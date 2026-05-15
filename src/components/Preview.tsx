import { useState } from "react";
import { Copy, Download, Check, Eye, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTIONS } from "@/lib/sectionData";
import { analyzePurpleTeam, exportScorecardJson } from "@/lib/purpleTeam";
import { toast } from "sonner";

interface PreviewProps {
  sections: Record<string, string>;
  draftName: string;
}

export function Preview({ sections, draftName }: PreviewProps) {
  const [copied, setCopied] = useState(false);

  const generatePrompt = () => {
    return SECTIONS.filter((s) => sections[s.id]?.trim())
      .map((s) => `<${s.id}>\n${sections[s.id].trim()}\n</${s.id}>`)
      .join("\n\n");
  };

  const prompt = generatePrompt();
  const isEmpty = !prompt.trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([`# ${draftName}\n\n${prompt}`], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draftName.toLowerCase().replace(/\s+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded as Markdown!");
  };

  const handleExportScorecard = () => {
    const report = analyzePurpleTeam(sections);
    const scorecard = exportScorecardJson(report, draftName);
    const blob = new Blob([JSON.stringify(scorecard, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draftName.toLowerCase().replace(/\s+/g, "-")}.scorecard.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const gateLabel = { green: "Greenlight", warning: "Warning", blocked: "Blocked" }[report.releaseGate];
    toast.success(`Scorecard exported — Gate: ${gateLabel} (${scorecard.composite_score}/30)`);
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b bg-secondary/30">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Live Preview</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={isEmpty}
            className="gap-2"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isEmpty}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download .md
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportScorecard}
            disabled={isEmpty}
            className="gap-2"
            title="Export Purple Team Reliability Scorecard as JSON (CI/CD compatible)"
          >
            <FileJson className="w-4 h-4" />
            Scorecard
          </Button>
        </div>
      </div>

      <div className="p-5 max-h-[500px] overflow-y-auto scrollbar-thin">
        {isEmpty ? (
          <div className="text-center py-12 text-muted-foreground">
            <Eye className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>Start filling in sections to see your prompt here</p>
          </div>
        ) : (
          <pre className="font-mono text-sm whitespace-pre-wrap break-words">
            {SECTIONS.filter((s) => sections[s.id]?.trim()).map((s) => (
              <div key={s.id} className="mb-4 last:mb-0">
                <span className="text-primary">{`<${s.id}>`}</span>
                <div className="pl-2 border-l-2 border-primary/20 my-1 text-foreground">
                  {sections[s.id].trim()}
                </div>
                <span className="text-primary">{`</${s.id}>`}</span>
              </div>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
}
