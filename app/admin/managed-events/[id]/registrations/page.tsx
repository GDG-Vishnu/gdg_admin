"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { Button } from "@/components/ui/button";
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
  Users,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Download,
  ToggleLeft,
  ToggleRight,
  Filter,
  UserRound,
  UsersRound,
  CalendarClock,
  ExternalLink,
} from "lucide-react";
import GoogleLoader from "@/components/GoogleLoader";
import type {
  ManagedEvent,
  RegisteredMember,
  RegistrationType,
} from "@/lib/types/managed-event";

/* ── Helpers ── */

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

/* ── Page ── */

export default function RegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  /* ── State ── */
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
    userId: "",
    name: "",
    email: "",
    phone: "",
    registrationType: "Individual" as RegistrationType,
  });

  // User search for manual registration
  const [allClientUsers, setAllClientUsers] = useState<
    { id: string; name: string; email: string; phoneNumber: string; branch: string; profileUrl: string }[]
  >([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string; name: string; email: string; phoneNumber: string; branch: string; profileUrl: string;
  } | null>(null);

  // Search & filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Individual" | "Team">("all");
  const [checkInFilter, setCheckInFilter] = useState<"all" | "checked-in" | "not-checked-in">("all");

  // Actions
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDeleteRegId, setConfirmDeleteRegId] = useState<string | null>(null);
  const [deletingRegId, setDeletingRegId] = useState<string | null>(null);
  const [togglingRegOpen, setTogglingRegOpen] = useState(false);
  const [bulkChecking, setBulkChecking] = useState(false);

  /* ── Data fetching ── */

  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/managed-events/${eventId}`);
      const data = await res.json();
      if (res.ok) setEvent(data);
      else setError(data.error || "Event not found");
    } catch {
      setError("Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const fetchRegistrations = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/managed-events/${eventId}/registrations`);
      const data = await res.json();
      if (Array.isArray(data)) setRegistrations(data);
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

  // Fetch client users when add-reg dialog opens
  useEffect(() => {
    if (!showAddReg || allClientUsers.length > 0) return;
    setLoadingUsers(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAllClientUsers(data); })
      .catch(() => console.error("Failed to load users"))
      .finally(() => setLoadingUsers(false));
  }, [showAddReg, allClientUsers.length]);

  /* ── Derived state ── */

  const registeredEmails = new Set(registrations.map((r) => r.email.toLowerCase()));
  const filteredUsers = userSearchQuery.trim().length >= 2
    ? allClientUsers.filter(
        (u) =>
          !registeredEmails.has(u.email.toLowerCase()) &&
          (u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
      )
    : [];

  const filteredRegs = registrations.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search);
    const matchesType = typeFilter === "all" || r.registrationType === typeFilter;
    const matchesCheckIn =
      checkInFilter === "all" ||
      (checkInFilter === "checked-in" ? r.isCheckedIn : !r.isCheckedIn);
    return matchesSearch && matchesType && matchesCheckIn;
  });

  const checkedInCount = registrations.filter((r) => r.isCheckedIn).length;
  const individualCount = registrations.filter((r) => r.registrationType === "Individual").length;
  const teamCount = registrations.filter((r) => r.registrationType === "Team").length;
  const capacityPercent = event?.maxParticipants ? Math.round((registrations.length / event.maxParticipants) * 100) : 0;
  const checkInPercent = registrations.length > 0 ? Math.round((checkedInCount / registrations.length) * 100) : 0;

  /* ── Handlers ── */

  async function handleAddRegistration() {
    if (!selectedUser) return;
    setAddingReg(true);
    try {
      const res = await fetch(`/api/admin/managed-events/${eventId}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.email,
          phone: selectedUser.phoneNumber || "",
          registrationType: regForm.registrationType,
        }),
      });
      if (res.ok) {
        setShowAddReg(false);
        setSelectedUser(null);
        setUserSearchQuery("");
        setRegForm({ userId: "", name: "", email: "", phone: "", registrationType: "Individual" });
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
      await fetch(`/api/admin/managed-events/${eventId}/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCheckedIn: !current }),
      });
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
      await fetch(`/api/admin/managed-events/${eventId}/registrations/${regId}`, { method: "DELETE" });
      setRegistrations((prev) => prev.filter((r) => r.regId !== regId));
      setConfirmDeleteRegId(null);
    } catch {
      console.error("Failed to delete registration");
    } finally {
      setDeletingRegId(null);
    }
  }

  async function handleToggleRegistration() {
    if (!event) return;
    setTogglingRegOpen(true);
    try {
      const res = await fetch(`/api/admin/managed-events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRegistrationOpen: !event.isRegistrationOpen }),
      });
      if (res.ok) fetchEvent();
    } catch {
      console.error("Failed to toggle registration");
    } finally {
      setTogglingRegOpen(false);
    }
  }

  async function handleBulkCheckIn() {
    const unchecked = filteredRegs.filter((r) => !r.isCheckedIn);
    if (unchecked.length === 0) return;
    setBulkChecking(true);
    try {
      await Promise.all(
        unchecked.map((r) =>
          fetch(`/api/admin/managed-events/${eventId}/registrations/${r.regId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isCheckedIn: true }),
          })
        )
      );
      fetchRegistrations();
    } catch {
      console.error("Failed to bulk check-in");
    } finally {
      setBulkChecking(false);
    }
  }

  function handleExportCSV() {
    if (registrations.length === 0) return;
    const headers = ["#", "Name", "Email", "Phone", "Type", "Registered At", "Checked In", "Checked In At"];
    const rows = registrations.map((r, i) => [
      String(i + 1),
      r.name,
      r.email,
      r.phone || "-",
      r.registrationType,
      r.registeredAt ? formatDate(r.registeredAt) : "-",
      r.isCheckedIn ? "Yes" : "No",
      r.checkedInAt ? formatDate(r.checkedInAt) : "-",
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${event?.title?.replace(/\s+/g, "-").toLowerCase() || eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Loading / Error states ── */

  if (loading) return <GoogleLoader message="Loading event..." />;
  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-xl text-muted-foreground">{error || "Event not found"}</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/admin/managed-events")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
      </div>
    );
  }

  /* ── Render ── */

  return (
    <div className="flex flex-col min-h-0">
      <PageHeader title="Registration Management" />

      <div className="flex-1 p-6 space-y-6">

        {/* ── Nav bar ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/admin/managed-events/${eventId}`)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to {event.title}
          </button>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleExportCSV}
              disabled={registrations.length === 0}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={() => setShowAddReg(true)}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add Registration
            </Button>
          </div>
        </div>

        {/* ── Registration Status & Toggle ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                event.isRegistrationOpen
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  : "bg-muted-foreground/30"
              }`} />
              <div>
                <p className="text-sm font-semibold">
                  Registration is {event.isRegistrationOpen ? "Open" : "Closed"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {event.registrationStart && event.registrationEnd
                    ? `${formatDate(event.registrationStart)} — ${formatDate(event.registrationEnd)}`
                    : event.registrationStart
                      ? `Opens ${formatDate(event.registrationStart)}`
                      : "No registration window configured"}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={event.isRegistrationOpen ? "destructive" : "default"}
              onClick={handleToggleRegistration}
              disabled={togglingRegOpen}
              className="h-8 text-xs shrink-0"
            >
              {togglingRegOpen ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : event.isRegistrationOpen ? (
                <ToggleRight className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <ToggleLeft className="mr-1.5 h-3.5 w-3.5" />
              )}
              {event.isRegistrationOpen ? "Close Registration" : "Open Registration"}
            </Button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Total Registered */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registered</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {registrations.length}
              {event.maxParticipants > 0 && (
                <span className="text-sm font-normal text-muted-foreground"> / {event.maxParticipants}</span>
              )}
            </p>
            {event.maxParticipants > 0 && (
              <div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      capacityPercent > 90 ? "bg-red-500" : capacityPercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, capacityPercent)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{capacityPercent}% capacity filled</p>
              </div>
            )}
          </div>

          {/* Checked In */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Checked In</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {checkedInCount}
              <span className="text-sm font-normal text-muted-foreground"> / {registrations.length}</span>
            </p>
            {registrations.length > 0 && (
              <div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${checkInPercent}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{checkInPercent}% check-in rate</p>
              </div>
            )}
          </div>

          {/* Individual */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <UserRound className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Individual</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{individualCount}</p>
            {registrations.length > 0 && (
              <p className="text-[10px] text-muted-foreground">{Math.round((individualCount / registrations.length) * 100)}% of registrations</p>
            )}
          </div>

          {/* Team */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <UsersRound className="w-4 h-4 text-violet-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Team</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{teamCount}</p>
            {registrations.length > 0 && (
              <p className="text-[10px] text-muted-foreground">{Math.round((teamCount / registrations.length) * 100)}% of registrations</p>
            )}
          </div>
        </div>

        {/* ── Registrations Table ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">

          {/* Filters bar */}
          <div className="px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b border-border bg-muted/20">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as "all" | "Individual" | "Team")}>
                <SelectTrigger className="h-8 text-xs w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Team">Team</SelectItem>
                </SelectContent>
              </Select>
              <Select value={checkInFilter} onValueChange={(v) => setCheckInFilter(v as "all" | "checked-in" | "not-checked-in")}>
                <SelectTrigger className="h-8 text-xs w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="checked-in">Checked In</SelectItem>
                  <SelectItem value="not-checked-in">Not Checked In</SelectItem>
                </SelectContent>
              </Select>
              {filteredRegs.length > 0 && filteredRegs.some((r) => !r.isCheckedIn) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkCheckIn}
                  disabled={bulkChecking}
                  className="h-8 text-xs"
                >
                  {bulkChecking ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Check In All ({filteredRegs.filter((r) => !r.isCheckedIn).length})
                </Button>
              )}
            </div>
          </div>

          {/* Table content */}
          {regLoading ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              <Loader2 className="w-5 h-5 mx-auto animate-spin mb-2" /> Loading registrations…
            </div>
          ) : filteredRegs.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-15" />
              <p className="text-sm font-medium">
                {search || typeFilter !== "all" || checkInFilter !== "all"
                  ? "No registrations match your filters."
                  : "No registrations yet."}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {search || typeFilter !== "all" || checkInFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : 'Click "Add Registration" to manually register a participant.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs w-10 text-center">#</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Phone</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Registered</TableHead>
                    <TableHead className="text-xs text-center">Check-in</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Checked In At</TableHead>
                    <TableHead className="text-xs text-right w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegs.map((reg, idx) => (
                    <TableRow key={reg.regId || `reg-${idx}`} className="text-sm group">
                      <TableCell className="text-center text-xs text-muted-foreground tabular-nums py-2.5">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                            {reg.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="truncate max-w-[150px]">{reg.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-2.5 text-xs">{reg.email}</TableCell>
                      <TableCell className="text-muted-foreground py-2.5 font-mono text-xs hidden md:table-cell">
                        {reg.phone || "–"}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                          reg.registrationType === "Team"
                            ? "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                        }`}>
                          {reg.registrationType}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2.5 hidden lg:table-cell">
                        {formatDate(reg.registeredAt)}
                      </TableCell>
                      <TableCell className="text-center py-2.5">
                        <button
                          onClick={() => handleToggleCheckIn(reg.regId, reg.isCheckedIn)}
                          disabled={togglingId === reg.regId}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors"
                          title={reg.isCheckedIn ? "Mark as not checked in" : "Mark as checked in"}
                        >
                          {togglingId === reg.regId ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : reg.isCheckedIn ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground/30 hover:text-muted-foreground/60" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2.5 hidden lg:table-cell">
                        {reg.isCheckedIn && reg.checkedInAt ? formatDate(reg.checkedInAt) : "–"}
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
                            className="p-1 rounded text-muted-foreground/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"
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

          {/* Table footer */}
          {!regLoading && (
            <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Showing {filteredRegs.length} of {registrations.length} registration{registrations.length !== 1 ? "s" : ""}
              </span>
              {(typeFilter !== "all" || checkInFilter !== "all" || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => { setSearch(""); setTypeFilter("all"); setCheckInFilter("all"); }}
                >
                  <Filter className="mr-1 h-3 w-3" /> Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Registration Dialog ── */}
      <Dialog open={showAddReg} onOpenChange={(open) => {
        setShowAddReg(open);
        if (!open) { setSelectedUser(null); setUserSearchQuery(""); }
      }}>
        <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Add Registration</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Search and select a user from the system to register for {event.title}.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 pb-2">
            {selectedUser ? (
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-border bg-muted/40">
                <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                  {selectedUser.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium leading-tight truncate">{selectedUser.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">{selectedUser.email}</p>
                </div>
                {selectedUser.branch && (
                  <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full bg-muted text-muted-foreground border border-border">
                    {selectedUser.branch}
                  </span>
                )}
                <button
                  onClick={() => { setSelectedUser(null); setUserSearchQuery(""); }}
                  className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
                  title="Change user"
                >
                  <XCircle className="w-4 h-4 text-muted-foreground/60 hover:text-foreground" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <Input
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name or email…"
                    className="pl-9 h-9 text-sm"
                    autoFocus
                  />
                </div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="max-h-[220px] overflow-y-auto divide-y divide-border">
                    {loadingUsers ? (
                      <div className="flex items-center justify-center gap-2 py-8">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Loading users…</span>
                      </div>
                    ) : userSearchQuery.trim().length < 2 ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-1">
                        <Search className="w-5 h-5 text-muted-foreground/30" />
                        <span className="text-xs text-muted-foreground/60">Type at least 2 characters to search</span>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-1">
                        <Users className="w-5 h-5 text-muted-foreground/30" />
                        <span className="text-xs text-muted-foreground/60">No matching users found</span>
                      </div>
                    ) : (
                      filteredUsers.slice(0, 20).map((u) => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUser(u)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60 focus:bg-muted/60 outline-none"
                        >
                          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">
                            {u.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium leading-tight truncate">{u.name}</p>
                            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">{u.email}</p>
                          </div>
                          {u.branch && (
                            <span className="shrink-0 text-[10px] text-muted-foreground/70">{u.branch}</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                  {filteredUsers.length > 0 && (
                    <div className="px-3 py-1.5 bg-muted/30 border-t border-border">
                      <span className="text-[10px] text-muted-foreground/60">
                        {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
                        {filteredUsers.length > 20 ? " · showing first 20" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedUser && (
              <div className="mt-4 space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Registration Type</Label>
                <Select value={regForm.registrationType} onValueChange={(v) => setRegForm((p) => ({ ...p, registrationType: v as RegistrationType }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Team">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 mt-2 border-t border-border bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => { setShowAddReg(false); setSelectedUser(null); setUserSearchQuery(""); }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 px-4 text-xs"
              onClick={handleAddRegistration}
              disabled={addingReg || !selectedUser}
            >
              {addingReg ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <UserPlus className="mr-1.5 h-3.5 w-3.5" />}
              Register
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
