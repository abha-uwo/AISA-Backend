import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, FileText, Scale, Eye, AlertTriangle, X } from 'lucide-react';
import ReportModal from '../ReportModal/ReportModal';

const SecurityModal = ({ isOpen, onClose }) => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const sections = [
        {
            id: 1,
            title: "1. Data Privacy & Protection",
            icon: <Lock className="w-5 h-5 text-primary" />,
            content: (
                <div className="space-y-4">
                    <p className="text-subtext">AISA™ is committed to safeguarding user data in accordance with applicable data protection laws. We prioritize end-to-end encryption for all sensitive interactions.</p>
                    <p className="text-sm text-subtext">AISA™ collects minimal personal and technical information required for service delivery, including account details and usage metadata.</p>
                    <p className="text-sm text-subtext">AISA™ does not sell personal data. Data is shared with trusted infrastructure providers solely for operational requirements under strict confidentiality agreements.</p>
                    <p className="text-sm text-subtext">Users retain full ownership of their data and may request access, rectification, or deletion by contacting support@aimall.global.</p>
                </div>
            )
        },
        {
            id: 2,
            title: "2. Account Security Responsibilities",
            icon: <Shield className="w-5 h-5 text-primary" />,
            content: (
                <div className="space-y-3 text-subtext">
                    <p><strong>2.1</strong> Users are responsible for maintaining the confidentiality of their AISA™ account credentials.</p>
                    <p><strong>2.2</strong> We employ industry-standard encryption and secure session protocols. Users must report any suspected unauthorized access immediately.</p>
                </div>
            )
        },
        {
            id: 3,
            title: "3. Acceptable Use Policy",
            icon: <AlertTriangle className="w-5 h-5 text-primary" />,
            content: (
                <div className="space-y-3">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                            "Illegal or malicious activities",
                            "Reverse engineering models",
                            "Generating harmful content",
                            "Automated scraping or abuse"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-subtext bg-surface p-2 rounded-lg border border-border">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )
        },
        {
            id: 4,
            title: "4. AI Limitations & Disclaimers",
            icon: <Scale className="w-5 h-5 text-primary" />,
            content: (
                <div className="space-y-3">
                    <div className="bg-surface/50 p-3 rounded-lg border border-border">
                        <p className="text-xs text-subtext"><strong>4.1 Accuracy:</strong> AISA™ utilizes advanced LLMs, but outputs may occasionally be inaccurate. Users should verify critical information.</p>
                    </div>
                    <div className="bg-surface/50 p-3 rounded-lg border border-border">
                        <p className="text-xs text-subtext"><strong>4.2 Liability:</strong> AISA™ is an assistive tool. We are not liable for decisions made based on AI-generated advice or content.</p>
                    </div>
                </div>
            )
        },
        {
            id: 5,
            title: "5. Content & Intellectual Property",
            icon: <FileText className="w-5 h-5 text-primary" />,
            content: (
                <div className="space-y-2 text-subtext text-sm">
                    <p>Users retain rights to content they generate using AISA™. However, using the platform does not grant rights to the underlying models or software, which remain the property of AISA™.</p>
                </div>
            )
        },
        {
            id: 6,
            title: "6. Cookies & Usage Tracking",
            icon: <Eye className="w-5 h-5 text-primary" />,
            content: <p className="text-subtext text-sm">We use cookies to enhance your experience and ensure security. You can manage your cookie preferences through your browser settings.</p>
        },
        {
            id: 7,
            title: "7. Third-Party Integrations",
            icon: <div className="w-5 h-5 flex items-center justify-center font-bold text-primary text-xs border border-primary/20 rounded-md">3P</div>,
            content: <p className="text-subtext text-sm">Integrations with third-party services (e.g., calendar, email) are performed only with user consent and limited to necessary data exchange.</p>
        },
        {
            id: 8,
            title: "8. Platform Governance",
            icon: <div className="w-5 h-5 flex items-center justify-center font-bold text-primary text-xs border border-primary/20 rounded-md">©</div>,
            content: <p className="text-subtext text-sm">AISA™ reserves the right to suspend accounts that violate these guidelines to ensure the safety and integrity of the platform.</p>
        },
        {
            id: 9,
            title: "9. Updates to Guidelines",
            icon: <FileText className="w-5 h-5 text-primary" />,
            content: <p className="text-subtext text-sm">We may update these policies periodically. Continued use of AISA™ signifies acceptance of the revised terms.</p>
        },
        {
            id: 10,
            title: "10. Contact & Support",
            icon: <FileText className="w-5 h-5 text-primary" />,
            content: <p className="text-subtext text-sm">For privacy concerns, data requests, or policy questions, please contact us at <span className="text-primary font-bold">support@aimall.global</span>.</p>
        },
        {
            id: 11,
            title: "11. Incident Reporting",
            icon: <AlertTriangle className="w-5 h-5 text-blue-500" />,
            content: (
                <div className="space-y-4">
                    <p className="text-subtext text-xs">If you encounter a security vulnerability or policy violation, please report it immediately.</p>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setIsReportModalOpen(true)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-200 hover:bg-blue-100 transition-colors">
                            📧 Report Issue
                        </button>
                    </div>
                </div>
            )
        }
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-card rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-border flex items-center justify-between bg-surface/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-maintext">Security & Guidelines</h2>
                                        <p className="text-[10px] text-subtext uppercase tracking-widest font-bold">Comprehensive Platform Policy</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-black/5 rounded-full text-subtext transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8">
                                <div className="bg-secondary/50 border border-border rounded-xl p-6 shadow-sm">
                                    <p className="text-sm text-subtext leading-relaxed">
                                        This section governs the acceptable use, data protection practices, and security standards applicable to <span className="text-maintext font-semibold">AISA™</span>, developed by <span className="text-maintext font-semibold">UWO™</span>.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sections.map((section, index) => (
                                        <motion.div
                                            key={section.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all flex flex-col"
                                        >
                                            <div className="flex items-center gap-3 mb-3 border-b border-border/30 pb-2">
                                                {section.icon}
                                                <h3 className="text-sm font-bold text-maintext">{section.title}</h3>
                                            </div>
                                            <div className="flex-1">
                                                {section.content}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="bg-surface border border-border rounded-2xl p-6">
                                    <h3 className="font-bold text-maintext mb-2 flex items-center gap-2 text-sm">
                                        🧠 Legal Summary
                                    </h3>
                                    <p className="text-subtext text-xs italic">
                                        "These Guidelines establish the framework for lawful use, data protection, AI governance, and operational security within the AISA™ platform."
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 bg-surface border-t border-border flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-10 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                >
                                    Close Guidelines
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
        </>
    );
};

export default SecurityModal;
