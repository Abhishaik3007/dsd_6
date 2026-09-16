import React from 'react';
import { HubProvider, useHub } from './context/HubContext';
import { SearchModal } from './components/common/SearchModal';
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
import './components/hub/hub-3d-styles.css';
import './gate-glossy-overrides.css';
import './notebook-truth-table.css';

const MainAppContent = () => {
  const { activeTab } = useHub();

  return (
    <div className="continuum-app bg-[#F6F4EE] min-h-screen">

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
      </main>
    </div>
  );
};

export default function App() {
  return (
    <HubProvider>
      <MainAppContent />
    </HubProvider>
  );
}
