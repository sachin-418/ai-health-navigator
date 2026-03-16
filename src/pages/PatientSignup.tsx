import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { sendPatientOtp, verifyPatientOtp } from "@/lib/auth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { INDIAN_PHONE_PREFIX, isValidIndianPhoneInput, sanitizeIndianPhoneInput, toIndianPhoneNumber } from "@/lib/phone";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, CheckCircle2, Heart, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import LocationPicker from "@/components/LocationPicker";

export default function PatientSignup() {
  const navigate = useNavigate();
  const { registerPatient, setShowSplash } = useAppContext();
  const [form, setForm] = useState({ name: "", phone: "", age: "", occupation: "", location: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [showMap, setShowMap] = useState(false);

  const handlePhoneChange = (value: string) => {
    setForm({ ...form, phone: sanitizeIndianPhoneInput(value) });
    setOtp("");
    setOtpSent(false);
    setVerificationToken("");
    setStatusMessage("");
  };

  const handleSendOtp = async () => {
    if (!isValidIndianPhoneInput(form.phone)) {
      setError("Enter a 10-digit Indian mobile number.");
      return;
    }

    setOtpLoading(true);
    setError("");
    setStatusMessage("");

    const result = await sendPatientOtp(toIndianPhoneNumber(form.phone));

    setOtpLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOtpSent(true);
    setStatusMessage(result.message ?? "OTP sent successfully.");
  };

  const handleVerifyOtp = async () => {
    if (!isValidIndianPhoneInput(form.phone)) {
      setError("Enter a 10-digit Indian mobile number.");
      return;
    }

    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP sent to your phone.");
      return;
    }

    setOtpLoading(true);
    setError("");
    setStatusMessage("");

    const result = await verifyPatientOtp(toIndianPhoneNumber(form.phone), otp);

    setOtpLoading(false);

    if (result.error || !result.verificationToken) {
      setError(result.error ?? "Unable to verify OTP.");
      return;
    }

    setVerificationToken(result.verificationToken);
    setStatusMessage(result.message ?? "OTP verified. You can create your account now.");
  };

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.phone || !form.age || !form.occupation || !form.location) {
      setError("Fill in name, phone number, age, occupation, and location.");
      return;
    }

    if (!isValidIndianPhoneInput(form.phone)) {
      setError("Enter a 10-digit Indian mobile number.");
      return;
    }

    if (!verificationToken) {
      setError("Verify OTP before creating your account.");
      return;
    }

    setLoading(true);
    setError("");
    setStatusMessage("");

    const result = await registerPatient(
      form.name,
      toIndianPhoneNumber(form.phone),
      form.age,
      form.occupation,
      form.location,
      verificationToken,
    );
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setShowSplash(true);
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] h-[520px] w-[520px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card w-full max-w-md p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Patient Sign Up</h2>
            <p className="text-sm text-muted-foreground">Create your account with your full patient details</p>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSignup}>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <div className="flex items-center rounded-lg border border-border bg-muted/50 focus-within:ring-2 focus-within:ring-primary/50">
              <span className="border-r border-border px-4 py-3 text-sm font-semibold text-foreground">{INDIAN_PHONE_PREFIX}</span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Phone verification</p>
                <p className="text-xs text-muted-foreground">Verify your Indian mobile number with OTP before patient signup.</p>
              </div>
              {verificationToken ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <ShieldCheck className="h-5 w-5 text-muted-foreground" />}
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={otpLoading}
              onClick={handleSendOtp}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-70"
            >
              {otpLoading && !otpSent ? "Sending OTP..." : "Send OTP"}
            </motion.button>

            {otpSent ? (
              <div className="space-y-3">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} containerClassName="justify-center">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={otpLoading}
                  onClick={handleVerifyOtp}
                  className="w-full rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/15 disabled:opacity-70"
                >
                  {otpLoading ? "Verifying OTP..." : "Verify OTP"}
                </motion.button>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="number"
              placeholder="Age"
              min={1}
              value={form.age}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") { setForm({ ...form, age: "" }); return; }
                const n = parseInt(v, 10);
                if (!isNaN(n) && n >= 1) setForm({ ...form, age: String(n) });
              }}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Occupation"
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setShowMap((v) => !v)}
              className="flex items-center gap-2 w-full pl-3 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-left text-foreground hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            >
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className={`flex-1 text-sm truncate ${form.location ? "" : "text-muted-foreground"}`}>
                {form.location || "Pick location on map"}
              </span>
              <span className="text-xs text-primary font-medium">{showMap ? "Hide map" : "Open map"}</span>
            </button>
            {showMap && (
              <LocationPicker
                value={form.location}
                onChange={(address) => setForm({ ...form, location: address })}
              />
            )}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {!error && statusMessage ? <p className="text-sm text-green-600">{statusMessage}</p> : null}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading || !verificationToken}
            className="w-full gradient-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Create Patient Account"} <ArrowRight className="h-4 w-4" />
          </motion.button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login/patient" className="font-semibold text-primary hover:underline">
            Login here
          </Link>
        </p>

        <button onClick={() => navigate("/")} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to role selection
        </button>
      </motion.div>
    </div>
  );
}