import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import Registration from "./pages/Registration";
import DuasPage from "./pages/DuasPage";
import AiPage from "./pages/AiPage";
import QiblaPage from "./pages/QiblaPage";
import SettingsPage from "./pages/SettingsPage";
import PoliciesPage from "./pages/PoliciesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Registration />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/duas" element={<DuasPage />} />
            <Route path="/ai" element={<AiPage />} />
            <Route path="/qibla" element={<QiblaPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
