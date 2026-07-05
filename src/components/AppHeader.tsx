import { useMemo } from 'react';
import { getSeasonalLogo, getSeasonalLabel } from '@/lib/seasonal-logo';
import wordmarkBlackAsset from '@/assets/brand/atraa-wordmark-black.png.asset.json';
import wordmarkDarkAsset from '@/assets/brand/atraa-wordmark-dark.png.asset.json';

/**
 * Sticky app header.
 *
 * iOS 26.5 PWA fix: respects the top safe-area inset so the logo always
 * clears the notch / Dynamic Island in PWA/native installs.
 *
 * Dark/Light mode: we ship a native BLACK wordmark for light mode and the
 * white wordmark for dark mode — no CSS invert. Seasonal logos are single
 * dark-on-transparent PNGs, so they still use `invert dark:invert-0`.
 */
const AppHeader = () => {
  const seasonalSrc = useMemo(() => getSeasonalLogo(), []);
  const label = useMemo(() => getSeasonalLabel(), []);
  const isSeasonal = !!label;

  return (
    <header
      className="sticky top-0 z-40 glass-surface border-b border-foreground/5"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      <div className="flex items-center justify-center px-5 py-2.5 max-w-lg mx-auto min-h-[44px]">
        {isSeasonal ? (
          <img
            src={seasonalSrc}
            alt={label || 'Atraa'}
            title={label || undefined}
            className="h-7 w-auto object-contain invert dark:invert-0 opacity-90"
          />
        ) : (
          <>
            <img
              src={wordmarkBlackAsset.url}
              alt="Atraa"
              className="h-7 w-auto object-contain opacity-90 block dark:hidden"
            />
            <img
              src={wordmarkDarkAsset.url}
              alt="Atraa"
              className="h-7 w-auto object-contain opacity-90 hidden dark:block"
            />
          </>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
