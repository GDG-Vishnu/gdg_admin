"use client";

import React, { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: string[];
  defaultValue?: string | boolean | number;
  stepId: string;
}

interface FormStep {
  id: string;
  title: string;
  description?: string;
  order: number;
}

interface PublicFormRendererProps {
  formId: string;
  title: string;
  description?: string;
  steps: FormStep[];
  elements: FormElement[];
}

export default function PublicFormRenderer({
  formId,
  title,
  description,
  steps,
  elements,
}: PublicFormRendererProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedSteps = steps.sort((a, b) => a.order - b.order);
  const currentStep = sortedSteps[currentStepIndex];
  const currentElements = elements.filter((el) => el.stepId === currentStep.id);

  const handleInputChange = (elementId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [elementId]: value }));
  };

  const validateCurrentStep = () => {
    for (const element of currentElements) {
      if (element.required) {
        const value = formData[element.id];
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          toast.error(`Please fill in: ${element.label}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStepIndex < sortedSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/forms/${formId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      toast.success("Form submitted successfully!");
      setFormData({});
      setCurrentStepIndex(0);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderElement = (element: FormElement) => {
    const value = formData[element.id];

    switch (element.type) {
      case "text":
        return (
          <div key={element.id} className="space-y-2">
            <Label>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              placeholder={element.placeholder}
              value={value || ""}
              onChange={(e) => handleInputChange(element.id, e.target.value)}
            />
            {element.helpText && (
              <p className="text-sm text-muted-foreground">
                {element.helpText}
              </p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={element.id} className="space-y-2">
            <Label>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Textarea
              placeholder={element.placeholder}
              value={value || ""}
              onChange={(e) => handleInputChange(element.id, e.target.value)}
              rows={4}
            />
            {element.helpText && (
              <p className="text-sm text-muted-foreground">
                {element.helpText}
              </p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={element.id} className="space-y-2">
            <Label>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              type="number"
              placeholder={element.placeholder}
              value={value || ""}
              onChange={(e) => handleInputChange(element.id, e.target.value)}
            />
            {element.helpText && (
              <p className="text-sm text-muted-foreground">
                {element.helpText}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={element.id} className="space-y-2">
            <Label>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleInputChange(element.id, val)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={element.placeholder || "Select an option"}
                />
              </SelectTrigger>
              <SelectContent>
                {element.options?.map((opt, idx) => (
                  <SelectItem key={idx} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {element.helpText && (
              <p className="text-sm text-muted-foreground">
                {element.helpText}
              </p>
            )}
          </div>
        );

      case "radio":
        return (
          <div key={element.id} className="space-y-2">
            <Label>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => handleInputChange(element.id, val)}
            >
              {element.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`${element.id}-${idx}`} />
                  <Label htmlFor={`${element.id}-${idx}`}>{opt}</Label>
                </div>
              ))}
            </RadioGroup>
            {element.helpText && (
              <p className="text-sm text-muted-foreground">
                {element.helpText}
              </p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={element.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={element.id}
                checked={value || false}
                onCheckedChange={(checked) =>
                  handleInputChange(element.id, checked)
                }
              />
              <Label htmlFor={element.id}>
                {element.label}
                {element.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
            </div>
            {element.helpText && (
              <p className="text-sm text-muted-foreground ml-6">
                {element.helpText}
              </p>
            )}
          </div>
        );

      case "switch":
        return (
          <div key={element.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                {element.label}
                {element.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Switch
                checked={value || false}
                onCheckedChange={(checked) =>
                  handleInputChange(element.id, checked)
                }
              />
            </div>
            {element.helpText && (
              <p className="text-sm text-muted-foreground">
                {element.helpText}
              </p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={element.id} className="space-y-2">
            <Label>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              type="date"
              value={value || ""}
              onChange={(e) => handleInputChange(element.id, e.target.value)}
            />
            {element.helpText && (
              <p className="text-sm text-muted-foreground">
                {element.helpText}
              </p>
            )}
          </div>
        );

      case "file":
        return (
          <div key={element.id} className="space-y-2">
            <Label>
              {element.label}
              {element.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleInputChange(element.id, file.name);
                }
              }}
            />
            {element.helpText && (
              <p className="text-sm text-muted-foreground">
                {element.helpText}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStepIndex + 1} of {sortedSteps.length}
              </span>
              <span>
                {Math.round(
                  ((currentStepIndex + 1) / sortedSteps.length) * 100,
                )}
                %
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStepIndex + 1) / sortedSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Current Step */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{currentStep.title}</h3>
              {currentStep.description && (
                <p className="text-sm text-muted-foreground">
                  {currentStep.description}
                </p>
              )}
            </div>

            {/* Form Elements */}
            <div className="space-y-4">
              {currentElements.map((element) => renderElement(element))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStepIndex < sortedSteps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Form"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
