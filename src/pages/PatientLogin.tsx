import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { Phone, Camera, MapPin, Briefcase, ArrowRight, CheckCircle } from "lucide-react";

export default function PatientLogin() {
  const navigate = useNavigate();
  const { setRole, setPatientProfile, setIsLoggedIn, setShowSplash } = useAppContext();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState({ phone: "", age: "", occupation: "", location: "" });
  const [profilePic, setProfilePic] = useState<string | undefined>();
  const [otp, setOtp] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!form.phone || !form.age || !form.occupation || !form.location) return;
    setStep("otp");
  };

  const handleVerify = () => {
    if (otp.length < 4) return;
    setPatientProfile({ ...form, profilePic });
    setRole("patient");
    setIsLoggedIn(true);
    setShowSplash(true);
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card w-full max-w-md p-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-1">Patient Login</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          {step === "form" ? "Enter your details to get started" : "Verify your phone number"}
        </p>

        {step === "form" ? (
          <div className="flex flex-col gap-4">
            {/* Profile pic */}
            <div className="flex justify-center mb-2">
              <label className="relative cursor-pointer">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">Optional</span>
              </label>
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <input
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Occupation"
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSubmit}
              className="w-full gradient-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mt-2"
            >
              Send OTP <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-center text-sm text-muted-foreground">
              OTP sent to <span className="font-semibold text-foreground">{form.phone}</span>
            </p>
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={otp[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 1) {
                      const newOtp = otp.split("");
                      newOtp[i] = val;
                      setOtp(newOtp.join(""));
                      if (val && i < 3) {
                        const next = e.target.nextElementSibling as HTMLInputElement;
                        next?.focus();
                      }
                    }
                  }}
                  className="h-14 w-14 text-center text-2xl font-bold rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground">Enter any 4 digits for demo</p>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleVerify}
              className="w-full gradient-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" /> Verify & Login
            </motion.button>
          </div>
        )}

        <button onClick={() => navigate("/")} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to role selection
        </button>
      </motion.div>
    </div>
  );
}
