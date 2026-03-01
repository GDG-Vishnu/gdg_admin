"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Loader2,
  Plus,
  X,
  Save,
  Upload,
} from "lucide-react";
import GoogleLoader from "@/components/GoogleLoader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MemberCard, {
  type MemberCardProps,
} from "@/components/admin/cards/MemberCard";

const EMPTY_FORM = {
  name: "",
  designation: "",
  position: "",
  imageUrl: "",
  mail: "",
  linkedinUrl: "",
  bgColor: "",
  logo: "",
  dept_logo: "",
  rank: 0,
  dept_rank: 0,
};

export default function MembersPage() {
  const [members, setMembers] = useState<MemberCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add member dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [addUploading, setAddUploading] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Search/filter
  const [search, setSearch] = useState("");

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/members", { cache: "no-store" });
      const json = await res.json();
      if (Array.isArray(json)) {
        setMembers(json);
        setError(null);
      } else if (json.error) {
        setError(json.error);
      } else {
        setError("Unexpected response format");
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setError("Network error fetching members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  function openAddDialog() {
    setAddForm({ ...EMPTY_FORM });
    setCreateError(null);
    setAddOpen(true);
  }

  function handleAddChange(field: string, value: string | number) {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAddImageUpload(file: File) {
    setAddUploading(true);
    setCreateError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Upload failed");
      } else {
        handleAddChange("imageUrl", data.url);
      }
    } catch {
      setCreateError("Image upload failed");
    } finally {
      setAddUploading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setCreateError("Name is required");
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create member");
      } else {
        setAddOpen(false);
        fetchMembers();
      }
    } catch {
      setCreateError("Network error");
    } finally {
      setCreating(false);
    }
  }

  function handleDelete(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function handleUpdate() {
    fetchMembers();
  }

  // Filter members by search query
  const filtered = search.trim()
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          (m.designation || "").toLowerCase().includes(search.toLowerCase()) ||
          (m.position || "").toLowerCase().includes(search.toLowerCase()) ||
          (m.mail || "").toLowerCase().includes(search.toLowerCase()),
      )
    : members;

  const stats = [
    {
      title: "Total Members",
      value: String(members.length),
      description: "All team members",
      icon: Users,
    },
    {
      title: "With LinkedIn",
      value: String(members.filter((m) => m.linkedinUrl).length),
      description: "Profiles linked",
      icon: UserPlus,
    },
    {
      title: "With Email",
      value: String(members.filter((m) => m.mail).length),
      description: "Contactable",
      icon: UserCheck,
    },
    {
      title: "Positions",
      value: String(new Set(members.map((m) => m.designation)).size),
      description: "Unique roles",
      icon: UserX,
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Members" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
            <p className="text-muted-foreground">
              Manage and view all GDG community team members.
            </p>
          </div>
          <Button variant="outline" onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        </div>

        {/* Search bar */}
        <div className="max-w-sm">
          <Input
            placeholder="Search by name, designation, position, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <GoogleLoader message="Loading members..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">
              {search.trim() ? "No members match your search" : "No team members found"}
            </p>
            <p className="text-sm">
              {search.trim()
                ? "Try a different search term."
                : "Add team members to see them here."}
            </p>
          </div>
        ) : (
          <div className="space-y-8 w-full">
            {Object.entries(
              filtered
                .slice()
                // Sort: department rank first, then individual rank, then alphabetical
                .sort((a, b) => {
                  const dra = typeof a.dept_rank === "number" ? a.dept_rank : 0;
                  const drb = typeof b.dept_rank === "number" ? b.dept_rank : 0;
                  if (dra !== drb) return dra - drb;
                  const ra = typeof a.rank === "number" ? a.rank : 0;
                  const rb = typeof b.rank === "number" ? b.rank : 0;
                  if (ra !== rb) return ra - rb;
                  return (a.name || "").localeCompare(b.name || "");
                })
                .reduce<Record<string, MemberCardProps[]>>((acc, member) => {
                  const pos = (member.position || "").trim() || "Unspecified";
                  if (!acc[pos]) acc[pos] = [];
                  acc[pos].push(member);
                  return acc;
                }, {}),
            ).map(([position, groupMembers]) => (
              <section
                key={position}
                className="flex flex-col items-center w-full"
              >
                {/* Position header */}
                <div
                  style={{
                    backgroundColor: groupMembers[0]?.bgColor || undefined,
                  }}
                  className="w-[330px] h-[54px] sm:w-[370px] lg:w-[800px] text-center rounded-[100px] items-center justify-center flex border-2 border-stone-900"
                >
                  <h2 className="text-xl font-semibold sm:m-1 p-2 text-center text-stone-950">
                    {position}
                  </h2>
                </div>

                <div className="h-4" />

                {/* Mobile: horizontal scroll */}
                <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 md:hidden">
                  <div className="flex gap-6 px-4 min-w-max justify-center">
                    {groupMembers.map((m) => (
                      <div key={m.id} className="flex-shrink-0">
                        <MemberCard
                          id={m.id}
                          imageUrl={m.imageUrl || "/file.svg"}
                          name={m.name}
                          designation={m.designation || "MEMBER"}
                          position={m.position || undefined}
                          linkedinUrl={m.linkedinUrl || undefined}
                          mail={m.mail || undefined}
                          bgColor={m.bgColor || undefined}
                          logo={m.logo || undefined}
                          rank={m.rank}
                          dept_rank={m.dept_rank}
                          dept_logo={m.dept_logo}
                          onDelete={handleDelete}
                          onUpdate={handleUpdate}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop: alternating 3-2-3-2 row layout creates a honeycomb-like grid */}
                <div className="hidden md:block w-full px-4">
                  {groupMembers.length > 4 ? (
                    <div className="space-y-6">
                      {(() => {
                        const rows: React.ReactNode[] = [];
                        let index = 0;
                        let rowIdx = 0;
                        while (index < groupMembers.length) {
                          const isOddRow = rowIdx % 2 === 0;
                          const cardsInRow = isOddRow ? 3 : 2;
                          const rowMembers = groupMembers.slice(
                            index,
                            index + cardsInRow,
                          );
                          rows.push(
                            <div
                              key={index}
                              className="flex gap-6 justify-center"
                            >
                              {rowMembers.map((m) => (
                                <div key={m.id} className="flex-shrink-0">
                                  <MemberCard
                                    id={m.id}
                                    imageUrl={m.imageUrl || "/file.svg"}
                                    name={m.name}
                                    designation={m.designation || "MEMBER"}
                                    position={m.position || undefined}
                                    linkedinUrl={m.linkedinUrl || undefined}
                                    mail={m.mail || undefined}
                                    bgColor={m.bgColor || undefined}
                                    logo={m.logo || undefined}
                                    rank={m.rank}
                                    dept_rank={m.dept_rank}
                                    dept_logo={m.dept_logo}
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate}
                                  />
                                </div>
                              ))}
                            </div>,
                          );
                          index += cardsInRow;
                          rowIdx++;
                        }
                        return rows;
                      })()}
                    </div>
                  ) : (
                    <div className="flex gap-6 justify-center">
                      {groupMembers.map((m) => (
                        <div key={m.id} className="flex-shrink-0">
                          <MemberCard
                            id={m.id}
                            imageUrl={m.imageUrl || "/file.svg"}
                            name={m.name}
                            designation={m.designation || "MEMBER"}
                            position={m.position || undefined}
                            linkedinUrl={m.linkedinUrl || undefined}
                            mail={m.mail || undefined}
                            bgColor={m.bgColor || undefined}
                            logo={m.logo || undefined}
                            rank={m.rank}
                            dept_rank={m.dept_rank}
                            dept_logo={m.dept_logo}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Add Member Dialog */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setAddOpen(false)}
        >
          <div
            className="relative w-[90vw] max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAddOpen(false)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-md hover:bg-stone-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>

            <form onSubmit={handleCreate}>
              <div className="flex flex-col md:flex-row">
                {/* Left: Photo preview */}
                <div
                  style={{ backgroundColor: addForm.bgColor || "#e6fffa" }}
                  className="md:w-1/2 flex flex-col items-center justify-center p-6 gap-4"
                >
                  <img
                    src={
                      addForm.imageUrl ||
                      "https://res.cloudinary.com/duvr3z2z0/image/upload/v1764391657/Screenshot_2025-11-29_095727_wptmhb.png"
                    }
                    alt={addForm.name || "New member"}
                    className="w-full max-h-[350px] object-contain rounded-md"
                  />
                  <div className="w-full">
                    <label className="text-xs font-medium text-stone-600">
                      Photo
                    </label>
                    <input
                      ref={addFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAddImageUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      disabled={addUploading}
                      className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-stone-300 rounded-md bg-white/80 hover:bg-white transition-colors disabled:opacity-50"
                    >
                      {addUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {addUploading ? "Uploading..." : "Upload Photo"}
                    </button>
                  </div>
                </div>

                {/* Right: Fields */}
                <div className="md:w-1/2 p-6 space-y-4">
                  <h2 className="text-xl font-bold text-stone-900">
                    Add New Member
                  </h2>

                  <div className="space-y-3">
                    <AddField
                      label="Name *"
                      value={addForm.name}
                      onChange={(v) => handleAddChange("name", v)}
                      required
                    />
                    <AddField
                      label="Designation"
                      value={addForm.designation}
                      onChange={(v) => handleAddChange("designation", v)}
                      placeholder='e.g. "Lead", "Co Lead", "Member"'
                    />
                    <AddField
                      label="Position"
                      value={addForm.position}
                      onChange={(v) => handleAddChange("position", v)}
                      placeholder='e.g. "Event Management", "Communication"'
                    />
                    <AddField
                      label="Email"
                      value={addForm.mail}
                      onChange={(v) => handleAddChange("mail", v)}
                      type="email"
                    />
                    <AddField
                      label="LinkedIn URL"
                      value={addForm.linkedinUrl}
                      onChange={(v) => handleAddChange("linkedinUrl", v)}
                      type="url"
                    />
                    <AddField
                      label="Logo URL"
                      value={addForm.logo}
                      onChange={(v) => handleAddChange("logo", v)}
                      type="url"
                    />
                    <AddField
                      label="Dept Logo URL"
                      value={addForm.dept_logo}
                      onChange={(v) => handleAddChange("dept_logo", v)}
                      type="url"
                    />
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-stone-600">
                          Background Color
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={addForm.bgColor || "#e6fffa"}
                            onChange={(e) =>
                              handleAddChange("bgColor", e.target.value)
                            }
                            className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={addForm.bgColor}
                            onChange={(e) =>
                              handleAddChange("bgColor", e.target.value)
                            }
                            className="flex-1 px-3 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="#e6fffa"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-stone-600">
                          Rank
                        </label>
                        <input
                          type="number"
                          value={addForm.rank}
                          onChange={(e) =>
                            handleAddChange(
                              "rank",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-full mt-1 px-3 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-stone-600">
                          Dept Rank
                        </label>
                        <input
                          type="number"
                          value={addForm.dept_rank}
                          onChange={(e) =>
                            handleAddChange(
                              "dept_rank",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-full mt-1 px-3 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Create button */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-md hover:bg-stone-800 disabled:opacity-50 text-sm font-medium"
                    >
                      {creating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {creating ? "Creating..." : "Create Member"}
                    </button>
                    {createError && (
                      <span className="text-red-600 text-sm">
                        {createError}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AddField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full mt-1 px-3 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
}
