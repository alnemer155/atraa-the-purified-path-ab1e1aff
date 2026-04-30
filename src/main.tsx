import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { applyThemeToDocument, getStoredQuranTheme } from "./lib/quran-theme";

// Boot stored reading mode (default / sepia / night) before first paint.
applyThemeToDocument(getStoredQuranTheme());

// Cleanup: unregister any previously installed service worker (PWA removed)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister().catch(() => {}));
  }).catch(() => {});
}

// Copyright & rights notice (visible in DevTools — discourages casual copying).
try {
  const banner = [
    '%c عِتَرَةً · Atraa ',
    '%c © 2024–2026 abj-dev.xyz — All rights reserved.\n' +
      ' Unauthorized copying, redistribution or reverse engineering is prohibited.\n' +
      ' Report abuse: support@atraa.xyz',
  ];
  // eslint-disable-next-line no-console
  console.log(
    banner[0] + banner[1],
    'background:#1a3a2a;color:#fff;padding:4px 8px;border-radius:4px;font-weight:400;',
    'color:#666;font-size:11px;line-height:1.6;',
  );
  // Light anti-debug nudge in production only — never block the app.
  if (import.meta.env.PROD) {
    Object.defineProperty(window, '__ATRAA__', {
      value: Object.freeze({ owner: 'abj-dev.xyz', license: 'proprietary' }),
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }
} catch { /* never let the banner break the app */ }

createRoot(document.getElementById("root")!).render(<App />);

