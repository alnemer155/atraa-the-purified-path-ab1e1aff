import logo from '@/assets/logo-v11.png';
import { useTranslation } from 'react-i18next';

const AppHeader = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl backdrop-saturate-150 border-b border-border/5">
      <div className="flex items-center justify-center px-5 py-2.5 max-w-lg mx-auto">
        <img src={logo} alt="Atraa" className="h-8 w-auto object-contain" />
      </div>
    </header>
  );
};

export default AppHeader;
