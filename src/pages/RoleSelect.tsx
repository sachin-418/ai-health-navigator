import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, UserCircle, Stethoscope } from "lucide-react";

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-lg"
          >
            <Heart className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-black text-gradient-primary mb-2">AI Health</h1>
          <p className="text-muted-foreground">Early Disease Detection System</p>
        </div>

        <div className="flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/login/patient")}
            className="glass-card-hover flex items-center gap-4 p-6 text-left"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
              <UserCircle className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">I'm a Patient</h3>
              <p className="text-sm text-muted-foreground">Get AI-powered health diagnosis</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/login/doctor")}
            className="glass-card-hover flex items-center gap-4 p-6 text-left"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-success">
              <Stethoscope className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">I'm a Doctor</h3>
              <p className="text-sm text-muted-foreground">Review patient reports & analytics</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
