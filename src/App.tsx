import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";

const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PoliciesPage = lazy(() => import("./pages/PoliciesPage"));
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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/policies" element={<PoliciesPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
                <Route path="/data" element={<DataPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
