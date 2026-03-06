"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Activity,
  BarChart3,
  CircleDot,
  CalendarCheck,
  TrendingUp,
  Eye,
  Sparkles,
  Globe,
  MapPin,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import type { ManagedEvent, RegisteredMember } from "@/lib/types/managed-event";

/* ── Cool silver palette ── */
const P = {
  indigo: "#d6dde8",
  sky: "#7e90ad",
  emerald: "#c5d0df",
  amber: "#596a7f",
  rose: "#3e4d5e",
  violet: "#e8edf3",
  teal: "#6e7f96",
  slate: "#1f2937",
  white: "#ffffff",
};

const CHART_FILL = ["#d6dde8", "#596a7f", "#e8edf3", "#3e4d5e", "#7e90ad", "#1f2937", "#c5d0df", "#6e7f96"];

/* ═══ Animated number ═══ */
function Num({ value, duration = 800 }: { value: number; duration?: number }) {
  const [d, setD] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const s = prev.current, diff = value - s;
    if (!diff) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setD(Math.round(s + diff * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick); else prev.current = value;
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{d.toLocaleString()}</>;
}

/* ═══ Tooltips ═══ */
function TT({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#1a1f2e]/95 backdrop-blur-xl px-4 py-2.5 shadow-2xl">
      <p className="text-[11px] font-medium text-slate-400 mb-1.5">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[12px]">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />
          <span className="text-slate-300">{e.name}</span>
          <span className="font-semibold text-white ml-auto tabular-nums">{e.value}</span>
        </div>
      ))}
    </div>
  );
}

function PTT({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#1a1f2e]/95 backdrop-blur-xl px-4 py-2.5 shadow-2xl">
      <div className="flex items-center gap-2 text-[12px]">
        <span className="w-2 h-2 rounded-full" style={{ background: d.payload.fill || d.payload.color }} />
        <span className="text-slate-200 font-medium">{d.name}</span>
        <span className="font-bold text-white ml-auto tabular-nums">{d.value}</span>
      </div>
    </div>
  );
}

/* ═══ Spark mini-bar ═══ */
function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[2px] h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full transition-all duration-500"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.35 + (i / data.length) * 0.65 }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */

interface DashboardData {
  managedEvents: ManagedEvent[];
  registrationsByEvent: Record<string, (RegisteredMember & { regId: string })[]>;
  users: any[];
  legacyEvents: any[];
  gdgTeam: any[];
  forms: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const [meRes, usersRes, eventsRes, teamRes, formsRes] = await Promise.all([
        fetch("/api/admin/managed-events"),
        fetch("/api/admin/users"),
        fetch("/api/admin/events"),
        fetch("/api/admin/gdg-team"),
        fetch("/api/forms"),
      ]);
      const [managedEvents, users, legacyEvents, gdgTeam, forms] = await Promise.all([
        meRes.json(), usersRes.json(), eventsRes.json(), teamRes.json(), formsRes.json(),
      ]);
      const regEntries = await Promise.all(
        (Array.isArray(managedEvents) ? managedEvents : []).map(async (ev: ManagedEvent) => {
          try {
            const r = await fetch(`/api/admin/managed-events/${ev.eventId}/registrations`);
            const regs = await r.json();
            return [ev.eventId, Array.isArray(regs) ? regs : []] as const;
          } catch { return [ev.eventId, []] as const; }
        })
      );
      const registrationsByEvent: Record<string, any[]> = {};
      regEntries.forEach(([id, regs]) => { registrationsByEvent[id] = [...regs]; });
      setData({
        managedEvents: Array.isArray(managedEvents) ? managedEvents : [],
        registrationsByEvent,
        users: Array.isArray(users) ? users : [],
        legacyEvents: Array.isArray(legacyEvents) ? legacyEvents : [],
        gdgTeam: Array.isArray(gdgTeam) ? gdgTeam : [],
        forms: Array.isArray(forms) ? forms : [],
      });
    } catch (err) { console.error("Dashboard fetch failed:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  /* ── stats ── */
  const stats = useMemo(() => {
    if (!data) return null;
    const { managedEvents, registrationsByEvent, users, legacyEvents, gdgTeam, forms } = data;

    const allRegs = Object.values(registrationsByEvent).flat();
    const totalRegs = allRegs.length;
    const totalCheckedIn = allRegs.filter((r) => r.isCheckedIn).length;
    const totalIndividual = allRegs.filter((r) => r.registrationType === "Individual").length;
    const totalTeam = allRegs.filter((r) => r.registrationType === "Team").length;

    const upcoming = managedEvents.filter((e) => e.status === "UPCOMING");
    const ongoing = managedEvents.filter((e) => e.status === "ONGOING");
    const completed = managedEvents.filter((e) => e.status === "COMPLETED");
    const openRegs = managedEvents.filter((e) => e.isRegistrationOpen);

    const totalCapacity = managedEvents.reduce((s, e) => s + (e.maxParticipants || 0), 0);
    const profileComplete = users.filter((u: any) => u.profileCompleted).length;

    const teamApproved = gdgTeam.filter((m: any) => m.authorizationStatus === "approved").length;
    const teamPending = gdgTeam.filter((m: any) => m.authorizationStatus === "pending").length;
    const teamRejected = gdgTeam.filter((m: any) => m.authorizationStatus === "rejected").length;
    const teamRevoked = gdgTeam.filter((m: any) => m.authorizationStatus === "revoked").length;

    const teamPieData = [
      { name: "Approved", value: teamApproved, color: P.emerald },
      { name: "Pending", value: teamPending, color: P.sky },
      { name: "Rejected", value: teamRejected, color: P.rose },
      { name: "Revoked", value: teamRevoked, color: P.slate },
    ].filter((d) => d.value > 0);

    // Timeline
    const regTimeline: Record<string, number> = {};
    allRegs.forEach((r) => {
      if (!r.registeredAt) return;
      try {
        const d = typeof r.registeredAt === "object" && (r.registeredAt as any)?._seconds
          ? new Date((r.registeredAt as any)._seconds * 1000) : new Date(r.registeredAt);
        const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        regTimeline[key] = (regTimeline[key] || 0) + 1;
      } catch {}
    });
    const timeline = Object.entries(regTimeline).map(([date, count]) => ({ date, count }));
    let cum = 0;
    const cumulativeTimeline = timeline.map((t) => { cum += t.count; return { ...t, cumulative: cum }; });

    // Spark data: last 14 timeline points padded
    const sparkRegs = timeline.map(t => t.count);
    while (sparkRegs.length < 14) sparkRegs.unshift(0);
    const sparkData = sparkRegs.slice(-14);

    // Per-event bar data
    const eventBarData = managedEvents.map((e) => ({
      name: e.title.length > 15 ? e.title.slice(0, 13) + "\u2026" : e.title,
      fullName: e.title,
      registrations: registrationsByEvent[e.eventId]?.length || 0,
      checkedIn: registrationsByEvent[e.eventId]?.filter((r: any) => r.isCheckedIn).length || 0,
      capacity: e.maxParticipants || 0,
    })).sort((a, b) => b.registrations - a.registrations).slice(0, 8);

    // Pies
    const eventStatusPie = [
      { name: "Upcoming", value: upcoming.length, color: P.indigo },
      { name: "Ongoing", value: ongoing.length, color: P.sky },
      { name: "Completed", value: completed.length, color: P.emerald },
    ].filter((d) => d.value > 0);

    const regTypePie = [
      { name: "Individual", value: totalIndividual, color: P.indigo },
      { name: "Team", value: totalTeam, color: P.sky },
    ].filter((d) => d.value > 0);

    // Branches
    const branches: Record<string, number> = {};
    users.forEach((u: any) => { branches[u.branch || "Unknown"] = (branches[u.branch || "Unknown"] || 0) + 1; });
    const branchPieData = Object.entries(branches).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, value], i) => ({ name, value, color: CHART_FILL[i % CHART_FILL.length] }));

    // Graduation year
    const gradYears: Record<number, number> = {};
    users.forEach((u: any) => { if (u.graduationYear) gradYears[u.graduationYear] = (gradYears[u.graduationYear] || 0) + 1; });
    const gradYearData = Object.entries(gradYears).map(([y, c]) => ({ year: y, count: c })).sort((a, b) => a.year.localeCompare(b.year));

    // Event mode
    const modes: Record<string, number> = {};
    managedEvents.forEach((e) => { modes[e.mode] = (modes[e.mode] || 0) + 1; });
    const modeData = Object.entries(modes).map(([m, v], i) => ({ name: m, value: v, color: CHART_FILL[i % CHART_FILL.length] }));

    // Recent regs
    const regEventMap: Record<string, string> = {};
    Object.entries(registrationsByEvent).forEach(([eid, regs]) => {
      const ev = managedEvents.find((e) => e.eventId === eid);
      regs.forEach((r) => { regEventMap[r.regId] = ev?.title || "Unknown"; });
    });
    const recentRegs = allRegs.filter((r) => r.registeredAt).sort((a, b) => {
      const ta = typeof a.registeredAt === "object" && (a.registeredAt as any)?._seconds ? (a.registeredAt as any)._seconds : new Date(a.registeredAt!).getTime() / 1000;
      const tb = typeof b.registeredAt === "object" && (b.registeredAt as any)?._seconds ? (b.registeredAt as any)._seconds : new Date(b.registeredAt!).getTime() / 1000;
      return tb - ta;
    }).slice(0, 8);

    const checkInRate = totalRegs > 0 ? Math.round((totalCheckedIn / totalRegs) * 100) : 0;
    const capacityUtil = totalCapacity > 0 ? Math.round((totalRegs / totalCapacity) * 100) : 0;
    const profileRate = users.length > 0 ? Math.round((profileComplete / users.length) * 100) : 0;
    const totalFormResponses = forms.reduce((s: number, f: any) => s + (f.responseCount || 0), 0);
    const activeForms = forms.filter((f: any) => f.isActive).length;

    // Radial data for gauges
    const radialData = [
      { name: "Check-in", value: checkInRate, fill: P.emerald },
      { name: "Capacity", value: Math.min(capacityUtil, 100), fill: P.indigo },
      { name: "Profiles", value: profileRate, fill: P.sky },
    ];

    return {
      managedEvents, users, legacyEvents, gdgTeam, forms,
      totalRegs, totalCheckedIn, totalIndividual, totalTeam,
      upcoming, ongoing, completed, openRegs,
      totalCapacity, profileComplete,
      teamApproved, teamPending, teamRejected, teamRevoked, teamPieData,
      cumulativeTimeline, sparkData, eventBarData,
      eventStatusPie, regTypePie, branchPieData, gradYearData, modeData,
      recentRegs, regEventMap,
      checkInRate, capacityUtil, profileRate,
      totalFormResponses, activeForms, radialData,
    };
  }, [data]);

  if (loading || !stats) {
    return (
      <div className="flex flex-col min-h-0">
        <PageHeader title="Dashboard" />
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-slate-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-slate-300 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-slate-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Loading analytics&hellip;</p>
          </div>
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const totalEvents = stats.managedEvents.length + stats.legacyEvents.length;

  return (
    <div className="flex flex-col min-h-0">
      <PageHeader title="Dashboard" />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

          {/* ═══ HEADER ═══ */}
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">{greeting}</p>
              <h2 className="text-2xl font-bold tracking-tight">Chapter Overview</h2>
            </div>
            <div className="flex items-center gap-2">
              {stats.ongoing.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-white" /></span>
                  <span className="text-xs font-semibold text-white">{stats.ongoing.length} Live</span>
                </div>
              )}
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => router.push("/admin/managed-events")}>
                All Events <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* ═══ METRIC CARDS ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Users */}
            <button onClick={() => router.push("/admin/users")} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card p-5 text-left transition-all hover:shadow-lg hover:shadow-slate-500/10 hover:border-white/20">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-200" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tabular-nums tracking-tight"><Num value={stats.users.length} /></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Community Users</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Spark data={stats.sparkData} color={P.indigo} />
                  <p className="text-[10px] text-muted-foreground tabular-nums">{stats.profileRate}% profiled</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-400/[0.04] to-transparent pointer-events-none" />
            </button>

            {/* Card 2: Events */}
            <button onClick={() => router.push("/admin/managed-events")} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card p-5 text-left transition-all hover:shadow-lg hover:shadow-slate-500/10 hover:border-white/20">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-slate-200" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tabular-nums tracking-tight"><Num value={totalEvents} /></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Total Events</p>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-[11px] tabular-nums text-muted-foreground">{stats.managedEvents.length} managed</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span className="text-[11px] tabular-nums text-muted-foreground">{stats.legacyEvents.length} legacy</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="text-[11px] tabular-nums text-muted-foreground">{stats.openRegs.length} open</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-400/[0.04] to-transparent pointer-events-none" />
            </button>

            {/* Card 3: Registrations */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card p-5 text-left">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-slate-200" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tabular-nums tracking-tight"><Num value={stats.totalRegs} /></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Total Registrations</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-[11px] tabular-nums text-muted-foreground">{stats.totalIndividual} solo</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-[11px] tabular-nums text-muted-foreground">{stats.totalTeam} team</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  </div>
                  <div className="h-px w-12 bg-border ml-auto" />
                  <div className="flex items-center gap-1 justify-end">
                    <CheckCircle className="w-3 h-3 text-slate-300" />
                    <span className="text-[11px] font-semibold text-slate-300 tabular-nums">{stats.checkInRate}% checked in</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-400/[0.04] to-transparent pointer-events-none" />
            </div>

            {/* Card 4: Team */}
            <button onClick={() => router.push("/admin/gdg-team")} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card p-5 text-left transition-all hover:shadow-lg hover:shadow-slate-500/10 hover:border-white/20">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-slate-200" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tabular-nums tracking-tight"><Num value={stats.gdgTeam.length} /></p>
                    <p className="text-xs text-muted-foreground mt-0.5">GDG Team</p>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.08]">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-semibold text-slate-300 tabular-nums">{stats.teamApproved}</span>
                  </div>
                  {stats.teamPending > 0 && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05]">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span className="text-[10px] font-semibold text-slate-400 tabular-nums">{stats.teamPending} pending</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-400/[0.04] to-transparent pointer-events-none" />
            </button>
          </div>

          {/* ═══ ROW 2: Timeline + Radial Gauges ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
            {/* Timeline */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Registration Activity</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Daily inflow &amp; cumulative growth</p>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-[3px] rounded-full" style={{ background: P.indigo }} />Daily</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-[3px] rounded-full" style={{ background: P.sky }} />Cumulative</span>
                </div>
              </div>
              <div className="p-5">
                {stats.cumulativeTimeline.length === 0 ? (
                  <div className="h-[240px] flex flex-col items-center justify-center gap-2 text-muted-foreground/30">
                    <Activity className="w-8 h-8" />
                    <p className="text-sm">No registration data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={stats.cumulativeTimeline} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gPrimary" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={P.indigo} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={P.indigo} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gSecondary" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={P.sky} stopOpacity={0.12} />
                          <stop offset="100%" stopColor={P.sky} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<TT />} />
                      <Area type="monotone" dataKey="count" name="Daily" stroke={P.indigo} fill="url(#gPrimary)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: P.indigo }} />
                      <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke={P.sky} fill="url(#gSecondary)" strokeWidth={2} strokeDasharray="6 3" dot={false} activeDot={{ r: 3, strokeWidth: 0, fill: P.sky }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Radial Gauges */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold">Health Score</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Key performance indicators</p>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={160}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={stats.radialData} startAngle={180} endAngle={0} barSize={12}>
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "hsl(var(--muted))" }} />
                    <Tooltip content={<PTT />} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { label: "Check-in", val: `${stats.checkInRate}%`, sub: `${stats.totalCheckedIn}/${stats.totalRegs}`, color: P.emerald },
                    { label: "Capacity", val: `${stats.capacityUtil}%`, sub: `${stats.totalRegs}/${stats.totalCapacity || "\u221E"}`, color: P.indigo },
                    { label: "Profiles", val: `${stats.profileRate}%`, sub: `${stats.profileComplete}/${stats.users.length}`, color: P.sky },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                        <span className="text-[10px] text-muted-foreground">{m.label}</span>
                      </div>
                      <p className="text-lg font-bold tabular-nums">{m.val}</p>
                      <p className="text-[10px] text-muted-foreground tabular-nums">{m.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ ROW 3: Bar Chart + Event Pipeline + Reg Type ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px_250px] gap-4">
            {/* Bar chart */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Registrations by Event</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Top events by signups</p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => router.push("/admin/managed-events")}>
                  View All <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </div>
              <div className="p-5">
                {stats.eventBarData.length === 0 ? (
                  <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-muted-foreground/30">
                    <BarChart3 className="w-8 h-8" />
                    <p className="text-sm">No events yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.eventBarData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barGap={3}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<TT />} />
                      <Bar dataKey="registrations" name="Registered" fill={P.indigo} radius={[4, 4, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="checkedIn" name="Checked In" fill={P.sky} radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Event pipeline */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold">Event Pipeline</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Status breakdown</p>
              </div>
              <div className="p-4 flex flex-col items-center">
                {stats.eventStatusPie.length === 0 ? (
                  <div className="h-[160px] flex items-center justify-center text-muted-foreground/30 text-sm">No events</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={stats.eventStatusPie} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={4} dataKey="value" strokeWidth={0}>
                          {stats.eventStatusPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<PTT />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-full space-y-2 mt-2">
                      {stats.eventStatusPie.map((d) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="text-[11px] text-muted-foreground flex-1">{d.name}</span>
                          <span className="text-xs font-bold tabular-nums">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Reg type */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold">Registration Split</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Individual vs Team</p>
              </div>
              <div className="p-4 flex flex-col items-center">
                {stats.regTypePie.length === 0 ? (
                  <div className="h-[160px] flex items-center justify-center text-muted-foreground/30 text-sm">No registrations</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={stats.regTypePie} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={5} dataKey="value" strokeWidth={0}>
                          {stats.regTypePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<PTT />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-full space-y-2 mt-2">
                      {stats.regTypePie.map((d) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="text-[11px] text-muted-foreground flex-1">{d.name}</span>
                          <span className="text-xs font-bold tabular-nums">{d.value}</span>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            ({stats.totalRegs > 0 ? Math.round((d.value / stats.totalRegs) * 100) : 0}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ═══ ROW 4: Branch + GDG Team + Grad Year ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Branch */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold">Users by Branch</h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => router.push("/admin/users")}>
                  View <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </div>
              <div className="p-4">
                {stats.branchPieData.length === 0 ? (
                  <div className="h-[170px] flex items-center justify-center text-muted-foreground/30 text-sm">No data</div>
                ) : (
                  <div className="flex items-start gap-3">
                    <ResponsiveContainer width="50%" height={170}>
                      <PieChart>
                        <Pie data={stats.branchPieData} cx="50%" cy="50%" innerRadius={28} outerRadius={60} paddingAngle={2} dataKey="value" strokeWidth={0}>
                          {stats.branchPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<PTT />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5 pt-1">
                      {stats.branchPieData.map((d) => (
                        <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.color }} />
                          <span className="text-muted-foreground truncate flex-1">{d.name}</span>
                          <span className="font-semibold tabular-nums">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GDG Team */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold">Team Composition</h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => router.push("/admin/gdg-team")}>
                  Manage <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </div>
              <div className="p-4">
                {stats.teamPieData.length === 0 ? (
                  <div className="h-[170px] flex items-center justify-center text-muted-foreground/30 text-sm">No team members</div>
                ) : (
                  <div className="flex items-start gap-3">
                    <ResponsiveContainer width="50%" height={170}>
                      <PieChart>
                        <Pie data={stats.teamPieData} cx="50%" cy="50%" innerRadius={28} outerRadius={60} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {stats.teamPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<PTT />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2 pt-1">
                      {[
                        { l: "Approved", c: stats.teamApproved, cl: P.emerald },
                        { l: "Pending", c: stats.teamPending, cl: P.sky },
                        { l: "Rejected", c: stats.teamRejected, cl: P.rose },
                        { l: "Revoked", c: stats.teamRevoked, cl: P.slate },
                      ].map(({ l, c, cl }) => (
                        <div key={l} className="flex items-center gap-2 text-[11px]">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cl }} />
                          <span className="text-muted-foreground flex-1">{l}</span>
                          <span className="font-semibold tabular-nums">{c}</span>
                        </div>
                      ))}
                      <div className="h-px bg-border" />
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold tabular-nums">{stats.gdgTeam.length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Graduation Year */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold">Batch Distribution</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Users by graduation year</p>
              </div>
              <div className="p-4">
                {stats.gradYearData.length === 0 ? (
                  <div className="h-[170px] flex items-center justify-center text-muted-foreground/30 text-sm">No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={stats.gradYearData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<TT />} />
                      <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]} maxBarSize={28}>
                        {stats.gradYearData.map((_, i) => <Cell key={i} fill={CHART_FILL[i % CHART_FILL.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* ═══ ROW 5: Quick Stats Strip ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "Active Forms", value: stats.activeForms, icon: Eye, color: P.indigo },
              { label: "Form Responses", value: stats.totalFormResponses, icon: Activity, color: P.sky },
              { label: "Checked In", value: stats.totalCheckedIn, icon: CheckCircle, color: P.emerald },
              { label: "Open Regs", value: stats.openRegs.length, icon: TrendingUp, color: P.amber },
              { label: "Upcoming", value: stats.upcoming.length, icon: CalendarCheck, color: P.indigo },
              { label: "Completed", value: stats.completed.length, icon: Sparkles, color: P.teal },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold tabular-nums leading-none">{value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ═══ ROW 6: Recent Registrations ═══ */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Recent Registrations</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Latest signups across events</p>
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground px-2.5 py-1 rounded-full bg-muted font-medium">
                {stats.totalRegs} total
              </span>
            </div>
            {stats.recentRegs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground/30">
                <UserPlus className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No registrations yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Participant", "Event", "Type", "Status"].map((h) => (
                        <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.recentRegs.map((reg, i) => (
                      <tr key={reg.regId || i} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-[11px] font-bold text-foreground/70 shrink-0 border border-white/[0.08]">
                              {reg.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{reg.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{reg.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{stats.regEventMap[reg.regId] || "\u2014"}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            reg.registrationType === "Team" ? "bg-slate-400/10 text-slate-300" : "bg-slate-500/10 text-slate-400"
                          }`}>{reg.registrationType}</span>
                        </td>
                        <td className="px-5 py-3">
                          {reg.isCheckedIn ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-200">
                              <CheckCircle className="w-3.5 h-3.5" /> Checked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" /> Registered
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ═══ LIVE EVENTS ═══ */}
          {stats.ongoing.length > 0 && (
            <div className="rounded-2xl border-2 border-white/15 bg-gradient-to-br from-white/[0.03] to-white/[0.01] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </div>
                <h3 className="text-sm font-bold text-white">Happening Now</h3>
                <span className="text-[11px] text-slate-400 tabular-nums">{stats.ongoing.length} event{stats.ongoing.length > 1 ? "s" : ""}</span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.ongoing.map((ev) => {
                  const evRegs = data?.registrationsByEvent[ev.eventId] || [];
                  const regs = evRegs.length;
                  const checkedIn = evRegs.filter((r: any) => r.isCheckedIn).length;
                  const pct = ev.maxParticipants > 0 ? Math.round((regs / ev.maxParticipants) * 100) : 0;
                  return (
                    <button key={ev.eventId} onClick={() => router.push(`/admin/managed-events/${ev.eventId}`)}
                      className="rounded-xl border border-slate-500/20 text-left hover:shadow-lg hover:shadow-slate-400/10 transition-all bg-card overflow-hidden group">
                      {ev.bannerImage ? (
                        <div className="w-full h-28 overflow-hidden relative">
                          <img src={ev.bannerImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-black flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />LIVE
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-28 bg-gradient-to-br from-slate-500/10 to-slate-600/5 flex items-center justify-center relative">
                          <Zap className="w-8 h-8 text-slate-400/20" />
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-black flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />LIVE
                          </span>
                        </div>
                      )}
                      <div className="p-4 space-y-3">
                        <p className="text-sm font-semibold truncate">{ev.title}</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">Attendance</span>
                            <span className="font-semibold tabular-nums">{checkedIn}<span className="text-muted-foreground font-normal">/{regs}</span></span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-slate-300 to-slate-200 transition-all duration-700" style={{ width: `${ev.maxParticipants > 0 ? pct : regs > 0 ? 100 : 0}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.venue || ev.mode}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ UPCOMING EVENTS ═══ */}
          {stats.upcoming.length > 0 && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Upcoming Events</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stats.upcoming.length} scheduled</p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => router.push("/admin/managed-events")}>
                  All Events <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.upcoming.slice(0, 6).map((ev) => {
                  const regs = data?.registrationsByEvent[ev.eventId]?.length || 0;
                  const pct = ev.maxParticipants > 0 ? Math.round((regs / ev.maxParticipants) * 100) : 0;
                  return (
                    <button key={ev.eventId} onClick={() => router.push(`/admin/managed-events/${ev.eventId}`)}
                      className="rounded-xl border border-border text-left hover:shadow-lg hover:shadow-slate-400/10 hover:border-slate-400/25 transition-all bg-card overflow-hidden group hover:-translate-y-0.5 duration-200">
                      {ev.bannerImage ? (
                        <div className="w-full h-28 overflow-hidden relative">
                          <img src={ev.bannerImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>
                      ) : (
                        <div className="w-full h-28 bg-gradient-to-br from-slate-500/8 to-slate-600/5 flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-muted-foreground/10" />
                        </div>
                      )}
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-sm font-semibold truncate">{ev.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ev.startDate ? new Date(ev.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBD"}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">Registrations</span>
                            <span className="font-semibold tabular-nums">{regs}{ev.maxParticipants > 0 && <span className="text-muted-foreground font-normal">/{ev.maxParticipants}</span>}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-slate-300 to-slate-200 transition-all duration-700" style={{ width: `${ev.maxParticipants > 0 ? pct : regs > 0 ? 100 : 0}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Globe className="w-3 h-3" />{ev.mode} &middot; {ev.eventType}
                          </span>
                          {ev.isRegistrationOpen && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-white border border-white/20">OPEN</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
