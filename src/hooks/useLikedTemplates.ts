import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useLikedTemplates() {
  const { user } = useAuth();
  const [likedTemplateIds, setLikedTemplateIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchLikedTemplates = useCallback(async () => {
    if (!user) {
      setLikedTemplateIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_template_likes")
        .select("template_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setLikedTemplateIds(new Set(data?.map((item) => item.template_id) || []));
    } catch (error) {
      console.error("Error fetching liked templates:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLikedTemplates();
  }, [fetchLikedTemplates]);

  const toggleLike = async (templateId: string) => {
    if (!user) {
      toast.error("Please sign in to like templates");
      return;
    }

    const isCurrentlyLiked = likedTemplateIds.has(templateId);

    // Optimistic update
    setLikedTemplateIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyLiked) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });

    try {
      if (isCurrentlyLiked) {
        const { error } = await supabase
          .from("user_template_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("template_id", templateId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_template_likes")
          .insert({ user_id: user.id, template_id: templateId });

        if (error) throw error;
      }
    } catch (error: any) {
      // Revert optimistic update
      setLikedTemplateIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyLiked) {
          next.add(templateId);
        } else {
          next.delete(templateId);
        }
        return next;
      });
      console.error("Error toggling like:", error);
      if (error?.message?.includes("Rate limit exceeded")) {
        toast.error("Too many likes! Please slow down.");
      } else {
        toast.error("Failed to update like");
      }
    }
  };

  const isLiked = (templateId: string) => likedTemplateIds.has(templateId);

  return {
    likedTemplateIds,
    loading,
    toggleLike,
    isLiked,
    refetch: fetchLikedTemplates,
  };
}
