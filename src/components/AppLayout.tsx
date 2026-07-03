import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import BottomNav from './BottomNav';
import DesktopSidebar from './DesktopSidebar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '@/contexts/UIContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const AppLayout = () => {
  const { i18n } = useTranslation();
  const { hideHeader, hideBottomNav } = useUI();
  const isMobile = useIsMobile();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  // Mobile / tablet — original compact shell.
  if (isMobile !== false) {
    return (
      <div
        className="min-h-screen bg-background max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto relative"
        style={{
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {!hideHeader && <AppHeader />}
        <main className="safe-bottom">
          <Outlet />
        </main>
        {!hideBottomNav && <BottomNav />}
      </div>
    );
  }

  // Desktop (≥ 1024px) — sidebar-driven layout, wider content area (v2.11.16).
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <DesktopSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 h-12 flex items-center gap-3 border-b border-border/30 bg-background/85 backdrop-blur-xl px-4">
            <SidebarTrigger className="text-muted-foreground" />
            <span className="text-[12px] text-muted-foreground/70">
              {i18n.language === 'ar' ? 'منصة عِتْرَة' : 'Atraa Platform'}
            </span>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-5xl px-4 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
