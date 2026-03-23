import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, FileText, Send, Phone, Video, MapPin, Clock, X, User } from "lucide-react";
import Navbar from "@/components/Navbar";
<<<<<<< HEAD
=======
import DoctorReplyCard from "@/components/DoctorReplyCard";
>>>>>>> a0dc8d9 (initial)
import type { DoctorReply, Report } from "@/store/appStore";

export default function DoctorNotifications() {
  const { doctorReports, updateDoctorReport, doctorProfile, addNotification } = useAppContext();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [solution, setSolution] = useState("");
  const [slotType, setSlotType] = useState<"phone" | "video" | "live" | "">("");
  const [slotDateTime, setSlotDateTime] = useState("");

  const unread = doctorReports.filter((r) => !r.read && !r.doctorReply);

  const handleSendReply = () => {
    if (!selectedReport || !solution) return;
    const reply: DoctorReply = {
      solution,
      doctorName: doctorProfile?.phone || "Doctor",
      doctorType: doctorProfile?.doctorType || "General",
      ...(slotType && slotDateTime ? { timeSlot: { type: slotType as any, dateTime: slotDateTime } } : {}),
    };
    updateDoctorReport(selectedReport.id, reply);
    addNotification({
      id: Date.now().toString(),
      type: "reply",
<<<<<<< HEAD
      title: "Reply Sent",
      message: `Solution sent to patient ${selectedReport.patientName}`,
=======
      title: "Doctor Solution Ready",
      message: `Dr. ${doctorProfile?.phone || "Doctor"} shared treatment guidance for ${selectedReport.patientName}.`,
>>>>>>> a0dc8d9 (initial)
      data: reply,
      read: false,
      timestamp: new Date(),
    });
    setSelectedReport(null);
    setSolution("");
    setSlotType("");
    setSlotDateTime("");
  };

  const levelColors: Record<string, string> = {
    mild: "text-secondary",
    moderate: "text-accent-foreground",
    severe: "text-destructive",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" /> Patient Reports
        </h2>
        <p className="text-sm text-muted-foreground mb-6">{unread.length} pending report{unread.length !== 1 ? "s" : ""}</p>

        <div className="space-y-4">
          {doctorReports.map((report, i) => (
            <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              className={`glass-card p-5 cursor-pointer transition-all ${!report.doctorReply ? "ring-2 ring-primary/20" : ""}`}
              onClick={() => setSelectedReport(report)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{report.patientName}</h3>
                    <p className="text-xs text-muted-foreground">{report.patientAge} yrs • {report.patientOccupation} • {report.patientLocation}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{report.checkupResult.diseaseName}</p>
                    <span className={`text-xs font-semibold capitalize ${levelColors[report.checkupResult.conditionLevel]}`}>
                      {report.checkupResult.conditionLevel}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{new Date(report.date).toLocaleDateString()}</p>
                  {report.doctorReply ? (
                    <span className="text-xs text-secondary font-medium">✓ Replied</span>
                  ) : (
                    <span className="text-xs text-destructive font-medium">Pending</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reply Modal */}
        <AnimatePresence>
          {selectedReport && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
              onClick={() => setSelectedReport(null)}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="glass-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">Patient Report</h3>
                  <button onClick={() => setSelectedReport(null)} className="p-1 rounded hover:bg-muted"><X className="h-5 w-5" /></button>
                </div>

                {/* Patient details */}
                <div className="space-y-2 mb-4 p-3 rounded-lg bg-muted/30">
                  <p className="text-sm"><span className="text-muted-foreground">Patient:</span> <span className="font-medium text-foreground">{selectedReport.patientName}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">Age:</span> <span className="font-medium text-foreground">{selectedReport.patientAge} years</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">Location:</span> <span className="font-medium text-foreground">{selectedReport.patientLocation}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">Disease:</span> <span className="font-bold text-foreground">{selectedReport.checkupResult.diseaseName}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">Score:</span> <span className="font-medium text-foreground">{selectedReport.checkupResult.healthScore}/100</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">Condition:</span>{" "}
                    <span className={`font-semibold capitalize ${levelColors[selectedReport.checkupResult.conditionLevel]}`}>{selectedReport.checkupResult.conditionLevel}</span></p>
                </div>

                {selectedReport.doctorReply ? (
<<<<<<< HEAD
                  <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                    <p className="text-xs font-semibold text-secondary mb-1">Your Reply</p>
                    <p className="text-sm text-foreground">{selectedReport.doctorReply.solution}</p>
                    {selectedReport.doctorReply.timeSlot && (
                      <p className="text-xs text-muted-foreground mt-2">
                        📅 {selectedReport.doctorReply.timeSlot.type} - {selectedReport.doctorReply.timeSlot.dateTime}
                      </p>
                    )}
                  </div>
=======
                  <DoctorReplyCard reply={selectedReport.doctorReply} title="Your Reply" />
>>>>>>> a0dc8d9 (initial)
                ) : (
                  <div className="space-y-4">
                    <textarea
                      placeholder="Write your solution/prescription..."
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                    />

                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Schedule appointment (optional)</p>
                      <div className="flex gap-2 mb-2">
                        {[
                          { type: "phone" as const, icon: Phone, label: "Phone" },
                          { type: "video" as const, icon: Video, label: "Video" },
                          { type: "live" as const, icon: MapPin, label: "In-person" },
                        ].map((opt) => (
                          <button key={opt.type} onClick={() => setSlotType(slotType === opt.type ? "" : opt.type)}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              slotType === opt.type ? "gradient-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            }`}>
                            <opt.icon className="h-3 w-3" /> {opt.label}
                          </button>
                        ))}
                      </div>
                      {slotType && (
                        <input type="datetime-local" value={slotDateTime} onChange={(e) => setSlotDateTime(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      )}
                    </div>

                    <button onClick={handleSendReply} disabled={!solution}
                      className="w-full gradient-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                      <Send className="h-4 w-4" /> Send Solution
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
