import React from 'react';
import styled from 'styled-components';
import { X, CheckCircle2, Sparkles, Crown, Zap } from 'lucide-react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { toggleState, userData, setUserData } from '../../userStore/userData';
import { motion, AnimatePresence } from 'motion/react';
import { apis } from '../../types';
import axios from 'axios';
import toast from 'react-hot-toast';

const PlatformSubscriptionModal = () => {
    const [tglState, setTglState] = useRecoilState(toggleState);
    const [currentUserData, setUserRecoil] = useRecoilState(userData);
    const user = currentUserData.user || JSON.parse(localStorage.getItem('user'));

    const [isProcessing, setIsProcessing] = React.useState(false);
    const [selectedPlan, setSelectedPlan] = React.useState('Pro');

    const plans = [
        {
            name: 'Basic',
            price: 0,
            icon: Zap,
            color: 'from-blue-400 to-blue-600',
            features: [
                'Basic AI Model Access',
                '100 Messages per day',
                'Standard Support',
                'Community Access'
            ]
        },
        {
            name: 'Pro',
            price: 499,
            icon: Sparkles,
            color: 'from-purple-500 to-indigo-600',
            popular: true,
            features: [
                'Advanced AI Models (Gemini Flash)',
                '1000 Messages per day',
                'Priority Support',
                'Advanced File Processing',
                'Early Access to Features'
            ]
        },
        {
            name: 'King',
            price: 1499,
            icon: Crown,
            color: 'from-amber-400 to-orange-500',
            features: [
                'Premium AI Models (Gemini Pro)',
                'Unlimited Messages',
                '24/7 Dedicated Support',
                'Custom Agent Creation',
                'Enterprise Security',
                'Unlimited Knowledge Bases'
            ]
        }
    ];

    const currentPlan = user?.plan || 'Basic';

    const handleSubscribe = async (plan) => {
        if (plan.name === currentPlan) {
            toast('You are already on this plan');
            return;
        }

        if (plan.price === 0) {
            // Handle downgrade or switch to basic (free)
            toast.success('Switched to Basic plan');
            // Add API call if needed
            setTglState(prev => ({ ...prev, platformSubTgl: false }));
            return;
        }

        setIsProcessing(true);
        const loadingToast = toast.loading(`Initiating ${plan.name} plan...`);

        try {
            // 1. Create Order
            const res = await axios.post(`${apis.payment}/create-order`, {
                plan: plan.name,
                amount: plan.price
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const order = res.data;

            // 2. Open Razorpay
            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "AISA Premium",
                description: `Upgrade to ${plan.name} Plan`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post(`${apis.payment}/verify-payment`, {
                            ...response,
                            plan: plan.name,
                            amount: plan.price
                        }, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        });

                        toast.dismiss(loadingToast);
                        toast.success(`Welcome to ${plan.name} Plan!`);

                        // Update User State
                        const updatedUser = verifyRes.data.user;
                        setUserData(updatedUser);
                        setUserRecoil({ user: updatedUser });

                        setTglState(prev => ({ ...prev, platformSubTgl: false }));
                    } catch (err) {
                        toast.dismiss(loadingToast);
                        toast.error("Payment verification failed");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#8b5cf6",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            toast.dismiss(loadingToast);
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Order error", error);
            toast.error(error.response?.data?.error || "Failed to initiate payment");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <ModalContainer
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
            >
                <CloseButton onClick={() => setTglState(prev => ({ ...prev, platformSubTgl: false }))}>
                    <X className="w-6 h-6" />
                </CloseButton>

                <Header>
                    <Title>Choose Your Power</Title>
                    <Subtitle>Unlock advanced AI capabilities and higher limits</Subtitle>
                </Header>

                <PlansGrid>
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.name}
                            isPopular={plan.popular}
                            isCurrent={plan.name === currentPlan}
                            whileHover={{ y: -5 }}
                        >
                            {plan.popular && <PopularBadge>Most Popular</PopularBadge>}

                            <IconWrapper className={`bg-gradient-to-br ${plan.color}`}>
                                <plan.icon className="w-6 h-6 text-white" />
                            </IconWrapper>

                            <PlanName>{plan.name}</PlanName>

                            <PriceWrapper>
                                <Currency>₹</Currency>
                                <Price>{plan.price}</Price>
                                <Period>/mo</Period>
                            </PriceWrapper>

                            <FeaturesList>
                                {plan.features.map((feature, idx) => (
                                    <FeatureItem key={idx}>
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        <span>{feature}</span>
                                    </FeatureItem>
                                ))}
                            </FeaturesList>

                            <SubscribeButton
                                onClick={() => handleSubscribe(plan)}
                                className={plan.popular ? 'popular' : ''}
                                disabled={isProcessing || plan.name === currentPlan}
                            >
                                {plan.name === currentPlan ? 'Current Plan' : `Get ${plan.name}`}
                            </SubscribeButton>
                        </PlanCard>
                    ))}
                </PlansGrid>

                <Footer>
                    <p>Prices are inclusive of all taxes. Cancel anytime.</p>
                </Footer>
            </ModalContainer>
        </Overlay>
    );
};

const Overlay = styled(motion.div)`
    fixed: inset 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
`;

const ModalContainer = styled(motion.div)`
    background: #ffffff;
    width: 100%;
    max-width: 1000px;
    border-radius: 32px;
    border: 1px solid #e5e7eb;
    padding: 40px;
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);

    &::-webkit-scrollbar {
        width: 8px;
    }
    &::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 10px;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 24px;
    right: 24px;
    color: #6b7280;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;
    &:hover {
        background: #f3f4f6;
        color: #111827;
    }
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 40px;
`;

const Title = styled.h2`
    font-size: 2.5rem;
    font-weight: 900;
    color: #111827;
    margin-bottom: 8px;
`;

const Subtitle = styled.p`
    color: #4b5563;
    font-size: 1.1rem;
`;

const PlansGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
`;

const PlanCard = styled(motion.div)`
    background: #ffffff;
    border: 2px solid ${props => props.isPopular ? 'var(--primary)' : '#f3f4f6'};
    padding: 32px;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.3s;
    ${props => props.isCurrent && 'opacity: 0.8;'}

    &:hover {
        border-color: var(--primary);
        box-shadow: 0 10px 30px -10px rgba(139, 92, 246, 0.15);
    }
`;

const PopularBadge = styled.div`
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: #8b5cf6;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
`;

const IconWrapper = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
`;

const PlanName = styled.h3`
    font-size: 1.5rem;
    font-weight: 800;
    color: #111827;
    margin-bottom: 12px;
`;

const PriceWrapper = styled.div`
    display: flex;
    align-items: baseline;
    margin-bottom: 24px;
`;

const Currency = styled.span`
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
`;

const Price = styled.span`
    font-size: 3rem;
    font-weight: 900;
    color: #111827;
    margin: 0 4px;
`;

const Period = styled.span`
    color: #6b7280;
    font-size: 1rem;
`;

const FeaturesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 40px;
    flex: 1;
`;

const FeatureItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    color: #4b5563;
    font-size: 0.95rem;
`;

const SubscribeButton = styled.button`
    width: 100%;
    padding: 16px;
    border-radius: 16px;
    font-weight: 700;
    font-size: 1rem;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #111827;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background: #f9fafb;
    }

    &.popular {
        background: #8b5cf6;
        color: white;
        border: none;
        &:hover:not(:disabled) {
            background: #7c3aed;
        }
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Footer = styled.div`
    margin-top: 40px;
    text-align: center;
    color: #6b7280;
    font-size: 0.85rem;
`;

export default PlatformSubscriptionModal;
