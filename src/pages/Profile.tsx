import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TemplateCard } from "@/components/TemplateCard";
import { PromptTemplate, TemplateCategory } from "@/hooks/useTemplateLibrary";
import { Json } from "@/integrations/supabase/types";

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

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userTemplates, setUserTemplates] = useState<PromptTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserTemplates();
    }
  }, [user]);

  async function fetchProfile() {
    if (!user) return;
    
    setLoadingProfile(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else if (data) {
      setDisplayName(data.display_name || "");
    }
    setLoadingProfile(false);
  }

  async function fetchUserTemplates() {
    if (!user) return;

    setLoadingTemplates(true);
    
    // First get the user's display name
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.display_name) {
      const { data, error } = await supabase
        .from("prompt_templates")
        .select("*")
        .eq("author", profile.display_name)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching templates:", error);
      } else {
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
        setUserTemplates(mappedTemplates);
      }
    }
    setLoadingTemplates(false);
  }

  async function handleSaveProfile() {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } else {
      toast.success("Profile updated successfully");
    }
    setSaving(false);
  }

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-panel border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold">Profile</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your display name and account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Templates</CardTitle>
            <CardDescription>
              Templates you've created and shared with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTemplates ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : userTemplates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                You haven't created any templates yet. Go to the Library to create your first template!
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {userTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUseTemplate={() => {}}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
