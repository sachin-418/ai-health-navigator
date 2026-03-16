import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { History, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
<<<<<<< HEAD
=======
import DoctorReplyCard from "@/components/DoctorReplyCard";
>>>>>>> a0dc8d9 (initial)

const levelColors: Record<string, string> = {
  mild: "text-secondary",
  moderate: "text-accent-foreground",
  severe: "text-destructive",
};

export default function PatientHistory() {
  const { patientHistory } = useAppContext();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <History className="h-6 w-6 text-primary" /> Diagnosis History
        </h2>

        {patientHistory.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No diagnosis records yet</p>
            <p className="text-xs text-muted-foreground mt-1">Complete a check-up to see your history here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {patientHistory.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{new Date(report.date).toLocaleDateString()}</p>
                    <h3 className="font-bold text-foreground mt-1">{report.checkupResult.diseaseName}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-muted-foreground">Score: {report.checkupResult.healthScore}/100</span>
                      <span className={`text-sm font-semibold capitalize ${levelColors[report.checkupResult.conditionLevel]}`}>
                        {report.checkupResult.conditionLevel}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {report.checkupResult.symptoms.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                {report.doctorReply && (
<<<<<<< HEAD
                  <div className="mt-3 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                    <p className="text-xs font-semibold text-secondary mb-1">Doctor's Response</p>
                    <p className="text-sm text-foreground">{report.doctorReply.solution}</p>
                  </div>
=======
                  <DoctorReplyCard reply={report.doctorReply} />
>>>>>>> a0dc8d9 (initial)
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
