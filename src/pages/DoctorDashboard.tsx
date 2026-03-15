import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { BarChart3, Users, FileText, TrendingUp, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Navbar from "@/components/Navbar";
import { MOCK_VILLAGE_DATA } from "@/store/appStore";

const COLORS = ["hsl(4, 74%, 63%)", "hsl(214, 84%, 56%)", "hsl(145, 52%, 42%)", "hsl(194, 86%, 64%)", "hsl(40, 90%, 55%)"];

export default function DoctorDashboard() {
  const { doctorProfile, doctorReports } = useAppContext();
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);


  const villageChartData = MOCK_VILLAGE_DATA.map((v) => ({ name: v.village, cases: v.totalCases }));
  const selected = MOCK_VILLAGE_DATA.find((v) => v.village === selectedVillage);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome, Dr. {doctorProfile?.phone || "Doctor"}</h1>
          <p className="text-sm text-muted-foreground">{doctorProfile?.doctorType || "General Physician"} • Dashboard</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: "Reports", value: doctorReports.length, color: "gradient-primary" },
            { icon: Users, label: "Patients", value: doctorReports.length, color: "gradient-success" },
            { icon: TrendingUp, label: "Pending", value: doctorReports.filter((r) => !r.doctorReply).length, color: "gradient-danger" },
            { icon: BarChart3, label: "Villages", value: MOCK_VILLAGE_DATA.length, color: "gradient-primary" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              className="glass-card p-4">
              <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Village Disease Chart */}
        <div className="glass-card p-6 mb-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Disease Count by Village
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Click on a village bar to see disease breakdown</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villageChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="cases" radius={[6, 6, 0, 0]} cursor="pointer"
                  onClick={(_data: unknown, index: number) => setSelectedVillage(villageChartData[index].name)}>
                  {villageChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected village diseases */}
        {selected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="font-bold text-foreground mb-4">{selected.village} — Disease Breakdown</h3>
            <div className="space-y-3">
              {selected.diseases.map((d) => {
                const levelColor = d.level === "severe" ? "bg-destructive" : d.level === "moderate" ? "bg-accent" : "bg-secondary";
                return (
                  <div key={d.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{d.level}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${levelColor}`} style={{ width: `${(d.count / selected.totalCases) * 100}%` }} />
                      </div>
                      <span className="text-sm font-bold text-foreground w-8 text-right">{d.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
