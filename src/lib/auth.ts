import type { DoctorProfile, PatientProfile, UserRole } from "@/store/appStore";

type ResolvedAuth = {
  role: UserRole;
  patientProfile: PatientProfile | null;
  doctorProfile: DoctorProfile | null;
};

type AuthResult = {
  data?: ResolvedAuth;
  error?: string;
};

type ApiAuthResponse = {
  token?: string;
  user?: ResolvedAuth;
  error?: string;
};

type OtpApiResponse = {
  message?: string;
  verificationToken?: string;
  error?: string;
};

type OtpResult = {
  message?: string;
  verificationToken?: string;
  error?: string;
};

// Empty string = same origin (works in production where backend serves frontend).
// In development the Vite proxy at /api forwards to localhost:5000 automatically.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const AUTH_TOKEN_KEY = "aihealth.auth.token";

const getAuthErrorMessage = (message: string) => {
  const lower = message.toLowerCase();

  if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("network request failed")) {
    return "Cannot connect to the MongoDB API. Make sure the backend is running and VITE_API_BASE_URL is correct.";
  }

  if (lower.includes("already exists") || lower.includes("already registered")) {
    return "An account with this phone number already exists. Please log in instead.";
  }

  if (lower.includes("invalid credentials")) {
    return "Invalid credentials. Check the phone, name, or password and try again.";
  }

  if (lower.includes("verify otp")) {
    return "Verify OTP before logging in.";
  }

  if (lower.includes("otp has expired")) {
    return "OTP has expired. Request a new OTP and try again.";
  }

  if (lower.includes("otp not found")) {
    return "OTP not found. Request a new OTP and try again.";
  }

  if (lower.includes("invalid otp")) {
    return "Invalid OTP. Check the code and try again.";
  }

  if (lower.includes("unable to send otp")) {
    return "Unable to send OTP SMS right now.";
  }

  return message;
};

const storeAuthToken = (token?: string) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
};

const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

const apiRequest = async <T>(
  path: string,
  init: RequestInit = {},
  includeAuth = false,
): Promise<T> => {
  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? "Request failed.");
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
};

const resolveAuthFromResponse = (payload: ApiAuthResponse): AuthResult => {
  if (payload.token) {
    storeAuthToken(payload.token);
  }

  if (!payload.user) {
    return { error: "Unable to resolve user profile." };
  }

  return { data: payload.user };
};

const clearSession = () => {
  storeAuthToken(undefined);
};

export const restoreAuthSession = async (): Promise<AuthResult> => {
  const token = getAuthToken();

  if (!token) {
    return { data: { role: null, patientProfile: null, doctorProfile: null } };
  }

  try {
    const payload = await apiRequest<{ user: ResolvedAuth }>("/api/auth/session", {}, true);
    return { data: payload.user };
  } catch (error) {
    clearSession();
    return { error: getAuthErrorMessage(error instanceof Error ? error.message : "Unable to restore session.") };
  }
};

export const signUpPatient = async (
  name: string,
  phone: string,
  age: string,
  occupation: string,
  location: string,
  verificationToken: string,
): Promise<AuthResult> => {
  try {
    const payload = await apiRequest<ApiAuthResponse>("/api/auth/patient/signup", {
      method: "POST",
      body: JSON.stringify({ name, phone, age, occupation, location, verificationToken }),
    });

    return resolveAuthFromResponse(payload);
  } catch (error) {
    return { error: getAuthErrorMessage(error instanceof Error ? error.message : "Unable to sign up patient.") };
  }
};

export const sendPatientOtp = async (phone: string): Promise<OtpResult> => {
  try {
    const payload = await apiRequest<OtpApiResponse>("/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone, purpose: "patient-signup" }),
    });

    return { message: payload.message };
  } catch (error) {
    return { error: getAuthErrorMessage(error instanceof Error ? error.message : "Unable to send OTP.") };
  }
};

export const verifyPatientOtp = async (phone: string, otp: string): Promise<OtpResult> => {
  try {
    const payload = await apiRequest<OtpApiResponse>("/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp, purpose: "patient-signup" }),
    });

    return {
      message: payload.message,
      verificationToken: payload.verificationToken,
    };
  } catch (error) {
    return { error: getAuthErrorMessage(error instanceof Error ? error.message : "Unable to verify OTP.") };
  }
};

export const sendDoctorOtp = async (phone: string): Promise<OtpResult> => {
  try {
    const payload = await apiRequest<OtpApiResponse>("/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone, purpose: "doctor-signup" }),
    });

    return { message: payload.message };
  } catch (error) {
    return { error: getAuthErrorMessage(error instanceof Error ? error.message : "Unable to send OTP.") };
  }
};

export const verifyDoctorOtp = async (phone: string, otp: string): Promise<OtpResult> => {
  try {
    const payload = await apiRequest<OtpApiResponse>("/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp, purpose: "doctor-signup" }),
    });

    return {
      message: payload.message,
      verificationToken: payload.verificationToken,
    };
  } catch (error) {
    return { error: getAuthErrorMessage(error instanceof Error ? error.message : "Unable to verify OTP.") };
  }
};

export const loginPatient = async (name: string, phone: string): Promise<AuthResult> => {
  try {
    const payload = await apiRequest<ApiAuthResponse>("/api/auth/patient/login", {
      method: "POST",
      body: JSON.stringify({ name, phone }),
    });

    return resolveAuthFromResponse(payload);
  } catch (error) {
    return { error: getAuthErrorMessage(error instanceof Error ? error.message : "Unable to log in patient.") };
  }
};

export const signUpDoctor = async (
  phone: string,
  password: string,
  verificationToken: string,
  name: string,
  location?: string,
  lat?: number,
  lng?: number,
): Promise<AuthResult> => {
  try {
    const payload = await apiRequest<ApiAuthResponse>("/api/auth/doctor/signup", {
      method: "POST",
      body: JSON.stringify({ phone, password, verificationToken, name, location, lat, lng }),
    });

    return resolveAuthFromResponse(payload);
  } catch (error) {
    return { error: getAuthErrorMessage(error instanceof Error ? error.message : "Unable to sign up doctor.") };
  }
};

export const loginDoctor = async (phone: string, password: string): Promise<AuthResult> => {
  try {
    const payload = await apiRequest<ApiAuthResponse>("/api/auth/doctor/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });

    return resolveAuthFromResponse(payload);
  } catch (error) {
    return { error: getAuthErrorMessage(error instanceof Error ? error.message : "Unable to log in doctor.") };
  }
};

export type NearbyDoctor = {
  id: string;
  name: string;
  phone: string;
  doctorType: string;
  location: string;
  lat: number;
  lng: number;
  profilePic: string | null;
  bio: string | null;
  distanceKm: number;
};

export const fetchNearbyDoctors = async (
  lat: number,
  lng: number,
  radiusKm = 50,
): Promise<{ doctors?: NearbyDoctor[]; error?: string }> => {
  try {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radiusKm) });
    const data = await apiRequest<{ doctors: NearbyDoctor[] }>(`/api/doctors/nearby?${params}`);
    return { doctors: data.doctors };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to fetch nearby doctors." };
  }
};

export const logoutUser = async () => {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" }, true);
  } finally {
    clearSession();
  }
};

export type ProfileUpdateData = {
  name?: string;
  bio?: string;
  profilePic?: string;
  age?: string;
  occupation?: string;
  location?: string;
  lat?: number;
  lng?: number;
  doctorType?: string;
};

export const updateUserProfile = async (data: ProfileUpdateData): Promise<AuthResult> => {
  try {
    const payload = await apiRequest<{ user: ResolvedAuth }>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }, true);
    return { data: payload.user };
  } catch (error) {
    return { error: getAuthErrorMessage(error instanceof Error ? error.message : "Unable to update profile.") };
  }
};
