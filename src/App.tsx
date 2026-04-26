import { lazy, Suspense, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import SplashScreen from "@/components/SplashScreen";
import OnboardingScreen, { isOnboardingDone } from "@/components/Onboarding/OnboardingScreen";
import { UIProvider } from "@/contexts/UIContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";

const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const QuranPage = lazy(() => import("./pages/QuranPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PoliciesPage = lazy(() => import("./pages/PoliciesPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const PrivacyPage = lazy(() => import("./pages/legal/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/legal/TermsPage"));
const DisclaimerPage = lazy(() => import("./pages/legal/DisclaimerPage"));
const DataPage = lazy(() => import("./pages/legal/DataPage"));
const AboutPage = lazy(() => import("./pages/legal/AboutPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-7 h-7 border-2 border-primary/15 border-t-primary rounded-full animate-spin" />
  </div>
);

const SPLASH_KEY = "atraa_splash_seen_v1";

const App = () => {
  // Show splash only on first launch per session (or first ever, depending on storage choice).
  // Using sessionStorage so users see it once per browser session.
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return sessionStorage.getItem(SPLASH_KEY) !== "1";
    } catch {
      return true;
    }
  });

  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDone());

  const handleSplashFinish = () => {
    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      /* ignore */
    }
    setShowSplash(false);
  };

  const handleOnboardingFinish = () => setShowOnboarding(false);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
          {!showSplash && showOnboarding && <OnboardingScreen onFinish={handleOnboardingFinish} />}
          <BrowserRouter>
            <UIProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/quran" element={<QuranPage />} />
                    <Route path="/quran/:slug" element={<QuranPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/policies" element={<PoliciesPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/disclaimer" element={<DisclaimerPage />} />
                    <Route path="/data" element={<DataPage />} />
                    <Route path="/about" element={<AboutPage />} />
                  </Route>

                  <Route element={<AppLayout />}>
                    {/* Locale-aware aliases: /SA-ar, /SA-en, /US-en, etc. */}
                    <Route path="/:locale" element={<HomePage />} />
                    <Route path="/:locale/library" element={<LibraryPage />} />
                    <Route path="/:locale/quran" element={<QuranPage />} />
                    <Route path="/:locale/quran/:slug" element={<QuranPage />} />
                    <Route path="/:locale/settings" element={<SettingsPage />} />
                    <Route path="/:locale/about" element={<AboutPage />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </UIProvider>
          </BrowserRouter>
          <Analytics />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
