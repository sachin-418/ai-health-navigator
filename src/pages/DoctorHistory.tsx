import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { History, User } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function DoctorHistory() {
  const { doctorReports } = useAppContext();

  const levelColors: Record<string, string> = {
    mild: "text-secondary",
    moderate: "text-accent-foreground",
    severe: "text-destructive",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <History className="h-6 w-6 text-primary" /> Patient Records
        </h2>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Disease</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Level</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {doctorReports.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.patientName}</p>
                          <p className="text-xs text-muted-foreground">{r.patientLocation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{r.checkupResult.diseaseName}</td>
                    <td className={`px-4 py-3 text-sm font-semibold capitalize ${levelColors[r.checkupResult.conditionLevel]}`}>
                      {r.checkupResult.conditionLevel}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{r.checkupResult.healthScore}/100</td>
                    <td className="px-4 py-3">
                      {r.doctorReply ? (
                        <span className="px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">Replied</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
