import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    CircleUser, Settings, Shield, Clock, Star, Infinity, ChevronRight, LogOut,
    Camera, Pencil, Check, Bell, Lock, Trash2, Eye, EyeOff, X, Moon, Sun, Globe,
    UserCog, LayoutDashboard, Sparkles, MessageSquare, ChevronDown, Menu as MenuIcon
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { AppRoute, apis } from '../types';
import axios from 'axios';
import { getUserData, clearUser, setUserData, userData } from '../userStore/userData';
import { useRecoilState } from 'recoil';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Profile = () => {
    const navigate = useNavigate();
    const [currentUserData, setUserRecoil] = useRecoilState(userData);
    const user = getUserData() || { name: 'Gauhar', email: 'gauhar@example.com' };
    const { theme, setTheme } = useTheme();
    const { t, region, setRegion, regions, regionFlags, allTimezones, regionTimezones, language, setLanguage } = useLanguage();

    const [activeTab, setActiveTab] = useState('personalization');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // --- Personalization State ---
    const [personalization, setPersonalization] = useState(() => {
        const saved = localStorage.getItem('user_personalization');
        return saved ? JSON.parse(saved) : {
            baseStyle: 'Default',
            characteristics: {
                warm: 'Default',
                enthusiastic: 'Default',
                headersLists: 'Default',
                emoji: 'Default'
            },
            customInstructions: '',
            nickname: ''
        };
    });

    const updatePersonalization = (key, value, nestedKey = null) => {
        setPersonalization(prev => {
            const newState = { ...prev };
            if (nestedKey) {
                newState[key] = { ...newState[key], [nestedKey]: value };
            } else {
                newState[key] = value;
            }
            localStorage.setItem('user_personalization', JSON.stringify(newState));
            return newState;
        });
    };

    // --- Existing Settings State ---
    const [userSettings, setUserSettings] = useState(() => {
        const saved = localStorage.getItem('user_settings');
        return saved ? JSON.parse(saved) : {
            emailNotif: true,
            pushNotif: true,
            publicProfile: true,
            twoFactor: true
        };
    });

    // Fetch latest settings
    useEffect(() => {
        const fetchSettings = async () => {
            if (!user?.token) return;
            try {
                const res = await axios.get(apis.user, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (res.data.settings) {
                    setUserSettings(res.data.settings);
                    localStorage.setItem('user_settings', JSON.stringify(res.data.settings));
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    // --- Password State ---
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // --- Handlers ---
    const handleLogout = () => {
        clearUser();
        navigate(AppRoute.LANDING);
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you SURE you want to delete your account? This action is permanent.")) return;
        const loadingToast = toast.loading("Deleting account...");
        try {
            await axios.delete(`${apis.user}/${user.id}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
            toast.dismiss(loadingToast);
            toast.success("Account deleted.");
            clearUser();
            navigate(AppRoute.LANDING);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Failed to delete account.");
        }
    };

    const toggleSetting = async (key) => {
        const newState = { ...userSettings, [key]: !userSettings[key] };
        setUserSettings(newState);
        localStorage.setItem('user_settings', JSON.stringify(newState));
        try {
            if (user?.token) {
                await axios.put(apis.user, { settings: newState }, { headers: { 'Authorization': `Bearer ${user.token}` } });
            }
        } catch (error) {
            toast.error("Failed to sync setting");
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.new !== passwordForm.confirm) return toast.error("Passwords match error");
        const loadingToast = toast.loading("Updating password...");
        try {
            await axios.post(apis.resetPasswordEmail, {
                email: user.email, currentPassword: passwordForm.current, newPassword: passwordForm.new
            });
            toast.dismiss(loadingToast);
            toast.success("Password updated!");
            setShowPasswordModal(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Failed update");
        }
    };

    // --- Render Components ---
    const SidebarItem = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => { setActiveTab(id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === id
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-subtext hover:bg-secondary hover:text-maintext'
                }`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto" />}
        </button>
    );

    const Select = ({ label, value, options, onChange }) => (
        <div className="flex items-center justify-between py-4 border-b border-border/50 first:pt-0">
            <span className="text-sm font-medium text-maintext">{label}</span>
            <div className="relative group">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="appearance-none bg-transparent text-sm font-bold text-primary pr-8 pl-4 py-1.5 focus:outline-none cursor-pointer"
                >
                    {options.map(opt => (
                        <option key={opt} value={opt} className="bg-card text-maintext">
                            {opt}
                        </option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 text-subtext absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary transition-colors" />
            </div>
        </div>
    );

    return (
        <div className="flex h-full bg-secondary overflow-hidden">
            {/* Sidebar */}
            <motion.div
                initial={false}
                animate={{ width: isSidebarOpen ? (window.innerWidth < 768 ? '100%' : '280px') : '0px' }}
                className={`bg-card border-r border-border flex-shrink-0 flex flex-col z-20 overflow-hidden ${window.innerWidth < 768 && isSidebarOpen ? 'absolute inset-0' : 'relative'}`}
            >
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold text-maintext">Settings</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 hover:bg-secondary rounded-lg">
                        <X className="w-5 h-5 text-subtext" />
                    </button>
                </div>
                <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                    <SidebarItem id="general" label="General" icon={LayoutDashboard} />
                    <SidebarItem id="personalization" label="Personalization" icon={UserCog} />
                    <SidebarItem id="notifications" label="Notifications" icon={Bell} />
                    <SidebarItem id="security" label="Security" icon={Shield} />
                </div>
                <div className="p-4 border-t border-border">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/5 rounded-xl transition-colors">
                        <LogOut className="w-5 h-5" /> Log Out
                    </button>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full min-w-0 bg-secondary relative">
                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b border-border flex items-center bg-card">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-secondary rounded-lg mr-4">
                        <MenuIcon className="w-6 h-6 text-maintext" />
                    </button>
                    <h1 className="text-lg font-bold text-maintext capitalize">{activeTab}</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-3xl mx-auto w-full pb-12">

                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {/* Profile Card */}
                                <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-8 rounded-[32px] flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/30">
                                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" /> : (user.name ? user.name.charAt(0).toUpperCase() : "U")}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-black text-maintext mb-1">{user.name}</h1>
                                        <p className="text-subtext font-medium">{user.email}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { l: 'Sessions', v: '128', i: Clock, c: 'text-blue-500 bg-blue-500/10' },
                                        { l: 'Status', v: 'Active', i: Star, c: 'text-yellow-500 bg-yellow-500/10' },
                                        { l: 'Plan', v: 'Pro', i: Sparkles, c: 'text-purple-500 bg-purple-500/10' },
                                        { l: 'Credits', v: '∞', i: Infinity, c: 'text-green-500 bg-green-500/10' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-card border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                                            <div className={`p-2 rounded-xl ${s.c}`}><s.i className="w-5 h-5" /></div>
                                            <div>
                                                <div className="text-lg font-bold text-maintext">{s.v}</div>
                                                <div className="text-[10px] uppercase font-bold text-subtext">{s.l}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Regional Settings */}
                                <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
                                    <h3 className="text-lg font-bold text-maintext mb-4">Regional Preferences</h3>
                                    <Select label="Region" value={region} options={Object.keys(regions)} onChange={setRegion} />
                                    <Select label="Language" value={language} options={regions[region] || []} onChange={setLanguage} />
                                    <Select label="Theme" value={theme} options={['Light', 'Dark']} onChange={setTheme} />
                                </div>
                            </motion.div>
                        )}

                        {/* PERSONALIZATION TAB */}
                        {activeTab === 'personalization' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-maintext">Personalization</h2>
                                    <p className="text-subtext">Customize how AISA responds to you.</p>
                                </div>

                                <div className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
                                    {/* Base Style */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-maintext">Base style and tone</h3>
                                                <p className="text-sm text-subtext mt-1 max-w-md">Set the style and tone of how the AI responds to you.</p>
                                            </div>
                                            <Select label="" value={personalization.baseStyle} options={['Default', 'Formal', 'Casual', 'Concise']} onChange={v => updatePersonalization('baseStyle', v)} />
                                        </div>
                                    </div>

                                    <div className="h-px bg-border/50" />

                                    {/* Characteristics */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-maintext">Characteristics</h3>
                                        <Select label="Warmth" value={personalization.characteristics.warm} options={['Default', 'High', 'Low']} onChange={v => updatePersonalization('characteristics', v, 'warm')} />
                                        <Select label="Enthusiasm" value={personalization.characteristics.enthusiastic} options={['Default', 'High', 'Low']} onChange={v => updatePersonalization('characteristics', v, 'enthusiastic')} />
                                        <Select label="Headers & Lists" value={personalization.characteristics.headersLists} options={['Default', 'More Headers', 'Less Lists']} onChange={v => updatePersonalization('characteristics', v, 'headersLists')} />
                                        <Select label="Emoji Usage" value={personalization.characteristics.emoji} options={['Default', 'Frequent', 'None']} onChange={v => updatePersonalization('characteristics', v, 'emoji')} />
                                    </div>

                                    <div className="h-px bg-border/50" />

                                    {/* Custom Instructions */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-maintext">Custom instructions</h3>
                                        <textarea
                                            value={personalization.customInstructions}
                                            onChange={(e) => updatePersonalization('customInstructions', e.target.value)}
                                            placeholder="Additional behavior, style, and tone preferences..."
                                            className="w-full bg-secondary/50 border border-border rounded-xl p-4 min-h-[100px] text-sm text-maintext focus:outline-none focus:border-primary transition-colors resize-none"
                                        />
                                    </div>

                                    <div className="h-px bg-border/50" />

                                    {/* About You */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-maintext">About you</h3>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-sm font-medium text-maintext">Nickname</span>
                                            <input
                                                type="text"
                                                value={personalization.nickname}
                                                onChange={(e) => updatePersonalization('nickname', e.target.value)}
                                                className="bg-transparent text-right text-sm font-bold text-primary focus:outline-none placeholder:text-subtext/50"
                                                placeholder="Set a nickname"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* NOTIFICATIONS TAB */}
                        {activeTab === 'notifications' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-3xl p-8 space-y-6">
                                <h2 className="text-xl font-bold text-maintext flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-blue-500" /> Notifications
                                </h2>
                                {[
                                    { key: 'emailNotif', label: 'Email Notifications', desc: 'Receive updates via email' },
                                    { key: 'pushNotif', label: 'Push Notifications', desc: 'Receive updates on your device' }
                                ].map(({ key, label, desc }) => (
                                    <div key={key} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="text-sm font-bold text-maintext">{label}</p>
                                            <p className="text-xs text-subtext">{desc}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleSetting(key)}
                                            className={`w-12 h-7 rounded-full p-1 transition-all duration-300 ${userSettings[key] ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${userSettings[key] ? 'translate-x-5' : ''}`} />
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === 'security' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
                                    <h2 className="text-xl font-bold text-maintext flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-green-500" /> Security
                                    </h2>
                                    <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                        <p className="text-sm font-bold text-green-700">Account Secured</p>
                                    </div>
                                    <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors group">
                                        <span className="text-sm font-bold text-maintext">Change Password</span>
                                        <ChevronRight className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                                    </button>
                                </div>

                                <div className="bg-card border border-border rounded-3xl p-8 space-y-4">
                                    <h3 className="text-lg font-bold text-red-500">Danger Zone</h3>
                                    <button onClick={handleDeleteAccount} className="w-full py-4 bg-red-500/5 text-red-600 border border-red-500/10 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                                        <Trash2 className="w-4 h-4" /> Delete Account
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-md rounded-3xl p-6 border border-border shadow-2xl relative">
                        <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5 text-subtext" /></button>
                        <h2 className="text-xl font-bold text-maintext mb-6">Change Password</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <input type={showCurrentPassword ? 'text' : 'password'} placeholder="Current Password" required className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-maintext" value={passwordForm.current} onChange={e => setPasswordForm(prev => ({ ...prev, current: e.target.value }))} />
                            <input type={showNewPassword ? 'text' : 'password'} placeholder="New Password" required className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-maintext" value={passwordForm.new} onChange={e => setPasswordForm(prev => ({ ...prev, new: e.target.value }))} />
                            <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" required className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-maintext" value={passwordForm.confirm} onChange={e => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))} />
                            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl mt-2">Update Password</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Profile;
