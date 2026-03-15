import { Phone } from "lucide-react";
import { MOCK_HOSPITALS } from "@/store/appStore";

export default function EmergencyButton() {
  const handleEmergency = () => {
    const nearest = MOCK_HOSPITALS[3]; // LifeLine Emergency - closest
    window.open(`tel:${nearest.phone}`, "_self");
    alert(`Calling ${nearest.name} - ${nearest.phone}`);
  };

  return (
    <button
      onClick={handleEmergency}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 gradient-danger px-5 py-3 rounded-full text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 pulse-ring"
    >
      <Phone className="h-5 w-5" />
      <span className="hidden sm:inline">Emergency</span>
    </button>
  );
}
