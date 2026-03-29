import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import SplashScreen from "./components/SplashScreen";
import HomePage from "./pages/HomePage";
import Registration from "./pages/Registration";
import LibraryPage from "./pages/LibraryPage";
import AiPage from "./pages/AiPage";

import QuizPage from "./pages/QuizPage";
import SettingsPage from "./pages/SettingsPage";
import PoliciesPage from "./pages/PoliciesPage";
import NotFound from "./pages/NotFound";
import UnsubscribePage from "./pages/UnsubscribePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SplashScreen />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
