import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useSavedTemplates() {
  const { user } = useAuth();
  const [savedTemplateIds, setSavedTemplateIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSavedTemplates();
    } else {
      setSavedTemplateIds(new Set());
    }
  }, [user]);

  async function fetchSavedTemplates() {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('user_saved_templates')
      .select('template_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching saved templates:', error);
    } else {
      setSavedTemplateIds(new Set(data.map(d => d.template_id)));
    }
    setLoading(false);
  }

  async function saveTemplate(templateId: string) {
    if (!user) {
      toast.error('Please sign in to save templates');
      return false;
    }

    const { error } = await supabase
      .from('user_saved_templates')
      .insert({ user_id: user.id, template_id: templateId });

    if (error) {
      if (error.code === '23505') {
        toast.error('Template already saved');
      } else if (error.message?.includes('Rate limit exceeded')) {
        toast.error('Too many saves! Please slow down.');
      } else {
        toast.error('Failed to save template');
      }
      return false;
    }

    setSavedTemplateIds(prev => new Set([...prev, templateId]));
    toast.success('Template saved!');
    return true;
  }

  async function unsaveTemplate(templateId: string) {
    if (!user) return false;

    const { error } = await supabase
      .from('user_saved_templates')
      .delete()
      .eq('user_id', user.id)
      .eq('template_id', templateId);

    if (error) {
      toast.error('Failed to unsave template');
      return false;
    }

    setSavedTemplateIds(prev => {
      const next = new Set(prev);
      next.delete(templateId);
      return next;
    });
    toast.success('Template removed from saved');
    return true;
  }

  function isTemplateSaved(templateId: string) {
    return savedTemplateIds.has(templateId);
  }

  return {
    savedTemplateIds,
    loading,
    saveTemplate,
    unsaveTemplate,
    isTemplateSaved,
    refetch: fetchSavedTemplates
  };
}
