import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HealthTracker from "./pages/HealthTracker";
import Appointments from "./pages/Appointments";
import PreventiveHealth from "./pages/PreventiveHealth";
import Insurance from "./pages/Insurance";
import Symptoms from "./pages/Symptoms";
import BMI from "./pages/Consultation";
import Medicine from "./pages/Medicine";
import NotFound from "./pages/NotFound";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { ThemeProvider } from "./utils/theme.provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Profile from "./pages/Profile";
// import ChatPage from "./components/Chat";
import { AuthProvider } from "./auth/AuthProvider";
import ChatCall from "./pages/chat/VideoChat";
import DocRegister from "./auth/DocRegister";
import AiDoctor from "./pages/AiDoctor";
import HealthFeedPage from "./pages/HealthFeed";
import RepostsPage from "./pages/Report";
import Diet from "./pages/Diet";
import MainLayout from "./components/layout/MainLayout";
import ConsultationBooking from "./pages/ConsBooking";
import Consultation from "./pages/Consultation";
import Emergency from "./pages/Emergency";
import CalorieCalculator from "./pages/CalorieCalculator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
      onScriptLoadError={() => console.error("Google Script failed to load")}
    >
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <AuthProvider>
                    <Index />
                  </AuthProvider>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doc-register" element={<DocRegister />} />
              <Route
                path="/profile"
                element={
                  <AuthProvider>
                    <Profile />
                  </AuthProvider>
                }
              />
              <Route
                path="/health-tracker"
                element={
                  <AuthProvider>
                    <HealthTracker />
                  </AuthProvider>
                }
              />
              <Route
                path="/preventive-health"
                element={
                  <AuthProvider>
                    <PreventiveHealth />
                  </AuthProvider>
                }
              />
              <Route
                path="/insurance"
                element={
                  <AuthProvider>
                    <Insurance />
                  </AuthProvider>
                }
              />
              <Route
                path="/symptoms"
                element={
                  <AuthProvider>
                    <Symptoms />
                  </AuthProvider>
                }
              />
              <Route
                path="/consultation"
                element={
                  <AuthProvider>
                    <Consultation />
                  </AuthProvider>
                }
              />
              <Route
                path="/consultation/:doctorId"
                element={
                  <AuthProvider>
                    <ConsultationBooking />
                  </AuthProvider>
                }
              />
              <Route
                path="/medicine"
                element={
                  <AuthProvider>
                    <Medicine />
                  </AuthProvider>
                }
              />
              <Route
                path="/calorie-calculator"
                element={
                  <AuthProvider>
                    <CalorieCalculator />
                  </AuthProvider>
                }
              />
              <Route
                path="/chat"
                element={
                  <AuthProvider>
                    <ChatCall />
                  </AuthProvider>
                }
              />
              <Route
                path="/ai-doctor"
                element={
                  <AuthProvider>
                    <AiDoctor />
                  </AuthProvider>
                }
              />
              <Route
                path="/feed"
                element={
                  <AuthProvider>
                    <HealthFeedPage />
                  </AuthProvider>
                }
              />
              <Route
                path="/report"
                element={
                  <AuthProvider>
                    <MainLayout>
                      <RepostsPage />
                    </MainLayout>
                  </AuthProvider>
                }
              />
              <Route
                path="/diet"
                element={
                  <AuthProvider>
                    <Diet />
                  </AuthProvider>
                }
              />
              <Route
                path="/emergency"
                element={
                  <AuthProvider>
                    <Emergency />
                  </AuthProvider>
                }
              />
              <Route
                path="*"
                element={
                  <AuthProvider>
                    <NotFound />
                  </AuthProvider>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);

export default App;
