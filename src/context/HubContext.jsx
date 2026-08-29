import React, { createContext, useContext, useState, useEffect } from 'react';

const HubContext = createContext();

const PATH_TO_TAB = {
  '/': 'hub',
  '/home': 'hub',
  '/labs': 'labs',
  '/logicraft': 'logic-gates',
  '/logic-gates': 'logic-gates',
  '/dsa': 'dsa-catalog',
  '/dsa/catalog': 'dsa-catalog',
  '/dsa/doc': 'dsa-doc',
  '/dsa-visualizer': 'cs-visualizer',
  '/dsa/lab': 'cs-visualizer',
  '/cs-visualizer': 'cs-visualizer',
  '/systems': 'systems-preview',
  '/systems-preview': 'systems-preview',
};

const TAB_TO_PATH = {
  'hub': '/home',
  'labs': '/labs',
  'logic-gates': '/logicraft',
  'dsa-catalog': '/dsa',
  'dsa-doc': '/dsa/doc',
  'cs-visualizer': '/dsa-visualizer',
  'systems-preview': '/systems',
};

const getInitialTab = () => {
  if (typeof window === 'undefined') return 'hub';
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const normalizedPath = path === '' ? '/' : path;
  return PATH_TO_TAB[normalizedPath] || 'hub';
};

const getInitialDsId = () => {
  if (typeof window === 'undefined') return 'linked-list';
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('id') || urlParams.get('ds');
  if (paramId) return paramId;
  const storedId = sessionStorage.getItem('selectedDsId');
  if (storedId) return storedId;
  return 'linked-list';
};

export const HubProvider = ({ children }) => {
  // Active View: 'hub' | 'labs' | 'logic-gates' | 'dsa-catalog' | 'dsa-doc' | 'cs-visualizer' | 'systems-preview'
  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [selectedDsId, setSelectedDsIdState] = useState(getInitialDsId);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [themeMode, setThemeMode] = useState('dark');
  const [accentTheme, setAccentTheme] = useState('cyan');
  const [stats] = useState({
    labsCount: 4,
    operationsCount: 1420,
    hardwareNodes: 28,
    activeLearners: '1.2k+'
  });

  const setSelectedDsId = (dsId) => {
    setSelectedDsIdState(dsId);
    if (typeof window !== 'undefined' && dsId) {
      sessionStorage.setItem('selectedDsId', dsId);
    }
  };

  const navigateTo = (tab, dsId = null, replace = false) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const activeDs = dsId || selectedDsId;
    if (dsId) setSelectedDsId(dsId);

    let targetPath = TAB_TO_PATH[tab] || '/home';
    if ((tab === 'dsa-doc' || tab === 'cs-visualizer') && activeDs) {
      targetPath += `?id=${activeDs}`;
    }

    const currentFullPath = window.location.pathname + window.location.search;
    if (currentFullPath !== targetPath) {
      if (replace) {
        window.history.replaceState({ tab, dsId: activeDs }, '', targetPath);
      } else {
        window.history.pushState({ tab, dsId: activeDs }, '', targetPath);
      }
    }
  };

  const openDsDoc = (dsId) => {
    setSelectedDsId(dsId);
    navigateTo('dsa-doc', dsId);
  };

  const launchDsLab = (dsId) => {
    const targetId = dsId || selectedDsId;
    setSelectedDsId(targetId);
    navigateTo('cs-visualizer', targetId);
  };

  // Sync canonical URL path & query on initial mount
  useEffect(() => {
    const initialTab = getInitialTab();
    const initialDsId = getInitialDsId();
    let canonicalPath = TAB_TO_PATH[initialTab];

    if ((initialTab === 'dsa-doc' || initialTab === 'cs-visualizer') && initialDsId) {
      canonicalPath += `?id=${initialDsId}`;
    }

    const currentFullPath = window.location.pathname + window.location.search;
    if (canonicalPath && currentFullPath !== canonicalPath) {
      window.history.replaceState({ tab: initialTab, dsId: initialDsId }, '', canonicalPath);
    }
  }, []);

  // Listen for browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const normalizedPath = path === '' ? '/' : path;
      const matchedTab = PATH_TO_TAB[normalizedPath] || 'hub';
      
      const urlParams = new URLSearchParams(window.location.search);
      const paramId = urlParams.get('id') || urlParams.get('ds') || sessionStorage.getItem('selectedDsId');
      if (paramId) {
        setSelectedDsIdState(paramId);
      }

      setActiveTabState(matchedTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global Keyboard Shortcuts (e.g., Ctrl+K for search modal)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleThemeMode = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <HubContext.Provider
      value={{
        activeTab,
        setActiveTab: navigateTo,
        selectedDsId,
        setSelectedDsId,
        openDsDoc,
        launchDsLab,
        isSearchOpen,
        setIsSearchOpen,
        themeMode,
        setThemeMode,
        toggleThemeMode,
        accentTheme,
        setAccentTheme,
        stats
      }}
    >
      {children}
    </HubContext.Provider>
  );
};

export const useHub = () => {
  const context = useContext(HubContext);
  if (!context) {
    throw new Error('useHub must be used within a HubProvider');
  }
  return context;
};
