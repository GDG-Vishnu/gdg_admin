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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Types ---

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
  options?: string[]; // For select, radio
  defaultValue?: string | boolean | number;
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

// --- Sub-Components ---

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
        isSelected && "ring-2 ring-primary"
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
                {element.required && <span className="text-destructive ml-1">*</span>}
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
              <SelectValue placeholder={element.placeholder || "Select option"} />
            </SelectTrigger>
          </Select>
        )}
        {element.type === "checkbox" && (
            <div className="flex items-center space-x-2">
                <Checkbox disabled id={`check-${element.id}`} />
                <label htmlFor={`check-${element.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
            <Button variant="outline" className="w-full justify-start text-left font-normal" disabled>
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Pick a date</span>
            </Button>
        )}
        {element.type === "number" && (
             <Input type="number" placeholder={element.placeholder} disabled />
        )}
        {element.type === "file" && (
             <Input type="file" disabled />
        )}
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

// --- Main Component ---

export default function FormBuilder() {
  const [elements, setElements] = useState<FormElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [formName, setFormName] = useState("Untitled Form");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [draggedSidebarItem, setDraggedSidebarItem] = useState<ElementType | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
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

    // Drop from sidebar
    if (active.data.current?.isSidebar) {
        const type = active.data.current.type as ElementType;
        const newElement: FormElement = {
            id: crypto.randomUUID(),
            type,
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            placeholder: "Placeholder text...",
            required: false,
            options: type === 'radio' || type === 'select' ? ["Option 1", "Option 2"] : undefined,
        };

       if (over.id === 'canvas-droppable') {
           setElements((prev) => [...prev, newElement]);
           setSelectedElementId(newElement.id);
       } else {
            // Drop over existing item (insert index)
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

    // Reorder existing
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
      setElements((prev) => prev.map((el) => el.id === selectedElementId ? { ...el, ...updates } : el));
  };
  
  const deleteElement = (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id));
      if (selectedElementId === id) setSelectedElementId(null);
      toast.success("Element deleted");
  };

  const duplicateElement = (id: string) => {
      const el = elements.find(e => e.id === id);
      if(!el) return;
      const newEl = { ...el, id: crypto.randomUUID(), label: `${el.label} (Copy)` };
      setElements(prev => [...prev, newEl]);
      setSelectedElementId(newEl.id);
      toast.success("Element duplicated");
  };

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
                        <DialogDescription>Preview of your generated form.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 p-4 border rounded-md">
                         <div className="space-y-6 max-w-xl mx-auto">
                            {elements.map((el) => (
                                <div key={el.id} className="space-y-2">
                                     <Label>
                                        {el.label}
                                        {el.required && <span className="text-destructive ml-1">*</span>}
                                     </Label>
                                     {el.type === 'text' && <Input placeholder={el.placeholder} required={el.required} />}
                                     {el.type === 'textarea' && <Textarea placeholder={el.placeholder} required={el.required} />}
                                     {el.type === 'select' && (
                                         <Select required={el.required}>
                                             <SelectTrigger><SelectValue placeholder={el.placeholder}/></SelectTrigger>
                                             <SelectContent>
                                                 {(el.options || []).map(opt => (
                                                     <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                 ))}
                                             </SelectContent>
                                         </Select>
                                     )}
                                     {el.type === 'checkbox' && (
                                         <div className="flex items-center space-x-2">
                                             <Checkbox id={`preview-${el.id}`} required={el.required} />
                                             <label htmlFor={`preview-${el.id}`}>{el.label}</label>
                                         </div>
                                     )}
                                     {el.type === 'radio' && (
                                          <RadioGroup required={el.required}>
                                               {(el.options || []).map((opt, i) => (
                                                   <div key={i} className="flex items-center space-x-2">
                                                       <RadioGroupItem value={opt} id={`preview-r-${el.id}-${i}`} />
                                                       <Label htmlFor={`preview-r-${el.id}-${i}`}>{opt}</Label>
                                                   </div>
                                               ))}
                                          </RadioGroup>
                                     )}
                                </div>
                            ))}
                         </div>
                    </ScrollArea>
                    <DialogFooter>
                         <Button onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => {
                    const json = JSON.stringify({ formName, elements }, null, 2);
                    navigator.clipboard.writeText(json);
                    toast.success("Copied to clipboard");
                }}
            >
                <Copy className="h-4 w-4" /> Copy JSON
            </Button>
            
            <Button size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Palette */}
          <aside className="w-64 border-r bg-muted/30 flex flex-col">
            <div className="p-4 border-b bg-background/50">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Components</h2>
                <p className="text-xs text-muted-foreground">Drag items to the canvas</p>
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
                     <SortableContext 
                        items={elements.map(e => e.id)} 
                        strategy={verticalListSortingStrategy}
                     >
                        <div 
                             className="space-y-4 min-h-[200px]"
                             id="canvas-droppable"
                        >
                            {elements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
                                     <div className="p-4 bg-background rounded-full mb-4 shadow-sm">
                                         <Plus className="h-8 w-8 text-primary"/>
                                     </div>
                                     <h3 className="text-lg font-medium">Start Building</h3>
                                     <p className="text-sm">Drag components from the sidebar to here</p>
                                </div>
                            ) : (
                                elements.map((element) => (
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
                             <p className="text-xs text-muted-foreground">Edit component settings</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedElementId(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                     </div>
                     <ScrollArea className="flex-1 p-5">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Field Label</Label>
                                <Input 
                                    value={selectedElement.label} 
                                    onChange={(e) => updateSelectedElement({ label: e.target.value })} 
                                />
                            </div>
                            
                            {(selectedElement.type === 'text' || selectedElement.type === 'textarea' || selectedElement.type === 'number' || selectedElement.type === 'select') && (
                                 <div className="space-y-2">
                                     <Label>Placeholder</Label>
                                     <Input 
                                         value={selectedElement.placeholder || ''} 
                                         onChange={(e) => updateSelectedElement({ placeholder: e.target.value })} 
                                     />
                                 </div>
                            )}

                             <div className="space-y-2">
                                <Label>Helper Text</Label>
                                <Input 
                                    value={selectedElement.helpText || ''} 
                                    onChange={(e) => updateSelectedElement({ helpText: e.target.value })} 
                                    placeholder="Brief description for user"
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <Label>Required Field</Label>
                                <Switch 
                                    checked={selectedElement.required}
                                    onCheckedChange={(c) => updateSelectedElement({ required: c })}
                                />
                            </div>

                            {(selectedElement.type === 'select' || selectedElement.type === 'radio') && (
                                <div className="space-y-3">
                                    <Separator />
                                    <Label>Options</Label>
                                    <div className="space-y-2">
                                        {(selectedElement.options || []).map((opt, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <Input 
                                                    value={opt} 
                                                    onChange={(e) => {
                                                        const newOpts = [...(selectedElement.options || [])];
                                                        newOpts[idx] = e.target.value;
                                                        updateSelectedElement({ options: newOpts });
                                                    }}
                                                />
                                                <Button 
                                                    variant="ghost" size="icon"
                                                    onClick={() => {
                                                         const newOpts = (selectedElement.options || []).filter((_, i) => i !== idx);
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
                                            onClick={() => updateSelectedElement({ options: [...(selectedElement.options || []), `Option ${(selectedElement.options?.length || 0) + 1}`] })}
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
                     <p className="text-sm max-w-[200px]">Select an element on the canvas to edit its properties.</p>
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
                             {ELEMENT_TYPES.find(e => e.type === draggedSidebarItem)?.label}
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

