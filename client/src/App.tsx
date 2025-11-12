import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Landing from "./pages/Landing";
import InputModeSelection from "./pages/InputModeSelection";
import ManualInput from "./pages/ManualInput";
import RTLUpload from "./pages/RTLUpload";
import Summary from "./pages/Summary";
import TimingConfig from "./pages/TimingConfig";
import Prediction from "./pages/Prediction";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/input-mode" element={<InputModeSelection />} />
            <Route path="/manual-input" element={<ManualInput />} />
            <Route path="/rtl-upload" element={<RTLUpload />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/timing-config" element={<TimingConfig />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
