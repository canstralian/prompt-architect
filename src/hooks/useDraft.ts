import { useState, useEffect, useCallback } from "react";
import { Draft, SECTIONS, PRESETS } from "@/lib/sectionData";
import {
  generateId,
  getDrafts,
  saveDraft,
  deleteDraft as deleteStoredDraft,
  renameDraft as renameStoredDraft,
  getCurrentDraftId,
  setCurrentDraftId,
} from "@/lib/storage";

const createEmptyDraft = (): Draft => ({
  id: generateId(),
  name: "Untitled Draft",
  updatedAt: new Date().toISOString(),
  sections: SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: "" }), {}),
});

export function useDraft() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [currentDraft, setCurrentDraft] = useState<Draft>(createEmptyDraft);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Load drafts on mount
  useEffect(() => {
    const loadedDrafts = getDrafts();
    setDrafts(loadedDrafts);

    const currentId = getCurrentDraftId();
    if (currentId) {
      const found = loadedDrafts.find((d) => d.id === currentId);
      if (found) {
        setCurrentDraft(found);
        return;
      }
    }

    // Use most recent draft or create new
    if (loadedDrafts.length > 0) {
      setCurrentDraft(loadedDrafts[0]);
      setCurrentDraftId(loadedDrafts[0].id);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const timer = setTimeout(() => {
      saveDraft(currentDraft);
      setDrafts(getDrafts());
      setCurrentDraftId(currentDraft.id);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentDraft, autoSaveEnabled]);

  const updateSection = useCallback((sectionId: string, value: string) => {
    setCurrentDraft((prev) => ({
      ...prev,
      sections: { ...prev.sections, [sectionId]: value },
    }));
  }, []);

  const updateName = useCallback((name: string) => {
    setCurrentDraft((prev) => ({ ...prev, name }));
  }, []);

  const loadDraft = useCallback((draft: Draft) => {
    setCurrentDraft(draft);
    setCurrentDraftId(draft.id);
  }, []);

  const newDraft = useCallback(() => {
    const draft = createEmptyDraft();
    setCurrentDraft(draft);
    setCurrentDraftId(draft.id);
  }, []);

  const loadPreset = useCallback((presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const draft: Draft = {
        id: generateId(),
        name: preset.name,
        updatedAt: new Date().toISOString(),
        sections: { ...preset.sections },
      };
      setCurrentDraft(draft);
      setCurrentDraftId(draft.id);
    }
  }, []);

  const deleteDraft = useCallback((id: string) => {
    deleteStoredDraft(id);
    setDrafts(getDrafts());
    if (currentDraft.id === id) {
      const remaining = getDrafts();
      if (remaining.length > 0) {
        setCurrentDraft(remaining[0]);
        setCurrentDraftId(remaining[0].id);
      } else {
        newDraft();
      }
    }
  }, [currentDraft.id, newDraft]);

  const renameDraft = useCallback((id: string, newName: string) => {
    renameStoredDraft(id, newName);
    setDrafts(getDrafts());
    if (currentDraft.id === id) {
      setCurrentDraft((prev) => ({ ...prev, name: newName }));
    }
  }, [currentDraft.id]);

  return {
    drafts,
    currentDraft,
    updateSection,
    updateName,
    loadDraft,
    newDraft,
    loadPreset,
    deleteDraft,
    renameDraft,
    autoSaveEnabled,
    setAutoSaveEnabled,
  };
}
