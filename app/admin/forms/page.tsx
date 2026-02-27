"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import {
  FileText,
  FilePlus,
  Users,
  Calendar,
  Search,
  Plus,
  Settings,
  BarChart3,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface FormStats {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fields: any[];
  responseCount: number;
}

export default function FormsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [forms, setForms] = useState<FormStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/forms");
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      } else {
        console.error("Failed to load forms");
      }
    } catch (error) {
      console.error("Error loading forms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteForm = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;

    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setForms(forms.filter((f) => f.id !== id));
      } else {
        alert("Failed to delete form");
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      alert("Error deleting form");
    }
  };

  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.description &&
        form.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && form.isActive) ||
      (filterStatus === "inactive" && !form.isActive);
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-gray-500";
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary";
  };

  const stats = [
    {
      title: "Total Forms",
      value: forms.length.toString(),
      description: "All created forms",
      icon: FileText,
    },
    {
      title: "Active Forms",
      value: forms.filter((f) => f.isActive).length.toString(),
      description: "Currently accepting responses",
      icon: FilePlus,
    },
    {
      title: "Total Responses",
      value: forms
        .reduce((sum, form) => sum + form.responseCount, 0)
        .toString(),
      description: "All form submissions",
      icon: Users,
    },
    {
      title: "This Month",
      value: forms
        .filter(
          (f) =>
            new Date(f.createdAt) >
            new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        )
        .length.toString(),
      description: "Forms created this month",
      icon: Calendar,
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Forms Management" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Forms</h2>
            <p className="text-muted-foreground">
              Create and manage forms for your community events and surveys.
            </p>
          </div>
          <Link href="/admin/form-builder">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Form
            </Button>
          </Link>
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

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              All
            </Button>
            <Button
              variant={filterStatus === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("active")}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("inactive")}
            >
              Inactive
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredForms.map((form) => (
              <Card
                key={form.id}
                className="group hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-primary/20"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(form.isActive)}`}
                        />
                        <Badge
                          variant={getStatusBadgeVariant(form.isActive)}
                          className="text-xs"
                        >
                          {form.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {form.title}
                      </CardTitle>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteForm(form.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {form.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {form.responseCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {form.fields.length} fields
                      </span>
                    </div>
                    <span className="text-xs">
                      Updated {new Date(form.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/form-builder?id=${form.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit Form
                      </Button>
                    </Link>
                    <Link href={`/admin/forms/${form.id}/responses`}>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Results
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredForms.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No forms found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Create your first form to get started."}
              </p>
              {!searchQuery && filterStatus === "all" && (
                <Link href="/admin/form-builder">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Form
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
