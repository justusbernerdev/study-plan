"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";
import { 
  X, 
  Plus, 
  GraduationCap, 
  Target, 
  BookOpen, 
  Award, 
  Sparkles,
  FileText,
  Calendar,
  Palette,
} from "lucide-react";

interface NewGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: {
    title: string;
    description: string;
    type: "yo_exam" | "entrance_exam" | "course_completion" | "certification" | "custom";
    deadline: string;
    color: string;
  }) => void;
}

const goalTypes = [
  { value: "yo_exam", label: "YO-koe", labelEn: "Final Exam", icon: GraduationCap, description: "Ylioppilastutkinto", descriptionEn: "Matriculation exam" },
  { value: "entrance_exam", label: "Pääsykoe", labelEn: "Entrance", icon: Target, description: "Yliopiston valintakoe", descriptionEn: "University entrance" },
  { value: "course_completion", label: "Kurssi", labelEn: "Course", icon: BookOpen, description: "Suorita opiskelukurssi", descriptionEn: "Complete a course" },
  { value: "certification", label: "Sertifikaatti", labelEn: "Certificate", icon: Award, description: "Ammattitodistus", descriptionEn: "Professional cert" },
  { value: "custom", label: "Oma", labelEn: "Custom", icon: FileText, description: "Aseta oma tavoitteesi", descriptionEn: "Set your own goal" },
] as const;

const colorOptions = [
  { value: "emerald", label: "Vihreä", class: "bg-emerald-500" },
  { value: "blue", label: "Sininen", class: "bg-blue-500" },
  { value: "purple", label: "Violetti", class: "bg-purple-500" },
  { value: "rose", label: "Ruusu", class: "bg-rose-500" },
  { value: "amber", label: "Keltainen", class: "bg-amber-500" },
  { value: "cyan", label: "Syaani", class: "bg-cyan-500" },
];

export function NewGoalForm({ isOpen, onClose, onSubmit }: NewGoalFormProps) {
  const { language } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<typeof goalTypes[number]["value"]>("yo_exam");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("emerald");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;

    setIsSubmitting(true);
    await onSubmit({
      title,
      description,
      type,
      deadline,
      color,
    });
    setIsSubmitting(false);

    setTitle("");
    setDescription("");
    setType("yo_exam");
    setDeadline("");
    setColor("emerald");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative z-10 w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden glass-modal card-shadow rounded-t-2xl sm:rounded-2xl">
        <CardHeader className="relative pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-xl">
                {language === "fi" ? "Luo uusi tavoite" : "Create new goal"}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {language === "fi" ? "Aseta uusi opiskelutavoite" : "Set a new study goal"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 overflow-y-auto max-h-[calc(90vh-100px)] sm:max-h-[calc(85vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Goal Type Selection - Scrollable on mobile */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                {language === "fi" ? "Tavoitetyyppi" : "Goal type"}
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:grid sm:grid-cols-5 sm:gap-2 sm:overflow-visible">
                {goalTypes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`flex-shrink-0 p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-center transition-all min-w-[70px] sm:min-w-0 ${
                        type === t.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${type === t.value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`font-medium text-[10px] sm:text-xs block ${type === t.value ? "text-primary" : "text-foreground"}`}>
                        {language === "fi" ? t.label : t.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                {language === "fi" ? "Tavoitteen nimi" : "Goal name"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={language === "fi" ? "esim. Englannin YO-koe 2026" : "e.g. English Final Exam 2026"}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Deadline */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                {language === "fi" ? "Takaraja" : "Deadline"}
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                {language === "fi" ? "Kuvaus (valinnainen)" : "Description (optional)"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === "fi" ? "Lisää muistiinpanoja tavoitteestasi..." : "Add notes about your goal..."}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={2}
              />
            </div>

            {/* Color */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
                <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                {language === "fi" ? "Väriteema" : "Color theme"}
              </label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl ${c.class} transition-all ${
                      color === c.value
                        ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                        : "hover:scale-105 opacity-70 hover:opacity-100"
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2 sm:gap-3 pt-2 sticky bottom-0 bg-card pb-1">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:flex-none sm:px-6 text-sm"
              >
                {language === "fi" ? "Peruuta" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title || !deadline}
                className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white sm:px-6 text-sm"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {language === "fi" ? "Luo tavoite" : "Create goal"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
