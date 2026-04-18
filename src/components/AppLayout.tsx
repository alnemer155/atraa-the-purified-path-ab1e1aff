import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import BottomNav from './BottomNav';
import DesktopBlocker from './DesktopBlocker';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AppLayout = () => {
  const isMobile = useIsMobile();
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  if (isMobile === undefined) return null;

  return (
    <>
      {!isMobile && <DesktopBlocker />}
      <div className={`min-h-screen bg-background max-w-lg md:max-w-2xl mx-auto relative ${!isMobile ? 'hidden' : ''}`}>
        <AppHeader />
        <main className="safe-bottom">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </>
  );
};

export default AppLayout;
