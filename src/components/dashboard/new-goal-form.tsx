"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  { value: "yo_exam", label: "YO-koe", icon: GraduationCap, description: "Ylioppilastutkinto" },
  { value: "entrance_exam", label: "Pääsykoe", icon: Target, description: "Yliopiston valintakoe" },
  { value: "course_completion", label: "Kurssi", icon: BookOpen, description: "Suorita opiskelukurssi" },
  { value: "certification", label: "Sertifikaatti", icon: Award, description: "Ammattitodistus" },
  { value: "custom", label: "Oma tavoite", icon: FileText, description: "Aseta oma tavoitteesi" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative z-10 w-full max-w-4xl glass-modal card-shadow">
        <CardHeader className="relative pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Luo uusi tavoite</CardTitle>
              <p className="text-sm text-muted-foreground">Aseta uusi opiskelutavoite seurantaan</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Type Selection - Horizontal row */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Tavoitetyyppi</label>
              <div className="grid grid-cols-5 gap-3">
                {goalTypes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        type === t.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${type === t.value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`font-medium text-sm block ${type === t.value ? "text-primary" : "text-foreground"}`}>{t.label}</span>
                      <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{t.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Two-column layout for title and deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  Tavoitteen nimi
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="esim. Englannin YO-koe 2026"
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Takaraja
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Two-column layout for description and color */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Kuvaus (valinnainen)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Lisää muistiinpanoja tavoitteestasi..."
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={2}
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  Väriteema
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-10 h-10 rounded-xl ${c.class} transition-all ${
                        color === c.value
                          ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                          : "hover:scale-105 opacity-70 hover:opacity-100"
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Submit - Full width at bottom */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Peruuta
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title || !deadline}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-8"
                size="lg"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Luodaan...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Luo tavoite
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
