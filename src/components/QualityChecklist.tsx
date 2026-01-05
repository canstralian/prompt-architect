import { Check, X, AlertTriangle } from "lucide-react";
import { SECTIONS } from "@/lib/sectionData";

interface QualityChecklistProps {
  sections: Record<string, string>;
}

interface CheckItem {
  id: string;
  label: string;
  check: (sections: Record<string, string>) => boolean;
  severity: "error" | "warning";
}

const CHECKS: CheckItem[] = [
  {
    id: "role-present",
    label: "Role section is defined",
    check: (s) => !!s.role?.trim(),
    severity: "error",
  },
  {
    id: "role-concise",
    label: "Role is concise (≤3 sentences)",
    check: (s) => {
      if (!s.role?.trim()) return true;
      const sentences = s.role.split(/[.!?]+/).filter((x) => x.trim()).length;
      return sentences <= 3;
    },
    severity: "warning",
  },
  {
    id: "constraints-present",
    label: "Constraints are defined",
    check: (s) => !!s.constraints?.trim(),
    severity: "error",
  },
  {
    id: "goals-present",
    label: "Goals are defined",
    check: (s) => !!s.goals?.trim(),
    severity: "error",
  },
  {
    id: "goals-measurable",
    label: "Goals appear measurable (contain numbers)",
    check: (s) => {
      if (!s.goals?.trim()) return false;
      return /\d/.test(s.goals);
    },
    severity: "warning",
  },
  {
    id: "instructions-present",
    label: "Instructions are defined",
    check: (s) => !!s.instructions?.trim(),
    severity: "error",
  },
  {
    id: "instructions-numbered",
    label: "Instructions are numbered",
    check: (s) => {
      if (!s.instructions?.trim()) return false;
      return /^\s*\d+[\.\)]/m.test(s.instructions);
    },
    severity: "warning",
  },
  {
    id: "output-format-present",
    label: "Output format is specified",
    check: (s) => !!s.output_format?.trim(),
    severity: "error",
  },
];

export function QualityChecklist({ sections }: QualityChecklistProps) {
  const results = CHECKS.map((check) => ({
    ...check,
    passed: check.check(sections),
  }));

  const passedCount = results.filter((r) => r.passed).length;
  const percentage = Math.round((passedCount / results.length) * 100);

  return (
    <div className="bg-card border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Quality Gates</h3>
        <span
          className={`text-sm font-medium ${
            percentage === 100
              ? "text-success"
              : percentage >= 70
              ? "text-warning"
              : "text-destructive"
          }`}
        >
          {passedCount}/{results.length} passed
        </span>
      </div>

      <div className="w-full h-2 bg-secondary rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            percentage === 100
              ? "bg-success"
              : percentage >= 70
              ? "bg-warning"
              : "bg-destructive"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <ul className="space-y-2">
        {results.map((result) => (
          <li
            key={result.id}
            className={`flex items-center gap-2 text-sm ${
              result.passed ? "text-muted-foreground" : ""
            }`}
          >
            {result.passed ? (
              <Check className="w-4 h-4 text-success flex-shrink-0" />
            ) : result.severity === "error" ? (
              <X className="w-4 h-4 text-destructive flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
            )}
            <span className={result.passed ? "line-through opacity-60" : ""}>
              {result.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
