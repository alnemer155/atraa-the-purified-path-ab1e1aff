import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { scheduleQuizNotifications, scheduleDhikrReminders } from "./lib/notifications";

// Apply system theme on load
const applyTheme = () => {
  const saved = localStorage.getItem('atraa_theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
applyTheme();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (!localStorage.getItem('atraa_theme')) applyTheme();
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Schedule notifications on app load
if ('Notification' in window && Notification.permission === 'granted') {
  scheduleQuizNotifications();
  scheduleDhikrReminders();
}

createRoot(document.getElementById("root")!).render(<App />);
