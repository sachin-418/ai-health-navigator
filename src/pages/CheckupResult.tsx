import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Shield, Download, UserCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import type { CheckupResult, Report } from "@/store/appStore";

const MOCK_RESULT: CheckupResult = {
  healthScore: 68,
  diseaseName: "Viral Fever with Upper Respiratory Infection",
  conditionLevel: "moderate",
  similarityLevel: 82,
  safetyTips: [
    "Stay hydrated - drink at least 3 liters of water daily",
    "Take adequate rest for 3-5 days",
    "Monitor temperature every 4 hours",
    "Avoid cold food and beverages",
    "If fever persists beyond 3 days, seek immediate medical attention",
  ],
  symptoms: ["Fever", "Headache", "Body ache", "Fatigue"],
};

const levelColors = {
  mild: { bg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/30", label: "Mild" },
  moderate: { bg: "bg-accent/10", text: "text-accent-foreground", border: "border-accent/30", label: "Moderate" },
  severe: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30", label: "Severe" },
};

export default function CheckupResultPage() {
  const navigate = useNavigate();
  const { setCheckupResult, patientProfile, addPatientHistory, addDoctorReport, language } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CheckupResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setResult(MOCK_RESULT);
      setCheckupResult(MOCK_RESULT);
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [setCheckupResult]);

  const handleDownloadReport = () => {
    const report = generateReportText();
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health_report_${language}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReportText = () => {
    if (!result) return "";
    return `
═══════════════════════════════════════
        AI HEALTH - DIAGNOSIS REPORT
        Language: ${language.toUpperCase()}
═══════════════════════════════════════

Patient: ${patientProfile?.phone || "N/A"}
Age: ${patientProfile?.age || "N/A"}
Location: ${patientProfile?.location || "N/A"}
Date: ${new Date().toLocaleDateString()}

─────────────────────────────────────
HEALTH SCORE: ${result.healthScore}/100
DISEASE: ${result.diseaseName}
CONDITION: ${result.conditionLevel.toUpperCase()}
SIMILARITY: ${result.similarityLevel}%
─────────────────────────────────────

SYMPTOMS:
${result.symptoms.map((s) => `  • ${s}`).join("\n")}

SAFETY RECOMMENDATIONS:
${result.safetyTips.map((t, i) => `  ${i + 1}. ${t}`).join("\n")}

═══════════════════════════════════════
  This report is AI-generated and for reference only.
  Please consult a qualified doctor for treatment.
═══════════════════════════════════════
    `.trim();
  };

  const handleContactDoctor = () => {
    if (!result || !patientProfile) return;
    const report: Report = {
      id: Date.now().toString(),
<<<<<<< HEAD
      patientName: patientProfile.phone,
=======
      patientName: patientProfile.name || patientProfile.phone,
>>>>>>> a0dc8d9 (initial)
      patientPhone: patientProfile.phone,
      patientAge: patientProfile.age,
      patientOccupation: patientProfile.occupation,
      patientLocation: patientProfile.location,
      checkupResult: result,
      date: new Date().toISOString(),
      language,
    };
    addPatientHistory(report);
    addDoctorReport(report);
    navigate("/contact-doctor");
  };

  const level = result ? levelColors[result.conditionLevel] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {loading ? (
          <LoadingAnalysis text="Analyzing your health data..." />
        ) : result ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Health Score */}
            <div className="glass-card p-6 text-center">
              <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Health Score</h2>
              <div className="relative mx-auto h-36 w-36">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={result.healthScore > 70 ? "hsl(var(--secondary))" : result.healthScore > 40 ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(result.healthScore / 100) * 314} 314`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-black text-foreground">{result.healthScore}</span>
                </div>
              </div>
            </div>

            {/* Disease */}
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Activity className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Detected Condition</p>
                  <h3 className="text-lg font-bold text-foreground">{result.diseaseName}</h3>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${level?.bg} ${level?.text} ${level?.border}`}>
                      {level?.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {result.similarityLevel}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning for severe */}
            {result.conditionLevel === "severe" && (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-4 border-2 border-destructive/30 bg-destructive/5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-destructive">High Risk Alert</h4>
                    <p className="text-sm text-muted-foreground">Please seek medical attention immediately</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Safety Tips */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-secondary" />
                <h3 className="font-bold text-foreground">Safety Recommendations</h3>
              </div>
              <div className="space-y-3">
                {result.safetyTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/10 text-secondary text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleContactDoctor}
                className="w-full gradient-primary text-primary-foreground py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg">
                <UserCheck className="h-5 w-5" /> Contact Doctor
              </motion.button>
              <button onClick={handleDownloadReport}
                className="w-full glass-card py-4 rounded-xl font-semibold text-foreground flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
                <Download className="h-5 w-5 text-primary" /> Download Report ({language.toUpperCase()})
              </button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
