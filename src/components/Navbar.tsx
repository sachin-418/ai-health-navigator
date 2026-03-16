import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Heart, Menu, X, Bell, User, LogOut, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const patientLinks = [
  { to: "/home", label: "Home" },
  { to: "/chat", label: "AI Chat" },
  { to: "/language", label: "Language" },
  { to: "/history", label: "History" },
];

const doctorLinks = [
  { to: "/doctor/dashboard", label: "Dashboard" },
  { to: "/doctor/notifications", label: "Reports" },
  { to: "/doctor/history", label: "History" },
];

export default function Navbar() {
<<<<<<< HEAD
  const { role, patientProfile, doctorProfile, notifications, setRole, setIsLoggedIn } = useAppContext();
=======
  const { role, notifications, signOut } = useAppContext();
>>>>>>> a0dc8d9 (initial)
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const links = role === "doctor" ? doctorLinks : patientLinks;
  const unreadCount = notifications.filter((n) => !n.read).length;

<<<<<<< HEAD
  const handleLogout = () => {
    setRole(null);
    setIsLoggedIn(false);
=======
  const handleLogout = async () => {
    await signOut();
>>>>>>> a0dc8d9 (initial)
    navigate("/");
  };

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to={role === "doctor" ? "/doctor/dashboard" : "/home"} className="flex items-center gap-2">
            <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient-primary">AI Health</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === l.to
                    ? "gradient-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={() => navigate(role === "doctor" ? "/doctor/notifications" : "/notifications")}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button onClick={() => navigate(role === "doctor" ? "/doctor/dashboard" : "/profile")} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <User className="h-5 w-5 text-muted-foreground" />
            </button>

            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border/50"
          >
            <div className="p-4 flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === l.to
                      ? "gradient-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
