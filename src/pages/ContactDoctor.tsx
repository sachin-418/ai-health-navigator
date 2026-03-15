import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { MapPin, Phone, Navigation, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { MOCK_HOSPITALS } from "@/store/appStore";

export default function ContactDoctor() {
  const navigate = useNavigate();
  const { patientProfile, checkupResult } = useAppContext();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-foreground mb-2">Connect with a Doctor</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Your report has been sent to nearby hospitals. Here are recommended options:
          </p>

          {/* Summary card */}
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Condition</p>
                <p className="font-semibold text-foreground">{checkupResult?.diseaseName || "N/A"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-semibold text-foreground">{patientProfile?.location || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Hospitals */}
          <div className="space-y-4">
            {MOCK_HOSPITALS.map((hospital, i) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass-card-hover p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{hospital.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{hospital.address}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-medium text-primary flex items-center gap-1">
                        <Navigation className="h-3 w-3" /> {hospital.distance}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {hospital.phone}
                      </span>
                    </div>
                  </div>
                  <button className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
                    Contact <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Your details and health report have been shared with the selected hospital's doctor.
            You'll receive a notification once the doctor responds.
          </p>

          <button onClick={() => navigate("/home")}
            className="mt-6 w-full glass-card py-3 rounded-xl text-center font-medium text-foreground hover:bg-muted/50 transition-colors">
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
