import { useState, useEffect } from "react";
import { Edit3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SECTIONS } from "@/lib/sectionData";
import { SectionEditor } from "./SectionEditor";
import { PresetSelector } from "./PresetSelector";
import { DraftManager } from "./DraftManager";
import { QualityChecklist } from "./QualityChecklist";
import { Preview } from "./Preview";
import { OnboardingTip } from "./OnboardingTip";
import { FeaturedTemplates } from "./FeaturedTemplates";
import { Draft } from "@/lib/sectionData";
import { isFirstVisit, markVisited } from "@/lib/storage";

interface BuilderViewProps {
  draft: Draft;
  drafts: Draft[];
  onUpdateSection: (sectionId: string, value: string) => void;
  onUpdateName: (name: string) => void;
  onLoadDraft: (draft: Draft) => void;
  onNewDraft: () => void;
  onLoadPreset: (presetId: string) => void;
  onDeleteDraft: (id: string) => void;
  onRenameDraft: (id: string, name: string) => void;
  onUseTemplate?: (sections: Record<string, string>, name: string) => void;
  onViewLibrary?: () => void;
}

export function BuilderView({
  draft,
  drafts,
  onUpdateSection,
  onUpdateName,
  onLoadDraft,
  onNewDraft,
  onLoadPreset,
  onDeleteDraft,
  onRenameDraft,
  onUseTemplate,
  onViewLibrary,
}: BuilderViewProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isFirstVisit()) {
      setShowOnboarding(true);
    }
  }, []);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    markVisited();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {showOnboarding && <OnboardingTip onDismiss={dismissOnboarding} />}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
        {/* Main form */}
        <div className="space-y-6">
          {/* Header with draft name and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              {isEditingName ? (
                <Input
                  value={draft.name}
                  onChange={(e) => onUpdateName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                  className="text-xl font-semibold"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="flex items-center gap-2 text-xl font-semibold hover:text-primary transition-colors group"
                >
                  {draft.name}
                  <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Auto-saving • {SECTIONS.filter((s) => draft.sections[s.id]?.trim()).length}/{SECTIONS.length} sections filled
              </p>
            </div>

            <div className="flex items-center gap-2">
              <PresetSelector onSelect={onLoadPreset} />
              <DraftManager
                drafts={drafts}
                currentDraftId={draft.id}
                onLoad={onLoadDraft}
                onNew={onNewDraft}
                onDelete={onDeleteDraft}
                onRename={onRenameDraft}
              />
            </div>
          </div>

          {/* Section editors */}
          <div className="space-y-4">
            {SECTIONS.map((section, index) => (
              <div
                key={section.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SectionEditor
                  section={section}
                  value={draft.sections[section.id] || ""}
                  onChange={(value) => onUpdateSection(section.id, value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar with preview and checklist */}
        <aside className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <QualityChecklist sections={draft.sections} />
            <Preview sections={draft.sections} draftName={draft.name} />
            {onUseTemplate && onViewLibrary && (
              <FeaturedTemplates 
                onUseTemplate={onUseTemplate} 
                onViewAll={onViewLibrary} 
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
