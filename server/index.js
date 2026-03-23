import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import twilio from "twilio";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === "production";

const app = express();
const port = Number(process.env.PORT ?? 5000);
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:8080";
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const otpExpirationMs = 5 * 60 * 1000;

if (!mongoUri) {
  throw new Error("MONGODB_URI is not configured in .env");
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not configured in .env");
}

if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
  throw new Error("Twilio environment variables are not fully configured in .env");
}

const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["patient", "doctor"],
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    phoneNormalized: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: null,
    },
    age: {
      type: String,
      default: null,
    },
    occupation: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    profilePic: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    doctorType: {
      type: String,
      default: null,
    },
    lat: {
      type: Number,
      default: null,
    },
    lng: {
      type: Number,
      default: null,
    },
    passwordHash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

const otpVerificationSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
    },
    phoneNormalized: {
      type: String,
      required: true,
      unique: true,
    },
    otpCodeHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["patient-signup", "doctor-signup"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);

const normalizePhone = (phone) => String(phone ?? "").replace(/[^\d]/g, "");
const isValidTwilioPhoneNumber = (phone) => /^\+[1-9]\d{7,14}$/.test(String(phone ?? "").trim());
const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

const signOtpVerificationToken = (phoneNormalized, purpose) =>
  jwt.sign(
    {
      phoneNormalized,
      purpose,
    },
    jwtSecret,
    { expiresIn: "5m" },
  );

const toResolvedAuth = (user) => {
  if (user.role === "patient") {
    return {
      role: "patient",
      patientProfile: {
        name: user.name ?? "Patient",
        phone: user.phone,
        age: user.age ?? "Not provided",
        occupation: user.occupation ?? "Not provided",
        location: user.location ?? "Not provided",
        profilePic: user.profilePic ?? undefined,
        bio: user.bio ?? undefined,
      },
      doctorProfile: null,
    };
  }

  return {
    role: "doctor",
    patientProfile: null,
    doctorProfile: {
      name: user.name ?? "Doctor",
      phone: user.phone,
      age: user.age ?? "Not provided",
      doctorType: user.doctorType ?? "General Physician",
      password: "",
      profilePic: user.profilePic ?? undefined,
      bio: user.bio ?? undefined,
      location: user.location ?? undefined,
      lat: user.lat ?? undefined,
      lng: user.lng ?? undefined,
    },
  };
};

const signAuthToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: "7d" },
  );

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token." });
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: "Session is no longer valid." });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
};

// In production the frontend is on the same origin — allow all; in dev restrict to dev server
app.use(cors({ origin: isProduction ? true : corsOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/send-otp", async (req, res) => {
  const phone = String(req.body.phone ?? "").trim();
  const purpose = String(req.body.purpose ?? "patient-signup").trim();

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required." });
  }

  if (!["patient-signup", "doctor-signup"].includes(purpose)) {
    return res.status(400).json({ error: "Unsupported OTP purpose." });
  }

  if (!isValidTwilioPhoneNumber(phone)) {
    return res.status(400).json({ error: "Phone number must be in E.164 format, for example +919123456789." });
  }

  const phoneNormalized = normalizePhone(phone);
  const role = purpose === "doctor-signup" ? "doctor" : "patient";
  const existingUser = await User.findOne({ role, phoneNormalized });

  if (existingUser) {
    return res.status(409).json({ error: "An account with this phone number already exists. Please log in instead." });
  }

  const otpCode = generateOtpCode();
  const otpCodeHash = await bcrypt.hash(otpCode, 10);
  const expiresAt = new Date(Date.now() + otpExpirationMs);

  await OtpVerification.findOneAndUpdate(
    { phoneNormalized },
    {
      phone,
      phoneNormalized,
      otpCodeHash,
      purpose,
      expiresAt,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  try {
    await twilioClient.messages.create({
      body: `Your AI Health Navigator OTP is ${otpCode}. It expires in 5 minutes.`,
      from: twilioPhoneNumber,
      to: phone,
    });
  } catch (error) {
    console.error(error);
    return res.status(502).json({ error: "Unable to send OTP SMS right now." });
  }

  return res.json({ message: "OTP sent successfully." });
});

app.post("/verify-otp", async (req, res) => {
  const phone = String(req.body.phone ?? "").trim();
  const otp = String(req.body.otp ?? "").trim();
  const purpose = String(req.body.purpose ?? "patient-signup").trim();

  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required." });
  }

  const phoneNormalized = normalizePhone(phone);
  const verification = await OtpVerification.findOne({ phoneNormalized, purpose });

  if (!verification) {
    return res.status(400).json({ error: "OTP not found. Request a new OTP and try again." });
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    await OtpVerification.deleteOne({ _id: verification._id });
    return res.status(400).json({ error: "OTP has expired. Request a new OTP and try again." });
  }

  const isValidOtp = await bcrypt.compare(otp, verification.otpCodeHash);

  if (!isValidOtp) {
    return res.status(400).json({ error: "Invalid OTP. Check the code and try again." });
  }

  await OtpVerification.deleteOne({ _id: verification._id });

  return res.json({
    message: "OTP verified successfully.",
    verificationToken: signOtpVerificationToken(phoneNormalized, purpose),
  });
});

app.post("/api/auth/patient/signup", async (req, res) => {
  const { name, phone, age, occupation, location, verificationToken } = req.body;

  if (!name || !phone || !age || !occupation || !location) {
    return res.status(400).json({ error: "All patient signup fields are required." });
  }

  if (!verificationToken) {
    return res.status(401).json({ error: "Verify OTP before creating your account." });
  }

  const phoneNormalized = normalizePhone(phone);

  try {
    const payload = jwt.verify(verificationToken, jwtSecret);

    if (
      typeof payload === "string" ||
      payload.purpose !== "patient-signup" ||
      payload.phoneNormalized !== phoneNormalized
    ) {
      return res.status(401).json({ error: "OTP verification is invalid or expired." });
    }
  } catch {
    return res.status(401).json({ error: "OTP verification is invalid or expired." });
  }

  const existingUser = await User.findOne({ phoneNormalized });

  if (existingUser) {
    return res.status(409).json({ error: "An account with this phone number already exists. Please log in instead." });
  }

  const user = await User.create({
    role: "patient",
    phone,
    phoneNormalized,
    name,
    age,
    occupation,
    location,
    profilePic: null,
    doctorType: null,
    passwordHash: null,
  });

  const token = signAuthToken(user);
  return res.status(201).json({ token, user: toResolvedAuth(user) });
});

app.post("/api/auth/patient/login", async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required." });
  }

  const phoneNormalized = normalizePhone(phone);

  const user = await User.findOne({ role: "patient", phoneNormalized });

  if (!user || user.name?.trim().toLowerCase() !== String(name).trim().toLowerCase()) {
    return res.status(401).json({ error: "Invalid credentials. Check the phone and name and try again." });
  }

  const token = signAuthToken(user);
  return res.json({ token, user: toResolvedAuth(user) });
});

app.put("/api/profile", authMiddleware, async (req, res) => {
  const { name, bio, profilePic, age, occupation, location, lat, lng, doctorType } = req.body;
  const user = req.user;

  const updates = {};
  if (name !== undefined) updates.name = String(name).trim() || null;
  if (bio !== undefined) updates.bio = String(bio).trim() || null;
  if (profilePic !== undefined) updates.profilePic = profilePic || null;
  if (location !== undefined) updates.location = String(location).trim() || null;
  if (lat !== undefined) updates.lat = typeof lat === "number" ? lat : null;
  if (lng !== undefined) updates.lng = typeof lng === "number" ? lng : null;
  if (user.role === "patient") {
    if (age !== undefined) updates.age = String(age).trim() || null;
    if (occupation !== undefined) updates.occupation = String(occupation).trim() || null;
  } else if (user.role === "doctor") {
    if (doctorType !== undefined) updates.doctorType = String(doctorType).trim() || null;
  }

  const updated = await User.findByIdAndUpdate(user._id, updates, { new: true });
  return res.json({ user: toResolvedAuth(updated) });
});

app.post("/api/auth/doctor/signup", async (req, res) => {
  const { phone, password, verificationToken, name, location, lat, lng } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: "Phone and password are required." });
  }

  if (!verificationToken) {
    return res.status(401).json({ error: "Verify OTP before creating your account." });
  }

  const phoneNormalized = normalizePhone(phone);

  try {
    const payload = jwt.verify(verificationToken, jwtSecret);

    if (
      typeof payload === "string" ||
      payload.purpose !== "doctor-signup" ||
      payload.phoneNormalized !== phoneNormalized
    ) {
      return res.status(401).json({ error: "OTP verification is invalid or expired." });
    }
  } catch {
    return res.status(401).json({ error: "OTP verification is invalid or expired." });
  }

  const existingUser = await User.findOne({ phoneNormalized });

  if (existingUser) {
    return res.status(409).json({ error: "An account with this phone number already exists. Please log in instead." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    role: "doctor",
    phone,
    phoneNormalized,
    name: name ? String(name).trim() : null,
    age: null,
    occupation: null,
    location: location ? String(location).trim() : null,
    lat: typeof lat === "number" ? lat : null,
    lng: typeof lng === "number" ? lng : null,
    profilePic: null,
    doctorType: "General Physician",
    passwordHash,
  });

  const token = signAuthToken(user);
  return res.status(201).json({ token, user: toResolvedAuth(user) });
});

app.post("/api/auth/doctor/login", async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: "Phone and password are required." });
  }

  const phoneNormalized = normalizePhone(phone);
  const user = await User.findOne({ role: "doctor", phoneNormalized });

  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "Invalid credentials. Check the phone or password and try again." });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return res.status(401).json({ error: "Invalid credentials. Check the phone or password and try again." });
  }

  const token = signAuthToken(user);
  return res.json({ token, user: toResolvedAuth(user) });
});

app.get("/api/auth/session", authMiddleware, async (req, res) => {
  res.json({ user: toResolvedAuth(req.user) });
});

// Haversine distance in km between two lat/lng points
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

app.get("/api/doctors/nearby", async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseFloat(req.query.radius ?? "50"); // km

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng query parameters are required." });
  }

  const doctors = await User.find({ role: "doctor", lat: { $ne: null }, lng: { $ne: null } }).select(
    "name phone doctorType location lat lng profilePic bio",
  );

  const nearby = doctors
    .map((d) => ({
      id: String(d._id),
      name: d.name ?? "Doctor",
      phone: d.phone,
      doctorType: d.doctorType ?? "General Physician",
      location: d.location ?? "",
      lat: d.lat,
      lng: d.lng,
      profilePic: d.profilePic ?? null,
      bio: d.bio ?? null,
      distanceKm: haversineKm(lat, lng, d.lat, d.lng),
    }))
    .filter((d) => d.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return res.json({ doctors: nearby });
});

app.post("/api/auth/logout", (_req, res) => {
  res.status(204).send();
});

// Serve the React frontend in production
if (isProduction) {
  const distPath = path.join(__dirname, "../dist");
  app.use(express.static(distPath));
  // SPA fallback — send index.html for any unmatched route
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Unexpected server error." });
});

const startServer = async () => {
  await mongoose.connect(mongoUri);

  app.listen(port, () => {
    console.log(`MongoDB auth API running on http://localhost:${port}`);
  });
};

void startServer();
