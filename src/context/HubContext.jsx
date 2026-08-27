import React, { createContext, useContext, useState, useEffect } from 'react';

const HubContext = createContext();

const PATH_TO_TAB = {
  '/': 'hub',
  '/home': 'hub',
  '/labs': 'labs',
  '/logicraft': 'logic-gates',
  '/logic-gates': 'logic-gates',
  '/dsa-visualizer': 'cs-visualizer',
  '/dsa': 'cs-visualizer',
  '/cs-visualizer': 'cs-visualizer',
  '/systems': 'systems-preview',
  '/systems-preview': 'systems-preview',
};

const TAB_TO_PATH = {
  'hub': '/home',
  'labs': '/labs',
  'logic-gates': '/logicraft',
  'cs-visualizer': '/dsa-visualizer',
  'systems-preview': '/systems',
};

const getInitialTab = () => {
  if (typeof window === 'undefined') return 'hub';
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const normalizedPath = path === '' ? '/' : path;
  return PATH_TO_TAB[normalizedPath] || 'hub';
};

export const HubProvider = ({ children }) => {
  // Active View: 'hub' | 'logic-gates' | 'cs-visualizer' | 'systems-preview'
  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' | 'light'
  const [accentTheme, setAccentTheme] = useState('cyan'); // 'cyan' | 'purple' | 'emerald'
  const [stats] = useState({
    labsCount: 4,
    operationsCount: 1420,
    hardwareNodes: 28,
    activeLearners: '1.2k+'
  });

  const navigateTo = (tab, replace = false) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const targetPath = TAB_TO_PATH[tab] || '/home';
    if (window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState({ tab }, '', targetPath);
      } else {
        window.history.pushState({ tab }, '', targetPath);
      }
    }
  };

  // Sync canonical URL path on initial mount
  useEffect(() => {
    const currentPath = window.location.pathname;
    const initialTab = getInitialTab();
    const canonicalPath = TAB_TO_PATH[initialTab];

    if (canonicalPath && currentPath !== canonicalPath) {
      window.history.replaceState({ tab: initialTab }, '', canonicalPath);
    }
  }, []);

  // Listen for browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const normalizedPath = path === '' ? '/' : path;
      const matchedTab = PATH_TO_TAB[normalizedPath] || 'hub';
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
