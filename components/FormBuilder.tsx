"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Type,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  Circle,
  Calendar as CalendarIcon,
  Hash,
  Upload,
  ToggleLeft,
  GripVertical,
  Trash2,
  Copy,
  Settings,
  Eye,
  Download,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ElementType =
  | "text"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "number"
  | "file"
  | "switch";

export interface FormElement {
  id: string;
  type: ElementType;
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: string[];
  defaultValue?: string | boolean | number;
  stepId: string;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  order: number;
}

const ELEMENT_TYPES: {
  type: ElementType;
  icon: React.ElementType;
  label: string;
}[] = [
  { type: "text", icon: Type, label: "Text Input" },
  { type: "textarea", icon: AlignLeft, label: "Textarea" },
  { type: "select", icon: ChevronDown, label: "Select" },
  { type: "checkbox", icon: CheckSquare, label: "Checkbox" },
  { type: "radio", icon: Circle, label: "Radio Group" },
  { type: "date", icon: CalendarIcon, label: "Date Picker" },
  { type: "number", icon: Hash, label: "Number Input" },
  { type: "file", icon: Upload, label: "File Upload" },
  { type: "switch", icon: ToggleLeft, label: "Switch" },
];

function SidebarDraggableItem({
  type,
  icon: Icon,
  label,
}: {
  type: ElementType;
  icon: React.ElementType;
  label: string;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-${type}`,
    data: { type, isSidebar: true },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 rounded-md border bg-card p-3 shadow-sm hover:ring-2 hover:ring-primary/50 cursor-grab active:cursor-grabbing"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
      <GripVertical className="ml-auto h-4 w-4 text-muted-foreground/50" />
    </div>
  );
}

function SortableCanvasElement({
  element,
  isSelected,
  onSelect,
}: {
  element: FormElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    data: { type: element.type, element },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const Icon = ELEMENT_TYPES.find((t) => t.type === element.type)?.icon || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-start gap-2 rounded-lg border bg-card p-4 shadow-sm transition-all hover:ring-2 hover:ring-primary/20",
        isSelected && "ring-2 ring-primary",
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex-1 space-y-2 pointer-events-none">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            {element.label}
            {element.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>

        {element.helpText && (
          <p className="text-xs text-muted-foreground">{element.helpText}</p>
        )}

        {element.type === "text" && (
          <Input placeholder={element.placeholder} disabled />
        )}
        {element.type === "textarea" && (
          <Textarea placeholder={element.placeholder} disabled />
        )}
        {element.type === "select" && (
          <Select disabled>
            <SelectTrigger>
              <SelectValue
                placeholder={element.placeholder || "Select option"}
              />
            </SelectTrigger>
          </Select>
        )}
        {element.type === "checkbox" && (
          <div className="flex items-center space-x-2">
            <Checkbox disabled id={`check-${element.id}`} />
            <label
              htmlFor={`check-${element.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {element.label}
            </label>
          </div>
        )}
        {element.type === "radio" && (
          <RadioGroup disabled defaultValue="option-one">
            {(element.options || ["Option 1", "Option 2"]).map((opt, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={opt} id={`r-${element.id}-${i}`} />
                <Label htmlFor={`r-${element.id}-${i}`}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
        {element.type === "date" && (
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            disabled
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>Pick a date</span>
          </Button>
        )}
        {element.type === "number" && (
          <Input type="number" placeholder={element.placeholder} disabled />
        )}
        {element.type === "file" && <Input type="file" disabled />}
        {element.type === "switch" && (
          <div className="flex items-center space-x-2">
            <Switch disabled id={`switch-${element.id}`} />
            <Label htmlFor={`switch-${element.id}`}>{element.label}</Label>
          </div>
        )}
      </div>

      {isSelected && (
        <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
      )}
    </div>
  );
}

function PreviewForm({
  steps,
  elements,
}: {
  steps: FormStep[];
  elements: FormElement[];
}) {
  const [currentPreviewStep, setCurrentPreviewStep] = useState(0);
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const currentStep = sortedSteps[currentPreviewStep];
  const currentStepElements = elements.filter(
    (el) => el.stepId === currentStep?.id,
  );

  const goNext = () => {
    if (currentPreviewStep < sortedSteps.length - 1) {
      setCurrentPreviewStep((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentPreviewStep > 0) {
      setCurrentPreviewStep((prev) => prev - 1);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Step Progress Indicator */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between mb-3">
          {sortedSteps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                  index === currentPreviewStep
                    ? "bg-primary text-primary-foreground"
                    : index < currentPreviewStep
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {index + 1}
              </div>
              {index < sortedSteps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded-full transition-colors",
                    index < currentPreviewStep ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h3 className="font-semibold">{currentStep?.title}</h3>
          {currentStep?.description && (
            <p className="text-sm text-muted-foreground">
              {currentStep.description}
            </p>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-xl mx-auto">
          {currentStepElements.map((el) => (
            <div key={el.id} className="space-y-2">
              <Label>
                {el.label}
                {el.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {el.helpText && (
                <p className="text-xs text-muted-foreground">{el.helpText}</p>
              )}

              {el.type === "text" && (
                <Input placeholder={el.placeholder} required={el.required} />
              )}
              {el.type === "textarea" && (
                <Textarea placeholder={el.placeholder} required={el.required} />
              )}
              {el.type === "select" && (
                <Select required={el.required}>
                  <SelectTrigger>
                    <SelectValue placeholder={el.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {(el.options || []).map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {el.type === "checkbox" && (
                <div className="flex items-center space-x-2">
                  <Checkbox id={`preview-${el.id}`} required={el.required} />
                  <label htmlFor={`preview-${el.id}`} className="text-sm">
                    {el.label}
                  </label>
                </div>
              )}
              {el.type === "radio" && (
                <RadioGroup required={el.required}>
                  {(el.options || []).map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={opt}
                        id={`preview-r-${el.id}-${i}`}
                      />
                      <Label htmlFor={`preview-r-${el.id}-${i}`}>{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {el.type === "date" && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>Pick a date</span>
                </Button>
              )}
              {el.type === "number" && (
                <Input
                  type="number"
                  placeholder={el.placeholder}
                  required={el.required}
                />
              )}
              {el.type === "file" && <Input type="file" />}
              {el.type === "switch" && (
                <div className="flex items-center space-x-2">
                  <Switch id={`preview-switch-${el.id}`} />
                  <Label htmlFor={`preview-switch-${el.id}`}>{el.label}</Label>
                </div>
              )}
            </div>
          ))}

          {currentStepElements.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No fields in this step yet</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between px-6 py-4 border-t">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentPreviewStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentPreviewStep + 1} of {sortedSteps.length}
        </div>

        {currentPreviewStep < sortedSteps.length - 1 ? (
          <Button onClick={goNext} className="gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="gap-2">Submit Form</Button>
        )}
      </div>
    </div>
  );
}

interface FormBuilderProps {
  formId?: string; // If provided, we're editing an existing form
  initialData?: {
    title: string;
    description?: string;
    steps: FormStep[];
    elements: FormElement[];
    isActive?: boolean;
  };
}

export default function FormBuilder({
  formId,
  initialData,
}: FormBuilderProps = {}) {
  const [steps, setSteps] = useState<FormStep[]>(
    initialData?.steps || [
      {
        id: crypto.randomUUID(),
        title: "Step 1",
        description: "Basic Information",
        order: 0,
      },
    ],
  );
  const [currentStepId, setCurrentStepId] = useState<string>("");
  const [elements, setElements] = useState<FormElement[]>(
    initialData?.elements || [],
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );
  const [formName, setFormName] = useState(
    initialData?.title || "Untitled Form",
  );
  const [formDescription, setFormDescription] = useState(
    initialData?.description || "",
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [draggedSidebarItem, setDraggedSidebarItem] =
    useState<ElementType | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditingStepId, setIsEditingStepId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (!currentStepId && steps.length > 0) {
      setCurrentStepId(steps[0].id);
    }
  }, [steps, currentStepId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (event.active.data.current?.isSidebar) {
      setDraggedSidebarItem(event.active.data.current.type);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedSidebarItem(null);

    if (!over) return;

    if (active.data.current?.isSidebar) {
      const type = active.data.current.type as ElementType;
      const newElement: FormElement = {
        id: crypto.randomUUID(),
        type,
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        placeholder: "Placeholder text...",
        required: false,
        options:
          type === "radio" || type === "select"
            ? ["Option 1", "Option 2"]
            : undefined,
        stepId: currentStepId, // Assign to current step
      };

      if (over.id === "canvas-droppable") {
        setElements((prev) => [...prev, newElement]);
        setSelectedElementId(newElement.id);
      } else {
        const overIndex = elements.findIndex((el) => el.id === over.id);
        if (overIndex !== -1) {
          const newElements = [...elements];
          newElements.splice(overIndex, 0, newElement);
          setElements(newElements);
          setSelectedElementId(newElement.id);
        } else {
          setElements((prev) => [...prev, newElement]);
          setSelectedElementId(newElement.id);
        }
      }
      return;
    }

    if (active.id !== over.id) {
      setElements((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const updateSelectedElement = (updates: Partial<FormElement>) => {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedElementId ? { ...el, ...updates } : el,
      ),
    );
  };

  const deleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
    toast.success("Element deleted");
  };

  const duplicateElement = (id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const newEl = {
      ...el,
      id: crypto.randomUUID(),
      label: `${el.label} (Copy)`,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
    toast.success("Element duplicated");
  };

  const addStep = () => {
    const newStep: FormStep = {
      id: crypto.randomUUID(),
      title: `Step ${steps.length + 1}`,
      description: "",
      order: steps.length,
    };
    setSteps((prev) => [...prev, newStep]);
    setCurrentStepId(newStep.id);
    toast.success("Step added");
  };

  const updateStep = (id: string, updates: Partial<FormStep>) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, ...updates } : step)),
    );
  };

  const deleteStep = (id: string) => {
    if (steps.length === 1) {
      toast.error("Cannot delete the last step");
      return;
    }
    setSteps((prev) => prev.filter((s) => s.id !== id));
    setElements((prev) => prev.filter((el) => el.stepId !== id));
    if (currentStepId === id) {
      setCurrentStepId(steps[0].id);
    }
    toast.success("Step deleted");
  };

  const handleSaveForm = async () => {
    if (!formName.trim()) {
      toast.error("Please enter a form name");
      return;
    }

    if (elements.length === 0) {
      toast.error("Please add at least one form element");
      return;
    }

    setIsSaving(true);
    try {
      const url = formId ? `/api/forms/${formId}` : "/api/forms";
      const method = formId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formName,
          description: formDescription,
          fields: elements,
          steps: steps,
          isActive: isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save form");
      }

      const savedForm = await response.json();
      toast.success(
        formId ? "Form updated successfully!" : "Form created successfully!",
      );

      if (!formId && savedForm.id) {
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form");
    } finally {
      setIsSaving(false);
    }
  };

  const currentStepElements = elements.filter(
    (el) => el.stepId === currentStepId,
  );
  const currentStepIndex = steps.findIndex((s) => s.id === currentStepId);
  const currentStep = steps[currentStepIndex];

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col bg-background text-foreground">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-md">
              <Type className="h-5 w-5 text-primary" />
            </div>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-[300px] border-transparent bg-transparent text-lg font-semibold hover:bg-accent/50 focus:bg-accent focus:border-input transition-colors h-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" /> Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>{formName}</DialogTitle>
                  <DialogDescription>
                    Preview of your multi-step form
                  </DialogDescription>
                </DialogHeader>
                <PreviewForm steps={steps} elements={elements} />
                <DialogFooter>
                  <Button onClick={() => setIsPreviewOpen(false)}>
                    Close Preview
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                const json = JSON.stringify(
                  { formName, steps, elements },
                  null,
                  2,
                );
                navigator.clipboard.writeText(json);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy className="h-4 w-4" /> Copy JSON
            </Button>

            <Button
              size="sm"
              className="gap-2"
              onClick={handleSaveForm}
              disabled={isSaving}
            >
              <Download className="h-4 w-4" />
              {isSaving ? "Saving..." : formId ? "Update Form" : "Save Form"}
            </Button>
          </div>
        </header>

        {/* Step Navigation Bar */}
        <div className="flex items-center gap-2 border-b px-6 py-3 bg-muted/30 overflow-x-auto">
          <div className="flex items-center gap-2 mr-auto">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Steps:
            </span>
          </div>
          <div className="flex items-center gap-2">
            {steps
              .sort((a, b) => a.order - b.order)
              .map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  {isEditingStepId === step.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={step.title}
                        onChange={(e) =>
                          updateStep(step.id, { title: e.target.value })
                        }
                        onBlur={() => setIsEditingStepId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setIsEditingStepId(null);
                        }}
                        className="h-8 w-32"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteStep(step.id)}
                        disabled={steps.length === 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant={
                        currentStepId === step.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setCurrentStepId(step.id)}
                      className="gap-2 group relative"
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-background/20 text-xs">
                        {index + 1}
                      </span>
                      <span>{step.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 absolute -right-1 -top-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingStepId(step.id);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </Button>
                  )}
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={addStep}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Add Step
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Palette */}
          <aside className="w-64 border-r bg-muted/30 flex flex-col">
            <div className="p-4 border-b bg-background/50">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Components
              </h2>
              <p className="text-xs text-muted-foreground">
                Drag items to the canvas
              </p>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="grid gap-3">
                {ELEMENT_TYPES.map((type) => (
                  <SidebarDraggableItem key={type.type} {...type} />
                ))}
              </div>
            </ScrollArea>
          </aside>

          {/* Center Canvas */}
          <main
            className="flex-1 bg-muted/10 relative overflow-hidden flex flex-col"
            onClick={() => setSelectedElementId(null)}
          >
            <ScrollArea className="flex-1 p-8">
              <div className="mx-auto max-w-2xl bg-background min-h-[800px] rounded-xl shadow-sm border p-8 transition-colors">
                {/* Step Header */}
                <div className="mb-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold">{currentStep?.title}</h2>
                  {currentStep?.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentStep.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="text-xs text-muted-foreground">
                      Step {currentStepIndex + 1} of {steps.length}
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                          width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <SortableContext
                  items={currentStepElements.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className="space-y-4 min-h-[200px]"
                    id="canvas-droppable"
                  >
                    {currentStepElements.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-4 bg-background rounded-full mb-4 shadow-sm">
                          <Plus className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">
                          Start Building This Step
                        </h3>
                        <p className="text-sm">
                          Drag components from the sidebar to here
                        </p>
                      </div>
                    ) : (
                      currentStepElements.map((element) => (
                        <SortableCanvasElement
                          key={element.id}
                          element={element}
                          isSelected={selectedElementId === element.id}
                          onSelect={setSelectedElementId}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </div>
            </ScrollArea>
          </main>

          {/* Right Sidebar - Properties */}
          <aside className="w-80 border-l bg-background flex flex-col shadow-xl z-20">
            {selectedElement ? (
              <div className="flex flex-col h-full">
                <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-background z-10">
                  <div>
                    <h3 className="font-semibold text-lg">Properties</h3>
                    <p className="text-xs text-muted-foreground">
                      Edit component settings
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedElementId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-5">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Field Label</Label>
                      <Input
                        value={selectedElement.label}
                        onChange={(e) =>
                          updateSelectedElement({ label: e.target.value })
                        }
                      />
                    </div>

                    {(selectedElement.type === "text" ||
                      selectedElement.type === "textarea" ||
                      selectedElement.type === "number" ||
                      selectedElement.type === "select") && (
                      <div className="space-y-2">
                        <Label>Placeholder</Label>
                        <Input
                          value={selectedElement.placeholder || ""}
                          onChange={(e) =>
                            updateSelectedElement({
                              placeholder: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Helper Text</Label>
                      <Input
                        value={selectedElement.helpText || ""}
                        onChange={(e) =>
                          updateSelectedElement({ helpText: e.target.value })
                        }
                        placeholder="Brief description for user"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <Label>Required Field</Label>
                      <Switch
                        checked={selectedElement.required}
                        onCheckedChange={(c) =>
                          updateSelectedElement({ required: c })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Move to Step</Label>
                      <Select
                        value={selectedElement.stepId}
                        onValueChange={(value) =>
                          updateSelectedElement({ stepId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {steps
                            .sort((a, b) => a.order - b.order)
                            .map((step, idx) => (
                              <SelectItem key={step.id} value={step.id}>
                                Step {idx + 1}: {step.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {(selectedElement.type === "select" ||
                      selectedElement.type === "radio") && (
                      <div className="space-y-3">
                        <Separator />
                        <Label>Options</Label>
                        <div className="space-y-2">
                          {(selectedElement.options || []).map((opt, idx) => (
                            <div key={idx} className="flex gap-2">
                              <Input
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [
                                    ...(selectedElement.options || []),
                                  ];
                                  newOpts[idx] = e.target.value;
                                  updateSelectedElement({ options: newOpts });
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newOpts = (
                                    selectedElement.options || []
                                  ).filter((_, i) => i !== idx);
                                  updateSelectedElement({ options: newOpts });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              updateSelectedElement({
                                options: [
                                  ...(selectedElement.options || []),
                                  `Option ${(selectedElement.options?.length || 0) + 1}`,
                                ],
                              })
                            }
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Option
                          </Button>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="pt-4 flex gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => duplicateElement(selectedElement.id)}
                      >
                        <Copy className="h-4 w-4 mr-2" /> Duplicate
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => deleteElement(selectedElement.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground animate-in fade-in duration-500">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Settings className="h-8 w-8 opacity-50" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Configuration</h3>
                <p className="text-sm max-w-[200px]">
                  Select an element on the canvas to edit its properties.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          draggedSidebarItem ? (
            <div className="flex items-center gap-2 rounded-md border bg-card p-3 shadow-lg opacity-80 w-[200px] cursor-grabbing">
              <GripVertical className="mr-2 h-4 w-4" />
              <span className="font-medium">
                {
                  ELEMENT_TYPES.find((e) => e.type === draggedSidebarItem)
                    ?.label
                }
              </span>
            </div>
          ) : (
            <div className="opacity-50 bg-card p-4 border rounded-lg shadow-lg w-[400px]">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
