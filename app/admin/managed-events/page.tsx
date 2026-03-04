"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import {
  Card,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Plus,
  Search,
  Trash2,
  Pencil,
  Users,
  MapPin,
  Loader2,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  FileText,
} from "lucide-react";
import GoogleLoader from "@/components/GoogleLoader";
import type {
  ManagedEvent,
  EventStatus,
  EventType,
} from "@/lib/types/managed-event";
import { ManagedEventEditDialog } from "@/components/admin/ManagedEventEditDialog";

const STATUS_COLORS: Record<EventStatus, string> = {
  DRAFT: "bg-zinc-500",
  PUBLISHED: "bg-blue-500",
  CLOSED: "bg-amber-500",
  COMPLETED: "bg-green-500",
};
const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
  COMPLETED: "Completed",
};


function formatDate(d: string | null): string {
  if (!d) return "TBD";
  try {
    if (typeof d === "object" && (d as any)?._seconds) {
      return new Date((d as any)._seconds * 1000).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "TBD";
  }
}



export default function ManagedEventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | EventStatus>("all");
  const [filterType, setFilterType] = useState<"all" | EventType>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // Edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ManagedEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/managed-events");
      const json = await res.json();
      if (Array.isArray(json)) setEvents(json);
      else if (json.error) setError(json.error);
    } catch {
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.authenticated && d.user?.email) setCurrentUserEmail(d.user.email); })
      .catch(() => {});
  }, [fetchEvents]);

  // Auto-open edit form when navigated with ?edit=<id>
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || events.length === 0) return;
    const target = events.find((e) => e.eventId === editId);
    if (target) {
      openEdit(target);
      router.replace("/admin/managed-events");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, searchParams]);

  /* ──── dialog helpers ──── */

  function openCreate() {
    setEditingEvent(null);
    setFormOpen(true);
  }

  function openEdit(event: ManagedEvent) {
    setEditingEvent(event);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingEvent(null);
  }

  async function handleDelete(eventId: string) {
    setDeletingId(eventId);
    try {
      const res = await fetch(`/api/admin/managed-events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.eventId !== eventId));
        setConfirmDeleteId(null);
      }
    } catch { console.error("Delete failed"); } finally { setDeletingId(null); }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || event.status === filterStatus;
    const matchesType = filterType === "all" || event.eventType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = [
    { title: "Total Events", value: events.length, description: "All managed events", icon: Calendar },
    { title: "Published", value: events.filter((e) => e.status === "PUBLISHED").length, description: "Live events", icon: CalendarPlus },
    { title: "Completed", value: events.filter((e) => e.status === "COMPLETED").length, description: "Past events", icon: CalendarCheck },
    { title: "Drafts", value: events.filter((e) => e.status === "DRAFT").length, description: "Unpublished", icon: FileText },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Managed Events" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Event Management</h2>
            <p className="text-muted-foreground">Create and manage community events with registration tracking.</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40 text-sm">
                <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{stat.title}:</span>
                <span className="font-semibold text-foreground">{stat.value}</span>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search events by title, description, or venue..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="WORKSHOP">Workshop</SelectItem>
              <SelectItem value="HACKATHON">Hackathon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {loading ? (
            <GoogleLoader message="Loading events..." />
          ) : error ? (
            <Card className="flex items-center justify-center p-12 bg-muted/20 border-dashed">
              <div className="text-center">
                <CalendarX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-medium text-muted-foreground">{error}</p>
              </div>
            </Card>
          ) : filteredEvents.length === 0 ? (
            <Card className="flex items-center justify-center p-12 bg-muted/20 border-dashed">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-xl font-medium text-muted-foreground">No events found.</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  {searchQuery || filterStatus !== "all" || filterType !== "all" ? "Try adjusting your filters." : "Create your first managed event."}
                </p>
              </div>
            </Card>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.eventId} onClick={() => router.push(`/admin/managed-events/${event.eventId}`)} className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-r from-card to-muted/50 shadow-md cursor-pointer p-3">
                <div className="flex flex-col md:flex-row min-h-[180px]">
                  {/* Image */}
                  <div className="relative w-full md:w-60 h-48 md:h-auto overflow-hidden rounded-xl flex-shrink-0">
                    {event.posterImage || event.bannerImage ? (
                      <img src={event.posterImage || event.bannerImage} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${STATUS_COLORS[event.status] || "bg-zinc-500"}`}>{STATUS_LABELS[event.status] || event.status}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-card text-foreground shadow-sm border border-border">{event.eventType}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 px-5 py-3 md:px-6 md:py-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {event.title}
                        </CardTitle>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center text-muted-foreground font-medium">
                            <Calendar className="h-4 w-4 mr-2 text-primary" />
                            <span className="text-sm">{formatDate(event.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => { e.stopPropagation(); openEdit(event); }} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit event">
                              <Pencil className="w-4 h-4" />
                            </button>
                            {confirmDeleteId === event.eventId ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(event.eventId)} disabled={deletingId === event.eventId} className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                                  {deletingId === event.eventId ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
                                </button>
                                <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDeleteId(event.eventId)} className="p-2 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors" title="Delete event">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{event.description || "No description provided."}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 mt-auto">
                      {event.venue && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3"><MapPin className="w-4 h-4 text-primary" /></div>
                          <span>{event.venue}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mr-3"><Users className="w-4 h-4 text-accent" /></div>
                        <span>Max {event.maxParticipants || "∞"}</span>
                      </div>
                      {event.mode && <Badge variant="outline" className="text-xs">{event.mode}</Badge>}
                      {event.isRegistrationOpen && <Badge className="bg-green-500 text-white text-xs">Registration Open</Badge>}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex gap-2 ml-auto">
                          {event.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground rounded text-[10px] font-bold uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <ManagedEventEditDialog
        event={editingEvent}
        open={formOpen}
        onClose={closeForm}
        onSaved={() => { closeForm(); fetchEvents(); }}
        createdByEmail={currentUserEmail}
      />
    </div>
  );
}
