"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  ShieldX,
  Search,
  Loader2,
  Trash2,
  Pencil,
  Check,
  X,
  Clock,
  Mail,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import GoogleLoader from "@/components/GoogleLoader";
import type {
  GDGTeamMember,
  AccessLevel,
  AuthorizationStatus,
} from "@/lib/types/gdg-team";

/* ─── Status badge configuration ─── */

const STATUS_CONFIG: Record<
  AuthorizationStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  approved: { label: "Approved", variant: "default", icon: Check },
  rejected: { label: "Rejected", variant: "destructive", icon: X },
  revoked: { label: "Revoked", variant: "destructive", icon: ShieldX },
};

const ACCESS_CONFIG: Record<AccessLevel, { label: string; icon: React.ElementType }> = {
  admin: { label: "Admin", icon: ShieldCheck },
  member: { label: "Member", icon: Shield },
};

/* ─── Helper to format dates ─── */

function formatDate(d: string | null): string {
  if (!d) return "—";
  try {
    if (typeof d === "object" && (d as any)?._seconds) {
      return new Date((d as any)._seconds * 1000).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/* ─── Main Page Component ─── */

export default function GDGTeamPage() {
  const [members, setMembers] = useState<GDGTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | AuthorizationStatus>("all");
  const [filterAccess, setFilterAccess] = useState<"all" | AccessLevel>("all");
  const [activeTab, setActiveTab] = useState<"members" | "requests" | "rejected">("members");
  const [currentUserUid, setCurrentUserUid] = useState("");

  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GDGTeamMember | null>(null);
  const [detailMember, setDetailMember] = useState<GDGTeamMember | null>(null);

  // Form states
  const [approveForm, setApproveForm] = useState({ position: "", designation: "", accessLevel: "member" as AccessLevel });
  const [editForm, setEditForm] = useState({ name: "", email: "", position: "", designation: "", accessLevel: "member" as AccessLevel, profilePicture: "" });
  const [revokeReason, setRevokeReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [addForm, setAddForm] = useState({ name: "", email: "", position: "", designation: "", accessLevel: "member" as AccessLevel, profilePicture: "" });

  // Action loading states
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  /* ─── Fetch ─── */

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/gdg-team");
      const json = await res.json();
      if (Array.isArray(json)) {
        setMembers(json);
        setError(null);
      } else if (json.error) {
        setError(json.error);
      }
    } catch {
      setError("Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user?.id) setCurrentUserUid(d.user.id);
      })
      .catch(() => {});
  }, [fetchMembers]);

  /* ─── Actions ─── */

  async function handleApprove() {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/gdg-team/${selectedMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorizationStatus: "approved",
          position: approveForm.position,
          designation: approveForm.designation,
          accessLevel: approveForm.accessLevel,
          approvedAt: new Date().toISOString(),
          approvedBy: currentUserUid,
        }),
      });
      if (res.ok) {
        setApproveDialogOpen(false);
        setSelectedMember(null);
        fetchMembers();
      }
    } catch {
      console.error("Approve failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/gdg-team/${selectedMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorizationStatus: "rejected",
          rejectedAt: new Date().toISOString(),
          rejectedBy: currentUserUid,
          rejectedReason: rejectReason || null,
        }),
      });
      if (res.ok) {
        setRejectDialogOpen(false);
        setSelectedMember(null);
        setRejectReason("");
        fetchMembers();
      }
    } catch {
      console.error("Reject failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRevoke() {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/gdg-team/${selectedMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorizationStatus: "revoked",
          revokedAt: new Date().toISOString(),
          revokedBy: currentUserUid,
          revokedReason: revokeReason || null,
        }),
      });
      if (res.ok) {
        setRevokeDialogOpen(false);
        setSelectedMember(null);
        setRevokeReason("");
        fetchMembers();
      }
    } catch {
      console.error("Revoke failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEdit() {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/gdg-team/${selectedMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          position: editForm.position,
          designation: editForm.designation,
          accessLevel: editForm.accessLevel,
          profilePicture: editForm.profilePicture,
        }),
      });
      if (res.ok) {
        setEditDialogOpen(false);
        setSelectedMember(null);
        fetchMembers();
      }
    } catch {
      console.error("Edit failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAdd() {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/gdg-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addForm,
          approvedBy: currentUserUid,
        }),
      });
      if (res.ok) {
        setAddDialogOpen(false);
        setAddForm({ name: "", email: "", position: "", designation: "", accessLevel: "member", profilePicture: "" });
        fetchMembers();
      }
    } catch {
      console.error("Add failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/gdg-team/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        setConfirmDeleteId(null);
      }
    } catch {
      console.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  /* ─── Derived data ─── */

  const pendingMembers = members.filter((m) => m.authorizationStatus === "pending");
  const rejectedMembers = members.filter((m) => m.authorizationStatus === "rejected");
  const teamMembers = members.filter((m) => m.authorizationStatus === "approved" || m.authorizationStatus === "revoked");

  const displayMembers = activeTab === "requests" ? pendingMembers : activeTab === "rejected" ? rejectedMembers : teamMembers;

  const filteredMembers = displayMembers.filter((m) => {
    const matchSearch =
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = activeTab !== "members" || filterStatus === "all" || m.authorizationStatus === filterStatus;
    const matchAccess = filterAccess === "all" || m.accessLevel === filterAccess;
    return matchSearch && matchStatus && matchAccess;
  });

  const stats = [
    { title: "Total Members", value: members.length, icon: Users },
    { title: "Approved", value: members.filter((m) => m.authorizationStatus === "approved").length, icon: UserCheck },
    { title: "Pending", value: pendingMembers.length, icon: Clock },
    { title: "Rejected", value: members.filter((m) => m.authorizationStatus === "rejected").length, icon: X },
    { title: "Revoked", value: members.filter((m) => m.authorizationStatus === "revoked").length, icon: UserX },
  ];

  /* ─── Dialog openers ─── */

  function openApproveDialog(member: GDGTeamMember) {
    setSelectedMember(member);
    setApproveForm({ position: member.position || "", designation: member.designation || "", accessLevel: member.accessLevel || "member" });
    setApproveDialogOpen(true);
  }

  function openEditDialog(member: GDGTeamMember) {
    setSelectedMember(member);
    setEditForm({
      name: member.name || "",
      email: member.email || "",
      position: member.position || "",
      designation: member.designation || "",
      accessLevel: member.accessLevel || "member",
      profilePicture: member.profilePicture || "",
    });
    setEditDialogOpen(true);
  }

  function openRevokeDialog(member: GDGTeamMember) {
    setSelectedMember(member);
    setRevokeReason("");
    setRevokeDialogOpen(true);
  }

  function openRejectDialog(member: GDGTeamMember) {
    setSelectedMember(member);
    setRejectReason("");
    setRejectDialogOpen(true);
  }

  /* ─── Render ─── */

  return (
    <div className="flex flex-col">
      <PageHeader title="GDG Team Management" />

      <div className="flex-1 space-y-6 p-6">
        {/* Title bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
            <p className="text-muted-foreground">
              Manage GDG chapter team members, approve login requests, and assign roles.
            </p>
          </div>
          <Button onClick={() => { setAddForm({ name: "", email: "", position: "", designation: "", accessLevel: "member", profilePicture: "" }); setAddDialogOpen(true); }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
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

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted/50 w-fit">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "members"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Team Members
            <Badge variant="secondary" className="ml-1 text-xs">
              {teamMembers.length}
            </Badge>
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "requests"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-4 w-4" />
            Pending Requests
            {pendingMembers.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs animate-pulse">
                {pendingMembers.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "rejected"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <X className="h-4 w-4" />
            Rejected
            {rejectedMembers.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {rejectedMembers.length}
              </Badge>
            )}
          </button>
        </div>

        {/* Filters (only for Team Members tab) */}
        {activeTab === "members" && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, position, or designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAccess} onValueChange={(v) => setFilterAccess(v as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Access Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Search for requests/rejected tab */}
        {(activeTab === "requests" || activeTab === "rejected") && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "requests" ? "Search pending requests..." : "Search rejected requests..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            <GoogleLoader message="Loading team members..." />
          ) : error ? (
            <Card className="flex items-center justify-center p-12 bg-muted/20 border-dashed">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-medium text-muted-foreground">{error}</p>
              </div>
            </Card>
          ) : filteredMembers.length === 0 ? (
            <Card className="flex items-center justify-center p-12 bg-muted/20 border-dashed">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-xl font-medium text-muted-foreground">
                  {activeTab === "requests" ? "No pending requests" : activeTab === "rejected" ? "No rejected requests" : "No team members found"}
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  {activeTab === "requests"
                    ? "All login requests have been handled."
                    : activeTab === "rejected"
                      ? "No requests have been rejected yet."
                      : searchQuery || filterStatus !== "all" || filterAccess !== "all"
                        ? "Try adjusting your filters."
                        : "Add your first team member to get started."}
                </p>
              </div>
            </Card>
          ) : activeTab === "requests" ? (
            /* ─── Pending Requests Cards ─── */
            <div className="grid gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer" onClick={() => setDetailMember(member)}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture}
                            alt={member.name}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-500/30"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center ring-2 ring-amber-500/30">
                            <span className="text-lg font-bold text-amber-600">
                              {member.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                          <Clock className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground truncate">{member.name}</h3>
                          <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                            Pending Approval
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Requested on {formatDate(member.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openApproveDialog(member)}
                          className="border-green-600/50 text-green-600 hover:bg-green-600/10 hover:text-green-600 hover:border-green-600 dark:border-green-500/50 dark:text-green-500 dark:hover:bg-green-500/10 dark:hover:text-green-500 dark:hover:border-green-500"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRejectDialog(member)}
                          disabled={actionLoading}
                          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeTab === "rejected" ? (
            /* ─── Rejected Requests Cards ─── */
            <div className="grid gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden transition-all duration-200 hover:shadow-md border-destructive/20 cursor-pointer" onClick={() => setDetailMember(member)}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture}
                            alt={member.name}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-red-500/30 opacity-75"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center ring-2 ring-red-500/30">
                            <span className="text-lg font-bold text-red-600">
                              {member.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground truncate">{member.name}</h3>
                          <Badge variant="destructive" className="text-xs">
                            Rejected
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        {member.rejectedReason && (
                          <p className="text-xs text-destructive/80 mb-1">
                            <span className="font-medium">Reason:</span> {member.rejectedReason}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Requested on {formatDate(member.createdAt)}</span>
                          <span>•</span>
                          <span>Rejected on {formatDate(member.rejectedAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openApproveDialog(member)}
                          className="border-green-600/50 text-green-600 hover:bg-green-600/10 hover:text-green-600 hover:border-green-600 dark:border-green-500/50 dark:text-green-500 dark:hover:bg-green-500/10 dark:hover:text-green-500 dark:hover:border-green-500"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Re-approve
                        </Button>
                        {confirmDeleteId === member.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(member.id)}
                              disabled={deletingId === member.id}
                            >
                              {deletingId === member.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Delete"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmDeleteId(member.id)}
                            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* ─── Team Members Table ─── */
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Member</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Position</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Designation</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Access</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Joined</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMembers.map((member) => {
                      const statusCfg = STATUS_CONFIG[member.authorizationStatus] || STATUS_CONFIG.pending;
                      const accessCfg = ACCESS_CONFIG[member.accessLevel] || ACCESS_CONFIG.member;
                      const StatusIcon = statusCfg.icon;
                      const AccessIcon = accessCfg.icon;

                      return (
                        <tr key={member.id} className="group hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setDetailMember(member)}>
                          {/* Member info */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {member.profilePicture ? (
                                <img src={member.profilePicture} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">
                                    {member.name?.charAt(0)?.toUpperCase() || "?"}
                                  </span>
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Position */}
                          <td className="px-5 py-4">
                            <span className="text-sm text-foreground">{member.position || "—"}</span>
                          </td>

                          {/* Designation */}
                          <td className="px-5 py-4">
                            <span className="text-sm text-foreground">{member.designation || "—"}</span>
                          </td>

                          {/* Access Level */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <AccessIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm capitalize">{member.accessLevel}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <div>
                              <Badge variant={statusCfg.variant} className="text-xs gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusCfg.label}
                              </Badge>
                              {member.authorizationStatus === "revoked" && member.revokedReason && (
                                <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={member.revokedReason}>
                                  Reason: {member.revokedReason}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Joined */}
                          <td className="px-5 py-4">
                            <div>
                              <span className="text-xs text-muted-foreground">
                                {member.authorizationStatus === "revoked"
                                  ? `Revoked ${formatDate(member.revokedAt)}`
                                  : formatDate(member.approvedAt || member.createdAt)}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditDialog(member)}
                                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              {member.authorizationStatus === "approved" && (
                                <button
                                  onClick={() => openRevokeDialog(member)}
                                  className="p-2 rounded-md text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
                                  title="Revoke access"
                                >
                                  <ShieldX className="w-4 h-4" />
                                </button>
                              )}

                              {member.authorizationStatus === "revoked" && (
                                <button
                                  onClick={() => openApproveDialog(member)}
                                  className="p-2 rounded-md text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
                                  title="Re-approve"
                                >
                                  <BadgeCheck className="w-4 h-4" />
                                </button>
                              )}

                              {confirmDeleteId === member.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(member.id)}
                                    disabled={deletingId === member.id}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                                  >
                                    {deletingId === member.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      "Delete"
                                    )}
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(member.id)}
                                  className="p-2 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ─── Approve Dialog ─── */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Approve Team Member
            </DialogTitle>
            <DialogDescription>
              Assign a position and designation before approving <strong>{selectedMember?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Position *</Label>
              <Input
                placeholder="e.g. Lead Organizer, Core Team, Volunteer"
                value={approveForm.position}
                onChange={(e) => setApproveForm({ ...approveForm, position: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input
                placeholder="e.g. Google Developer Expert, Tech Lead"
                value={approveForm.designation}
                onChange={(e) => setApproveForm({ ...approveForm, designation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select
                value={approveForm.accessLevel}
                onValueChange={(v) => setApproveForm({ ...approveForm, accessLevel: v as AccessLevel })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={actionLoading || !approveForm.position}
                variant="outline"
                className="border-green-600/50 text-green-600 hover:bg-green-600/10 hover:border-green-600 dark:border-green-500/50 dark:text-green-500 dark:hover:bg-green-500/10 dark:hover:border-green-500"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Revoke Dialog ─── */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldX className="h-5 w-5 text-red-600" />
              Revoke Access
            </DialogTitle>
            <DialogDescription>
              Revoke access for <strong>{selectedMember?.name}</strong>. This will prevent them from accessing the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Provide a reason for revoking access..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                rows={3}
              />
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRevoke}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldX className="h-4 w-4 mr-2" />}
                Revoke Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Reject Dialog ─── */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              Reject Request
            </DialogTitle>
            <DialogDescription>
              Reject the join request from <strong>{selectedMember?.name}</strong>. Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Rejection Reason *</Label>
              <Textarea
                placeholder="Provide a reason for rejecting this request..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Dialog ─── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Team Member
            </DialogTitle>
            <DialogDescription>
              Update details for <strong>{selectedMember?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  placeholder="e.g. Lead Organizer"
                  value={editForm.position}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input
                  placeholder="e.g. Google Developer Expert"
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Profile Picture URL</Label>
              <Input
                placeholder="https://..."
                value={editForm.profilePicture}
                onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select
                value={editForm.accessLevel}
                onValueChange={(v) => setEditForm({ ...editForm, accessLevel: v as AccessLevel })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={actionLoading || !editForm.name || !editForm.email}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Add Member Dialog ─── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add Team Member
            </DialogTitle>
            <DialogDescription>
              Manually add a new GDG team member. They will be auto-approved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="Full name"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  placeholder="e.g. Lead Organizer"
                  value={addForm.position}
                  onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input
                  placeholder="e.g. Google Developer Expert"
                  value={addForm.designation}
                  onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Profile Picture URL</Label>
              <Input
                placeholder="https://..."
                value={addForm.profilePicture}
                onChange={(e) => setAddForm({ ...addForm, profilePicture: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select
                value={addForm.accessLevel}
                onValueChange={(v) => setAddForm({ ...addForm, accessLevel: v as AccessLevel })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={actionLoading || !addForm.name || !addForm.email}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Member Detail Dialog ─── */}
      <Dialog open={!!detailMember} onOpenChange={(open) => { if (!open) setDetailMember(null); }}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Member Details</DialogTitle>
          {detailMember && (() => {
            const statusCfg = STATUS_CONFIG[detailMember.authorizationStatus] || STATUS_CONFIG.pending;
            const accessCfg = ACCESS_CONFIG[detailMember.accessLevel] || ACCESS_CONFIG.member;
            const StatusIcon = statusCfg.icon;
            const AccessIcon = accessCfg.icon;
            return (
              <>
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center gap-4">
                    {detailMember.profilePicture ? (
                      <img src={detailMember.profilePicture} alt={detailMember.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-2 ring-primary/20">
                        <span className="text-2xl font-bold text-primary">
                          {detailMember.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold truncate">{detailMember.name}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{detailMember.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={statusCfg.variant} className="text-xs gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs gap-1">
                          <AccessIcon className="h-3 w-3" />
                          {accessCfg.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="px-6 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Position</p>
                      <p className="text-sm font-medium">{detailMember.position || "\u2013"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Designation</p>
                      <p className="text-sm font-medium">{detailMember.designation || "\u2013"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Requested On</p>
                      <p className="text-sm font-medium">{formatDate(detailMember.createdAt)}</p>
                    </div>
                    {detailMember.authorizationStatus === "approved" && (
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Approved At</p>
                        <p className="text-sm font-medium">{formatDate(detailMember.approvedAt)}</p>
                      </div>
                    )}
                    {detailMember.authorizationStatus === "rejected" && (
                      <>
                        <div className="rounded-lg border border-border bg-muted/30 p-3">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Rejected At</p>
                          <p className="text-sm font-medium">{formatDate(detailMember.rejectedAt)}</p>
                        </div>
                        {detailMember.rejectedReason && (
                          <div className="col-span-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                            <p className="text-[10px] font-medium text-destructive uppercase tracking-wider mb-1">Rejection Reason</p>
                            <p className="text-sm">{detailMember.rejectedReason}</p>
                          </div>
                        )}
                      </>
                    )}
                    {detailMember.authorizationStatus === "revoked" && (
                      <>
                        <div className="rounded-lg border border-border bg-muted/30 p-3">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Revoked At</p>
                          <p className="text-sm font-medium">{formatDate(detailMember.revokedAt)}</p>
                        </div>
                        {detailMember.revokedReason && (
                          <div className="col-span-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                            <p className="text-[10px] font-medium text-destructive uppercase tracking-wider mb-1">Revoke Reason</p>
                            <p className="text-sm">{detailMember.revokedReason}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">User ID</p>
                    <p className="text-xs font-mono text-muted-foreground break-all">{detailMember.userId}</p>
                  </div>
                  {detailMember.updatedAt && (
                    <p className="text-xs text-muted-foreground text-right">Last updated: {formatDate(detailMember.updatedAt)}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        const m = detailMember;
                        setDetailMember(null);
                        openEditDialog(m);
                      }}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                    {detailMember.authorizationStatus === "approved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-amber-600/50 text-amber-600 hover:bg-amber-600/10 hover:border-amber-600"
                        onClick={() => {
                          const m = detailMember;
                          setDetailMember(null);
                          openRevokeDialog(m);
                        }}
                      >
                        <ShieldX className="mr-1.5 h-3.5 w-3.5" /> Revoke
                      </Button>
                    )}
                    {(detailMember.authorizationStatus === "rejected" || detailMember.authorizationStatus === "revoked" || detailMember.authorizationStatus === "pending") && (
                      <Button
                        size="sm"
                        className="h-8 text-xs border-green-600/50 text-green-600 hover:bg-green-600/10 hover:border-green-600 dark:border-green-500/50 dark:text-green-500"
                        variant="outline"
                        onClick={() => {
                          const m = detailMember;
                          setDetailMember(null);
                          openApproveDialog(m);
                        }}
                      >
                        <Check className="mr-1.5 h-3.5 w-3.5" /> {detailMember.authorizationStatus === "pending" ? "Approve" : "Re-approve"}
                      </Button>
                    )}
                    {detailMember.authorizationStatus === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
                        onClick={() => {
                          const m = detailMember;
                          setDetailMember(null);
                          openRejectDialog(m);
                        }}
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" /> Reject
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      const id = detailMember.id;
                      setDetailMember(null);
                      setConfirmDeleteId(id);
                    }}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
