import logo from '@/assets/logo-v11.png';

const DesktopBlocker = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <img src={logo} alt="عِتْرَة" className="h-20 w-20 mx-auto mb-6 rounded-2xl" />
        <h1 className="text-2xl font-semibold text-foreground mb-3">عِتْرَة</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Desktop support will be available soon.
        </p>
        <p className="text-muted-foreground text-sm mt-4">
          يرجى فتح التطبيق من هاتفك أو جهازك اللوحي
        </p>
      </div>
    </div>
  );
};

export default DesktopBlocker;
