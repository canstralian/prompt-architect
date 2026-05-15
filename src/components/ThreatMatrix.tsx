import { Shield, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { ThreatVector, Severity, Likelihood, MitigationStatus } from "@/lib/purpleTeam";
import { Badge } from "@/components/ui/badge";

interface ThreatMatrixProps {
  vectors: ThreatVector[];
}

const SEVERITY_CONFIG: Record<Severity, { color: string; label: string }> = {
  Low:      { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",     label: "Low" },
  Medium:   { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Medium" },
  High:     { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", label: "High" },
  Critical: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",         label: "Critical" },
};

const LIKELIHOOD_CONFIG: Record<Likelihood, { color: string }> = {
  Low:    { color: "text-blue-600 dark:text-blue-400" },
  Medium: { color: "text-yellow-600 dark:text-yellow-400" },
  High:   { color: "text-red-600 dark:text-red-400" },
};

const MITIGATION_CONFIG: Record<MitigationStatus, { icon: React.ReactNode; color: string }> = {
  Unmitigated: {
    icon: <XCircle className="w-4 h-4" />,
    color: "text-destructive",
  },
  Partial: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-warning",
  },
  Mitigated: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "text-success",
  },
};

export function ThreatMatrix({ vectors }: ThreatMatrixProps) {
  const criticalUnmitigated = vectors.some(
    (v) => v.severity === "Critical" && v.mitigation === "Unmitigated"
  );

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b bg-secondary/30">
        <Shield className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">Threat Matrix</h3>
        <span className="text-xs text-muted-foreground ml-1">(A–G Vector Analysis)</span>
        {criticalUnmitigated && (
          <Badge variant="destructive" className="ml-auto text-xs">Release Blocked</Badge>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/10 text-muted-foreground text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-2 w-6">ID</th>
              <th className="text-left px-4 py-2">Vector</th>
              <th className="text-left px-4 py-2 hidden sm:table-cell">Severity</th>
              <th className="text-left px-4 py-2 hidden sm:table-cell">Likelihood</th>
              <th className="text-left px-4 py-2">Mitigation</th>
            </tr>
          </thead>
          <tbody>
            {vectors.map((v, i) => {
              const sev = SEVERITY_CONFIG[v.severity];
              const lik = LIKELIHOOD_CONFIG[v.likelihood];
              const mit = MITIGATION_CONFIG[v.mitigation];
              const isBlocking = v.severity === "Critical" && v.mitigation === "Unmitigated";

              return (
                <tr
                  key={v.id}
                  className={`border-b last:border-0 transition-colors ${
                    isBlocking
                      ? "bg-destructive/5"
                      : i % 2 === 0
                      ? "bg-transparent"
                      : "bg-secondary/5"
                  }`}
                  title={v.description}
                >
                  <td className="px-4 py-2.5">
                    <span className="font-mono font-bold text-primary text-xs">{v.id}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-xs leading-tight">{v.name}</div>
                    <div className="text-muted-foreground text-xs hidden md:block">{v.description}</div>
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${sev.color}`}>
                      {sev.label}
                    </span>
                  </td>
                  <td className={`px-4 py-2.5 hidden sm:table-cell font-medium text-xs ${lik.color}`}>
                    {v.likelihood}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className={`flex items-center gap-1 ${mit.color}`}>
                      {mit.icon}
                      <span className="text-xs font-medium">{v.mitigation}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t bg-secondary/5 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-success" /> Mitigated
        </span>
        <span className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-warning" /> Partial
        </span>
        <span className="flex items-center gap-1">
          <XCircle className="w-3 h-3 text-destructive" /> Unmitigated
        </span>
        <span className="ml-auto italic">
          Critical + Unmitigated → blocks release
        </span>
      </div>
    </div>
  );
}
