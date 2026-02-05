import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Loader2, BookOpen, Sparkles, Bookmark, TrendingUp, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TemplateCard } from "@/components/TemplateCard";
import { CreateTemplateDialog } from "@/components/CreateTemplateDialog";
 import { EditTemplateDialog } from "@/components/EditTemplateDialog";
import { useTemplateLibrary, PromptTemplate } from "@/hooks/useTemplateLibrary";
import { useSavedTemplates } from "@/hooks/useSavedTemplates";
import { useLikedTemplates } from "@/hooks/useLikedTemplates";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SECTIONS } from "@/lib/sectionData";
interface LibraryViewProps {
  onUseTemplate: (sections: Record<string, string>, name: string) => void;
}

interface LibraryViewPropsWithDeepLink extends LibraryViewProps {
  initialTemplateId?: string | null;
}

export function LibraryView({ onUseTemplate, initialTemplateId }: LibraryViewPropsWithDeepLink) {
  const { user } = useAuth();
  const {
    templates,
    loading,
    loadingMore,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    refetch: refetchTemplates,
    loadMore,
    hasMore,
    totalCount,
  } = useTemplateLibrary();

  const {
    isTemplateSaved,
    saveTemplate,
    unsaveTemplate,
  } = useSavedTemplates();

  const {
    isLiked,
    toggleLike,
    refetch: refetchLikes,
  } = useLikedTemplates();

  const [previewTemplate, setPreviewTemplate] = useState<PromptTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
  const [sortBy, setSortBy] = useState<"popular" | "recent">("popular");
  const [searchParams, setSearchParams] = useSearchParams();
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
   const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

  // Fetch user's display name for delete permission check
  useEffect(() => {
    async function fetchDisplayName() {
      if (!user) {
        setUserDisplayName(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      setUserDisplayName(data?.display_name || null);
    }
    fetchDisplayName();
  }, [user]);

  // Handle deep linking - open template from URL parameter
  useEffect(() => {
    const templateIdFromUrl = searchParams.get("template") || initialTemplateId;
    if (templateIdFromUrl && templates.length > 0 && !loading) {
      const template = templates.find(t => t.id === templateIdFromUrl);
      if (template) {
        setPreviewTemplate(template);
        // Clear the URL parameter after opening
        if (searchParams.has("template")) {
          searchParams.delete("template");
          setSearchParams(searchParams, { replace: true });
        }
      }
    }
  }, [templates, loading, searchParams, initialTemplateId, setSearchParams]);

  function handleUseTemplate(template: PromptTemplate) {
    onUseTemplate(template.sections, template.name);
  }

  function handleToggleSave(templateId: string, isSaved: boolean) {
    if (isSaved) {
      unsaveTemplate(templateId);
    } else {
      saveTemplate(templateId);
    }
  }

  async function handleDeleteTemplate(templateId: string) {
    const { error } = await supabase
      .from("prompt_templates")
      .delete()
      .eq("id", templateId);

    if (error) {
      toast.error("Failed to delete template");
      console.error("Error deleting template:", error);
    } else {
      toast.success("Template deleted successfully");
      refetchTemplates();
    }
  }

  function canDeleteTemplate(template: PromptTemplate): boolean {
    return !!userDisplayName && template.author === userDisplayName;
  }
 
   function canEditTemplate(template: PromptTemplate): boolean {
     return !!userDisplayName && template.author === userDisplayName;
   }
 
   function handleEditTemplate(template: PromptTemplate) {
     setEditingTemplate(template);
   }

  const filteredByTab = activeTab === "saved" 
    ? templates.filter(t => isTemplateSaved(t.id))
    : templates;

  const displayedTemplates = [...filteredByTab].sort((a, b) => {
    if (sortBy === "popular") {
      return b.likes_count - a.likes_count;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Only enable infinite scroll for "all" tab
  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: hasMore && activeTab === "all",
    isLoading: loadingMore,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Template Library</h2>
            <p className="text-sm text-muted-foreground">
              Browse, save, and share prompt templates
            </p>
          </div>
        </div>
        <CreateTemplateDialog onCreated={refetchTemplates} />
      </div>

      {/* Tabs for All / Saved */}
      {user && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "saved")} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="w-4 h-4" />
              Saved
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

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
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "popular" | "recent")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Most Popular
              </div>
            </SelectItem>
            <SelectItem value="recent">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Most Recent
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
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
      {!loading && !error && displayedTemplates.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-xl">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {activeTab === "saved" ? "No saved templates" : "No templates found"}
          </h3>
          <p className="text-muted-foreground">
            {activeTab === "saved" 
              ? "Save templates to access them quickly later" 
              : "Try adjusting your search or filter criteria"}
          </p>
        </div>
      )}

      {/* Template Grid */}
      {!loading && !error && displayedTemplates.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedTemplates.map((template) => (
              <div 
                key={template.id} 
                onClick={() => setPreviewTemplate(template)}
                className="cursor-pointer"
              >
                <TemplateCard
                  template={template}
                  onUseTemplate={handleUseTemplate}
                  isSaved={isTemplateSaved(template.id)}
                  onToggleSave={user ? handleToggleSave : undefined}
                  isLiked={isLiked(template.id)}
                  onToggleLike={user ? toggleLike : undefined}
                  canDelete={canDeleteTemplate(template)}
                  onDelete={handleDeleteTemplate}
                   canEdit={canEditTemplate(template)}
                   onEdit={handleEditTemplate}
                />
              </div>
            ))}
          </div>

          {/* Infinite scroll trigger and load more button */}
          {activeTab === "all" && (
            <div ref={loadMoreRef} className="flex flex-col items-center gap-3 py-8">
              {loadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading more templates...</span>
                </div>
              )}
              {!loadingMore && hasMore && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={loadMore}
                    className="gap-2"
                  >
                    Load More Templates
                  </Button>
                  <p className="text-xs text-muted-foreground">or scroll to load automatically</p>
                </>
              )}
              {!hasMore && templates.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Showing all {totalCount} templates
                </p>
              )}
            </div>
          )}
        </>
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
 
       {/* Edit Template Dialog */}
       {editingTemplate && (
         <EditTemplateDialog
           template={editingTemplate}
           open={!!editingTemplate}
           onOpenChange={(open) => !open && setEditingTemplate(null)}
           onUpdated={() => {
             refetchTemplates();
             setEditingTemplate(null);
           }}
         />
       )}
    </div>
  );
}
