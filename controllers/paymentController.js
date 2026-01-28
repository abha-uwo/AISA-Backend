import PaytmChecksum from 'paytmchecksum';
import https from 'https';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

dotenv.config();

export const createOrder = async (req, res) => {
    try {
        const { plan } = req.body;
        const userId = req.user.id;

        // Validation for credentials
        if (!process.env.PAYTM_MERCHANT_ID || !process.env.PAYTM_MERCHANT_KEY) {
            console.error("CRITICAL: Missing Paytm Credentials in .env");
            return res.status(500).json({ error: "Server Configuration Error: Missing Paytm Credentials" });
        }

        if (!plan) {
            return res.status(400).json({ error: "Plan is required" });
        }

        let amount = "0";
        switch (plan.toLowerCase()) {
            case 'basic':
                amount = "0";
                break;
            case 'pro':
                amount = "499.00";
                break;
            case 'king':
                amount = "1499.00";
                break;
            default:
                return res.status(400).json({ error: "Invalid plan selected" });
        }

        // If amount is 0 (Basic plan), update user immediately
        if (amount === "0") {
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    plan: 'Basic',
                    subscription: {
                        status: 'active',
                        currentPeriodEnd: null
                    }
                },
                { new: true }
            );
            return res.status(200).json({ message: "Plan updated to Basic", user: updatedUser, amount: 0 });
        }

        // Use a shorter orderId (Paytm limit is technically 50, but shorter is safer)
        const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const amountFormatted = parseFloat(amount).toFixed(2);
        const mid = process.env.PAYTM_MERCHANT_ID.trim();
        const key = process.env.PAYTM_MERCHANT_KEY.trim();
        const websiteFromEnv = (process.env.PAYTM_WEBSITE || "WEBSTAGING").trim();
        const callbackUrl = (process.env.PAYTM_CALLBACK_URL || `http://localhost:5173/payment/verify`).trim();

        // Determine if we are in staging mode
        const isStagingEnv = websiteFromEnv === 'WEBSTAGING' || mid.toLowerCase().includes('stage') || mid.startsWith('SrctYa');
        const defaultHostname = isStagingEnv ? 'securegw-stage.paytm.in' : 'securegw.paytm.in';

        const initiateAttempt = async (targetWebsite, targetHostname) => {
            const body = {
                requestType: "Payment",
                mid: mid,
                websiteName: targetWebsite,
                orderId: orderId,
                callbackUrl: callbackUrl,
                txnAmount: {
                    value: amountFormatted,
                    currency: "INR",
                },
                userInfo: {
                    custId: userId.toString(),
                }
            };

            // Standard JS Checkout often requires these
            body.channelId = (process.env.PAYTM_CHANNEL_ID || "WEB").trim();
            body.industryTypeId = (process.env.PAYTM_INDUSTRY_TYPE || "Retail").trim();

            const bodyString = JSON.stringify(body);
            const signature = await PaytmChecksum.generateSignature(bodyString, key);

            const payload = {
                head: { signature: signature },
                body: body
            };

            const url = `https://${targetHostname}/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}`;

            console.log(`[Paytm] [${targetWebsite}] [${targetHostname}] Initiating...`);

            return axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            });
        };

        // Attempt 1: Using Env Config
        let response = await initiateAttempt(websiteFromEnv, defaultHostname);
        let paytmRes = response.data;

        // Attempt 2: If 501 and it was WEBSTAGING, try DEFAULT on the SAME hostname
        if (paytmRes.body?.resultInfo?.resultCode === "501" && websiteFromEnv === "WEBSTAGING") {
            console.warn(`[Paytm] WEBSTAGING failed. Retrying with DEFAULT on ${defaultHostname}...`);
            response = await initiateAttempt("DEFAULT", defaultHostname);
            paytmRes = response.data;
        }

        if (paytmRes.body && paytmRes.body.resultInfo && paytmRes.body.resultInfo.resultStatus === 'S') {
            console.log("[Paytm] Init Success. Token obtained.");
            res.status(200).json({
                txnToken: paytmRes.body.txnToken,
                orderId: orderId,
                amount: amount,
                mid: mid
            });
        } else {
            console.error("[Paytm] Init Failed. Final Response:", JSON.stringify(paytmRes, null, 2));
            res.status(500).json({
                error: "Paytm Init Failed",
                code: paytmRes.body?.resultInfo?.resultCode,
                details: paytmRes.body?.resultInfo?.resultMsg || "Unknown Error",
                raw: paytmRes
            });
        }

    } catch (error) {
        console.error("Paytm Order Error:", error);
        res.status(500).json({ error: "Failed to create payment order" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { plan, amount, STATUS, CHECKSUMHASH, ORDERID, TXNID } = req.body;
        const userId = req.user.id;

        // Exclude CHECKSUMHASH from the params to verify
        const paytmParams = {};
        for (const key in req.body) {
            if (key !== "CHECKSUMHASH" && key !== "plan" && key !== "amount") {
                paytmParams[key] = req.body[key];
            }
        }

        if (STATUS === 'TXN_SUCCESS') {
            // Update User Plan
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    plan: plan || (amount > 500 ? 'King' : 'Pro'), // Fallback if plan name missing
                    subscription: {
                        status: 'active',
                        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                    }
                },
                { new: true }
            );

            // Create Transaction Record
            await Transaction.create({
                buyerId: userId,
                transactionId: TXNID,
                amount: amount,
                plan: plan,
                paymentId: TXNID,
                orderId: ORDERID,
                status: 'success'
            });

            res.status(200).json({
                message: "Payment verified successfully",
                user: updatedUser
            });
        } else {
            res.status(400).json({ error: "Payment failed or pending" });
        }

    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ error: "Failed to verify payment" });
    }
};

export const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({ buyerId: userId }).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Fetch Transactions Error:", error);
        res.status(500).json({ error: "Failed to fetch transaction history" });
    }
};
