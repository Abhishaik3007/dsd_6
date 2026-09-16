import React from 'react';
import { HubProvider, useHub } from './context/HubContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InstituteProvider } from './context/InstituteContext';
import { SearchModal } from './components/common/SearchModal';
import { PublicHeroPage } from './components/landing/PublicHeroPage';
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
import './components/hub/hub-3d-styles.css';
import './gate-glossy-overrides.css';
import './notebook-truth-table.css';

import { AccessDeniedView } from './components/common/AccessDeniedView';

const MainAppContent = () => {
  const { activeTab, setActiveTab } = useHub();
  const { isAuthenticated, currentUser, isLoadingAuth } = useAuth();

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

  // Explicit Auth / Login page
  if (activeTab === 'login') {
    return <AuthLoginPage />;
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
    'admin'
  ].includes(activeTab);

  // If user is unauthenticated and attempts to access protected content, route to login
  if (!isAuthenticated && isProtectedContent) {
    return <AuthLoginPage />;
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

  // Role-Based Authorization Guard for Institute Admin (/admin)
  if (activeTab === 'admin') {
    const isAllowedAdmin = currentUser?.role === 'institute-admin' || currentUser?.role === 'super-admin';
    if (!isAllowedAdmin) {
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
    <div className="continuum-app bg-[#F6F4EE] min-h-screen relative">
      {/* Global Command Palette Search Modal */}
      <SearchModal />

      {/* Main View Router */}
      <main className="continuum-main-view">
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
