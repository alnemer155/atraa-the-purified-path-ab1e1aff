import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import SplashScreen from "./components/SplashScreen";
import HomePage from "./pages/HomePage";
import Registration from "./pages/Registration";

// Lazy-loaded routes for performance
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const AiPage = lazy(() => import("./pages/AiPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PoliciesPage = lazy(() => import("./pages/PoliciesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-[11px] text-muted-foreground font-medium">جاري التحميل...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SplashScreen />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/register" element={<Registration />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/ai" element={<AiPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/q/:shareCode" element={<QuizPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/policies" element={<PoliciesPage />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
