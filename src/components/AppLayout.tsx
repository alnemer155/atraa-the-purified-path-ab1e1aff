import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import BottomNav from './BottomNav';
import DesktopBlocker from './DesktopBlocker';
import { useIsMobile } from '@/hooks/use-mobile';

const AppLayout = () => {
  const isMobile = useIsMobile();

  // Show desktop blocker on screens wider than tablet
  if (isMobile === undefined) return null; // loading
  
  return (
    <>
      {!isMobile && <DesktopBlocker />}
      <div className={`min-h-screen bg-background max-w-lg mx-auto relative ${!isMobile ? 'hidden' : ''}`}>
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
