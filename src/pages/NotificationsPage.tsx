import { useAppContext } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, FileText, MessageCircle, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
<<<<<<< HEAD
=======
import DoctorReplyCard from "@/components/DoctorReplyCard";
import type { DoctorReply } from "@/store/appStore";

const isDoctorReply = (value: unknown): value is DoctorReply =>
  Boolean(value) && typeof value === "object" && "solution" in (value as DoctorReply);
>>>>>>> a0dc8d9 (initial)

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useAppContext();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" /> Notifications
        </h2>

        {notifications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => markNotificationRead(n.id)}
                  className={`glass-card p-4 cursor-pointer transition-all ${!n.read ? "ring-2 ring-primary/30 bg-primary/5" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      n.type === "report" ? "gradient-primary" : "gradient-success"
                    }`}>
                      {n.type === "report" ? <FileText className="h-5 w-5 text-primary-foreground" /> : <MessageCircle className="h-5 w-5 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground text-sm">{n.title}</h4>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {n.timestamp.toLocaleString()}
                      </p>
<<<<<<< HEAD
=======
                      {n.type === "reply" && isDoctorReply(n.data) ? <DoctorReplyCard reply={n.data} title="Doctor Solution" /> : null}
>>>>>>> a0dc8d9 (initial)
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
