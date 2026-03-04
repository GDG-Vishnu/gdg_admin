"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/admin/layout/PageHeader";
import {
  Plus,
  Trash2,
  Eye,
  Edit3,
  Settings,
  Type,
  TextCursorInput,
  CheckSquare,
  Circle,
  List,
  Calendar,
  AtSign,
  Hash,
  Save,
  Play,
  Copy,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Upload,
  ArrowLeft,
} from "lucide-react";

interface FormField {
  id: string;
  type:
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "date"
    | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
  accept?: string;
}

interface FormConfig {
  title: string;
  description: string;
  fields: FormField[];
}

const FIELD_TYPES = [
  { type: "text", label: "Text Input", icon: Type },
  { type: "email", label: "Email", icon: AtSign },
  { type: "number", label: "Number", icon: Hash },
  { type: "textarea", label: "Text Area", icon: TextCursorInput },
  { type: "select", label: "Select Dropdown", icon: List },
  { type: "radio", label: "Radio Group", icon: Circle },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "date", label: "Date Picker", icon: Calendar },
  { type: "file", label: "File Upload", icon: Upload },
] as const;

const MOCK_FORMS: Record<string, FormConfig> = {
  "1": {
    title: "Cloud Study Jam 2025 - GDG VITB",
    description:
      "This form will help us register participants and track event updates. Please fill in your details carefully. Vertical form has to work for you?",
    fields: [
      {
        id: "1",
        type: "text",
        label: "Full Name:",
        placeholder: "Enter your full name",
        required: true,
        description: "",
      },
      {
        id: "2",
        type: "text",
        label: "Register Number :",
        placeholder: "Enter your college register number",
        required: true,
        description: "",
      },
      {
        id: "3",
        type: "radio",
        label: "Year of Study",
        required: true,
        options: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
        description: "",
      },
      {
        id: "4",
        type: "radio",
        label: "Have you attended a GDG event before?",
        required: true,
        options: ["YES", "NO"],
        description: "",
      },
      {
        id: "5",
        type: "file",
        label: "Upload Your ID card Image",
        required: true,
        accept: "image/*",
        description: "Upload file upto 10 MB",
      },
      {
        id: "6",
        type: "select",
        label: "T-shirt Size (if swags are provided)",
        required: false,
        options: ["XS", "S", "M", "L", "XL", "XXL"],
        placeholder: "Select your Size",
        description: "",
      },
    ],
  },
  "2": {
    title: "GDG Member Feedback Survey",
    description:
      "Help us improve our community by sharing your feedback and suggestions.",
    fields: [
      {
        id: "1",
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        description: "",
      },
      {
        id: "2",
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email",
        required: true,
        description: "",
      },
      {
        id: "3",
        type: "select",
        label: "How long have you been part of GDG?",
        required: true,
        options: [
          "Less than 6 months",
          "6 months - 1 year",
          "1-2 years",
          "More than 2 years",
        ],
        placeholder: "Select duration",
        description: "",
      },
      {
        id: "4",
        type: "radio",
        label: "Overall satisfaction with GDG events",
        required: true,
        options: ["Excellent", "Good", "Average", "Poor"],
        description: "",
      },
      {
        id: "5",
        type: "textarea",
        label: "What topics would you like us to cover in future events?",
        placeholder: "Share your suggestions...",
        required: false,
        description: "",
      },
      {
        id: "6",
        type: "checkbox",
        label: "Which event formats do you prefer?",
        required: false,
        options: [
          "In-person workshops",
          "Online webinars",
          "Hybrid events",
          "Hackathons",
          "Networking sessions",
        ],
        description: "",
      },
    ],
  },
  "3": {
    title: "Workshop Registration - Android Development",
    description:
      "Register for our comprehensive Android development workshop series.",
    fields: [
      {
        id: "1",
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        description: "",
      },
      {
        id: "2",
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email",
        required: true,
        description: "",
      },
      {
        id: "3",
        type: "number",
        label: "Phone Number",
        placeholder: "Enter your phone number",
        required: true,
        description: "",
      },
      {
        id: "4",
        type: "select",
        label: "Experience Level",
        required: true,
        options: ["Beginner", "Intermediate", "Advanced"],
        placeholder: "Select your level",
        description: "",
      },
      {
        id: "5",
        type: "radio",
        label: "Do you have Android Studio installed?",
        required: true,
        options: ["Yes", "No", "Not sure"],
        description: "",
      },
      {
        id: "6",
        type: "textarea",
        label: "What do you hope to learn from this workshop?",
        placeholder: "Share your learning goals...",
        required: false,
        description: "",
      },
      {
        id: "7",
        type: "checkbox",
        label: "Dietary Requirements (for lunch)",
        required: false,
        options: ["Vegetarian", "Vegan", "Gluten-free", "No restrictions"],
        description: "",
      },
    ],
  },
};

import FormBuilder from "@/components/FormBuilder";

function FormBuilderContent() {
  const searchParams = useSearchParams();
  const formId = searchParams.get("id");
  const isEditMode = Boolean(formId);

  const getInitialForm = (): FormConfig => {
    return {
      title: "Untitled Form",
      description: "Form description",
      fields: [],
    };
  };

  const [activeTab, setActiveTab] = useState<"builder" | "preview">("builder");
  const [form, setForm] = useState<FormConfig>(getInitialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
  }, [formId]);

  const loadForm = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/forms/${id}`);
      if (response.ok) {
        const data = await response.json();
        setForm({
          title: data.title,
          description: data.description || "",
          fields: data.fields,
        });
      } else {
        console.error("Failed to load form");
      }
    } catch (error) {
      console.error("Error loading form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveForm = async (publish: boolean = false) => {
    setIsSaving(true);
    try {
      const url = formId ? `/api/forms/${formId}` : "/api/forms";
      const method = formId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          fields: form.fields,
          isActive: publish,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Form ${publish ? "published" : "saved"} successfully!`);
        if (!formId && data.id) {
          window.history.pushState({}, "", `/admin/form-builder?id=${data.id}`);
        }
      } else {
        console.error("Failed to save form");
        alert("Failed to save form. Please try again.");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Error saving form. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const addField = useCallback((type: FormField["type"]) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      placeholder:
        type === "textarea"
          ? "Enter your message..."
          : type === "file"
            ? undefined
            : "Enter value...",
      options: ["select", "radio", "checkbox"].includes(type)
        ? ["Option 1", "Option 2"]
        : undefined,
      accept: type === "file" ? "*/*" : undefined,
    };
    setForm((prev) => ({ ...prev, fields: [...prev.fields, newField] }));
    setEditingField(newField);
    setSelectedField(newField.id);
    setIsFieldDialogOpen(true);
  }, []);

  const updateField = useCallback((id: string, updates: Partial<FormField>) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field,
      ),
    }));
  }, []);

  const deleteField = useCallback(
    (id: string) => {
      setForm((prev) => ({
        ...prev,
        fields: prev.fields.filter((field) => field.id !== id),
      }));
      if (selectedField === id) {
        setSelectedField(null);
      }
    },
    [selectedField],
  );

  const moveField = useCallback((id: string, direction: "up" | "down") => {
    setForm((prev) => {
      const fields = [...prev.fields];
      const index = fields.findIndex((field) => field.id === id);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= fields.length) return prev;

      [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
      return { ...prev, fields };
    });
  }, []);

  const renderFormField = (field: FormField, isPreview = false) => {
    const fieldProps = {
      placeholder: field.placeholder,
      required: field.required,
      disabled: !isPreview,
      className: isPreview ? "" : "pointer-events-none",
    };

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return <Input type={field.type} {...fieldProps} />;

      case "textarea":
        return <Textarea {...fieldProps} />;

      case "select":
        return (
          <Select disabled={!isPreview}>
            <SelectTrigger>
              <SelectValue
                placeholder={field.placeholder || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem
                  key={index}
                  value={option.toLowerCase().replace(/\s+/g, "-")}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup disabled={!isPreview}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.toLowerCase().replace(/\s+/g, "-")}
                  id={`${field.id}-${index}`}
                />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${index}`} disabled={!isPreview} />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case "date":
        return <Input type="date" {...fieldProps} />;

      case "file":
        return (
          <div className="space-y-2">
            <Input
              type="file"
              accept={field.accept}
              disabled={!isPreview}
              className={isPreview ? "" : "pointer-events-none"}
            />
            {!isPreview && (
              <div className="flex items-center justify-center p-4 border-2 border-dashed border-muted-foreground/25 rounded-md bg-muted/50">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <Button variant="outline" size="sm" disabled>
                    Add File
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <Input {...fieldProps} />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Form Builder" />

      {/* Header Controls */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/forms">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Forms
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex flex-col">
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="text-lg font-semibold border-0 px-0 focus-visible:ring-0 bg-transparent"
                  placeholder="Form Title"
                />
                {isEditMode && (
                  <span className="text-xs text-muted-foreground">
                    Editing existing form
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border">
                <Button
                  variant={activeTab === "builder" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("builder")}
                  className="rounded-r-none"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Builder
                </Button>
                <Button
                  variant={activeTab === "preview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("preview")}
                  className="rounded-l-none"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveForm(false)}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                onClick={() => saveForm(true)}
                disabled={isSaving}
              >
                <Play className="h-4 w-4 mr-2" />
                {isSaving ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === "builder" ? (
          <>
            {/* Sidebar - Field Types */}
            <div className="w-80 border-r bg-muted/50 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Form Fields</h3>
                <div className="grid gap-2">
                  {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
                    <Button
                      key={type}
                      variant="ghost"
                      className="flex items-center justify-start gap-3 h-auto p-3"
                      onClick={() => addField(type)}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">
                          Click to add {label.toLowerCase()}
                        </div>
                      </div>
                      <Plus className="h-4 w-4 ml-auto" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center - Form Builder */}
            <div className="flex-1 p-6 overflow-y-auto">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>
                    <Input
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="text-xl font-bold border-0 px-0 focus-visible:ring-0 bg-transparent"
                      placeholder="Form Title"
                    />
                  </CardTitle>
                  <CardDescription>
                    <Textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="border-0 px-0 focus-visible:ring-0 bg-transparent resize-none"
                      placeholder="Form description"
                      rows={2}
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {form.fields.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No fields added yet</p>
                      <p className="text-sm">
                        Select a field type from the sidebar to get started
                      </p>
                    </div>
                  ) : (
                    form.fields.map((field, index) => (
                      <div
                        key={field.id}
                        className={`group relative p-4 border-2 rounded-lg transition-all ${
                          selectedField === field.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        onClick={() => setSelectedField(field.id)}
                      >
                        {/* Field Controls */}
                        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(field.id, "up");
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(field.id, "down");
                            }}
                            disabled={index === form.fields.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingField(field);
                              setIsFieldDialogOpen(true);
                            }}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteField(field.id);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Field Content */}
                        <div className="space-y-2 pr-20">
                          <div className="flex items-center gap-2">
                            <Label className="font-medium">{field.label}</Label>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          {field.description && (
                            <p className="text-sm text-muted-foreground">
                              {field.description}
                            </p>
                          )}
                          {renderFormField(field)}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          /* Preview Mode */
          <div className="flex-1 p-6 overflow-y-auto bg-muted/30">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>{form.title}</CardTitle>
                <CardDescription>{form.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {form.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label
                        htmlFor={field.id}
                        className="flex items-center gap-2"
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-muted-foreground">
                          {field.description}
                        </p>
                      )}
                      {renderFormField(field, true)}
                    </div>
                  ))}
                  {form.fields.length > 0 && (
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Submit Form
                      </Button>
                      <Button type="button" variant="outline">
                        Save as Draft
                      </Button>
                    </div>
                  )}
                  {form.fields.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        No fields to preview
                      </p>
                      <p className="text-sm">
                        Add some fields in builder mode to see the preview
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Field Editor Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogDescription>
              Configure the field properties and options.
            </DialogDescription>
          </DialogHeader>
          {editingField && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="field-label">Label</Label>
                <Input
                  id="field-label"
                  value={editingField.label}
                  onChange={(e) =>
                    setEditingField((prev) => ({
                      ...prev!,
                      label: e.target.value,
                    }))
                  }
                  placeholder="Field label"
                />
              </div>

              <div>
                <Label htmlFor="field-placeholder">Placeholder</Label>
                <Input
                  id="field-placeholder"
                  value={editingField.placeholder || ""}
                  onChange={(e) =>
                    setEditingField((prev) => ({
                      ...prev!,
                      placeholder: e.target.value,
                    }))
                  }
                  placeholder="Placeholder text"
                  disabled={["file", "date", "radio", "checkbox"].includes(
                    editingField.type,
                  )}
                />
                {["file", "date", "radio", "checkbox"].includes(
                  editingField.type,
                ) && (
                  <p className="text-xs text-muted-foreground">
                    Placeholder not applicable for this field type
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="field-description">
                  Description (Optional)
                </Label>
                <Textarea
                  id="field-description"
                  value={editingField.description || ""}
                  onChange={(e) =>
                    setEditingField((prev) => ({
                      ...prev!,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Help text for this field"
                  rows={2}
                />
              </div>

              {["select", "radio", "checkbox"].includes(editingField.type) && (
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {editingField.options?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [
                              ...(editingField.options || []),
                            ];
                            newOptions[index] = e.target.value;
                            setEditingField((prev) => ({
                              ...prev!,
                              options: newOptions,
                            }));
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                        <Button
                          size="icon-sm"
                          variant="outline"
                          onClick={() => {
                            const newOptions = [
                              ...(editingField.options || []),
                            ];
                            newOptions.splice(index, 1);
                            setEditingField((prev) => ({
                              ...prev!,
                              options: newOptions,
                            }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = [
                          ...(editingField.options || []),
                          `Option ${(editingField.options?.length || 0) + 1}`,
                        ];
                        setEditingField((prev) => ({
                          ...prev!,
                          options: newOptions,
                        }));
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              {editingField.type === "file" && (
                <div>
                  <Label htmlFor="field-accept">Accepted File Types</Label>
                  <Select
                    value={editingField.accept || "*/*"}
                    onValueChange={(value) =>
                      setEditingField((prev) => ({ ...prev!, accept: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select file types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="*/*">All Files</SelectItem>
                      <SelectItem value="image/*">Images Only</SelectItem>
                      <SelectItem value="application/pdf">PDF Only</SelectItem>
                      <SelectItem value=".doc,.docx">Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="field-required"
                  checked={editingField.required}
                  onCheckedChange={(checked) =>
                    setEditingField((prev) => ({ ...prev!, required: checked }))
                  }
                />
                <Label htmlFor="field-required">Required field</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (editingField) {
                      updateField(editingField.id, editingField);
                    }
                    setIsFieldDialogOpen(false);
                    setEditingField(null);
                  }}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsFieldDialogOpen(false);
                    setEditingField(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FormBuilderPage() {
  return (
    <Suspense>
      <FormBuilderContent />
    </Suspense>
  );
}
