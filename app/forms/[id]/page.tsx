"use client";

import { useEffect, useState } from "react";
import PublicFormRenderer from "@/components/forms/PublicFormRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { use } from "react";

interface FormData {
  id: string;
  title: string;
  description?: string;
  fields: any[];
  steps: any[];
  isActive: boolean;
}

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${id}`);
        if (!response.ok) {
          throw new Error("Form not found");
        }
        const data = await response.json();

        if (!data.isActive) {
          setError("This form is no longer accepting responses.");
          return;
        }

        setForm(data);
      } catch (err) {
        setError("Failed to load form");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-32 ml-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              {error || "Form not found"}
            </h2>
            <p className="text-muted-foreground">
              Please check the form link and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle both old forms (without steps) and new multi-step forms
  const steps = form.steps || [
    {
      id: "default-step",
      title: "Form",
      description: "",
      order: 0,
    },
  ];

  const elements = form.fields.map((field: any) => ({
    ...field,
    stepId: field.stepId || "default-step",
  }));

  return (
    <PublicFormRenderer
      formId={form.id}
      title={form.title}
      description={form.description}
      steps={steps}
      elements={elements}
    />
  );
}
