import logo from '@/assets/logo.png';

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-end px-4 py-3 max-w-lg mx-auto">
        <img src={logo} alt="عِتْرَة" className="h-9 w-9 object-contain" />
      </div>
    </header>
  );
};

export default AppHeader;
