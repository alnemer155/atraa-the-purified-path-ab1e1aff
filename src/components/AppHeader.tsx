import { useMemo } from 'react';
import { getSeasonalLogo, getSeasonalLabel } from '@/lib/seasonal-logo';

/**
 * Sticky app header.
 *
 * iOS 26.5 PWA fix: when `apple-mobile-web-app-status-bar-style` is
 * `black-translucent`, the system status bar overlays the web view, so
 * the header was being hidden under the notch / Dynamic Island after
 * installing as a PWA / native app. We now respect the top safe-area
 * inset and bump the minimum top padding so the logo always clears.
 *
 * Dark/Light mode: the default logo is white-on-black, so in light mode
 * we invert it via Tailwind's `dark:` prefix logic — the logo renders
 * normally in dark mode and is inverted (black-on-white) in light mode.
 */
const AppHeader = () => {
  const logoSrc = useMemo(() => getSeasonalLogo(), []);
  const label = useMemo(() => getSeasonalLabel(), []);

  return (
    <header
      className="sticky top-0 z-40 bg-background/70 backdrop-blur-2xl backdrop-saturate-150 border-b border-border/5"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      <div className="flex items-center justify-center px-5 py-2.5 max-w-lg mx-auto min-h-[44px]">
        <img
          src={logoSrc}
          alt={label || 'Atraa'}
          title={label || undefined}
          className="h-8 w-auto object-contain invert dark:invert-0"
        />
      </div>
    </header>
  );
};

export default AppHeader;
