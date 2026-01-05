import { Draft } from "./sectionData";

const STORAGE_KEY = "prompt-builder-drafts";
const CURRENT_DRAFT_KEY = "prompt-builder-current";
const FIRST_VISIT_KEY = "prompt-builder-first-visit";

export function generateId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getDrafts(): Draft[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDraft(draft: Draft): void {
  const drafts = getDrafts();
  const existingIndex = drafts.findIndex((d) => d.id === draft.id);
  
  if (existingIndex >= 0) {
    drafts[existingIndex] = { ...draft, updatedAt: new Date().toISOString() };
  } else {
    drafts.unshift({ ...draft, updatedAt: new Date().toISOString() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function deleteDraft(id: string): void {
  const drafts = getDrafts().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function renameDraft(id: string, newName: string): void {
  const drafts = getDrafts();
  const draft = drafts.find((d) => d.id === id);
  if (draft) {
    draft.name = newName;
    draft.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }
}

export function getCurrentDraftId(): string | null {
  return localStorage.getItem(CURRENT_DRAFT_KEY);
}

export function setCurrentDraftId(id: string | null): void {
  if (id) {
    localStorage.setItem(CURRENT_DRAFT_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_DRAFT_KEY);
  }
}

export function isFirstVisit(): boolean {
  return !localStorage.getItem(FIRST_VISIT_KEY);
}

export function markVisited(): void {
  localStorage.setItem(FIRST_VISIT_KEY, "true");
}
