import React, { createContext, useContext, useState, useEffect } from 'react';

const HubContext = createContext();

const PATH_TO_TAB = {
  '/': 'hub',
  '/home': 'hub',
  '/welcome': 'hub',
  '/login': 'login',
  '/auth': 'login',
  '/labs': 'labs',
  '/logicraft': 'logic-gates',
  '/logic-gates': 'logic-gates',
  '/circuits': 'digital-catalog',
  '/circuits/catalog': 'digital-catalog',
  '/circuits/study': 'digital-doc',
  '/digital': 'digital-catalog',
  '/digital/catalog': 'digital-catalog',
  '/digital/study': 'digital-doc',
  '/digital-doc': 'digital-doc',
  '/logicraft/study': 'digital-doc',
  '/dsa': 'dsa-catalog',
  '/dsa/catalog': 'dsa-catalog',
  '/dsa/doc': 'dsa-doc',
  '/dsa-visualizer': 'cs-visualizer',
  '/dsa/lab': 'cs-visualizer',
  '/cs-visualizer': 'cs-visualizer',
  '/algorithms': 'algo-catalog',
  '/algorithms/catalog': 'algo-catalog',
  '/algo': 'algo-catalog',
  '/algo/catalog': 'algo-catalog',
  '/algorithms/study': 'algo-doc',
  '/algorithms/doc': 'algo-doc',
  '/algo/doc': 'algo-doc',
  '/algorithms/lab': 'algo-visualizer',
  '/algo/lab': 'algo-visualizer',
  '/algo-visualizer': 'algo-visualizer',
  '/systems': 'systems-preview',
  '/systems-preview': 'systems-preview',
  '/mesh': 'p2p-chat',
  '/chat': 'p2p-chat',
  '/p2p-chat': 'p2p-chat',
  '/schule': 'super-admin',
  '/super-admin': 'super-admin',
  '/admin': 'admin',
  '/join': 'join',
  '/tiers': 'tiers',
  '/quotas': 'tiers',
  '/pricing': 'pricing',
};

const TAB_TO_PATH = {
  'hub': '/',
  'login': '/login',
  'labs': '/labs',
  'logic-gates': '/logicraft',
  'digital-catalog': '/circuits',
  'digital-doc': '/circuits/study',
  'dsa-catalog': '/dsa',
  'dsa-doc': '/dsa/doc',
  'cs-visualizer': '/dsa-visualizer',
  'algo-catalog': '/algorithms',
  'algo-doc': '/algorithms/study',
  'algo-visualizer': '/algorithms/lab',
  'systems-preview': '/systems',
  'p2p-chat': '/mesh',
  'super-admin': '/schule',
  'admin': '/admin',
  'join': '/join',
  'tiers': '/tiers',
  'pricing': '/pricing',
};

const getAuthenticatedDefaultTab = () => {
  if (typeof window === 'undefined') return 'hub';
  try {
    const isAuth = localStorage.getItem('signalschool_is_authenticated') === 'true';
    if (!isAuth) return 'login';
    const storedUser = JSON.parse(localStorage.getItem('signalschool_auth_user') || '{}');
    if (storedUser?.role === 'super-admin') return 'super-admin';
    if (storedUser?.role === 'institute-admin') return 'admin';
    return 'hub';
  } catch (e) {
    return 'hub';
  }
};

const getInitialTab = () => {
  if (typeof window === 'undefined') return 'hub';
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const normalizedPath = path === '' ? '/' : path;
  if (PATH_TO_TAB[normalizedPath]) {
    const tab = PATH_TO_TAB[normalizedPath];
    if (tab === 'login') {
      const isAuth = localStorage.getItem('signalschool_is_authenticated') === 'true';
      if (isAuth) {
        return getAuthenticatedDefaultTab();
      }
    }
    return tab;
  }
  if (normalizedPath.startsWith('/login') || normalizedPath.startsWith('/auth')) {
    const isAuth = localStorage.getItem('signalschool_is_authenticated') === 'true';
    if (isAuth) {
      return getAuthenticatedDefaultTab();
    }
    return 'login';
  }
  if (normalizedPath.startsWith('/pricing')) {
    return 'pricing';
  }
  if (normalizedPath.startsWith('/join')) {
    return 'join';
  }
  if (normalizedPath.startsWith('/mesh') || normalizedPath.startsWith('/chat')) {
    return 'p2p-chat';
  }
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('room')) {
    return 'p2p-chat';
  }
  return 'hub';
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

const getInitialCircuitId = () => {
  if (typeof window === 'undefined') return 'basic-gates';
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('circuit') || (window.location.pathname.includes('/circuits') ? urlParams.get('id') : null);
  if (paramId) return paramId;
  const storedId = sessionStorage.getItem('selectedCircuitId');
  if (storedId) return storedId;
  return 'basic-gates';
};

const getInitialAlgoId = () => {
  if (typeof window === 'undefined') return 'bubble';
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('algo') || (window.location.pathname.includes('/algo') ? urlParams.get('id') : null);
  if (paramId) return paramId;
  const storedId = sessionStorage.getItem('selectedAlgoId');
  if (storedId) return storedId;
  return 'bubble';
};

export const HubProvider = ({ children }) => {
  // Active View: 'hub' | 'labs' | 'logic-gates' | 'digital-catalog' | 'digital-doc' | 'dsa-catalog' | 'dsa-doc' | 'cs-visualizer' | 'algo-catalog' | 'algo-doc' | 'algo-visualizer' | 'systems-preview'
  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [selectedDsId, setSelectedDsIdState] = useState(getInitialDsId);
  const [selectedCircuitId, setSelectedCircuitIdState] = useState(getInitialCircuitId);
  const [selectedAlgoId, setSelectedAlgoIdState] = useState(getInitialAlgoId);
  const [selectedCircuitPreset, setSelectedCircuitPreset] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [themeMode, setThemeMode] = useState('light');
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

  const setSelectedCircuitId = (circuitId) => {
    setSelectedCircuitIdState(circuitId);
    if (typeof window !== 'undefined' && circuitId) {
      sessionStorage.setItem('selectedCircuitId', circuitId);
    }
  };

  const setSelectedAlgoId = (algoId) => {
    setSelectedAlgoIdState(algoId);
    if (typeof window !== 'undefined' && algoId) {
      sessionStorage.setItem('selectedAlgoId', algoId);
    }
  };

  const navigateTo = (tab, itemIdOrReplace = null, replaceOption = false) => {
    let itemId = itemIdOrReplace;
    let replace = replaceOption;
    if (typeof itemIdOrReplace === 'boolean') {
      replace = itemIdOrReplace;
      itemId = null;
    }

    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let targetPath = TAB_TO_PATH[tab] || '/home';

    if (tab === 'dsa-doc' || tab === 'cs-visualizer') {
      const activeDs = itemId || selectedDsId;
      if (itemId) setSelectedDsId(itemId);
      if (activeDs) targetPath += `?id=${activeDs}`;
    } else if (tab === 'digital-doc') {
      const activeCircuit = itemId || selectedCircuitId;
      if (itemId) setSelectedCircuitId(itemId);
      if (activeCircuit) targetPath += `?id=${activeCircuit}`;
    } else if (tab === 'algo-doc' || tab === 'algo-visualizer') {
      const activeAlgo = itemId || selectedAlgoId;
      if (itemId) setSelectedAlgoId(itemId);
      if (activeAlgo) targetPath += `?id=${activeAlgo}`;
    }

    const currentFullPath = window.location.pathname + window.location.search;
    if (currentFullPath !== targetPath) {
      if (replace) {
        window.history.replaceState({ tab, itemId }, '', targetPath);
      } else {
        window.history.pushState({ tab, itemId }, '', targetPath);
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

  const openCircuitDoc = (circuitId) => {
    setSelectedCircuitId(circuitId);
    navigateTo('digital-doc', circuitId);
  };

  const launchCircuitLab = (circuitId = null, presetId = null) => {
    if (circuitId) setSelectedCircuitId(circuitId);
    if (presetId) setSelectedCircuitPreset(presetId);
    navigateTo('logic-gates');
  };

  const openAlgoDoc = (algoId) => {
    const targetId = algoId || selectedAlgoId;
    setSelectedAlgoId(targetId);
    navigateTo('algo-doc', targetId);
  };

  const launchAlgoLab = (algoId = null) => {
    const targetId = algoId || selectedAlgoId;
    if (targetId) setSelectedAlgoId(targetId);
    navigateTo('algo-visualizer', targetId);
  };

  // Sync canonical URL path & query on initial mount
  useEffect(() => {
    const initialTab = getInitialTab();
    const initialDsId = getInitialDsId();
    const initialCircuitId = getInitialCircuitId();
    const initialAlgoId = getInitialAlgoId();
    let canonicalPath = TAB_TO_PATH[initialTab];

    if ((initialTab === 'dsa-doc' || initialTab === 'cs-visualizer') && initialDsId) {
      canonicalPath += `?id=${initialDsId}`;
    } else if (initialTab === 'digital-doc' && initialCircuitId) {
      canonicalPath += `?id=${initialCircuitId}`;
    } else if ((initialTab === 'algo-doc' || initialTab === 'algo-visualizer') && initialAlgoId) {
      canonicalPath += `?id=${initialAlgoId}`;
    } else if (initialTab === 'p2p-chat') {
      const path = window.location.pathname;
      if (path.startsWith('/mesh/') || path.startsWith('/chat/')) {
        canonicalPath = path.replace(/^\/chat\//, '/mesh/');
      } else if (window.location.search) {
        canonicalPath = `/mesh${window.location.search}`;
      }
    }

    const currentFullPath = window.location.pathname + window.location.search;
    if (canonicalPath && currentFullPath !== canonicalPath) {
      window.history.replaceState({ tab: initialTab }, '', canonicalPath);
    }
  }, []);

  // Listen for browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const normalizedPath = path === '' ? '/' : path;
      let matchedTab = PATH_TO_TAB[normalizedPath];
      if (!matchedTab) {
        if (normalizedPath.startsWith('/mesh') || normalizedPath.startsWith('/chat')) {
          matchedTab = 'p2p-chat';
        } else if (new URLSearchParams(window.location.search).has('room')) {
          matchedTab = 'p2p-chat';
        } else {
          matchedTab = 'hub';
        }
      }

      // If user is authenticated and back button targets login/auth, redirect to their workspace
      const isAuth = typeof window !== 'undefined' && localStorage.getItem('signalschool_is_authenticated') === 'true';
      if (isAuth && (matchedTab === 'login' || normalizedPath.startsWith('/login') || normalizedPath.startsWith('/auth'))) {
        const destTab = getAuthenticatedDefaultTab();
        const destPath = TAB_TO_PATH[destTab] || '/';
        window.history.replaceState({ tab: destTab }, '', destPath);
        setActiveTabState(destTab);
        return;
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const paramId = urlParams.get('id') || urlParams.get('ds') || sessionStorage.getItem('selectedDsId');
      if (paramId) {
        setSelectedDsIdState(paramId);
      }
      const circuitParamId = urlParams.get('circuit') || (window.location.pathname.includes('/circuits') ? urlParams.get('id') : null) || sessionStorage.getItem('selectedCircuitId');
      if (circuitParamId) {
        setSelectedCircuitIdState(circuitParamId);
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
        selectedCircuitId,
        setSelectedCircuitId,
        selectedCircuitPreset,
        setSelectedCircuitPreset,
        openCircuitDoc,
        launchCircuitLab,
        selectedAlgoId,
        setSelectedAlgoId,
        openAlgoDoc,
        launchAlgoLab,
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
