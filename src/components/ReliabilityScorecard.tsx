import { Activity, TrendingUp, AlertCircle, CheckCircle2, IterationCcw } from "lucide-react";
import { ReliabilityScorecard as ScorecardType, ReleaseGate } from "@/lib/purpleTeam";

interface ReliabilityScorecardProps {
  scorecard: ScorecardType;
  releaseGate: ReleaseGate;
}

const DIMENSION_ICONS: Record<string, string> = {
  intent_clarity:       "🎯",
  injection_resistance: "🛡️",
  output_determinism:   "📐",
  scope_containment:    "🔒",
  token_efficiency:     "⚡",
  graceful_degradation: "🪂",
};

const GATE_CONFIG: Record<ReleaseGate, { label: string; color: string; bg: string }> = {
  green:   { label: "Greenlight — Ready to Ship", color: "text-success",     bg: "bg-success/10 border-success/30" },
  warning: { label: "Soft Warning — Review Advised", color: "text-warning",   bg: "bg-warning/10 border-warning/30" },
  blocked: { label: "Blocked — Cannot Ship",          color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
};

function ScorePips({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full transition-all ${
            i < score
              ? score <= 2
                ? "bg-destructive"
                : score <= 3
                ? "bg-warning"
                : "bg-success"
              : "bg-secondary"
          }`}
        />
      ))}
    </div>
  );
}

export function ReliabilityScorecard({ scorecard, releaseGate }: ReliabilityScorecardProps) {
  const gate = GATE_CONFIG[releaseGate];
  const pct = Math.round((scorecard.composite / 30) * 100);

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b bg-secondary/30">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">Reliability Scorecard</h3>
        <span className="text-xs text-muted-foreground ml-1">v2.1</span>
      </div>

      {/* Composite score banner */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${gate.bg}`}>
        <div>
          <div className={`text-2xl font-bold tabular-nums ${gate.color}`}>
            {scorecard.composite}
            <span className="text-base font-normal text-muted-foreground">/30</span>
          </div>
          <div className={`text-xs font-medium ${gate.color}`}>{gate.label}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">Ship threshold: 22/30</div>
          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                releaseGate === "green"
                  ? "bg-success"
                  : releaseGate === "warning"
                  ? "bg-warning"
                  : "bg-destructive"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {scorecard.iterationCount > 0 && (
            <div className="flex items-center gap-1 mt-1 justify-end text-xs text-muted-foreground">
              <IterationCcw className="w-3 h-3" />
              {scorecard.iterationCount}/{2} iteration{scorecard.iterationCount > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Dimension rows */}
      <div className="divide-y">
        {scorecard.dimensions.map((dim) => {
          const icon = DIMENSION_ICONS[dim.id] ?? "•";
          const atMin = dim.score === 3;
          const belowMin = dim.score < 3;

          return (
            <div
              key={dim.id}
              className={`px-5 py-3 ${belowMin ? "bg-destructive/5" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className="text-sm font-medium">{dim.name}</span>
                  {belowMin && (
                    <AlertCircle className="w-3.5 h-3.5 text-destructive" title="Below minimum" />
                  )}
                  {atMin && !belowMin && (
                    <AlertCircle className="w-3.5 h-3.5 text-warning" title="At minimum" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ScorePips score={dim.score} />
                  <span
                    className={`text-sm font-bold tabular-nums w-4 text-right ${
                      belowMin ? "text-destructive" : atMin ? "text-warning" : "text-foreground"
                    }`}
                  >
                    {dim.score}
                  </span>
                </div>
              </div>
              {dim.score < 4 && (
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  {dim.rationale}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t bg-secondary/5 flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>Min dimension: 3 &nbsp;·&nbsp; Composite ship threshold: ≥ 22</span>
      </div>
    </div>
  );
}
