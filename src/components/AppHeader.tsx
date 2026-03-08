import logo from '@/assets/logo.png';

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="w-8" />
        <div className="flex items-center gap-2">
          <img src={logo} alt="عِتْرَة" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-lg font-semibold text-foreground">عِتْرَة</span>
        </div>
        <div className="w-8" />
      </div>
    </header>
  );
};

export default AppHeader;
