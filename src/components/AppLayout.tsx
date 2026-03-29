import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import BottomNav from './BottomNav';
import DesktopBlocker from './DesktopBlocker';
import UpdateBanner from './UpdateBanner';
import { useIsMobile } from '@/hooks/use-mobile';

const AppLayout = () => {
  const isMobile = useIsMobile();

  if (isMobile === undefined) return null;
  
  return (
    <>
      {!isMobile && <DesktopBlocker />}
      <div className={`min-h-screen bg-background max-w-lg mx-auto relative ${!isMobile ? 'hidden' : ''}`}>
        <AppHeader />
        <UpdateBanner />
        <main className="safe-bottom">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </>
  );
};

export default AppLayout;
