import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export type TemplateCategory = 
  | "coding"
  | "research"
  | "writing"
  | "automation"
  | "analysis"
  | "planning"
  | "creative"
  | "other";

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  author: string;
  is_curated: boolean;
  likes_count: number;
  saves_count: number;
  sections: Record<string, string>;
  tags: string[];
  created_at: string;
}

export function useTemplateLibrary() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("prompt_templates")
        .select("*")
        .order("likes_count", { ascending: false });

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setLoading(false);
    }
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

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  const categories = useMemo((): { value: TemplateCategory | "all"; label: string; count: number }[] => {
    const counts: Record<string, number> = {};
    templates.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    const allCategories: { value: TemplateCategory | "all"; label: string; count: number }[] = [
      { value: "all" as const, label: "All Templates", count: templates.length },
      { value: "coding" as const, label: "Coding", count: counts["coding"] || 0 },
      { value: "research" as const, label: "Research", count: counts["research"] || 0 },
      { value: "writing" as const, label: "Writing", count: counts["writing"] || 0 },
      { value: "automation" as const, label: "Automation", count: counts["automation"] || 0 },
      { value: "analysis" as const, label: "Analysis", count: counts["analysis"] || 0 },
      { value: "planning" as const, label: "Planning", count: counts["planning"] || 0 },
      { value: "creative" as const, label: "Creative", count: counts["creative"] || 0 },
      { value: "other" as const, label: "Other", count: counts["other"] || 0 },
    ];
    return allCategories.filter((c) => c.value === "all" || c.count > 0);
  }, [templates]);

  return {
    templates: filteredTemplates,
    allTemplates: templates,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    refetch: fetchTemplates,
  };
}
