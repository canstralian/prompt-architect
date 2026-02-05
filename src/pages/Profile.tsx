import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Camera, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TemplateCard } from "@/components/TemplateCard";
 import { EditTemplateDialog } from "@/components/EditTemplateDialog";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userTemplates, setUserTemplates] = useState<PromptTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [savedTemplates, setSavedTemplates] = useState<PromptTemplate[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
   const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

  const MAX_DISPLAY_NAME_LENGTH = 100;

  function handleDisplayNameChange(value: string) {
    setDisplayName(value);
    if (value.length > MAX_DISPLAY_NAME_LENGTH) {
      setDisplayNameError(`Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or less`);
    } else if (value.length > 0 && value.trim().length === 0) {
      setDisplayNameError("Display name cannot be only whitespace");
    } else {
      setDisplayNameError(null);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserTemplates();
      fetchSavedTemplates();
    }
  }, [user]);

  async function fetchProfile() {
    if (!user) return;
    
    setLoadingProfile(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else if (data) {
      setDisplayName(data.display_name || "");
      setAvatarUrl(data.avatar_url || null);
    }
    setLoadingProfile(false);
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
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

  async function fetchSavedTemplates() {
    if (!user) return;

    setLoadingSaved(true);
    
    // First get the saved template IDs
    const { data: savedData, error: savedError } = await supabase
      .from("user_saved_templates")
      .select("template_id")
      .eq("user_id", user.id);

    if (savedError) {
      console.error("Error fetching saved templates:", savedError);
      setLoadingSaved(false);
      return;
    }

    if (!savedData || savedData.length === 0) {
      setSavedTemplates([]);
      setLoadingSaved(false);
      return;
    }

    const templateIds = savedData.map((s) => s.template_id);
    
    // Then fetch the actual templates
    const { data: templatesData, error: templatesError } = await supabase
      .from("prompt_templates")
      .select("*")
      .in("id", templateIds);

    if (templatesError) {
      console.error("Error fetching template details:", templatesError);
    } else {
      const mappedTemplates: PromptTemplate[] = (templatesData || []).map((t) => ({
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
      setSavedTemplates(mappedTemplates);
    }
    setLoadingSaved(false);
  }

  async function handleSaveProfile() {
    if (!user) return;

    // Validate before saving
    if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
      toast.error(`Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or less`);
      return;
    }

    if (displayName.length > 0 && displayName.trim().length === 0) {
      toast.error("Display name cannot be only whitespace");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } else {
      toast.success("Profile updated successfully");
    }
    setSaving(false);
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
      setUserTemplates((prev) => prev.filter((t) => t.id !== templateId));
    }
  }

  async function handleUnsaveTemplate(templateId: string) {
    const { error } = await supabase
      .from("user_saved_templates")
      .delete()
      .eq("user_id", user!.id)
      .eq("template_id", templateId);

    if (error) {
      toast.error("Failed to remove from saved");
      console.error("Error unsaving template:", error);
    } else {
      toast.success("Removed from saved templates");
      setSavedTemplates((prev) => prev.filter((t) => t.id !== templateId));
    }
  }
 
   function handleEditTemplate(template: PromptTemplate) {
     setEditingTemplate(template);
   }
 
   function handleTemplateUpdated() {
     fetchUserTemplates();
     setEditingTemplate(null);
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
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl || undefined} alt="Profile avatar" />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {displayName.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Profile Picture</p>
                <p className="text-xs text-muted-foreground">
                  Click the camera icon to upload a new avatar
                </p>
              </div>
            </div>

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
              <div className="flex items-center justify-between">
                <Label htmlFor="displayName">Display Name</Label>
                <span className={`text-xs ${displayName.length > MAX_DISPLAY_NAME_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {displayName.length}/{MAX_DISPLAY_NAME_LENGTH}
                </span>
              </div>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                placeholder="Enter your display name"
                className={displayNameError ? "border-destructive" : ""}
                maxLength={MAX_DISPLAY_NAME_LENGTH + 10}
              />
              {displayNameError && (
                <p className="text-xs text-destructive">{displayNameError}</p>
              )}
            </div>
            <Button onClick={handleSaveProfile} disabled={saving || !!displayNameError}>
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
            <Tabs defaultValue="created" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="created">Created ({userTemplates.length})</TabsTrigger>
                <TabsTrigger value="saved" className="gap-2">
                  <Bookmark className="w-4 h-4" />
                  Saved ({savedTemplates.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="created">
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
                        canDelete={true}
                        onDelete={handleDeleteTemplate}
                         canEdit={true}
                         onEdit={handleEditTemplate}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="saved">
                {loadingSaved ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : savedTemplates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    You haven't saved any templates yet. Browse the Library and bookmark templates you like!
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {savedTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onUseTemplate={() => {}}
                        isSaved={true}
                        onToggleSave={() => handleUnsaveTemplate(template.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
         
         {/* Edit Template Dialog */}
         {editingTemplate && (
           <EditTemplateDialog
             template={editingTemplate}
             open={!!editingTemplate}
             onOpenChange={(open) => !open && setEditingTemplate(null)}
             onUpdated={handleTemplateUpdated}
           />
         )}
      </main>
    </div>
  );
}
