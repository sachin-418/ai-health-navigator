import { motion } from "framer-motion";

export default function LoadingAnalysis({ text = "AI is analyzing..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 rounded-full border-4 border-muted border-t-primary"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="h-6 w-6 rounded-full gradient-primary opacity-60" />
        </motion.div>
      </div>
      <p className="text-muted-foreground font-medium animate-pulse">{text}</p>
    </div>
  );
}
