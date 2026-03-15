import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";

export default function SplashScreen() {
  const { setShowSplash } = useAppContext();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, [setShowSplash]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center gradient-primary">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.3, 0.9, 1.1, 1], opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-foreground/20 backdrop-blur-sm"
        >
          <Heart className="h-14 w-14 text-primary-foreground" />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-5xl md:text-7xl font-black text-primary-foreground tracking-tight"
        >
          AI Health
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-3 text-lg text-primary-foreground/80"
        >
          Early Disease Detection System
        </motion.p>
      </motion.div>
    </div>
  );
}
