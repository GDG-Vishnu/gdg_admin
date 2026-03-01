"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import { Users, UserPlus, UserCheck, UserX, Loader2 } from "lucide-react";
import GoogleLoader from "@/components/GoogleLoader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MemberCard, {
  type MemberCardProps,
} from "@/components/admin/cards/MemberCard";

export default function MembersPage() {
  const [members, setMembers] = useState<MemberCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [operation, setOperation] = useState("read");

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/admin/members");
        const json = await res.json();
        if (Array.isArray(json)) {
          setMembers(json);
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
    }
    fetchMembers();
  }, []);

  function handleGo(e: React.FormEvent) {
    e.preventDefault();
  }

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
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
          <p className="text-muted-foreground">
            Manage and view all GDG community team members.
          </p>
        </div>

        <form
          onSubmit={handleGo}
          className="flex items-end gap-4 rounded-lg border p-4"
        >
          <div className="flex-1 space-y-1.5">
            <label htmlFor="identifier" className="text-sm font-medium">
              Identifier
            </label>
            <Input
              id="identifier"
              placeholder="Enter member ID or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div className="w-40 space-y-1.5">
            <label htmlFor="operation" className="text-sm font-medium">
              Operation
            </label>
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger id="operation">
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">GO</Button>
        </form>

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
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No team members found</p>
            <p className="text-sm">Add team members to see them here.</p>
          </div>
        ) : (
          <div className="space-y-8 w-full">
            {Object.entries(
              members
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
    </div>
  );
}
