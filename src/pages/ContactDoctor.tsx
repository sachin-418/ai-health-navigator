<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { MapPin, Phone, Navigation, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { MOCK_HOSPITALS } from "@/store/appStore";
=======
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { MapPin, Phone, Navigation, ArrowRight, Stethoscope, Loader2, AlertCircle, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import { MOCK_HOSPITALS } from "@/store/appStore";
import { fetchNearbyDoctors, type NearbyDoctor } from "@/lib/auth";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
>>>>>>> a0dc8d9 (initial)

export default function ContactDoctor() {
  const navigate = useNavigate();
  const { patientProfile, checkupResult } = useAppContext();

<<<<<<< HEAD
=======
  const [loading, setLoading] = useState(true);
  const [nearbyDoctors, setNearbyDoctors] = useState<NearbyDoctor[]>([]);
  const [locationError, setLocationError] = useState("");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported. Showing all available doctors.");
      fetchAll();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLat(lat);
        setUserLng(lng);
        const result = await fetchNearbyDoctors(lat, lng, 100);
        setNearbyDoctors(result.doctors ?? []);
        setLoading(false);
      },
      async () => {
        setLocationError("Location permission denied — showing all registered doctors.");
        await fetchAll();
      },
      { timeout: 8000 },
    );
  }, []);

  const fetchAll = async () => {
    // No coords — fetch with a dummy wide radius from India's centre
    const result = await fetchNearbyDoctors(20.5937, 78.9629, 5000);
    setNearbyDoctors(result.doctors ?? []);
    setLoading(false);
  };

  const formatDistance = (km: number) =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

>>>>>>> a0dc8d9 (initial)
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-foreground mb-2">Connect with a Doctor</h2>
<<<<<<< HEAD
          <p className="text-muted-foreground mb-6 text-sm">
            Your report has been sent to nearby hospitals. Here are recommended options:
=======
          <p className="text-muted-foreground mb-4 text-sm">
            {nearbyDoctors.length > 0
              ? `Found ${nearbyDoctors.length} registered doctor${nearbyDoctors.length > 1 ? "s" : ""} near you.`
              : "Finding doctors near your location…"}
>>>>>>> a0dc8d9 (initial)
          </p>

          {/* Summary card */}
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Condition</p>
                <p className="font-semibold text-foreground">{checkupResult?.diseaseName || "N/A"}</p>
              </div>
              <div className="text-right">
<<<<<<< HEAD
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-semibold text-foreground">{patientProfile?.location || "N/A"}</p>
=======
                <p className="text-xs text-muted-foreground">Your Location</p>
                <p className="font-semibold text-foreground">{patientProfile?.location || "Detecting…"}</p>
>>>>>>> a0dc8d9 (initial)
              </div>
            </div>
          </div>

<<<<<<< HEAD
          {/* Hospitals */}
          <div className="space-y-4">
            {MOCK_HOSPITALS.map((hospital, i) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass-card-hover p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{hospital.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{hospital.address}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-medium text-primary flex items-center gap-1">
                        <Navigation className="h-3 w-3" /> {hospital.distance}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {hospital.phone}
                      </span>
                    </div>
                  </div>
                  <button className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
                    Contact <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Your details and health report have been shared with the selected hospital's doctor.
            You'll receive a notification once the doctor responds.
          </p>

          <button onClick={() => navigate("/home")}
            className="mt-6 w-full glass-card py-3 rounded-xl text-center font-medium text-foreground hover:bg-muted/50 transition-colors">
=======
          {locationError && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 mb-4">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">{locationError}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Detecting your location and finding nearby doctors…</p>
            </div>
          )}

          {/* Real nearby doctors */}
          {!loading && nearbyDoctors.length > 0 && (
            <div className="space-y-4">
              {nearbyDoctors.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i }}
                  className="glass-card-hover p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-muted border-2 border-primary/20 shrink-0 flex items-center justify-center">
                      {doc.profilePic
                        ? <img src={doc.profilePic} alt={doc.name} className="h-full w-full object-cover" />
                        : <User className="h-6 w-6 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground">Dr. {doc.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Stethoscope className="h-3 w-3 text-primary" />
                        <span className="text-xs text-primary font-medium">{doc.doctorType}</span>
                      </div>
                      {doc.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.bio}</p>}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                        {doc.location && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {doc.location}
                          </span>
                        )}
                        <span className="text-xs font-medium text-primary flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          {userLat && userLng
                            ? formatDistance(haversineKm(userLat, userLng, doc.lat, doc.lng))
                            : formatDistance(doc.distanceKm)}
                          {userLat && userLng ? " from you" : ""}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {doc.phone}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`tel:${doc.phone}`}
                      className="gradient-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0"
                    >
                      Call <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Fallback: no registered doctors found — show mock hospitals */}
          {!loading && nearbyDoctors.length === 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                No registered doctors found nearby. Showing nearby hospitals instead:
              </p>
              <div className="space-y-4">
                {MOCK_HOSPITALS.map((hospital, i) => (
                  <motion.div
                    key={hospital.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="glass-card-hover p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{hospital.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{hospital.address}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm font-medium text-primary flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {userLat && userLng
                              ? formatDistance(haversineKm(userLat, userLng, hospital.lat, hospital.lng))
                              : hospital.distance}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {hospital.phone}
                          </span>
                        </div>
                      </div>
                      <a
                        href={`tel:${hospital.phone}`}
                        className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
                      >
                        Call <ArrowRight className="h-3 w-3" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6">
            Your health report will be shared with the doctor when they accept your request.
          </p>

          <button
            onClick={() => navigate("/home")}
            className="mt-6 w-full glass-card py-3 rounded-xl text-center font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
>>>>>>> a0dc8d9 (initial)
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

>>>>>>> a0dc8d9 (initial)
