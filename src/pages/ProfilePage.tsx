import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { User, MapPin, Briefcase, Phone as PhoneIcon } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const { patientProfile } = useAppContext();

  if (!patientProfile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
          <div className="mx-auto mb-4 h-24 w-24 rounded-full overflow-hidden bg-muted border-4 border-primary/20">
            {patientProfile.profilePic ? (
              <img src={patientProfile.profilePic} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">{patientProfile.phone}</h2>
          <p className="text-sm text-muted-foreground mb-6">Patient Profile</p>

          <div className="space-y-3 text-left">
            {[
              { icon: PhoneIcon, label: "Phone", value: patientProfile.phone },
              { icon: User, label: "Age", value: `${patientProfile.age} years` },
              { icon: Briefcase, label: "Occupation", value: patientProfile.occupation },
              { icon: MapPin, label: "Location", value: patientProfile.location },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <item.icon className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
