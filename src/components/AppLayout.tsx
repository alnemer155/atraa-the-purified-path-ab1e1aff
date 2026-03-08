import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import BottomNav from './BottomNav';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <AppHeader />
      <main className="safe-bottom">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
