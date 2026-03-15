import React, { createContext, useContext, useState, ReactNode } from "react";
import type {
  UserRole, PatientProfile, DoctorProfile, ChatMessage, CheckupResult,
  Report, DoctorReply, Notification
} from "@/store/appStore";

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
  const updateDoctorReport = (id: string, reply: DoctorReply) =>
    setDoctorReports((prev) => prev.map((r) => (r.id === id ? { ...r, doctorReply: reply } : r)));

  return (
    <AppContext.Provider
      value={{
        role, setRole, patientProfile, setPatientProfile, doctorProfile, setDoctorProfile,
        chatMessages, addChatMessage, clearChat, checkupResult, setCheckupResult,
        reports, addReport, notifications, addNotification, markNotificationRead,
        language, setLanguage, isLoggedIn, setIsLoggedIn, showSplash, setShowSplash,
        patientHistory, addPatientHistory, doctorReports, addDoctorReport, updateDoctorReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
