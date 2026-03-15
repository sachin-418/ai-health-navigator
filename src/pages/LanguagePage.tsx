import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import { LANGUAGES } from "@/store/appStore";

export default function LanguagePage() {
  const { language, setLanguage } = useAppContext();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-14 w-14 rounded-xl gradient-primary flex items-center justify-center">
            <Globe className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Choose Language</h2>
          <p className="text-sm text-muted-foreground">Reports will be generated in your selected language</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang, i) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLanguage(lang.code)}
              className={`glass-card p-4 text-center transition-all ${
                language === lang.code
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
            >
              <span className="text-2xl mb-1 block">{lang.flag}</span>
              <span className="font-semibold text-foreground text-sm">{lang.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
