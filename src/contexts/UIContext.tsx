import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface UIContextValue {
  hideHeader: boolean;
  setHideHeader: (hidden: boolean) => void;
  hideBottomNav: boolean;
  setHideBottomNav: (hidden: boolean) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [hideHeader, setHideHeader] = useState(false);
  const [hideBottomNav, setHideBottomNav] = useState(false);

  return (
    <UIContext.Provider value={{ hideHeader, setHideHeader, hideBottomNav, setHideBottomNav }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};

/**
 * Helper hook: hide the chrome (header / bottom nav) for the lifetime
 * of a component, then restore on unmount.
 */
export const useHideChrome = (opts: { header?: boolean; bottomNav?: boolean }) => {
  const { setHideHeader, setHideBottomNav } = useUI();
  const { header = false, bottomNav = false } = opts;
  useEffect(() => {
    if (header) setHideHeader(true);
    if (bottomNav) setHideBottomNav(true);
    return () => {
      if (header) setHideHeader(false);
      if (bottomNav) setHideBottomNav(false);
    };
  }, [header, bottomNav, setHideHeader, setHideBottomNav]);
};
