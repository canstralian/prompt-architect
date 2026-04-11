import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Heart, Download, Sparkles, Code, Search, PenTool, Zap, BarChart, Calendar, Palette, Bookmark, BookmarkCheck, Share2, Trash2, Pencil, Copy } from "lucide-react";
import { toast } from "sonner";
import { PromptTemplate, TemplateCategory } from "@/hooks/useTemplateLibrary";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TemplateCardProps {
  template: PromptTemplate;
  onUseTemplate: (template: PromptTemplate) => void;
  isSaved?: boolean;
  onToggleSave?: (templateId: string, isSaved: boolean) => void;
  isLiked?: boolean;
  onToggleLike?: (templateId: string) => void;
  canDelete?: boolean;
  onDelete?: (templateId: string) => void;
  canEdit?: boolean;
  onEdit?: (template: PromptTemplate) => void;
  onDuplicate?: (template: PromptTemplate) => void;
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

 export function TemplateCard({ template, onUseTemplate, isSaved, onToggleSave, isLiked, onToggleLike, canDelete, onDelete, canEdit, onEdit, onDuplicate }: TemplateCardProps) {
  const Icon = categoryIcons[template.category];
  const colorClass = categoryColors[template.category];

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave?.(template.id, isSaved ?? false);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike?.(template.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?template=${template.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
 
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(template);
  };

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(template);
  };

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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShareClick}
              title="Copy link to share"
            >
              <Share2 className="w-4 h-4" />
            </Button>
             {canEdit && onEdit && (
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-8 w-8"
                 onClick={handleEditClick}
                 title="Edit template"
               >
                 <Pencil className="w-4 h-4" />
               </Button>
             )}
            {onToggleSave && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleSaveClick}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
            )}
            {canDelete && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleDeleteClick}
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Template</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{template.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => onDelete(template.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Badge variant="outline" className={`text-xs capitalize ${colorClass}`}>
              {template.category}
            </Badge>
          </div>
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
            <button
              onClick={handleLikeClick}
              className={cn(
                "flex items-center gap-1 transition-colors hover:text-red-500",
                isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("w-3 h-3", isLiked && "fill-current")} />
              {template.likes_count}
            </button>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {template.saves_count}
            </span>
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onUseTemplate(template);
            }}
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
