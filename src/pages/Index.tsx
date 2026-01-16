import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header, ViewType } from "@/components/Header";
import { TemplateView } from "@/components/TemplateView";
import { BuilderView } from "@/components/BuilderView";
import { LibraryView } from "@/components/LibraryView";
import { useTheme } from "@/hooks/useTheme";
import { useDraft } from "@/hooks/useDraft";
import { toast } from "sonner";

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<ViewType>("builder");
  const [searchParams] = useSearchParams();
  const [initialTemplateId, setInitialTemplateId] = useState<string | null>(null);
  
  // Check for template deep link on mount
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId) {
      setInitialTemplateId(templateId);
      setView("library");
    }
  }, [searchParams]);
  
  const {
    drafts,
    currentDraft,
    updateSection,
    updateName,
    loadDraft,
    newDraft,
    loadPreset,
    deleteDraft,
    renameDraft,
  } = useDraft();

  const handleUseLibraryTemplate = (sections: Record<string, string>, name: string) => {
    // Create a new draft with the template sections
    newDraft();
    Object.entries(sections).forEach(([key, value]) => {
      updateSection(key, value);
    });
    updateName(`${name} (Copy)`);
    setView("builder");
    toast.success(`Template "${name}" loaded into builder`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        view={view}
        onViewChange={setView}
      />

      <main>
        {view === "template" && <TemplateView />}
        {view === "builder" && (
          <BuilderView
            draft={currentDraft}
            drafts={drafts}
            onUpdateSection={updateSection}
            onUpdateName={updateName}
            onLoadDraft={loadDraft}
            onNewDraft={newDraft}
            onLoadPreset={loadPreset}
            onDeleteDraft={deleteDraft}
            onRenameDraft={renameDraft}
          />
        )}
        {view === "library" && (
          <LibraryView onUseTemplate={handleUseLibraryTemplate} initialTemplateId={initialTemplateId} />
        )}
      </main>
    </div>
  );
};

export default Index;
