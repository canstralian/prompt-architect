import { useState } from "react";
import { Info, AlertTriangle, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SectionInfo } from "@/lib/sectionData";

interface SectionEditorProps {
  section: SectionInfo;
  value: string;
  onChange: (value: string) => void;
}

export function SectionEditor({ section, value, onChange }: SectionEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  const charCount = value.length;
  const sentenceCount = value.trim()
    ? value.split(/[.!?]+/).filter((s) => s.trim()).length
    : 0;

  const hasWarning =
    section.maxSentences && sentenceCount > section.maxSentences && value.trim();
  const isEmpty = !value.trim();
  const isValid = !isEmpty && !hasWarning;

  return (
    <div
      className={`bg-card border rounded-xl p-5 transition-all duration-200 ${
        isFocused ? "ring-2 ring-primary/50 border-primary" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Label htmlFor={section.id} className="text-base font-medium">
            {section.title}
          </Label>
          {section.required ? (
            <Badge variant="default" className="text-xs">
              Required
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Optional
            </Badge>
          )}
          {isValid && section.required && (
            <Check className="w-4 h-4 text-success" />
          )}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="View guidelines"
            >
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs p-4">
            <p className="font-medium mb-2">{section.description}</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {section.guidelines.map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{section.description}</p>

      <Textarea
        id={section.id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={section.placeholder}
        className="min-h-[120px] font-mono text-sm resize-y"
        aria-describedby={`${section.id}-hint`}
      />

      <div
        id={`${section.id}-hint`}
        className="flex items-center justify-between mt-2 text-xs"
      >
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">{charCount} characters</span>
          {section.maxSentences && (
            <span
              className={`flex items-center gap-1 ${
                hasWarning ? "text-warning" : "text-muted-foreground"
              }`}
            >
              {hasWarning && <AlertTriangle className="w-3 h-3" />}
              {sentenceCount}/{section.maxSentences} sentences
            </span>
          )}
        </div>

        {isEmpty && section.required && (
          <span className="text-destructive">Required field</span>
        )}
      </div>
    </div>
  );
}
