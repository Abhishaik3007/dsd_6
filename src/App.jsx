import React, { useEffect } from 'react';
import { HubProvider, useHub } from './context/HubContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InstituteProvider, useInstitute } from './context/InstituteContext';
import { checkSubscriptionAccess } from './utils/subscriptionUtils';
import { AuthLoginPage } from './components/auth/AuthLoginPage';
import { LandingPage } from './components/landing/LandingPage';
import { LogicGatesLab } from './components/logic-gates/LogicGatesLab';
import { DigitalCatalogPage } from './components/digital-electronics/DigitalCatalogPage';
import { DigitalDocumentationPage } from './components/digital-electronics/DigitalDocumentationPage';
import { DSACatalogPage } from './components/dsa/DSACatalogPage';
import { DSADocumentationPage } from './components/dsa/DSADocumentationPage';
import { CSVisualizerLab } from './components/cs-visualizer/CSVisualizerLab';
import { AlgoCatalogPage } from './components/algo-visualizer/AlgoCatalogPage';
import { AlgoDocumentationPage } from './components/algo-visualizer/AlgoDocumentationPage';
import { AlgoVisualizerLab } from './components/algo-visualizer/AlgoVisualizerLab';
import { P2PChatPage } from './components/chat/P2PChatPage';
import { SuperAdminPortal } from './components/admin/SuperAdminPortal';
import { InstituteAdminPortal } from './components/admin/InstituteAdminPortal';
import { JoinInvitePage } from './components/admin/JoinInvitePage';
import { TiersQuotaGovernancePage } from './components/admin/TiersQuotaGovernancePage';
import { PricingPage } from './components/pricing/PricingPage';
import { VerifyEmailView } from './components/auth/VerifyEmailView';
import { ResetPasswordView } from './components/auth/ResetPasswordView';
import './gate-glossy-overrides.css';
import './notebook-truth-table.css';

import { AccessDeniedView } from './components/common/AccessDeniedView';

const MainAppContent = () => {
  const { activeTab, setActiveTab } = useHub();
  const { isAuthenticated, currentUser, isLoadingAuth } = useAuth();
  const { institutes } = useInstitute();

  // If Super Admin accesses /admin, silently align route to /super-admin (/schule)
  useEffect(() => {
    if (activeTab === 'admin' && currentUser?.role === 'super-admin') {
      setActiveTab('super-admin');
    }
  }, [activeTab, currentUser?.role, setActiveTab]);

  // If authenticated user navigates to /login (e.g. via browser back button), redirect to their workspace
  useEffect(() => {
    if (isAuthenticated && activeTab === 'login') {
      const destination = currentUser?.role === 'super-admin'
        ? 'super-admin'
        : currentUser?.role === 'institute-admin'
        ? 'admin'
        : 'hub';
      setActiveTab(destination, true);
    }
  }, [isAuthenticated, activeTab, currentUser?.role, setActiveTab]);

  // Show a minimal loader while Firebase restores authentication state
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#f6f3eb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-[#203247]/20 border-t-[#347f7a] rounded-full animate-spin" />
          <span className="font-mono-signal text-[11px] text-[#647895] uppercase tracking-wider">
            Verifying Clearance...
          </span>
        </div>
      </div>
    );
  }

  // Highest Priority Public Action Pages: Password Reset & Email Verification
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const hasVerifyParam = urlParams && (urlParams.has('verify_token') || urlParams.has('verify_code'));
  const isResetPasswordMode = urlParams && (
    urlParams.get('mode') === 'resetPassword' ||
    (urlParams.has('oobCode') && !hasVerifyParam)
  );

  if (activeTab === 'reset-password' || isResetPasswordMode) {
    return <ResetPasswordView />;
  }

  if (activeTab === 'verify-email' || hasVerifyParam) {
    return <VerifyEmailView />;
  }

  // Explicit Auth / Login page
  if (activeTab === 'login') {
    if (isAuthenticated) {
      if (currentUser?.role === 'super-admin') return <SuperAdminPortal />;
      if (currentUser?.role === 'institute-admin') return <InstituteAdminPortal />;
      return <LandingPage />;
    }
    return <AuthLoginPage />;
  }

  // Public Pricing Page
  if (activeTab === 'pricing') {
    return <PricingPage />;
  }

  // Token-based enrollment / join page is accessible publicly
  if (activeTab === 'join') {
    return <JoinInvitePage />;
  }

  // List of protected labs & administrative portals
  const isProtectedContent = [
    'logic-gates',
    'digital-catalog',
    'digital-doc',
    'dsa-catalog',
    'dsa-doc',
    'cs-visualizer',
    'algo-catalog',
    'algo-doc',
    'algo-visualizer',
    'systems-preview',
    'p2p-chat',
    'super-admin',
    'admin',
    'tiers'
  ].includes(activeTab);

  // If user is unauthenticated and attempts to access protected content, route to login
  if (!isAuthenticated && isProtectedContent) {
    return <AuthLoginPage />;
  }

  // Subscription Guard for enrolled students/faculty and individual users
  // (Super Admins and Institute Admins are always permitted to access their consoles)
  if (isAuthenticated && currentUser && currentUser.role !== 'super-admin' && currentUser.role !== 'institute-admin') {
    const subCheck = checkSubscriptionAccess(currentUser, institutes);
    if (subCheck.isExpired || currentUser.isSubscriptionExpired) {
      return (
        <AccessDeniedView
          title={
            subCheck.isRevoked
              ? 'Seat License Revoked'
              : subCheck.type === 'institute'
              ? 'Campus Subscription Expired'
              : 'Subscription Expired'
          }
          description={
            subCheck.message ||
            currentUser.subscriptionExpiredNotice ||
            'Your access to the interactive labs and workspace has expired. Please contact your administrator or renew your subscription.'
          }
          requiredRole={subCheck.isRevoked ? 'Active Seat License' : 'Active Subscription'}
        />
      );
    }
  }

  // Role-Based Authorization Guard for Super Admin (/schule or /super-admin)
  if (activeTab === 'super-admin') {
    if (currentUser?.role !== 'super-admin') {
      return (
        <AccessDeniedView
          title="Platform Overseer Console Restricted"
          description="Access to global platform infrastructure, university contracts, and system directories requires Central Super Admin clearance."
          requiredRole="Super Admin"
        />
      );
    }
  }

  // Role-Based Authorization Guard for Tiers & Quotas Governance (/tiers or /quotas)
  if (activeTab === 'tiers') {
    if (currentUser?.role !== 'super-admin') {
      return (
        <AccessDeniedView
          title="Platform Tier Governance Restricted"
          description="Access to global platform contract tiers, licensing quotas, and capacity allocation requires Central Super Admin clearance."
          requiredRole="Super Admin"
        />
      );
    }
  }

  // Role-Based Authorization Guard for Institute Admin (/admin)
  if (activeTab === 'admin') {
    // If Super Admin accesses /admin, seamlessly render Super Admin Portal with zero flash and no "Access Denied" error
    if (currentUser?.role === 'super-admin') {
      return (
        <div className="signalschool-app bg-[#F6F4EE] min-h-screen relative">
          <main className="signalschool-main-view">
            <SuperAdminPortal />
          </main>
        </div>
      );
    }

    if (currentUser?.role !== 'institute-admin') {
      return (
        <AccessDeniedView
          title="Institute Administration Console Restricted"
          description="This dashboard is reserved strictly for designated university department administrators, deans, and campus leads. Student and faculty accounts cannot manage campus licenses."
          requiredRole="Institute Admin"
        />
      );
    }
  }

  // Authenticated Protected Content
  return (
    <div className="signalschool-app bg-[#F6F4EE] min-h-screen relative">
      {/* Main View Router */}
      <main className="signalschool-main-view">
        {activeTab === 'hub' && <LandingPage />}
        {activeTab === 'labs' && <LandingPage initialIndexOpen={true} />}
        {activeTab === 'digital-catalog' && <DigitalCatalogPage />}
        {activeTab === 'digital-doc' && <DigitalDocumentationPage />}
        {activeTab === 'logic-gates' && <LogicGatesLab />}
        {activeTab === 'dsa-catalog' && <DSACatalogPage />}
        {activeTab === 'dsa-doc' && <DSADocumentationPage />}
        {activeTab === 'cs-visualizer' && <CSVisualizerLab />}
        {activeTab === 'algo-catalog' && <AlgoCatalogPage />}
        {activeTab === 'algo-doc' && <AlgoDocumentationPage />}
        {activeTab === 'algo-visualizer' && <AlgoVisualizerLab />}
        {activeTab === 'systems-preview' && <DSACatalogPage />}
        {activeTab === 'p2p-chat' && <P2PChatPage />}

        {/* Enterprise Multi-Tenant Portals */}
        {activeTab === 'super-admin' && <SuperAdminPortal />}
        {activeTab === 'admin' && <InstituteAdminPortal />}
        {activeTab === 'tiers' && <TiersQuotaGovernancePage />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HubProvider>
        <InstituteProvider>
          <MainAppContent />
        </InstituteProvider>
      </HubProvider>
    </AuthProvider>
  );
}
