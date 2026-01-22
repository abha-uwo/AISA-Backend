import React, { useState } from 'react';
import { Routes, Route, Outlet, Navigate, BrowserRouter, useNavigate, useLocation } from 'react-router';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerificationForm from './pages/VerificationForm';
import Chat from './pages/Chat';
import Sidebar from './Components/SideBar/Sidebar.jsx';
import Profile from './pages/Profile';
import AiPersonalAssistantDashboard from './pages/AiPersonalAssistant/Dashboard';



import { AppRoute } from './types';
import { Menu } from 'lucide-react';
import { useRecoilState } from 'recoil';
import { toggleState } from './userStore/userData';
import ComingSoon from './Components/ComingSoon/ComingSoon.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import CookiePolicy from './pages/CookiePolicy.jsx';
import PlatformSubscriptionModal from './Components/SubscriptionForm/PlatformSubscriptionModal.jsx';

import { AnimatePresence } from 'motion/react';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute.jsx';

// Vendor Imports Removed
// import VendorLayout from './Components/Vendor/VendorLayout';
// import VendorOverview from './pages/Vendor/VendorOverview';
// ...

const SecurityAndGuidelines = lazy(() => import('./pages/SecurityAndGuidelines'));



const AuthenticatRoute = ({ children }) => {
  return children;
}

// ------------------------------
// Dashboard Layout (Auth pages)
// ------------------------------

const DashboardLayout = () => {
  const [tglState, setTglState] = useRecoilState(toggleState);
  const isSidebarOpen = tglState.sidebarOpen;
  const setIsSidebarOpen = (val) => setTglState(prev => ({ ...prev, sidebarOpen: val }));

  const location = useLocation();
  const isFullScreen = false;

  const user = JSON.parse(
    localStorage.getItem('user') || '{"name":"User"}'
  );

  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex bg-transparent text-maintext overflow-hidden font-sans">
      {/* Background Dreamy Orbs */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#fce7f3] dark:from-[#020617] dark:via-[#0f172a] dark:to-[#1e1b4b]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/30 dark:bg-purple-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 dark:bg-blue-900/20 blur-[120px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-pink-200/20 dark:bg-pink-900/10 blur-[100px]"></div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 bg-transparent h-full relative">

        {/* Mobile Header - Hide on Chat/Assistant if they provide their own toggle */}
        {!isFullScreen && !location.pathname.includes('/chat') && !location.pathname.includes('/ai-personal-assistant') && (
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-secondary shrink-0 z-50 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-surface text-maintext active:bg-surface/80 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-bold text-lg text-primary">A-Series</span>
            </div>

            <div
              onClick={() => navigate(user.email ? '/dashboard/profile' : '/login')}
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase cursor-pointer hover:bg-primary/30 transition-colors"
            >
              {user.name?.charAt(0) || 'U'}
            </div>
          </div>
        )}

        {/* Menu Button for Mobile if needed can be kept, but Sidebar is usually toggled by header */}

        {/* Outlet for pages */}
        <main className={`flex-1 overflow-y-auto relative w-full scroll-smooth p-0`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ------------------------------
// Placeholder Page
// ------------------------------

const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-full text-subtext flex-col">
    <h2 className="text-2xl font-bold mb-2 text-maintext">{title}</h2>
    <p>Coming soon...</p>
  </div>
);

// ------------------------------
// App Router
// ------------------------------

import { Toaster } from 'react-hot-toast';

const NavigateProvider = () => {
  const [tglState] = useRecoilState(toggleState);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AnimatePresence>
        {tglState.platformSubTgl && <PlatformSubscriptionModal />}
      </AnimatePresence>
      <Routes>
        {/* Public Routes */}
        <Route path={AppRoute.LANDING} element={<Landing />} />
        <Route path={AppRoute.LOGIN} element={<Login />} />
        <Route path={AppRoute.SIGNUP} element={<Signup />} />

        <Route path={AppRoute.E_Verification} element={<VerificationForm />} />
        <Route path={AppRoute.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={AppRoute.RESET_PASSWORD} element={<ResetPassword />} />
        <Route path={AppRoute.PRIVACY_POLICY} element={<PrivacyPolicy />} />
        <Route path={AppRoute.TERMS_OF_SERVICE} element={<TermsOfService />} />
        <Route path={AppRoute.COOKIE_POLICY} element={<CookiePolicy />} />
        <Route path="/agentsoon" element={<ComingSoon />}></Route>
        {/* Dashboard (Protected) */}
        <Route
          path={AppRoute.DASHBOARD}
          element={<DashboardLayout />}
        >
          <Route index element={<Navigate to="chat" replace />} />
          <Route path="chat/:sessionId?" element={<Chat />} />
          <Route path="ai-personal-assistant" element={<ProtectedRoute><AiPersonalAssistantDashboard /></ProtectedRoute>} />
          {/* <Route path="live-demos" element={
            <Suspense fallback={<div className="flex items-center justify-center h-full"><p className="text-subtext">Loading...</p></div>}>
              <LiveDemoPage />
            </Suspense>
          } /> */}
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="security" element={
            <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
              <SecurityAndGuidelines />
            </Suspense>
          } />
        </Route>


        {/* Vendor Dashboard Routes (Public for MVP/Testing) */}


        {/* Catch All */}
        <Route path="*" element={<Navigate to={AppRoute.LANDING} replace />} />
      </Routes>
    </BrowserRouter >
  );
};

export default NavigateProvider;