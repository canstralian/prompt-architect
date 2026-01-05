import { X, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingTipProps {
  onDismiss: () => void;
}

export function OnboardingTip({ onDismiss }: OnboardingTipProps) {
  return (
    <div className="mb-8 bg-gradient-to-r from-primary/10 via-accent to-primary/5 border border-primary/20 rounded-xl p-6 relative animate-fade-in">
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1 rounded-md hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Welcome to the Agent Prompt Builder!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Build effective AI agent prompts using our 7-section architecture. Each section
            serves a specific purpose—hover over the info icons for guidelines, or check
            the Template view for detailed examples.
          </p>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Start with a preset or blank template
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Fill in each section
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Copy or download your prompt
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onDismiss}
            className="mt-4"
          >
            Got it, let's start!
          </Button>
        </div>
      </div>
    </div>
  );
}
