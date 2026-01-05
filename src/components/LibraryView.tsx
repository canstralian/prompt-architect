import { useState } from "react";
import { Search, Filter, Loader2, BookOpen, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TemplateCard } from "@/components/TemplateCard";
import { useTemplateLibrary, PromptTemplate, TemplateCategory } from "@/hooks/useTemplateLibrary";
import { SECTIONS } from "@/lib/sectionData";

interface LibraryViewProps {
  onUseTemplate: (sections: Record<string, string>, name: string) => void;
}

export function LibraryView({ onUseTemplate }: LibraryViewProps) {
  const {
    templates,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
  } = useTemplateLibrary();

  const [previewTemplate, setPreviewTemplate] = useState<PromptTemplate | null>(null);

  function handleUseTemplate(template: PromptTemplate) {
    onUseTemplate(template.sections, template.name);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Template Library</h2>
            <p className="text-sm text-muted-foreground">
              Browse and use curated prompt templates
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filters */}
      <ScrollArea className="w-full mb-6">
        <div className="flex gap-2 pb-2">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className="shrink-0"
            >
              {cat.label}
              <Badge 
                variant="secondary" 
                className={`ml-2 text-xs ${
                  selectedCategory === cat.value 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : ""
                }`}
              >
                {cat.count}
              </Badge>
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && templates.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-xl">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Template Grid */}
      {!loading && !error && templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div 
              key={template.id} 
              onClick={() => setPreviewTemplate(template)}
              className="cursor-pointer"
            >
              <TemplateCard
                template={template}
                onUseTemplate={handleUseTemplate}
              />
            </div>
          ))}
        </div>
      )}

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewTemplate?.name}
              {previewTemplate?.is_curated && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Curated
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {SECTIONS.map((section) => {
                const content = previewTemplate?.sections[section.id];
                if (!content) return null;
                
                return (
                  <div key={section.id} className="glass-panel rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-primary mb-2">
                      {section.title}
                    </h4>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                      {content}
                    </pre>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (previewTemplate) {
                  handleUseTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }
              }}
            >
              Use This Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
