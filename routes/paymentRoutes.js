import express from 'express';
import { createOrder, verifyPayment, getPaymentHistory } from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authorization.js';

const router = express.Router();

router.post('/create-order', verifyToken, createOrder);
router.post('/verify-payment', verifyToken, verifyPayment);
router.get('/history', verifyToken, getPaymentHistory);

export default router;
