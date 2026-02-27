"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  FileText,
  Users,
  Calendar,
  ArrowLeft,
  Download,
  Eye,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface FormField {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
}

interface Form {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  fields: FormField[];
  _count: {
    responses: number;
  };
}

interface FormResponse {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
}

export default function FormResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFormAndResponses();
  }, [formId]);

  const loadFormAndResponses = async () => {
    setIsLoading(true);
    try {
      // Load form details
      const formResponse = await fetch(`/api/forms/${formId}`);
      if (formResponse.ok) {
        const formData = await formResponse.json();
        setForm(formData);
      } else {
        console.error("Failed to load form");
      }

      // Load responses
      const responsesResponse = await fetch(`/api/forms/${formId}/responses`);
      if (responsesResponse.ok) {
        const responsesData = await responsesResponse.json();
        setResponses(responsesData);
      } else {
        console.error("Failed to load responses");
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!form || responses.length === 0) return;

    // Create CSV header
    const headers = form.fields.map((field) => field.label);
    const csvHeaders = ["Submission Date", ...headers].join(",");

    // Create CSV rows
    const csvRows = responses.map((response) => {
      const date = new Date(response.submittedAt).toLocaleString();
      const values = form.fields.map((field) => {
        const value = response.data[field.id] || "";
        // Escape commas and quotes
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      return [date, ...values].join(",");
    });

    // Combine and create download
    const csvContent = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${form.title}-responses.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Form not found</h3>
          <p className="text-muted-foreground mb-4">
            The form you're looking for doesn't exist.
          </p>
          <Link href="/admin/forms">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Responses",
      value: responses.length.toString(),
      description: "All submissions",
      icon: Users,
    },
    {
      title: "Form Fields",
      value: form.fields.length.toString(),
      description: "Fields in form",
      icon: FileText,
    },
    {
      title: "Status",
      value: form.isActive ? "Active" : "Inactive",
      description: form.isActive ? "Accepting responses" : "Not accepting",
      icon: Calendar,
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/admin/forms">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{form.title}</h1>
            <p className="text-muted-foreground mt-2">
              {form.description || "Form responses and analytics"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} disabled={responses.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Link href={`/admin/form-builder?id=${formId}`}>
            <Button variant="outline">Edit Form</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
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

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Responses</CardTitle>
          <CardDescription>
            All submissions for this form ({responses.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
              <p className="text-muted-foreground">
                Responses will appear here once users submit the form.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Submitted At</TableHead>
                    {form.fields.map((field) => (
                      <TableHead key={field.id}>
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-medium">
                        {new Date(response.submittedAt).toLocaleString()}
                      </TableCell>
                      {form.fields.map((field) => (
                        <TableCell key={field.id}>
                          {field.type === "checkbox" ? (
                            <Badge
                              variant={
                                response.data[field.id]
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {response.data[field.id] ? "Yes" : "No"}
                            </Badge>
                          ) : Array.isArray(response.data[field.id]) ? (
                            <div className="flex flex-wrap gap-1">
                              {response.data[field.id].map(
                                (item: string, idx: number) => (
                                  <Badge key={idx} variant="outline">
                                    {item}
                                  </Badge>
                                ),
                              )}
                            </div>
                          ) : (
                            <span className="line-clamp-2">
                              {response.data[field.id] || "-"}
                            </span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
