import { Lock, CheckCircle2, XCircle } from "lucide-react";
import { DefensiveElement } from "@/lib/purpleTeam";

interface DefensiveArchitecturePanelProps {
  elements: DefensiveElement[];
}

export function DefensiveArchitecturePanel({ elements }: DefensiveArchitecturePanelProps) {
  const presentCount = elements.filter((e) => e.present).length;
  const allPresent = presentCount === elements.length;

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b bg-secondary/30">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Defensive Architecture</h3>
        </div>
        <span
          className={`text-xs font-medium ${
            allPresent ? "text-success" : presentCount >= 5 ? "text-warning" : "text-destructive"
          }`}
        >
          {presentCount}/{elements.length} layers
        </span>
      </div>

      <ul className="divide-y">
        {elements.map((el) => (
          <li key={el.id} className="flex items-start gap-3 px-5 py-3">
            {el.present ? (
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <p className={`text-sm font-medium ${el.present ? "text-foreground" : "text-muted-foreground"}`}>
                {el.name}
              </p>
              {!el.present && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{el.hint}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {allPresent && (
        <div className="px-5 py-2.5 border-t bg-success/5 text-xs text-success font-medium">
          All 7 defensive layers present. Prompt hardened.
        </div>
      )}
    </div>
  );
}
