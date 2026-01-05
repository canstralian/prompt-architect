import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Download, Sparkles, Code, Search, PenTool, Zap, BarChart, Calendar, Palette } from "lucide-react";
import { PromptTemplate, TemplateCategory } from "@/hooks/useTemplateLibrary";

interface TemplateCardProps {
  template: PromptTemplate;
  onUseTemplate: (template: PromptTemplate) => void;
}

const categoryIcons: Record<TemplateCategory, React.ElementType> = {
  coding: Code,
  research: Search,
  writing: PenTool,
  automation: Zap,
  analysis: BarChart,
  planning: Calendar,
  creative: Palette,
  other: Sparkles,
};

const categoryColors: Record<TemplateCategory, string> = {
  coding: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  research: "bg-green-500/10 text-green-400 border-green-500/20",
  writing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  automation: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  analysis: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  planning: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  creative: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  other: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export function TemplateCard({ template, onUseTemplate }: TemplateCardProps) {
  const Icon = categoryIcons[template.category];
  const colorClass = categoryColors[template.category];

  return (
    <Card className="group glass-panel border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg border ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            {template.is_curated && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Curated
              </Badge>
            )}
          </div>
          <Badge variant="outline" className={`text-xs capitalize ${colorClass}`}>
            {template.category}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
          {template.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {template.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 4 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{template.tags.length - 4}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {template.likes_count}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {template.saves_count}
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => onUseTemplate(template)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Use Template
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          by {template.author}
        </p>
      </CardContent>
    </Card>
  );
}
