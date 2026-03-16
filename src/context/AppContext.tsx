<<<<<<< HEAD
import React, { createContext, useContext, useState, ReactNode } from "react";
=======
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
>>>>>>> a0dc8d9 (initial)
import type {
  UserRole, PatientProfile, DoctorProfile, ChatMessage, CheckupResult,
  Report, DoctorReply, Notification
} from "@/store/appStore";
<<<<<<< HEAD
=======
import {
  loginDoctor,
  loginPatient,
  logoutUser,
  restoreAuthSession,
  signUpDoctor,
  signUpPatient,
  updateUserProfile,
  type ProfileUpdateData,
} from "@/lib/auth";
>>>>>>> a0dc8d9 (initial)

interface AppState {
  role: UserRole;
  setRole: (r: UserRole) => void;
  patientProfile: PatientProfile | null;
  setPatientProfile: (p: PatientProfile | null) => void;
  doctorProfile: DoctorProfile | null;
  setDoctorProfile: (d: DoctorProfile | null) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (m: ChatMessage) => void;
  clearChat: () => void;
  checkupResult: CheckupResult | null;
  setCheckupResult: (r: CheckupResult | null) => void;
  reports: Report[];
  addReport: (r: Report) => void;
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  language: string;
  setLanguage: (l: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (b: boolean) => void;
  showSplash: boolean;
  setShowSplash: (b: boolean) => void;
  patientHistory: Report[];
  addPatientHistory: (r: Report) => void;
  doctorReports: Report[];
  addDoctorReport: (r: Report) => void;
  updateDoctorReport: (id: string, reply: DoctorReply) => void;
<<<<<<< HEAD
=======
  authLoading: boolean;
  signInPatient: (name: string, phone: string) => Promise<{ error?: string }>;
  registerPatient: (name: string, phone: string, age: string, occupation: string, location: string, verificationToken: string) => Promise<{ error?: string }>;
  signInDoctor: (phone: string, password: string) => Promise<{ error?: string }>;
  registerDoctor: (phone: string, password: string, verificationToken: string, name: string, location?: string, lat?: number, lng?: number) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<{ error?: string }>;
>>>>>>> a0dc8d9 (initial)
}

const AppContext = createContext<AppState | undefined>(undefined);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [checkupResult, setCheckupResult] = useState<CheckupResult | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [language, setLanguage] = useState("en");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
<<<<<<< HEAD
=======
  const [authLoading, setAuthLoading] = useState(true);
>>>>>>> a0dc8d9 (initial)
  const [patientHistory, setPatientHistory] = useState<Report[]>([]);
  const [doctorReports, setDoctorReports] = useState<Report[]>([
    // Mock initial report for doctor
    {
      id: "demo-1",
      patientName: "Rahul Kumar",
      patientPhone: "+91 99887 76655",
      patientAge: "32",
      patientOccupation: "Farmer",
      patientLocation: "Rampur",
      checkupResult: {
        healthScore: 62,
        diseaseName: "Dengue Fever",
        conditionLevel: "moderate",
        similarityLevel: 78,
        safetyTips: ["Stay hydrated", "Take rest", "Monitor platelet count"],
        symptoms: ["High fever", "Joint pain", "Rash"],
      },
      date: new Date().toISOString(),
      language: "en",
      read: false,
    },
  ]);

  const addChatMessage = (m: ChatMessage) => setChatMessages((prev) => [...prev, m]);
  const clearChat = () => setChatMessages([]);
  const addReport = (r: Report) => setReports((prev) => [...prev, r]);
  const addNotification = (n: Notification) => setNotifications((prev) => [n, ...prev]);
  const markNotificationRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const addPatientHistory = (r: Report) => setPatientHistory((prev) => [...prev, r]);
  const addDoctorReport = (r: Report) => setDoctorReports((prev) => [...prev, r]);
<<<<<<< HEAD
  const updateDoctorReport = (id: string, reply: DoctorReply) =>
    setDoctorReports((prev) => prev.map((r) => (r.id === id ? { ...r, doctorReply: reply } : r)));
=======
  const updateDoctorReport = (id: string, reply: DoctorReply) => {
    setDoctorReports((prev) => prev.map((r) => (r.id === id ? { ...r, doctorReply: reply } : r)));
    setPatientHistory((prev) => prev.map((r) => (r.id === id ? { ...r, doctorReply: reply } : r)));
  };

  const clearAuthState = () => {
    setRole(null);
    setPatientProfile(null);
    setDoctorProfile(null);
    setIsLoggedIn(false);
  };

  const applyResolvedAuth = (resolved: {
    role: UserRole;
    patientProfile: PatientProfile | null;
    doctorProfile: DoctorProfile | null;
  }) => {
    setRole(resolved.role);
    setPatientProfile(resolved.patientProfile);
    setDoctorProfile(resolved.doctorProfile);
    setIsLoggedIn(Boolean(resolved.role));
  };

  useEffect(() => {
    let active = true;

    const syncSession = async () => {
      const result = await restoreAuthSession();
      if (!active) return;

      if (result.data) {
        applyResolvedAuth(result.data);
      } else {
        clearAuthState();
      }

      setAuthLoading(false);
    };

    void syncSession();

    return () => {
      active = false;
    };
  }, []);

  const signInPatientHandler = async (name: string, phone: string) => {
    const result = await loginPatient(name, phone);
    if (result.data) {
      applyResolvedAuth(result.data);
    }
    return { error: result.error };
  };

  const registerPatientHandler = async (name: string, phone: string, age: string, occupation: string, location: string, verificationToken: string) => {
    const result = await signUpPatient(name, phone, age, occupation, location, verificationToken);
    if (result.data) {
      applyResolvedAuth(result.data);
    }
    return { error: result.error };
  };

  const signInDoctorHandler = async (phone: string, password: string) => {
    const result = await loginDoctor(phone, password);
    if (result.data) {
      applyResolvedAuth(result.data);
    }
    return { error: result.error };
  };

  const registerDoctorHandler = async (phone: string, password: string, verificationToken: string, name: string, location?: string, lat?: number, lng?: number) => {
    const result = await signUpDoctor(phone, password, verificationToken, name, location, lat, lng);
    if (result.data) {
      applyResolvedAuth(result.data);
    }
    return { error: result.error };
  };

  const signOutHandler = async () => {
    await logoutUser();
    clearAuthState();
  };

  const updateProfileHandler = async (data: ProfileUpdateData) => {
    const result = await updateUserProfile(data);
    if (result.data) {
      applyResolvedAuth(result.data);
    }
    return { error: result.error };
  };
>>>>>>> a0dc8d9 (initial)

  return (
    <AppContext.Provider
      value={{
        role, setRole, patientProfile, setPatientProfile, doctorProfile, setDoctorProfile,
        chatMessages, addChatMessage, clearChat, checkupResult, setCheckupResult,
        reports, addReport, notifications, addNotification, markNotificationRead,
        language, setLanguage, isLoggedIn, setIsLoggedIn, showSplash, setShowSplash,
        patientHistory, addPatientHistory, doctorReports, addDoctorReport, updateDoctorReport,
<<<<<<< HEAD
=======
        authLoading,
        signInPatient: signInPatientHandler,
        registerPatient: registerPatientHandler,
        signInDoctor: signInDoctorHandler,
        registerDoctor: registerDoctorHandler,
        signOut: signOutHandler,
        updateProfile: updateProfileHandler,
>>>>>>> a0dc8d9 (initial)
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
