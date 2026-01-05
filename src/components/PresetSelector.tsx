import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRESETS } from "@/lib/sectionData";

interface PresetSelectorProps {
  onSelect: (presetId: string) => void;
}

export function PresetSelector({ onSelect }: PresetSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Load Preset
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {PRESETS.map((preset) => (
          <DropdownMenuItem
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className="flex flex-col items-start py-3 cursor-pointer"
          >
            <span className="font-medium">{preset.name}</span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {preset.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
