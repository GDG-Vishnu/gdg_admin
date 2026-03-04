"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import {
  X,
  Save,
  Upload,
  Loader2,
  Plus,
  Trash2,
  Minus,
  Star,
  Hash,
  Image as ImageLucide,
  Calendar,
  MapPin,
  GraduationCap,
  Building2,
  UserCheck,
  Mic,
  HelpCircle,
  ShieldCheck,
  Linkedin,
  Globe,
  Mail,
} from "lucide-react";
import type {
  ManagedEvent,
  EventStatus,
  EventType,
  EventMode,
  EventOfficial,
  OfficialRole,
  FAQ,
  Rule,
} from "@/lib/types/managed-event";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */

const STATUS_OPTIONS: { value: EventStatus; label: string; color: string }[] = [
  { value: "UPCOMING",  label: "Upcoming",  color: "bg-blue-500" },
  { value: "ONGOING",   label: "Ongoing",   color: "bg-amber-500" },
  { value: "COMPLETED", label: "Completed", color: "bg-green-500" },
];
const MODE_OPTIONS: { value: EventMode; label: string }[] = [
  { value: "ONLINE",  label: "Online" },
  { value: "OFFLINE", label: "Offline" },
  { value: "HYBRID",  label: "Hybrid" },
];
const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "WORKSHOP",  label: "Workshop" },
  { value: "HACKATHON", label: "Hackathon" },
];
const OFFICIAL_ROLE_OPTIONS: { value: OfficialRole; label: string }[] = [
  { value: "GUEST",   label: "Guest" },
  { value: "SPEAKER", label: "Speaker" },
  { value: "JURY",    label: "Jury" },
];
const VALID_DEPARTMENTS = [
  "CSE","IT","ECE","AIDS","AIML","CSBS","MECH","EEE","CIVIL",
] as const;

const EMPTY_OFFICIAL: EventOfficial = {
  role: "SPEAKER", name: "", email: "",
  bio: "", expertise: "", profileUrl: "", linkedinUrl: "",
};

/* ─────────────────────────────────────────────
   Form state type
───────────────────────────────────────────── */

type FormTab = "details" | "schedule" | "media" | "content" | "eligibility" | "officials" | "faqs" | "rules";

type EditFormState = {
  title: string; description: string;
  bannerImage: string; posterImage: string;
  startDate: string; startTime: string;
  endDate: string;   endTime: string;
  venue: string; mode: EventMode; status: EventStatus; eventType: EventType;
  maxParticipants: number;
  regStartDate: string; regStartTime: string;
  regEndDate: string;   regEndTime: string;
  isRegistrationOpen: boolean;
  createdBy: string;
  tags: string[]; keyHighlights: string[];
  eligYears: boolean[]; eligDepts: string[];
  organiser: string; coOrganiser: string; facilitator: string;
  eventOfficials: EventOfficial[];
  faqs: FAQ[];
  rules: Rule[];
};

const EMPTY_FORM: EditFormState = {
  title: "", description: "", bannerImage: "", posterImage: "",
  startDate: "", startTime: "", endDate: "", endTime: "",
  venue: "", mode: "OFFLINE", status: "UPCOMING", eventType: "WORKSHOP",
  maxParticipants: 0,
  regStartDate: "", regStartTime: "", regEndDate: "", regEndTime: "",
  isRegistrationOpen: false, createdBy: "",
  tags: [], keyHighlights: [],
  eligYears: [true, true, true, true], eligDepts: [],
  organiser: "", coOrganiser: "", facilitator: "",
  eventOfficials: [], faqs: [], rules: [],
};

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

function toDateInput(d: string | null | undefined): string {
  if (!d) return "";
  try {
    const date = typeof d === "object" && (d as any)?._seconds
      ? new Date((d as any)._seconds * 1000)
      : new Date(d);
    return date.toISOString().slice(0, 10);
  } catch { return ""; }
}

function toTimeInput(d: string | null | undefined): string {
  if (!d) return "";
  try {
    const date = typeof d === "object" && (d as any)?._seconds
      ? new Date((d as any)._seconds * 1000)
      : new Date(d);
    return date.toISOString().slice(11, 16);
  } catch { return ""; }
}

function combineDatetime(date: string, time: string): string | null {
  if (!date) return null;
  return time
    ? new Date(`${date}T${time}`).toISOString()
    : new Date(`${date}T00:00`).toISOString();
}

function eventToForm(e: ManagedEvent): EditFormState {
  return {
    title:       e.title || "",
    description: e.description || "",
    bannerImage: e.bannerImage || "",
    posterImage: e.posterImage || "",
    startDate:   toDateInput(e.startDate),
    startTime:   toTimeInput(e.startDate),
    endDate:     toDateInput(e.endDate),
    endTime:     toTimeInput(e.endDate),
    venue:       e.venue || "",
    mode:        e.mode || "OFFLINE",
    status:      e.status || "UPCOMING",
    eventType:   e.eventType || "WORKSHOP",
    maxParticipants: e.maxParticipants || 0,
    regStartDate:  toDateInput(e.registrationStart),
    regStartTime:  toTimeInput(e.registrationStart),
    regEndDate:    toDateInput(e.registrationEnd),
    regEndTime:    toTimeInput(e.registrationEnd),
    isRegistrationOpen: e.isRegistrationOpen ?? false,
    createdBy:   e.createdBy || "",
    tags:         Array.isArray(e.tags) ? [...e.tags] : [],
    keyHighlights: Array.isArray(e.keyHighlights) ? [...e.keyHighlights] : [],
    eligYears:  e.eligibilityCriteria?.yearOfGrad ?? [true, true, true, true],
    eligDepts:  Array.isArray(e.eligibilityCriteria?.Dept)
      ? e.eligibilityCriteria.Dept.map((d: string) => d.replace(/&/g, ""))
      : [],
    organiser:    e.executiveBoard?.organiser || "",
    coOrganiser:  e.executiveBoard?.coOrganiser || "",
    facilitator:  e.executiveBoard?.facilitator || "",
    eventOfficials: Array.isArray(e.eventOfficials)
      ? e.eventOfficials.map((o) => ({ ...o })) : [],
    faqs:  Array.isArray(e.faqs)  ? e.faqs.map((f) => ({ ...f }))  : [],
    rules: Array.isArray(e.rules) ? e.rules.map((r) => ({ ...r })) : [],
  };
}

function formToPayload(f: EditFormState) {
  return {
    title: f.title, description: f.description,
    bannerImage: f.bannerImage, posterImage: f.posterImage,
    startDate: combineDatetime(f.startDate, f.startTime),
    endDate:   combineDatetime(f.endDate,   f.endTime),
    venue: f.venue, mode: f.mode, status: f.status, eventType: f.eventType,
    maxParticipants: f.maxParticipants,
    registrationStart: combineDatetime(f.regStartDate, f.regStartTime),
    registrationEnd:   combineDatetime(f.regEndDate,   f.regEndTime),
    isRegistrationOpen: f.isRegistrationOpen,
    createdBy: f.createdBy,
    tags: f.tags, keyHighlights: f.keyHighlights,
    eligibilityCriteria: { yearOfGrad: f.eligYears, Dept: f.eligDepts },
    executiveBoard: { organiser: f.organiser, coOrganiser: f.coOrganiser, facilitator: f.facilitator },
    eventOfficials: f.eventOfficials,
    faqs: f.faqs,
    rules: f.rules,
  };
}

/* ─────────────────────────────────────────────
   SectionLabel
───────────────────────────────────────────── */

function SectionLabel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-foreground font-semibold text-sm border-b border-border pb-2">
      {icon}{title}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Props
───────────────────────────────────────────── */

interface ManagedEventEditDialogProps {
  /** The event to edit. Pass null to create a new event. */
  event: ManagedEvent | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Pre-fill createdBy when creating a new event */
  createdByEmail?: string;
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */

export function ManagedEventEditDialog({
  event,
  open,
  onClose,
  onSaved,
  createdByEmail = "",
}: ManagedEventEditDialogProps) {
  const editingId = event?.eventId ?? null;

  const [form, setForm]             = useState<EditFormState>({ ...EMPTY_FORM });
  const [formTab, setFormTab]       = useState<FormTab>("details");
  const [saving, setSaving]         = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [tagInput, setTagInput]     = useState("");
  const [highlightInput, setHighlightInput] = useState("");
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  // Populate form when dialog opens
  useEffect(() => {
    if (!open) return;
    setFormTab("details");
    setActionError(null);
    setTagInput(""); setHighlightInput("");
    if (event) {
      setForm(eventToForm(event));
    } else {
      setForm({ ...EMPTY_FORM, createdBy: createdByEmail });
    }
  }, [open, event, createdByEmail]);

  if (!open) return null;

  /* ── helpers ── */
  function updateField<K extends keyof EditFormState>(field: K, value: EditFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addToArray(field: "tags" | "keyHighlights", value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(trimmed)
        ? prev[field]
        : [...(prev[field] as string[]), trimmed],
    }));
  }

  function removeFromArray(field: "tags" | "keyHighlights", index: number) {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_: string, i: number) => i !== index),
    }));
  }

  function toggleDept(dept: string) {
    setForm((prev) => ({
      ...prev,
      eligDepts: prev.eligDepts.includes(dept)
        ? prev.eligDepts.filter((d) => d !== dept)
        : [...prev.eligDepts, dept],
    }));
  }

  async function handleFileUpload(file: File, target: "banner" | "poster") {
    const setUploading = target === "banner" ? setUploadingBanner : setUploadingPoster;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setActionError(data.error || "Upload failed"); return; }
      updateField(target === "banner" ? "bannerImage" : "posterImage", data.url);
    } catch { setActionError("Upload failed — network error"); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!form.title.trim()) { setActionError("Title is required"); return; }
    setSaving(true);
    setActionError(null);
    try {
      const payload = formToPayload(form);
      const url = editingId
        ? `/api/admin/managed-events/${editingId}`
        : "/api/admin/managed-events";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setActionError(data.error || "Save failed"); }
      else { onSaved(); }
    } catch { setActionError("Network error"); }
    finally { setSaving(false); }
  }

  /* ── render ── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {editingId ? "Edit Event" : "Create Event"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {editingId ? "Update event details below" : "Fill in the details to create a new event"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-background px-4 flex-shrink-0">
          {([
            { key: "details"     as const, label: "Details",     icon: <Star className="w-3.5 h-3.5" /> },
            { key: "schedule"    as const, label: "Schedule",    icon: <Calendar className="w-3.5 h-3.5" /> },
            { key: "media"       as const, label: "Media",       icon: <ImageLucide className="w-3.5 h-3.5" /> },
            { key: "content"     as const, label: "Content",     icon: <Hash className="w-3.5 h-3.5" /> },
            { key: "eligibility" as const, label: "Eligibility", icon: <GraduationCap className="w-3.5 h-3.5" /> },
            { key: "officials"   as const, label: "Officials",   icon: <Mic className="w-3.5 h-3.5" /> },
            { key: "faqs"        as const, label: "FAQs",        icon: <HelpCircle className="w-3.5 h-3.5" /> },
            { key: "rules"       as const, label: "Rules",       icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ]).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFormTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                formTab === tab.key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Tab Body */}
        <div className="overflow-y-auto flex-1 px-6 py-6">

          {/* ══ Details ══ */}
          {formTab === "details" && (
            <div className="space-y-6">
              <section>
                <SectionLabel icon={<Star className="w-4 h-4" />} title="Basic Info" />
                <div className="space-y-4 mt-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Event Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      className="w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. Cloud Study Jams"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      rows={3}
                      className="w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                      placeholder="Describe the event..."
                    />
                  </div>
                </div>
              </section>

              <section>
                <SectionLabel icon={<Hash className="w-4 h-4" />} title="Type & Status" />
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Event Type</label>
                    <select
                      value={form.eventType}
                      onChange={(e) => updateField("eventType", e.target.value as EventType)}
                      className="w-full mt-1 h-[42px] px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-background text-foreground"
                    >
                      {TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <div className="relative mt-1">
                      <select
                        value={form.status}
                        onChange={(e) => updateField("status", e.target.value as EventStatus)}
                        className="w-full h-[42px] px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-background text-foreground pr-8"
                      >
                        {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${STATUS_OPTIONS.find((o) => o.value === form.status)?.color || "bg-stone-400"}`} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Mode</label>
                    <select
                      value={form.mode}
                      onChange={(e) => updateField("mode", e.target.value as EventMode)}
                      className="w-full mt-1 h-[42px] px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-background text-foreground"
                    >
                      {MODE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <SectionLabel icon={<UserCheck className="w-4 h-4" />} title="Executive Board" />
                <div className="grid grid-cols-3 gap-4 mt-3">
                  {([
                    ["organiser",   "Organiser",    "Lead organiser"],
                    ["coOrganiser", "Co-Organiser", "Co-organiser"],
                    ["facilitator", "Facilitator",  "Facilitator"],
                  ] as [keyof EditFormState, string, string][]).map(([field, label, placeholder]) => (
                    <div key={field}>
                      <label className="text-xs font-medium text-muted-foreground">{label}</label>
                      <input
                        type="text"
                        value={form[field] as string}
                        onChange={(e) => updateField(field, e.target.value)}
                        className="w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ══ Schedule ══ */}
          {formTab === "schedule" && (
            <div className="space-y-6">
              <section>
                <SectionLabel icon={<Calendar className="w-4 h-4" />} title="Event Dates" />
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {([
                    ["startDate", "Start Date", "date"],
                    ["startTime", "Start Time", "time"],
                    ["endDate",   "End Date",   "date"],
                    ["endTime",   "End Time",   "time"],
                  ] as [keyof EditFormState, string, string][]).map(([field, label, type]) => (
                    <div key={field}>
                      <label className="text-xs font-medium text-muted-foreground">{label}</label>
                      <input
                        type={type}
                        value={form[field] as string}
                        onChange={(e) => updateField(field, e.target.value)}
                        onClick={type === "time" ? (e) => (e.currentTarget as any).showPicker?.() : undefined}
                        className={`w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${type === "time" ? "cursor-pointer" : ""}`}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionLabel icon={<MapPin className="w-4 h-4" />} title="Venue & Capacity" />
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Venue</label>
                    <input
                      type="text"
                      value={form.venue}
                      onChange={(e) => updateField("venue", e.target.value)}
                      className="w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. Room 201, Main Auditorium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Max Participants</label>
                    <div className="flex items-center gap-0 mt-1">
                      <button type="button" onClick={() => updateField("maxParticipants", Math.max(0, form.maxParticipants - 10))} className="h-[42px] w-10 flex items-center justify-center border border-border rounded-l-lg bg-muted hover:bg-accent transition-colors text-muted-foreground flex-shrink-0">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number" min={0}
                        value={form.maxParticipants}
                        onChange={(e) => updateField("maxParticipants", parseInt(e.target.value) || 0)}
                        className="h-[42px] flex-1 min-w-0 px-3 text-sm text-center border-y border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button type="button" onClick={() => updateField("maxParticipants", form.maxParticipants + 10)} className="h-[42px] w-10 flex items-center justify-center border border-border rounded-r-lg bg-muted hover:bg-accent transition-colors text-muted-foreground flex-shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">0 = Unlimited</p>
                  </div>
                </div>
              </section>

              <section>
                <SectionLabel icon={<UserCheck className="w-4 h-4" />} title="Registration Window" />
                <div className="mt-3 space-y-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.isRegistrationOpen}
                      onClick={() => updateField("isRegistrationOpen", !form.isRegistrationOpen)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isRegistrationOpen ? "bg-green-500" : "bg-muted"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isRegistrationOpen ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Registration is {form.isRegistrationOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {([
                      ["regStartDate", "Reg. Start Date", "date"],
                      ["regStartTime", "Reg. Start Time", "time"],
                      ["regEndDate",   "Reg. End Date",   "date"],
                      ["regEndTime",   "Reg. End Time",   "time"],
                    ] as [keyof EditFormState, string, string][]).map(([field, label, type]) => (
                      <div key={field}>
                        <label className="text-xs font-medium text-muted-foreground">{label}</label>
                        <input
                          type={type}
                          value={form[field] as string}
                          onChange={(e) => updateField(field, e.target.value)}
                          onClick={type === "time" ? (e) => (e.currentTarget as any).showPicker?.() : undefined}
                          className={`w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${type === "time" ? "cursor-pointer" : ""}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ══ Media ══ */}
          {formTab === "media" && (
            <div className="space-y-6">
              <section>
                <SectionLabel icon={<ImageLucide className="w-4 h-4" />} title="Banner & Poster" />
                <div className="grid grid-cols-2 gap-6 mt-3">
                  {/* Banner */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Banner Image</label>
                    <input ref={bannerInputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "banner"); e.target.value = ""; }}
                    />
                    {form.bannerImage ? (
                      <div className="mt-1 relative group rounded-lg overflow-hidden border border-border h-36">
                        <img src={form.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button type="button" onClick={() => bannerInputRef.current?.click()} className="px-3 py-1.5 bg-background rounded-md text-xs font-medium text-foreground hover:bg-muted">Replace</button>
                          <button type="button" onClick={() => updateField("bannerImage", "")} className="px-3 py-1.5 bg-background rounded-md text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => bannerInputRef.current?.click()} disabled={uploadingBanner}
                        className="w-full mt-1 h-36 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {uploadingBanner ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        <span className="text-xs font-medium">{uploadingBanner ? "Uploading..." : "Upload Banner"}</span>
                      </button>
                    )}
                  </div>
                  {/* Poster */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Poster Image</label>
                    <input ref={posterInputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "poster"); e.target.value = ""; }}
                    />
                    {form.posterImage ? (
                      <div className="mt-1 relative group rounded-lg overflow-hidden border border-border h-36">
                        <img src={form.posterImage} alt="Poster" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button type="button" onClick={() => posterInputRef.current?.click()} className="px-3 py-1.5 bg-background rounded-md text-xs font-medium text-foreground hover:bg-muted">Replace</button>
                          <button type="button" onClick={() => updateField("posterImage", "")} className="px-3 py-1.5 bg-background rounded-md text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => posterInputRef.current?.click()} disabled={uploadingPoster}
                        className="w-full mt-1 h-36 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {uploadingPoster ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        <span className="text-xs font-medium">{uploadingPoster ? "Uploading..." : "Upload Poster"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ══ Content ══ */}
          {formTab === "content" && (
            <div className="space-y-6">
              <section>
                <SectionLabel icon={<Hash className="w-4 h-4" />} title="Tags" />
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground rounded-full text-xs font-medium">
                        {tag}
                        <button type="button" onClick={() => removeFromArray("tags", i)} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text" value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") { e.preventDefault(); addToArray("tags", tagInput); setTagInput(""); } }}
                      className="flex-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Type a tag and press Enter"
                    />
                    <button type="button" onClick={() => { addToArray("tags", tagInput); setTagInput(""); }} className="px-3 py-2.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              <section>
                <SectionLabel icon={<Star className="w-4 h-4" />} title="Key Highlights" />
                <div className="mt-3 space-y-2">
                  {form.keyHighlights.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 group py-1">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <span className="flex-1 text-sm text-foreground">{item}</span>
                      <button type="button" onClick={() => removeFromArray("keyHighlights", i)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all text-muted-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text" value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") { e.preventDefault(); addToArray("keyHighlights", highlightInput); setHighlightInput(""); } }}
                      className="flex-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Add a highlight and press Enter"
                    />
                    <button type="button" onClick={() => { addToArray("keyHighlights", highlightInput); setHighlightInput(""); }} className="px-3 py-2.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ══ Eligibility ══ */}
          {formTab === "eligibility" && (
            <div className="space-y-6">
              <section>
                <SectionLabel icon={<GraduationCap className="w-4 h-4" />} title="Year of Graduation" />
                <div className="flex flex-wrap gap-2 mt-3">
                  <button type="button"
                    onClick={() => { const allOn = form.eligYears.every(Boolean); updateField("eligYears", form.eligYears.map(() => !allOn)); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${form.eligYears.every(Boolean) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                  >All Years</button>
                  {[0, 1, 2, 3].map((i) => (
                    <button key={i} type="button"
                      onClick={() => { const yog = [...form.eligYears]; yog[i] = !yog[i]; updateField("eligYears", yog); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${form.eligYears[i] ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}
                    >Year {i + 1}</button>
                  ))}
                </div>
              </section>

              <section>
                <SectionLabel icon={<GraduationCap className="w-4 h-4" />} title="Departments" />
                <div className="flex flex-wrap gap-2 mt-3">
                  <button type="button"
                    onClick={() => { const allSelected = VALID_DEPARTMENTS.every((d) => form.eligDepts.includes(d)); updateField("eligDepts", allSelected ? [] : [...VALID_DEPARTMENTS]); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${VALID_DEPARTMENTS.every((d) => form.eligDepts.includes(d)) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                  >All Branches</button>
                  {VALID_DEPARTMENTS.map((dept) => (
                    <button key={dept} type="button" onClick={() => toggleDept(dept)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${form.eligDepts.includes(dept) ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}
                    >{dept}</button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ══ Officials ══ */}
          {formTab === "officials" && (
            <div className="space-y-6">
              <section>
                <SectionLabel icon={<Mic className="w-4 h-4" />} title="Event Officials" />
                <p className="text-xs text-muted-foreground mt-1 mb-4">Add guests, speakers, and jury members for this event.</p>
                <div className="space-y-4">
                  {form.eventOfficials.map((official, i) => (
                    <div key={i} className="relative border border-border rounded-xl p-4 bg-muted/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Official #{i + 1}</span>
                        <button type="button"
                          onClick={() => setForm((prev) => ({ ...prev, eventOfficials: prev.eventOfficials.filter((_, idx) => idx !== i) }))}
                          className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        ><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Role *</label>
                          <select value={official.role}
                            onChange={(e) => { const u = [...form.eventOfficials]; u[i] = { ...u[i], role: e.target.value as OfficialRole }; updateField("eventOfficials", u); }}
                            className="w-full mt-1 h-[42px] px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-background text-foreground"
                          >
                            {OFFICIAL_ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Name *</label>
                          <input type="text" value={official.name}
                            onChange={(e) => { const u = [...form.eventOfficials]; u[i] = { ...u[i], name: e.target.value }; updateField("eventOfficials", u); }}
                            className="w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Full name"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email *</label>
                          <input type="email" value={official.email}
                            onChange={(e) => { const u = [...form.eventOfficials]; u[i] = { ...u[i], email: e.target.value }; updateField("eventOfficials", u); }}
                            className="w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="email@example.com"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Bio</label>
                          <textarea value={official.bio || ""}
                            onChange={(e) => { const u = [...form.eventOfficials]; u[i] = { ...u[i], bio: e.target.value }; updateField("eventOfficials", u); }}
                            rows={2} className="w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y" placeholder="Short bio..."
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Expertise</label>
                          <textarea value={official.expertise || ""}
                            onChange={(e) => { const u = [...form.eventOfficials]; u[i] = { ...u[i], expertise: e.target.value }; updateField("eventOfficials", u); }}
                            rows={2} className="w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y" placeholder="Areas of expertise..."
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3" /> Profile URL</label>
                          <input type="url" value={official.profileUrl || ""}
                            onChange={(e) => { const u = [...form.eventOfficials]; u[i] = { ...u[i], profileUrl: e.target.value }; updateField("eventOfficials", u); }}
                            className="w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Linkedin className="w-3 h-3" /> LinkedIn URL</label>
                          <input type="url" value={official.linkedinUrl || ""}
                            onChange={(e) => { const u = [...form.eventOfficials]; u[i] = { ...u[i], linkedinUrl: e.target.value }; updateField("eventOfficials", u); }}
                            className="w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://linkedin.com/in/..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Inline add form */}
                  <div className="border border-dashed border-border rounded-xl p-4 bg-muted/10 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <Plus className="w-3.5 h-3.5" />
                      {form.eventOfficials.length === 0 ? "Add your first official" : "Add another official"}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Role *</label>
                        <select id="new-official-role" defaultValue="SPEAKER"
                          className="w-full mt-1 h-[38px] px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-background text-foreground"
                        >
                          {OFFICIAL_ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Name *</label>
                        <input id="new-official-name" type="text" className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Full name" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email *</label>
                        <input id="new-official-email" type="email" className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="email@example.com" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Bio</label>
                        <input id="new-official-bio" type="text" className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Short bio..." />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Expertise</label>
                        <input id="new-official-expertise" type="text" className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Areas of expertise..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3" /> Profile URL</label>
                        <input id="new-official-profile" type="url" className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://..." />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Linkedin className="w-3 h-3" /> LinkedIn URL</label>
                        <input id="new-official-linkedin" type="url" className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://linkedin.com/in/..." />
                      </div>
                    </div>
                    <button type="button"
                      onClick={() => {
                        const nameEl     = document.getElementById("new-official-name")     as HTMLInputElement;
                        const emailEl    = document.getElementById("new-official-email")    as HTMLInputElement;
                        const roleEl     = document.getElementById("new-official-role")     as HTMLSelectElement;
                        const bioEl      = document.getElementById("new-official-bio")      as HTMLInputElement;
                        const expEl      = document.getElementById("new-official-expertise") as HTMLInputElement;
                        const profileEl  = document.getElementById("new-official-profile")  as HTMLInputElement;
                        const linkedinEl = document.getElementById("new-official-linkedin") as HTMLInputElement;
                        if (nameEl.value.trim()) {
                          updateField("eventOfficials", [...form.eventOfficials, {
                            role: roleEl.value as OfficialRole,
                            name: nameEl.value.trim(),
                            email: emailEl.value.trim(),
                            bio: bioEl.value.trim(),
                            expertise: expEl.value.trim(),
                            profileUrl: profileEl.value.trim(),
                            linkedinUrl: linkedinEl.value.trim(),
                          }]);
                          nameEl.value = ""; emailEl.value = ""; roleEl.value = "SPEAKER";
                          bioEl.value = ""; expEl.value = ""; profileEl.value = ""; linkedinEl.value = "";
                          nameEl.focus();
                        }
                      }}
                      className="w-full py-2.5 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Official
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ══ FAQs ══ */}
          {formTab === "faqs" && (
            <div className="space-y-6">
              <section>
                <SectionLabel icon={<HelpCircle className="w-4 h-4" />} title="Frequently Asked Questions" />
                <p className="text-xs text-muted-foreground mt-1 mb-4">Add questions and answers that attendees commonly ask.</p>
                <div className="space-y-4">
                  {form.faqs.map((faq, i) => (
                    <div key={i} className="relative border border-border rounded-xl p-4 bg-muted/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">FAQ #{i + 1}</span>
                        <button type="button"
                          onClick={() => setForm((prev) => ({ ...prev, faqs: prev.faqs.filter((_, idx) => idx !== i) }))}
                          className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        ><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Question *</label>
                        <input type="text" value={faq.question}
                          onChange={(e) => { const u = [...form.faqs]; u[i] = { ...u[i], question: e.target.value }; updateField("faqs", u); }}
                          className="w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. What should I bring?"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Answer *</label>
                        <textarea value={faq.answer}
                          onChange={(e) => { const u = [...form.faqs]; u[i] = { ...u[i], answer: e.target.value }; updateField("faqs", u); }}
                          rows={2} className="w-full mt-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y" placeholder="Provide a detailed answer..."
                        />
                      </div>
                    </div>
                  ))}
                  <div className="border border-dashed border-border rounded-xl p-4 bg-muted/10 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <Plus className="w-3.5 h-3.5" />
                      {form.faqs.length === 0 ? "Add your first FAQ" : "Add another FAQ"}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Question</label>
                      <input id="new-faq-question" type="text" className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. What should I bring?" />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-muted-foreground">Answer</label>
                        <input id="new-faq-answer" type="text" className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Provide a detailed answer..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const qEl = document.getElementById("new-faq-question") as HTMLInputElement;
                              const aEl = e.currentTarget as HTMLInputElement;
                              if (qEl.value.trim()) { updateField("faqs", [...form.faqs, { question: qEl.value.trim(), answer: aEl.value.trim() }]); qEl.value = ""; aEl.value = ""; qEl.focus(); }
                            }
                          }}
                        />
                      </div>
                      <button type="button"
                        onClick={() => {
                          const qEl = document.getElementById("new-faq-question") as HTMLInputElement;
                          const aEl = document.getElementById("new-faq-answer") as HTMLInputElement;
                          if (qEl.value.trim()) { updateField("faqs", [...form.faqs, { question: qEl.value.trim(), answer: aEl.value.trim() }]); qEl.value = ""; aEl.value = ""; qEl.focus(); }
                        }}
                        className="h-[38px] px-3 border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      ><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ══ Rules ══ */}
          {formTab === "rules" && (
            <div className="space-y-6">
              <section>
                <SectionLabel icon={<ShieldCheck className="w-4 h-4" />} title="Event Rules" />
                <p className="text-xs text-muted-foreground mt-1 mb-4">Define rules and guidelines for event participants.</p>
                <div className="space-y-2">
                  {form.rules.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 group py-1">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <input type="text" value={r.rule}
                        onChange={(e) => { const u = [...form.rules]; u[i] = { rule: e.target.value }; updateField("rules", u); }}
                        className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Enter rule..."
                      />
                      <button type="button"
                        onClick={() => setForm((prev) => ({ ...prev, rules: prev.rules.filter((_, idx) => idx !== i) }))}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 transition-all text-muted-foreground mt-1"
                      ><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <div className="flex items-start gap-3 py-1">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground/50 text-xs font-bold flex-shrink-0 mt-0.5 border border-dashed border-border">
                      {form.rules.length + 1}
                    </span>
                    <input id="new-rule-input" type="text"
                      className="flex-1 px-3 py-2 text-sm border border-dashed border-border rounded-lg bg-muted/10 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-border focus:bg-background"
                      placeholder={form.rules.length === 0 ? "Type your first rule and press Enter..." : "Add another rule..."}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const el = e.currentTarget;
                          if (el.value.trim()) { updateField("rules", [...form.rules, { rule: el.value.trim() }]); el.value = ""; }
                        }
                      }}
                    />
                    <button type="button"
                      onClick={() => { const el = document.getElementById("new-rule-input") as HTMLInputElement; if (el?.value.trim()) { updateField("rules", [...form.rules, { rule: el.value.trim() }]); el.value = ""; el.focus(); } }}
                      className="p-1.5 mt-0.5 hover:text-foreground transition-all text-muted-foreground border border-dashed border-border rounded-lg hover:bg-muted"
                    ><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </section>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-muted flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : editingId ? "Save Changes" : "Create Event"}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          {actionError && <span className="text-red-600 text-sm ml-auto">{actionError}</span>}
        </div>
      </div>
    </div>
  );
}
