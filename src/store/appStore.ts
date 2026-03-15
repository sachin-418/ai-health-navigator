// Simple global state management using React context
import { createContext, useContext } from "react";

export type UserRole = "patient" | "doctor" | null;

export interface PatientProfile {
  phone: string;
  age: string;
  occupation: string;
  location: string;
  profilePic?: string;
  name?: string;
}

export interface DoctorProfile {
  phone: string;
  age: string;
  doctorType: string;
  password: string;
  name?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "voice" | "image";
  imageUrl?: string;
  timestamp: Date;
}

export interface CheckupResult {
  healthScore: number;
  diseaseName: string;
  conditionLevel: "mild" | "moderate" | "severe";
  similarityLevel: number;
  safetyTips: string[];
  symptoms: string[];
}

export interface Report {
  id: string;
  patientName: string;
  patientPhone: string;
  patientAge: string;
  patientOccupation: string;
  patientLocation: string;
  checkupResult: CheckupResult;
  date: string;
  language: string;
  doctorReply?: DoctorReply;
  read?: boolean;
}

export interface DoctorReply {
  solution: string;
  timeSlot?: {
    type: "phone" | "video" | "live";
    dateTime: string;
  };
  doctorName: string;
  doctorType: string;
}

export interface Notification {
  id: string;
  type: "report" | "reply";
  title: string;
  message: string;
  data: Report | DoctorReply;
  read: boolean;
  timestamp: Date;
}

export interface Hospital {
  id: string;
  name: string;
  distance: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
}

export const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳" },
  { code: "bn", name: "বাংলা", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export const MOCK_HOSPITALS: Hospital[] = [
  { id: "1", name: "City General Hospital", distance: "2.3 km", phone: "+91 98765 43210", address: "MG Road, City Center", lat: 12.97, lng: 77.59 },
  { id: "2", name: "Apollo Health Center", distance: "4.1 km", phone: "+91 98765 43211", address: "Ring Road, Sector 5", lat: 12.98, lng: 77.60 },
  { id: "3", name: "Care Medical Institute", distance: "5.8 km", phone: "+91 98765 43212", address: "NH-44, Industrial Area", lat: 12.95, lng: 77.57 },
  { id: "4", name: "LifeLine Emergency Hospital", distance: "1.5 km", phone: "+91 98765 43213", address: "Station Road", lat: 12.96, lng: 77.58 },
];

export const MOCK_VILLAGE_DATA = [
  { village: "Rampur", totalCases: 145, diseases: [{ name: "Dengue", count: 45, level: "severe" }, { name: "Malaria", count: 30, level: "moderate" }, { name: "Typhoid", count: 70, level: "mild" }] },
  { village: "Sundarpur", totalCases: 98, diseases: [{ name: "COVID-19", count: 28, level: "moderate" }, { name: "Flu", count: 50, level: "mild" }, { name: "Skin Infection", count: 20, level: "mild" }] },
  { village: "Krishnanagar", totalCases: 210, diseases: [{ name: "Dengue", count: 80, level: "severe" }, { name: "Cholera", count: 60, level: "severe" }, { name: "Malaria", count: 70, level: "moderate" }] },
  { village: "Lakshmipur", totalCases: 67, diseases: [{ name: "Flu", count: 40, level: "mild" }, { name: "Skin Allergy", count: 27, level: "mild" }] },
  { village: "Govindapur", totalCases: 178, diseases: [{ name: "Tuberculosis", count: 55, level: "severe" }, { name: "Pneumonia", count: 48, level: "moderate" }, { name: "Bronchitis", count: 75, level: "moderate" }] },
];
