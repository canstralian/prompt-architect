import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TemplateCategory } from "@/hooks/useTemplateLibrary";
import { SECTIONS } from "@/lib/sectionData";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type TemplateCategoryEnum = Database["public"]["Enums"]["template_category"];

const CATEGORIES: { value: TemplateCategoryEnum; label: string }[] = [
  { value: "coding", label: "Coding" },
  { value: "research", label: "Research" },
  { value: "writing", label: "Writing" },
  { value: "automation", label: "Automation" },
  { value: "analysis", label: "Analysis" },
  { value: "planning", label: "Planning" },
  { value: "creative", label: "Creative" },
  { value: "other", label: "Other" },
];

export interface DuplicateTemplateData {
  name: string;
  description: string;
  category: TemplateCategoryEnum;
  tags: string[];
  sections: Record<string, string>;
}

interface CreateTemplateDialogProps {
  onCreated: () => void;
  duplicateData?: DuplicateTemplateData | null;
  onDuplicateHandled?: () => void;
}

export function CreateTemplateDialog({ onCreated, duplicateData, onDuplicateHandled }: CreateTemplateDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategoryEnum>("other");
  const [tags, setTags] = useState("");
  const [sections, setSections] = useState<Record<string, string>>({});

  // Handle duplicate data - open dialog pre-filled
  useState(() => {
    if (duplicateData) {
      setName(`${duplicateData.name} (Copy)`);
      setDescription(duplicateData.description);
      setCategory(duplicateData.category);
      setTags(duplicateData.tags.join(", "));
      setSections({ ...duplicateData.sections });
      setOpen(true);
      onDuplicateHandled?.();
    }
  });

  const handleSectionChange = (sectionId: string, value: string) => {
    setSections((prev) => ({ ...prev, [sectionId]: value }));
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("other");
    setTags("");
    setSections({});
  };

  const MAX_NAME = 200;
  const MAX_DESC = 2000;
  const MAX_TAGS = 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to create a template");
      return;
    }

    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in name and description");
      return;
    }

    if (name.trim().length > MAX_NAME) {
      toast.error(`Name must be ${MAX_NAME} characters or less`);
      return;
    }

    if (description.trim().length > MAX_DESC) {
      toast.error(`Description must be ${MAX_DESC} characters or less`);
      return;
    }

    const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tagArray.length > MAX_TAGS) {
      toast.error(`Maximum ${MAX_TAGS} tags allowed`);
      return;
    }

    // Check that at least one section has content
    const hasContent = Object.values(sections).some((v) => v.trim());
    if (!hasContent) {
      toast.error("Please fill in at least one section");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("prompt_templates").insert({
      name: name.trim(),
      description: description.trim(),
      category,
      tags: tagArray,
      sections,
    });

    setSubmitting(false);

    if (error) {
      console.error("Error creating template:", error);
      if (error.message?.includes("Rate limit exceeded")) {
        toast.error("You've reached the limit of 10 templates per hour. Please try again later.");
      } else {
        toast.error("Failed to create template");
      }
      return;
    }

    toast.success("Template created and shared with the community!");
    resetForm();
    setOpen(false);
    onCreated();
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Share your prompt template with the community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Template"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategoryEnum)} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this template is for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="AI, coding, productivity"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="space-y-3">
            <Label>Sections</Label>
            {SECTIONS.map((section) => (
              <div key={section.id} className="space-y-1">
                <Label htmlFor={section.id} className="text-sm text-muted-foreground">
                  {section.title}
                </Label>
                <Textarea
                  id={section.id}
                  placeholder={section.placeholder}
                  value={sections[section.id] || ""}
                  onChange={(e) => handleSectionChange(section.id, e.target.value)}
                  disabled={submitting}
                  rows={3}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create & Share"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
