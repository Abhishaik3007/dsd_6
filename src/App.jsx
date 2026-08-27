import React from 'react';
import { HubProvider, useHub } from './context/HubContext';
import { SearchModal } from './components/common/SearchModal';
import { ContinuumLandingPage } from './components/continuum/ContinuumLandingPage';
import { LogicGatesLab } from './components/logic-gates/LogicGatesLab';
import { CSVisualizerLab } from './components/cs-visualizer/CSVisualizerLab';
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
        {activeTab === 'hub' && <ContinuumLandingPage />}
        {activeTab === 'labs' && <ContinuumLandingPage initialIndexOpen={true} />}
        {activeTab === 'logic-gates' && <LogicGatesLab />}
        {activeTab === 'cs-visualizer' && <CSVisualizerLab />}
        {activeTab === 'systems-preview' && <CSVisualizerLab />}
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
