import { useState } from "react";
import { Header } from "@/components/Header";
import { TemplateView } from "@/components/TemplateView";
import { BuilderView } from "@/components/BuilderView";
import { useTheme } from "@/hooks/useTheme";
import { useDraft } from "@/hooks/useDraft";

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<"template" | "builder">("builder");
  
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

  return (
    <div className="min-h-screen bg-background">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        view={view}
        onViewChange={setView}
      />

      <main>
        {view === "template" ? (
          <TemplateView />
        ) : (
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
      </main>
    </div>
  );
};

export default Index;
