<<<<<<< HEAD
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { Phone, Lock, Stethoscope, ArrowRight, CheckCircle } from "lucide-react";

const DOCTOR_TYPES = ["General Physician", "Dermatologist", "Cardiologist", "Neurologist", "Orthopedic", "ENT Specialist", "Pediatrician", "Psychiatrist"];

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { setRole, setDoctorProfile, setIsLoggedIn, setShowSplash } = useAppContext();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [form, setForm] = useState({ phone: "", age: "", doctorType: "", password: "" });
  const [otp, setOtp] = useState("");

  const handleSubmit = () => {
    if (!form.phone || !form.age || !form.doctorType || !form.password) return;
    setStep("verify");
  };

  const handleVerify = () => {
    if (otp.length < 4) return;
    setDoctorProfile(form);
    setRole("doctor");
    setIsLoggedIn(true);
=======
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { INDIAN_PHONE_PREFIX, isValidIndianPhoneInput, sanitizeIndianPhoneInput, toIndianPhoneNumber } from "@/lib/phone";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Phone, Stethoscope } from "lucide-react";

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { signInDoctor, setShowSplash } = useAppContext();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.phone || !form.password) {
      setError("Enter your phone number and password.");
      return;
    }

    if (!isValidIndianPhoneInput(form.phone)) {
      setError("Enter a 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await signInDoctor(toIndianPhoneNumber(form.phone), form.password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

>>>>>>> a0dc8d9 (initial)
    setShowSplash(true);
    navigate("/doctor/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative glass-card w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-success">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Doctor Login</h2>
<<<<<<< HEAD
            <p className="text-sm text-muted-foreground">{step === "form" ? "Enter your credentials" : "Verify phone number"}</p>
          </div>
        </div>

        {step === "form" ? (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>

            <input type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />

            <select value={form.doctorType} onChange={(e) => setForm({ ...form, doctorType: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50">
              <option value="">Select Specialization</option>
              {DOCTOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSubmit}
              className="w-full gradient-success text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mt-2">
              Continue <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-center text-sm text-muted-foreground">
              OTP sent to <span className="font-semibold text-foreground">{form.phone}</span>
            </p>
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <input key={i} type="text" maxLength={1} value={otp[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 1) {
                      const newOtp = otp.split("");
                      newOtp[i] = val;
                      setOtp(newOtp.join(""));
                      if (val && i < 3) (e.target.nextElementSibling as HTMLInputElement)?.focus();
                    }
                  }}
                  className="h-14 w-14 text-center text-2xl font-bold rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground">Enter any 4 digits for demo</p>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleVerify}
              className="w-full gradient-success text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" /> Verify & Login
            </motion.button>
          </div>
        )}
=======
            <p className="text-sm text-muted-foreground">Log in with your phone number and password</p>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <div className="flex items-center rounded-lg border border-border bg-muted/50 focus-within:ring-2 focus-within:ring-secondary/50">
              <span className="border-r border-border px-4 py-3 text-sm font-semibold text-foreground">{INDIAN_PHONE_PREFIX}</span>
              <input type="tel" inputMode="numeric" placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: sanitizeIndianPhoneInput(e.target.value) })}
                className="w-full bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={loading}
            className="w-full gradient-success text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-70">
            {loading ? "Logging in..." : "Login"} <ArrowRight className="h-4 w-4" />
          </motion.button>
        </form>
>>>>>>> a0dc8d9 (initial)

        <button onClick={() => navigate("/")} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to role selection
        </button>
<<<<<<< HEAD
=======

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Need a new doctor account?{" "}
          <Link to="/signup/doctor" className="font-semibold text-secondary hover:underline">
            Sign up here
          </Link>
        </p>
>>>>>>> a0dc8d9 (initial)
      </motion.div>
    </div>
  );
}
