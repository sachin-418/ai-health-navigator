<<<<<<< HEAD
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { User, MapPin, Briefcase, Phone as PhoneIcon } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const { patientProfile } = useAppContext();

  if (!patientProfile) return null;

=======
import { useRef, useState, ChangeEvent } from "react";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import {
  User, MapPin, Briefcase, Phone as PhoneIcon, Pencil, Check, X,
  Stethoscope, FileText, Loader2, BadgeCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import LocationPicker from "@/components/LocationPicker";

type FieldConfig = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  editable?: boolean;
  min?: number;
  docOnly?: boolean;
  patientOnly?: boolean;
};

export default function ProfilePage() {
  const { patientProfile, doctorProfile, role, updateProfile } = useAppContext();
  const profile = role === "doctor" ? doctorProfile : patientProfile;
  const isDoctor = role === "doctor";

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [error, setError] = useState("");

  const [formName, setFormName] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formPic, setFormPic] = useState<string | undefined>(undefined);
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  const [formLat, setFormLat] = useState<number | undefined>();
  const [formLng, setFormLng] = useState<number | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return null;

  const picSrc = editing ? formPic : profile.profilePic;
  const displayName = profile.name ?? profile.phone;

  const startEdit = () => {
    setFormName(profile.name ?? "");
    setFormBio(profile.bio ?? "");
    setFormPic(profile.profilePic ?? undefined);
    const fields: Record<string, string> = {};
    if ("age" in profile) fields.age = (profile as typeof patientProfile & object)?.["age" as never] ?? "";
    if ("occupation" in profile) fields.occupation = (profile as typeof patientProfile & object)?.["occupation" as never] ?? "";
    // location field for both roles
    if ("location" in profile) fields.location = (profile as { location?: string }).location ?? "";
    if ("doctorType" in profile) fields.doctorType = (profile as typeof doctorProfile & object)?.["doctorType" as never] ?? "";
    setFormFields(fields);
    setFormLat((profile as { lat?: number }).lat);
    setFormLng((profile as { lng?: number }).lng);
    setError("");
    setShowLocationMap(false);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setShowLocationMap(false);
    setError("");
  };

  const handlePicChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Profile picture must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFormPic(reader.result as string);
    reader.readAsDataURL(file);
  };

  // LocationPicker callback
  const handleLocationPicked = (address: string, lat: number, lng: number) => {
    setFormFields((prev) => ({ ...prev, location: address }));
    setFormLat(lat);
    setFormLng(lng);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const payload: Record<string, string | number | undefined> = {
      name: formName.trim() || undefined,
      bio: formBio.trim() || undefined,
      profilePic: formPic,
      location: formFields.location || undefined,
      lat: formLat,
      lng: formLng,
    };
    if (!isDoctor) {
      payload.age = formFields.age;
      payload.occupation = formFields.occupation;
    } else {
      payload.doctorType = formFields.doctorType;
    }
    const result = await updateProfile(payload as Parameters<typeof updateProfile>[0]);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setEditing(false);
    }
  };

  const FIELD_CONFIG: FieldConfig[] = [
    { key: "phone",      label: "Phone",      icon: PhoneIcon,   editable: false },
    { key: "age",        label: "Age",        icon: User,        type: "number", editable: true, min: 1, patientOnly: true },
    { key: "occupation", label: "Occupation", icon: Briefcase,   editable: true, patientOnly: true },
    { key: "location",   label: "Location",   icon: MapPin,      editable: true },
    { key: "doctorType", label: "Specialty",  icon: Stethoscope, editable: true, docOnly: true },
  ];

  const fields = FIELD_CONFIG.filter((f) =>
    (isDoctor ? !f.patientOnly : !f.docOnly),
  );

  const getFieldValue = (key: string): string => {
    if (key === "phone") return profile.phone;
    if (isDoctor && key === "doctorType" && "doctorType" in profile) return (profile as { doctorType: string }).doctorType;
    if (isDoctor && key === "location") return (profile as { location?: string }).location ?? "";
    if (!isDoctor) {
      const p = profile as NonNullable<typeof patientProfile>;
      if (key === "age") return p.age ?? "";
      if (key === "occupation") return p.occupation ?? "";
      if (key === "location") return p.location ?? "";
    }
    return "";
  };

  // ─── Shared field-renderer ───────────────────────────────────────────────────
  const renderField = (f: FieldConfig) => {
    const value = f.editable && editing ? formFields[f.key] ?? "" : getFieldValue(f.key);
    const isLocationField = f.key === "location";
    return (
      <div key={f.key} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
        <f.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
          {f.editable && editing ? (
            isLocationField ? (
              <div className="mt-1 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowLocationMap((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <MapPin className="h-3 w-3" />
                  {formFields.location || "No location set"} — {showLocationMap ? "hide map" : "change on map"}
                </button>
                {showLocationMap && (
                  <LocationPicker value={formFields.location ?? ""} onChange={handleLocationPicked} />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type={f.type ?? "text"}
                  min={f.min}
                  value={value}
                  onChange={(e) => {
                    let v = e.target.value;
                    if (f.type === "number" && f.min !== undefined) {
                      const n = parseInt(v, 10);
                      if (!isNaN(n) && n < f.min) v = String(f.min);
                    }
                    setFormFields((prev) => ({ ...prev, [f.key]: v }));
                  }}
                  className="flex-1 bg-transparent border-b border-border focus:outline-none focus:border-primary text-sm text-foreground"
                />
              </div>
            )
          ) : (
            <p className="text-sm font-medium text-foreground">
              {f.key === "age" ? (value ? `${value} years` : "—") : value || "—"}
            </p>
          )}
        </div>
      </div>
    );
  };

  // ─── DOCTOR LAYOUT (left sidebar + right detail panel) ───────────────────────
  if (isDoctor) {
    const doc = doctorProfile!;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid lg:grid-cols-3 gap-6 items-start">

            {/* ── LEFT: Profile Card ─────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 flex flex-col items-center text-center lg:sticky lg:top-24"
            >
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="h-28 w-28 rounded-full overflow-hidden bg-muted border-4 border-primary/20">
                  {picSrc ? (
                    <img src={picSrc} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Stethoscope className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                {editing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:bg-primary/90"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
              </div>

              {/* Name */}
              {editing ? (
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Full Name"
                  className="text-center text-lg font-bold bg-transparent border-b border-border focus:outline-none focus:border-primary text-foreground w-full mb-1"
                />
              ) : (
                <h2 className="text-xl font-bold text-foreground">Dr. {displayName}</h2>
              )}

              {/* Specialty badge */}
              <span className="mt-2 mb-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                <BadgeCheck className="h-3 w-3" />
                {getFieldValue("doctorType") || "General Physician"}
              </span>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5 w-full justify-center">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{getFieldValue("location") || "Location not set"}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5 w-full justify-center">
                <PhoneIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{doc.phone}</span>
              </div>

              {/* Bio preview */}
              <div className="w-full text-left mb-5">
                <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> About
                </p>
                <p className="text-sm text-foreground bg-muted/30 rounded-lg px-3 py-2 min-h-[40px] line-clamp-4">
                  {doc.bio || <span className="text-muted-foreground italic">No bio yet</span>}
                </p>
              </div>

              {!editing && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={startEdit}
                  className="w-full border border-border py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit Profile
                </motion.button>
              )}
            </motion.div>

            {/* ── RIGHT: Editable Details ────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-4"
            >
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  {editing ? "Edit Profile Details" : "Profile Details"}
                </h3>

                {/* Bio (editable) */}
                {editing && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> About / Bio
                    </p>
                    <textarea
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      placeholder="Write a short bio — qualifications, years of experience, specialties…"
                      rows={3}
                      className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                )}

                {/* All fields */}
                <div className="space-y-3">
                  {fields.map(renderField)}
                </div>

                {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

                {editing && (
                  <div className="mt-6 flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 gradient-primary text-primary-foreground py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      {saving ? "Saving…" : "Save Changes"}
                    </motion.button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1"
                    >
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Location update hint card (when not editing) */}
              {!editing && (
                <div className="glass-card p-4 flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Update your clinic location anytime</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Moved to a new clinic? Click <strong>Edit Profile</strong> → expand the map → pin your new location so patients can find you.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PATIENT LAYOUT (single column, centered) ─────────────────────────────
>>>>>>> a0dc8d9 (initial)
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-lg">
<<<<<<< HEAD
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
          <div className="mx-auto mb-4 h-24 w-24 rounded-full overflow-hidden bg-muted border-4 border-primary/20">
            {patientProfile.profilePic ? (
              <img src={patientProfile.profilePic} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">{patientProfile.phone}</h2>
          <p className="text-sm text-muted-foreground mb-6">Patient Profile</p>

          <div className="space-y-3 text-left">
            {[
              { icon: PhoneIcon, label: "Phone", value: patientProfile.phone },
              { icon: User, label: "Age", value: `${patientProfile.age} years` },
              { icon: Briefcase, label: "Occupation", value: patientProfile.occupation },
              { icon: MapPin, label: "Location", value: patientProfile.location },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <item.icon className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
=======
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
          {/* Profile picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border-4 border-primary/20">
                {picSrc ? (
                  <img src={picSrc} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              {editing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:bg-primary/90"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
            </div>

            {editing ? (
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Full Name"
                className="text-center text-xl font-bold bg-transparent border-b border-border focus:outline-none focus:border-primary text-foreground w-full max-w-xs"
              />
            ) : (
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
            )}
            <p className="text-sm text-muted-foreground mt-1">Patient Profile</p>
          </div>

          {/* Bio */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">Bio</p>
            </div>
            {editing ? (
              <textarea
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                placeholder="Write a short bio about yourself…"
                rows={3}
                className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            ) : (
              <p className="text-sm text-foreground bg-muted/30 rounded-lg px-3 py-2 min-h-[40px]">
                {profile.bio || <span className="text-muted-foreground italic">No bio yet</span>}
              </p>
            )}
          </div>

          {/* Location update hint */}
          {!editing && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Moved? Click <strong className="text-foreground">Edit Profile</strong> to update your location on the map anytime.
              </p>
            </div>
          )}

          {/* Fields */}
          <div className="space-y-3">
            {fields.map(renderField)}
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            {editing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 gradient-primary text-primary-foreground py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {saving ? "Saving…" : "Save Changes"}
                </motion.button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={startEdit}
                className="w-full border border-border py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-muted transition-colors"
              >
                <Pencil className="h-4 w-4" /> Edit Profile
              </motion.button>
            )}
>>>>>>> a0dc8d9 (initial)
          </div>
        </motion.div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

>>>>>>> a0dc8d9 (initial)
