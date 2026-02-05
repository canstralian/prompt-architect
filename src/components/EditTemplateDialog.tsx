 import { useState, useEffect } from "react";
 import { Loader2, Pencil } from "lucide-react";
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
 } from "@/components/ui/dialog";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { supabase } from "@/integrations/supabase/client";
 import { PromptTemplate } from "@/hooks/useTemplateLibrary";
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
 
 interface EditTemplateDialogProps {
   template: PromptTemplate;
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onUpdated: () => void;
 }
 
 export function EditTemplateDialog({ template, open, onOpenChange, onUpdated }: EditTemplateDialogProps) {
   const [submitting, setSubmitting] = useState(false);
 
   const [name, setName] = useState(template.name);
   const [description, setDescription] = useState(template.description);
   const [category, setCategory] = useState<TemplateCategoryEnum>(template.category);
   const [tags, setTags] = useState(template.tags.join(", "));
   const [sections, setSections] = useState<Record<string, string>>(
     template.sections as Record<string, string>
   );
 
   // Reset form when template changes
   useEffect(() => {
     setName(template.name);
     setDescription(template.description);
     setCategory(template.category);
     setTags(template.tags.join(", "));
     setSections(template.sections as Record<string, string>);
   }, [template]);
 
   const handleSectionChange = (sectionId: string, value: string) => {
     setSections((prev) => ({ ...prev, [sectionId]: value }));
   };
 
   const MAX_NAME = 200;
   const MAX_DESC = 2000;
   const MAX_TAGS = 20;
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
 
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
 
     const hasContent = Object.values(sections).some((v) => v.trim());
     if (!hasContent) {
       toast.error("Please fill in at least one section");
       return;
     }
 
     setSubmitting(true);
 
     const { error } = await supabase
       .from("prompt_templates")
       .update({
         name: name.trim(),
         description: description.trim(),
         category,
         tags: tagArray,
         sections,
       })
       .eq("id", template.id);
 
     setSubmitting(false);
 
     if (error) {
       console.error("Error updating template:", error);
       toast.error("Failed to update template");
       return;
     }
 
     toast.success("Template updated successfully!");
     onOpenChange(false);
     onUpdated();
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <Pencil className="w-5 h-5" />
             Edit Template
           </DialogTitle>
           <DialogDescription>
             Update your template details
           </DialogDescription>
         </DialogHeader>
 
         <form onSubmit={handleSubmit} className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="edit-name">Template Name</Label>
               <Input
                 id="edit-name"
                 placeholder="My Awesome Template"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 disabled={submitting}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="edit-category">Category</Label>
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
             <Label htmlFor="edit-description">Description</Label>
             <Textarea
               id="edit-description"
               placeholder="Describe what this template is for..."
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               disabled={submitting}
               rows={2}
             />
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
             <Input
               id="edit-tags"
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
                 <Label htmlFor={`edit-${section.id}`} className="text-sm text-muted-foreground">
                   {section.title}
                 </Label>
                 <Textarea
                   id={`edit-${section.id}`}
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
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
               Cancel
             </Button>
             <Button type="submit" disabled={submitting}>
               {submitting ? (
                 <>
                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                   Saving...
                 </>
               ) : (
                 "Save Changes"
               )}
             </Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>
   );
 }