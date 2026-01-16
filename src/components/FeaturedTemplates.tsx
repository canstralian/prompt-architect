import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { PromptTemplate, TemplateCategory } from "@/hooks/useTemplateLibrary";
import { Json } from "@/integrations/supabase/types";

interface FeaturedTemplatesProps {
  onUseTemplate: (sections: Record<string, string>, name: string) => void;
  onViewAll: () => void;
}

function parseSections(sections: Json): Record<string, string> {
  if (typeof sections === "object" && sections !== null && !Array.isArray(sections)) {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(sections)) {
      result[key] = typeof value === "string" ? value : "";
    }
    return result;
  }
  return {};
}

export function FeaturedTemplates({ onUseTemplate, onViewAll }: FeaturedTemplatesProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedTemplates();
  }, []);

  async function fetchFeaturedTemplates() {
    try {
      const { data, error } = await supabase
        .from("prompt_templates")
        .select("*")
        .eq("is_curated", true)
        .order("likes_count", { ascending: false })
        .limit(3);

      if (error) throw error;

      const mappedTemplates: PromptTemplate[] = (data || []).map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category as TemplateCategory,
        author: t.author,
        is_curated: t.is_curated,
        likes_count: t.likes_count,
        saves_count: t.saves_count,
        sections: parseSections(t.sections),
        tags: t.tags || [],
        created_at: t.created_at,
      }));

      setTemplates(mappedTemplates);
    } catch (error) {
      console.error("Error fetching featured templates:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold">Featured Templates</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1">
          View All
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => onUseTemplate(template.sections, template.name)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-medium line-clamp-1">
                  {template.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs capitalize shrink-0">
                  {template.category}
                </Badge>
              </div>
              <CardDescription className="text-xs line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>❤️ {template.likes_count}</span>
                <span>•</span>
                <span>by {template.author}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}