"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  UserCheck,
  UserX,
  GraduationCap,
  Search,
  ShieldBan,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import GoogleLoader from "@/components/GoogleLoader";

interface SocialMedia {
  linkedin?: string;
  github?: string;
  twitter?: string;
}

interface ClientUser {
  id: string;
  name: string;
  email: string;
  profileUrl: string;
  resumeUrl: string;
  phoneNumber: string;
  branch: string;
  graduationYear: number | null;
  role: string;
  isBlocked: boolean;
  profileCompleted: boolean;
  participations: string[];
  socialMedia: SocialMedia;
  createdAt: string | null;
  updatedAt: string | null;
}

export default function ClientUsersPage() {
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "blocked">("all");
  const [filterBranch, setFilterBranch] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<ClientUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (Array.isArray(json)) {
        setUsers(json);
      } else if (json.error) {
        setError(json.error);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Network error fetching users");
    } finally {
      setLoading(false);
    }
  }

  async function toggleBlock(user: ClientUser) {
    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !user.isBlocked }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to toggle block:", err);
    } finally {
      setActionLoading(null);
    }
  }


  const branches = [...new Set(users.map((u) => u.branch).filter(Boolean))].sort();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber.includes(searchQuery) ||
      user.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && !user.isBlocked) ||
      (filterStatus === "blocked" && user.isBlocked);
    const matchesBranch =
      filterBranch === "all" || user.branch === filterBranch;
    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * rowsPerPage,
    safeCurrentPage * rowsPerPage,
  );
  const startIndex = (safeCurrentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(safeCurrentPage * rowsPerPage, filteredUsers.length);

  const stats = [
    {
      title: "Total Users",
      value: String(users.length),
      description: "Registered users",
      icon: Users,
    },
    {
      title: "Active",
      value: String(users.filter((u) => !u.isBlocked).length),
      description: "Not blocked",
      icon: UserCheck,
    },
    {
      title: "Blocked",
      value: String(users.filter((u) => u.isBlocked).length),
      description: "Restricted access",
      icon: UserX,
    },
    {
      title: "Branches",
      value: String(branches.length),
      description: "Unique departments",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Users" />

      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            View and manage registered community users.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or branch..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v: any) => { setFilterStatus(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterBranch} onValueChange={(v) => { setFilterBranch(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User Table */}
        {loading ? (
          <GoogleLoader message="Loading users..." />
        ) : error ? (
          <Card className="flex items-center justify-center p-12 bg-muted/20 border-dashed">
            <div className="text-center">
              <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-medium text-muted-foreground">{error}</p>
            </div>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card className="flex items-center justify-center p-12 bg-muted/20 border-dashed">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium text-muted-foreground">No users found.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {searchQuery || filterStatus !== "all" || filterBranch !== "all"
                  ? "Try adjusting your filters."
                  : "No users have registered yet."}
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden md:table-cell">Branch</TableHead>
                    <TableHead className="hidden md:table-cell">Year</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Profile</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="group cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.profileUrl ? (
                            <img
                              src={user.profileUrl}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover border"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-sm font-semibold text-muted-foreground">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-[200px]">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="font-mono text-xs">
                          {user.branch || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {user.graduationYear || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {user.phoneNumber || "—"}
                      </TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <Badge variant="destructive" className="text-xs">
                            Blocked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {user.profileCompleted ? (
                          <Badge variant="outline" className="text-xs">
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Incomplete
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleBlock(user)}
                            disabled={actionLoading === user.id}
                            title={user.isBlocked ? "Unblock user" : "Block user"}
                          >
                            {user.isBlocked ? (
                              <ShieldCheck className="h-4 w-4" />
                            ) : (
                              <ShieldBan className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-3 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page</span>
                <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 50, 100].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-muted-foreground">
                  {filteredUsers.length === 0 ? "0 results" : `${startIndex}–${endIndex} of ${filteredUsers.length}`}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(1)}
                    disabled={safeCurrentPage <= 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[80px] text-center">
                    Page {safeCurrentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={safeCurrentPage >= totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">
                  {selectedUser.name} — Profile
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Full profile details for {selectedUser.name}
                </DialogDescription>
              </DialogHeader>

              {/* Profile Header */}
              <div className="flex flex-col items-center text-center pb-4 border-b">
                {selectedUser.profileUrl ? (
                  <img
                    src={selectedUser.profileUrl}
                    alt={selectedUser.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-muted mb-3"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {selectedUser.name.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  {selectedUser.isBlocked ? (
                    <Badge variant="destructive">Blocked</Badge>
                  ) : (
                    <Badge variant="outline">Active</Badge>
                  )}
                  {selectedUser.profileCompleted ? (
                    <Badge variant="outline">Profile Complete</Badge>
                  ) : (
                    <Badge variant="outline">Profile Incomplete</Badge>
                  )}
                  <Badge variant="outline" className="capitalize">
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <DetailItem label="Phone Number" value={selectedUser.phoneNumber} />
                  <DetailItem label="Branch" value={selectedUser.branch} />
                  <DetailItem
                    label="Graduation Year"
                    value={selectedUser.graduationYear?.toString()}
                  />
                  <DetailItem label="Role" value={selectedUser.role} />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-3 pt-2 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Social Media
                </h4>
                <div className="flex flex-wrap gap-2">
                  <SocialChip
                    label="LinkedIn"
                    url={selectedUser.socialMedia?.linkedin}
                  />
                  <SocialChip
                    label="GitHub"
                    url={selectedUser.socialMedia?.github}
                  />
                  <SocialChip
                    label="Twitter"
                    url={selectedUser.socialMedia?.twitter}
                  />
                </div>
              </div>

              {/* Resume */}
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Resume
                </h4>
                {selectedUser.resumeUrl ? (
                  <a
                    href={selectedUser.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-foreground hover:underline inline-flex items-center gap-1"
                  >
                    View Resume <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground/60">Not uploaded</p>
                )}
              </div>

              {/* Participations */}
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Participations
                </h4>
                {selectedUser.participations.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.participations.map((p, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {p}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/60">No participations yet</p>
                )}
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <DetailItem
                  label="Joined"
                  value={
                    selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : undefined
                  }
                />
                <DetailItem
                  label="Last Updated"
                  value={
                    selectedUser.updatedAt
                      ? new Date(selectedUser.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : undefined
                  }
                />
              </div>

              {/* Document ID */}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Document ID</p>
                <p className="text-xs font-mono text-muted-foreground/70 break-all">
                  {selectedUser.id}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant={selectedUser.isBlocked ? "default" : "destructive"}
                  size="sm"
                  onClick={() => {
                    toggleBlock(selectedUser);
                    setSelectedUser({
                      ...selectedUser,
                      isBlocked: !selectedUser.isBlocked,
                    });
                  }}
                  disabled={actionLoading === selectedUser.id}
                  className="flex-1"
                >
                  {selectedUser.isBlocked ? (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" /> Unblock User
                    </>
                  ) : (
                    <>
                      <ShieldBan className="h-4 w-4 mr-2" /> Block User
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

function SocialChip({ label, url }: { label: string; url?: string }) {
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border bg-background hover:bg-muted transition-colors"
      >
        {label} <ExternalLink className="h-3 w-3" />
      </a>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-muted text-muted-foreground/50">
      {label} — Not linked
    </span>
  );
}
