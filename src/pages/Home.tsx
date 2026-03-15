import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { MessageCircle, Mic, Camera, Activity, Shield, Brain, Heart, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import EmergencyButton from "@/components/EmergencyButton";

const features = [
  { icon: Brain, title: "AI Symptom Analysis", desc: "Describe symptoms via text or voice for instant AI diagnosis", color: "gradient-primary" },
  { icon: Camera, title: "Image Diagnosis", desc: "Upload skin condition photos for AI-powered detection", color: "gradient-success" },
  { icon: Activity, title: "Health Score", desc: "Get a comprehensive health score with risk assessment", color: "gradient-primary" },
  { icon: Shield, title: "Doctor Connect", desc: "Instantly connect with nearby specialist doctors", color: "gradient-danger" },
];

export default function Home() {
  const navigate = useNavigate();
  const { patientProfile } = useAppContext();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 pt-16 pb-20 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" /> AI-Powered Healthcare
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4 leading-tight">
              Your Health, <span className="text-gradient-primary">AI Powered</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Get instant AI diagnosis through chat, voice, or image. Connect with doctors and take control of your health.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/chat")}
                className="gradient-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg">
                <MessageCircle className="h-5 w-5" /> Start Diagnosis
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/chat")}
                className="glass-card px-8 py-3.5 rounded-xl font-semibold text-foreground flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" /> Voice Assistant
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-card-hover p-6 cursor-pointer"
              onClick={() => navigate("/chat")}
            >
              <div className={`h-12 w-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <EmergencyButton />
    </div>
  );
}
