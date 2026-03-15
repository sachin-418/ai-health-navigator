import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useAppContext } from "@/context/AppContext";
import SplashScreen from "@/components/SplashScreen";
import RoleSelect from "@/pages/RoleSelect";
import PatientLogin from "@/pages/PatientLogin";
import DoctorLogin from "@/pages/DoctorLogin";
import Home from "@/pages/Home";
import ChatPage from "@/pages/ChatPage";
import CheckupResult from "@/pages/CheckupResult";
import ContactDoctor from "@/pages/ContactDoctor";
import LanguagePage from "@/pages/LanguagePage";
import ProfilePage from "@/pages/ProfilePage";
import NotificationsPage from "@/pages/NotificationsPage";
import PatientHistory from "@/pages/PatientHistory";
import DoctorDashboard from "@/pages/DoctorDashboard";
import DoctorNotifications from "@/pages/DoctorNotifications";
import DoctorHistory from "@/pages/DoctorHistory";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isLoggedIn, showSplash, role } = useAppContext();

  if (showSplash) return <SplashScreen />;

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/" element={isLoggedIn ? <Navigate to={role === "doctor" ? "/doctor/dashboard" : "/home"} /> : <RoleSelect />} />
      <Route path="/login/patient" element={<PatientLogin />} />
      <Route path="/login/doctor" element={<DoctorLogin />} />

      {/* Patient routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/checkup" element={<CheckupResult />} />
      <Route path="/contact-doctor" element={<ContactDoctor />} />
      <Route path="/language" element={<LanguagePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/history" element={<PatientHistory />} />

      {/* Doctor routes */}
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/doctor/notifications" element={<DoctorNotifications />} />
      <Route path="/doctor/history" element={<DoctorHistory />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
