import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration for Atraa (عِتَرَةً).
 *
 * IMPORTANT: per project memory, the `server` block below MUST be removed
 * before producing a production build for the App Store / Play Store.
 * It only exists to enable hot-reload from the Lovable sandbox during
 * development.
 */
const config: CapacitorConfig = {
  appId: 'app.lovable.001f52582af34dbb87daafdfb33a8518',
  appName: 'atraa',
  webDir: 'dist',
  // ⚠️ Remove this entire `server` block for production / App Store builds.
  server: {
    url: 'https://001f5258-2af3-4dbb-87da-afdfb33a8518.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#000000',
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#1a3a2a',
      // Custom adhan sound files must be added natively:
      //   iOS:     ios/App/App/adhan.caf
      //   Android: android/app/src/main/res/raw/adhan.mp3
      sound: 'adhan.caf',
    },
  },
};

export default config;
