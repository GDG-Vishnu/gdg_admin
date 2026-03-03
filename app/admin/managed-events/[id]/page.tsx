"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Pencil,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Tag,
  Star,
  Building2,
  GraduationCap,
  Search,
  Globe,
  Linkedin,
  Mail,
  Shield,
  MessageSquare,
  Mic,
  BookOpen,
  UserCheck,
  CalendarClock,
  Hash,
  Info,
  ExternalLink,
} from "lucide-react";
import GoogleLoader from "@/components/GoogleLoader";
import { ManagedEventEditDialog } from "@/components/admin/ManagedEventEditDialog";
import type {
  ManagedEvent,
  RegisteredMember,
  RegistrationType,
} from "@/lib/types/managed-event";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-500",
  PUBLISHED: "bg-blue-500",
  CLOSED: "bg-amber-500",
  COMPLETED: "bg-green-500",
};

function formatDate(d: string | null): string {
  if (!d) return "TBD";
  try {
    if (typeof d === "object" && (d as any)?._seconds) {
      return new Date((d as any)._seconds * 1000).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "TBD";
  }
}

export default function ManagedEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<ManagedEvent | null>(null);
  const [registrations, setRegistrations] = useState<
    (RegisteredMember & { regId: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add registration dialog
  const [showAddReg, setShowAddReg] = useState(false);
  const [addingReg, setAddingReg] = useState(false);
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    phone: "",
    registrationType: "Individual" as RegistrationType,
  });

  // Search
  const [search, setSearch] = useState("");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);

  // Check-in toggling
  const [togglingId, setTogglingId] = useState<string | null>(null);
  // Delete confirm
  const [confirmDeleteRegId, setConfirmDeleteRegId] = useState<string | null>(null);
  const [deletingRegId, setDeletingRegId] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/managed-events/${eventId}`);
      const data = await res.json();
      if (res.ok) {
        setEvent(data);
      } else {
        setError(data.error || "Event not found");
      }
    } catch {
      setError("Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const fetchRegistrations = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/managed-events/${eventId}/registrations`,
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setRegistrations(data);
      }
    } catch {
      console.error("Failed to load registrations");
    } finally {
      setRegLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
    fetchRegistrations();
  }, [fetchEvent, fetchRegistrations]);

  async function handleAddRegistration() {
    if (!regForm.name.trim() || !regForm.email.trim()) return;
    setAddingReg(true);
    try {
      const res = await fetch(
        `/api/admin/managed-events/${eventId}/registrations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(regForm),
        },
      );
      if (res.ok) {
        setShowAddReg(false);
        setRegForm({
          name: "",
          email: "",
          phone: "",
          registrationType: "Individual",
        });
        fetchRegistrations();
      }
    } catch {
      console.error("Failed to add registration");
    } finally {
      setAddingReg(false);
    }
  }

  async function handleToggleCheckIn(regId: string, current: boolean) {
    setTogglingId(regId);
    try {
      await fetch(
        `/api/admin/managed-events/${eventId}/registrations/${regId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCheckedIn: !current }),
        },
      );
      fetchRegistrations();
    } catch {
      console.error("Failed to toggle check-in");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDeleteRegistration(regId: string) {
    setDeletingRegId(regId);
    try {
      await fetch(
        `/api/admin/managed-events/${eventId}/registrations/${regId}`,
        { method: "DELETE" },
      );
      setRegistrations((prev) => prev.filter((r) => r.regId !== regId));
      setConfirmDeleteRegId(null);
    } catch {
      console.error("Failed to delete registration");
    } finally {
      setDeletingRegId(null);
    }
  }

  const filteredRegs = registrations.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search),
  );

  const checkedInCount = registrations.filter((r) => r.isCheckedIn).length;

  if (loading) return <GoogleLoader message="Loading event..." />;
  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-xl text-muted-foreground">{error || "Event not found"}</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/admin/managed-events")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
      </div>
    );
  }

  // Computed eligibility display
  const eligibleYears = (event.eligibilityCriteria?.yearOfGrad ?? [])
    .map((allowed: boolean, i: number) => allowed ? `Year ${i + 1}` : null)
    .filter(Boolean) as string[];
  const eligibleDepts = event.eligibilityCriteria?.Dept ?? [];

  return (
    <div className="flex flex-col min-h-0">
      <PageHeader title={event.title} />

      <div className="flex-1 p-6 space-y-0">

        {/* ── Nav bar ── */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.push("/admin/managed-events")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Events
          </button>
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
        </div>

        {/* ── Hero ── */}
        <div className="rounded-2xl overflow-hidden border border-border mb-5 bg-card">
          {/* Banner — full width, 16:9 */}
          {event.bannerImage ? (
            <div className="w-full overflow-hidden">
              <img
                src={event.bannerImage}
                alt="Banner"
                className="w-full object-cover block"
                style={{ aspectRatio: "16 / 9", maxHeight: "320px" }}
              />
            </div>
          ) : (
            <div className="w-full bg-muted/30 flex items-center justify-center text-xs text-muted-foreground/50" style={{ aspectRatio: "16 / 9", maxHeight: "320px" }}>
              No banner image
            </div>
          )}

          {/* Info strip */}
          <div className="relative px-5 pt-4 pb-4 border-t border-border">
            <div className="flex items-start gap-4">
              {/* Poster — small 1:1 square, pulled up to overlap the banner */}
              {event.posterImage && (
                <div className="shrink-0 -mt-16 w-28 h-28 rounded-xl overflow-hidden border-2 border-card shadow-md ring-1 ring-border">
                  <img
                    src={event.posterImage}
                    alt="Poster"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title + badges */}
              <div className={`flex-1 min-w-0 ${event.posterImage ? "" : "pt-0"}`}>
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide text-white ${STATUS_COLORS[event.status] || "bg-zinc-500"}`}>
                    {event.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">{event.eventType}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">{event.mode}</span>
                  {event.isRegistrationOpen && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">REG OPEN</span>
                  )}
                </div>
                <h1 className="text-lg sm:text-xl font-bold leading-tight">{event.title}</h1>
                {event.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{event.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Inline stat bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: Calendar, label: "Starts", value: formatDate(event.startDate), color: "text-primary", bg: "bg-primary/8" },
            { icon: MapPin,    label: "Venue",  value: event.venue || "TBD",         color: "text-sky-500", bg: "bg-sky-500/8" },
            { icon: Users,     label: "Registered",
              value: `${registrations.length}${event.maxParticipants ? ` / ${event.maxParticipants}` : ""}`,
              color: "text-emerald-500", bg: "bg-emerald-500/8" },
            { icon: CheckCircle, label: "Checked In",
              value: `${checkedInCount} / ${registrations.length}`,
              color: "text-amber-500", bg: "bg-amber-500/8" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-xl border border-border px-3.5 py-3 bg-card">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold leading-tight truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main content ── */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* LEFT: meta cards */}
          <div className="lg:col-span-1 space-y-4">

            {/* Event Details */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Event Details</span>
              </div>
              <div className="divide-y divide-border">
                {([
                  ["Type",            event.eventType],
                  ["Mode",            event.mode],
                  ["Max Capacity",    event.maxParticipants ? String(event.maxParticipants) : "Unlimited"],
                  ["Created By",      event.createdBy || "–"],
                  ["Event Start",     formatDate(event.startDate)],
                  ...(event.endDate ? [["Event End", formatDate(event.endDate)] as [string, string]] : []),
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground text-xs flex-shrink-0">{k}</span>
                    <span className="font-medium text-xs text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Window */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Registration</span>
              </div>
              <div className="divide-y divide-border">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-muted-foreground text-xs">Status</span>
                  {event.isRegistrationOpen
                    ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Open</span>
                    : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">Closed</span>}
                </div>
                {([
                  ["Opens",  formatDate(event.registrationStart)],
                  ["Closes", formatDate(event.registrationEnd)],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <span className="text-muted-foreground text-xs">{k}</span>
                    <span className="font-medium text-xs text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Board */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Executive Board</span>
              </div>
              <div className="divide-y divide-border">
                {([
                  ["Organiser",     event.executiveBoard?.organiser],
                  ["Co-Organiser",  event.executiveBoard?.coOrganiser],
                  ["Facilitator",   event.executiveBoard?.facilitator],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <span className="text-muted-foreground text-xs flex-shrink-0">{k}</span>
                    <span className="font-medium text-xs text-right">{v || "–"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            {(eligibleYears.length > 0 || eligibleDepts.length > 0) && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Eligibility</span>
                </div>
                <div className="px-4 py-3 space-y-3">
                  {eligibleYears.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide">Years</p>
                      <div className="flex flex-wrap gap-1">
                        {eligibleYears.map((y) => (
                          <span key={y} className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-primary/10 text-primary border border-primary/20">{y}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {eligibleDepts.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide">Departments</p>
                      <div className="flex flex-wrap gap-1">
                        {eligibleDepts.map((d: string) => (
                          <span key={d} className="px-2 py-0.5 text-[11px] font-medium rounded-md border border-border text-muted-foreground">{d.replace(/&/g, "")}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags & Highlights */}
            {(event.tags?.length > 0 || event.keyHighlights?.length > 0) && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Tags & Highlights</span>
                </div>
                <div className="px-4 py-3 space-y-3">
                  {event.tags?.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((t: string) => (
                          <span key={t} className="px-2 py-0.5 text-[11px] rounded-md bg-muted text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {event.keyHighlights?.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide flex items-center gap-1"><Star className="w-3 h-3" /> Highlights</p>
                      <div className="flex flex-wrap gap-1">
                        {event.keyHighlights.map((h: string) => (
                          <span key={h} className="px-2 py-0.5 text-[11px] rounded-md border border-border text-muted-foreground">{h}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: officials · faqs · rules */}
          <div className="lg:col-span-2 space-y-4">

            {/* Officials */}
            {event.eventOfficials?.length > 0 && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Officials</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">{event.eventOfficials.length} total</span>
                </div>
                <div className="p-4 grid gap-3 sm:grid-cols-2">
                  {event.eventOfficials.map((off: any, i: number) => (
                    <div key={i} className="flex gap-3 p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-border flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                        {off.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm leading-tight">{off.name}</p>
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-primary/10 text-primary border border-primary/15">{off.role}</span>
                        </div>
                        {off.expertise && (
                          <p className="text-xs text-muted-foreground">{off.expertise}</p>
                        )}
                        {off.bio && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{off.bio}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 pt-0.5">
                          {off.email && (
                            <a href={`mailto:${off.email}`} className="text-[11px] text-primary hover:underline flex items-center gap-1">
                              <Mail className="w-3 h-3" />{off.email}
                            </a>
                          )}
                          {off.profileUrl && (
                            <a href={off.profileUrl} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                              <Globe className="w-3 h-3" />Profile
                            </a>
                          )}
                          {off.linkedinUrl && (
                            <a href={off.linkedinUrl} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                              <Linkedin className="w-3 h-3" />LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {event.faqs?.length > 0 && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">FAQs</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">{event.faqs.length} questions</span>
                </div>
                <div className="divide-y divide-border">
                  {event.faqs.map((faq: any, i: number) => (
                    <div key={i} className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-foreground mb-1">{faq.question}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {event.rules?.length > 0 && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Rules</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">{event.rules.length} rules</span>
                </div>
                <ol className="divide-y divide-border">
                  {event.rules.map((r: any, i: number) => (
                    <li key={i} className="flex gap-3 px-5 py-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground mt-0.5">{i + 1}</span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.rule}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Registrations */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Registrations</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-muted text-muted-foreground">{registrations.length}</span>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={() => setShowAddReg(true)}>
                  <UserPlus className="mr-1.5 h-3 w-3" /> Add
                </Button>
              </div>

              {/* Search */}
              <div className="px-4 py-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              </div>

              {regLoading ? (
                <div className="py-14 text-center text-muted-foreground text-sm">
                  <Loader2 className="w-5 h-5 mx-auto animate-spin mb-2" /> Loading…
                </div>
              ) : filteredRegs.length === 0 ? (
                <div className="py-14 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{search ? "No matches found." : "No registrations yet."}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs">Phone</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">Registered</TableHead>
                        <TableHead className="text-xs text-center">In</TableHead>
                        <TableHead className="text-xs text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegs.map((reg) => (
                        <TableRow key={reg.regId} className="text-sm">
                          <TableCell className="font-medium py-2.5">{reg.name}</TableCell>
                          <TableCell className="text-muted-foreground py-2.5">{reg.email}</TableCell>
                          <TableCell className="text-muted-foreground py-2.5 font-mono text-xs">
                            {reg.phone ? reg.phone.slice(0, -4).replace(/\d/g, "•") + reg.phone.slice(-4) : "–"}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded border border-border text-muted-foreground">{reg.registrationType}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-2.5">{formatDate(reg.registeredAt)}</TableCell>
                          <TableCell className="text-center py-2.5">
                            <button
                              onClick={() => handleToggleCheckIn(reg.regId, reg.isCheckedIn)}
                              disabled={togglingId === reg.regId}
                              className="inline-flex"
                            >
                              {togglingId === reg.regId
                                ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                : reg.isCheckedIn
                                  ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  : <XCircle className="w-4 h-4 text-muted-foreground/40" />}
                            </button>
                          </TableCell>
                          <TableCell className="text-right py-2.5">
                            {confirmDeleteRegId === reg.regId ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleDeleteRegistration(reg.regId)}
                                  disabled={deletingRegId === reg.regId}
                                  className="px-2 py-0.5 bg-red-600 text-white rounded text-[11px] hover:bg-red-700 disabled:opacity-50"
                                >
                                  {deletingRegId === reg.regId ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
                                </button>
                                <button onClick={() => setConfirmDeleteRegId(null)} className="px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground">
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteRegId(reg.regId)}
                                className="p-1 rounded text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Add Registration Dialog */}
      <Dialog open={showAddReg} onOpenChange={setShowAddReg}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Add Registration</DialogTitle>
            <DialogDescription>Manually register a member for this event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="regName">Name *</Label>
              <Input id="regName" value={regForm.name} onChange={(e) => setRegForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regEmail">Email *</Label>
              <Input id="regEmail" type="email" value={regForm.email} onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regPhone">Phone</Label>
              <Input id="regPhone" value={regForm.phone} onChange={(e) => setRegForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
            </div>
            <div className="space-y-2">
              <Label>Registration Type</Label>
              <Select value={regForm.registrationType} onValueChange={(v) => setRegForm((p) => ({ ...p, registrationType: v as RegistrationType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowAddReg(false)}>Cancel</Button>
            <Button onClick={handleAddRegistration} disabled={addingReg || !regForm.name.trim() || !regForm.email.trim()}>
              {addingReg ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ManagedEventEditDialog
        event={event}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => { setEditOpen(false); fetchEvent(); }}
      />
    </div>
  );
}

