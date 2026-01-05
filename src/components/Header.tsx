import { Moon, Sun, FileText, Layers, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewType = "template" | "builder" | "library";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Header({ theme, onToggleTheme, view, onViewChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Layers className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Agent Prompt Builder</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              7-Section Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary rounded-lg p-1">
            <Button
              variant={view === "template" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("template")}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Template</span>
            </Button>
            <Button
              variant={view === "builder" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("builder")}
              className="gap-2"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Builder</span>
            </Button>
            <Button
              variant={view === "library" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("library")}
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="ml-2"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
