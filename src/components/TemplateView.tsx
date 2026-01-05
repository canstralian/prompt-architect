import { useState, useEffect } from "react";
import { ChevronRight, BookOpen, Target, AlertTriangle, ListChecks, Code, Play } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SECTIONS, SectionInfo } from "@/lib/sectionData";

const sectionIcons: Record<string, React.ReactNode> = {
  role: <BookOpen className="w-4 h-4" />,
  context: <Target className="w-4 h-4" />,
  constraints: <AlertTriangle className="w-4 h-4" />,
  goals: <Target className="w-4 h-4" />,
  instructions: <ListChecks className="w-4 h-4" />,
  output_format: <Code className="w-4 h-4" />,
  invocation: <Play className="w-4 h-4" />,
};

export function TemplateView() {
  const [activeSection, setActiveSection] = useState<string>("role");
  const [openSections, setOpenSections] = useState<string[]>(["role"]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = SECTIONS.map((s) => ({
        id: s.id,
        element: document.getElementById(`section-${s.id}`),
      }));

      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    if (!openSections.includes(id)) {
      setOpenSections([...openSections, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sticky TOC */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
              Sections
            </p>
            {SECTIONS.map((section, index) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  activeSection === section.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center text-xs rounded bg-secondary text-secondary-foreground">
                  {index + 1}
                </span>
                {section.title}
                {section.required && (
                  <ChevronRight
                    className={`w-3 h-3 ml-auto transition-transform ${
                      activeSection === section.id ? "rotate-90" : ""
                    }`}
                  />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="space-y-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Template Reference</h2>
            <p className="text-muted-foreground">
              Each section serves a specific purpose in creating effective agent prompts.
              Review the guidelines and examples below.
            </p>
          </div>

          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={setOpenSections}
            className="space-y-4"
          >
            {SECTIONS.map((section, index) => (
              <SectionAccordion
                key={section.id}
                section={section}
                index={index}
              />
            ))}
          </Accordion>
        </main>
      </div>
    </div>
  );
}

function SectionAccordion({
  section,
  index,
}: {
  section: SectionInfo;
  index: number;
}) {
  return (
    <AccordionItem
      value={section.id}
      id={`section-${section.id}`}
      className="bg-card border rounded-xl overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 transition-colors">
        <div className="flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {sectionIcons[section.id]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{section.title}</span>
              {section.required ? (
                <Badge variant="default" className="text-xs">
                  Required
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Optional
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {section.description}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="grid gap-6 pt-4">
          {/* Guidelines */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" />
              Guidelines
            </h4>
            <ul className="space-y-2">
              {section.guidelines.map((guideline, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {guideline}
                </li>
              ))}
            </ul>
          </div>

          {/* Example */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              Example
            </h4>
            <pre className="p-4 bg-secondary rounded-lg text-sm font-mono whitespace-pre-wrap overflow-x-auto scrollbar-thin">
              {section.example}
            </pre>
          </div>

          {section.maxSentences && (
            <p className="text-xs text-warning flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              Recommended: {section.maxSentences} sentences maximum
            </p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
