import { useMemo } from 'react';
import { getSeasonalLogo, getSeasonalLabel } from '@/lib/seasonal-logo';

const AppHeader = () => {
  const logoSrc = useMemo(() => getSeasonalLogo(), []);
  const label = useMemo(() => getSeasonalLabel(), []);

  return (
    <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl backdrop-saturate-150 border-b border-border/5">
      <div className="flex items-center justify-center px-5 py-2.5 max-w-lg mx-auto">
        <img
          src={logoSrc}
          alt={label || 'Atraa'}
          title={label || undefined}
          className="h-8 w-auto object-contain"
        />
      </div>
    </header>
  );
};

export default AppHeader;
