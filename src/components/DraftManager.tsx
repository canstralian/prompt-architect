import { useState } from "react";
import { format } from "date-fns";
import {
  FolderOpen,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Draft } from "@/lib/sectionData";

interface DraftManagerProps {
  drafts: Draft[];
  currentDraftId: string;
  onLoad: (draft: Draft) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function DraftManager({
  drafts,
  currentDraftId,
  onLoad,
  onNew,
  onDelete,
  onRename,
}: DraftManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startEditing = (draft: Draft) => {
    setEditingId(draft.id);
    setEditName(draft.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FolderOpen className="w-4 h-4" />
          Drafts
          {drafts.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-secondary rounded">
              {drafts.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuItem onClick={onNew} className="gap-2 cursor-pointer">
          <Plus className="w-4 h-4" />
          New Draft
        </DropdownMenuItem>

        {drafts.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className={`flex items-center gap-2 px-2 py-2 rounded-md transition-colors ${
                    currentDraftId === draft.id
                      ? "bg-accent"
                      : "hover:bg-secondary"
                  }`}
                >
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                  {editingId === draft.id ? (
                    <div className="flex-1 flex items-center gap-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={saveEdit}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={cancelEdit}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onLoad(draft)}
                        className="flex-1 text-left min-w-0"
                      >
                        <span className="block text-sm font-medium truncate">
                          {draft.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {format(new Date(draft.updatedAt), "MMM d, h:mm a")}
                        </span>
                      </button>
                      <div className="flex items-center gap-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(draft);
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(draft.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {drafts.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No saved drafts yet
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
