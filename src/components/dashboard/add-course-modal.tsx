"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import {
  X,
  Plus,
  BookOpen,
  FileText,
  Languages,
  PenTool,
  Calculator,
  Lightbulb,
  ClipboardList,
  Target,
  Sparkles,
  Calendar,
  CalendarCheck,
} from "lucide-react";

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: Id<"milestones">;
  userId: Id<"users">;
  onCourseCreated?: (courseId: Id<"courses">) => void;
}

const iconOptions = [
  { value: "BookOpen", icon: BookOpen, label: "Kirja" },
  { value: "FileText", icon: FileText, label: "Teksti" },
  { value: "Languages", icon: Languages, label: "Kieli" },
  { value: "PenTool", icon: PenTool, label: "Kynä" },
  { value: "Calculator", icon: Calculator, label: "Laskuri" },
  { value: "Lightbulb", icon: Lightbulb, label: "Idea" },
  { value: "ClipboardList", icon: ClipboardList, label: "Lista" },
  { value: "Target", icon: Target, label: "Tavoite" },
];

const colorOptions = [
  { value: "emerald", label: "Vihreä", class: "bg-emerald-500" },
  { value: "blue", label: "Sininen", class: "bg-blue-500" },
  { value: "purple", label: "Violetti", class: "bg-purple-500" },
  { value: "rose", label: "Ruusu", class: "bg-rose-500" },
  { value: "amber", label: "Keltainen", class: "bg-amber-500" },
  { value: "cyan", label: "Syaani", class: "bg-cyan-500" },
];

export function AddCourseModal({ isOpen, onClose, milestoneId, userId, onCourseCreated }: AddCourseModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [icon, setIcon] = useState("BookOpen");
  const [color, setColor] = useState("emerald");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCourse = useMutation(api.courses.create);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    try {
      const courseId = await createCourse({
        userId,
        title,
        description: description || undefined,
        milestoneId,
        startDate: startDate ? new Date(startDate).getTime() : undefined,
        endDate: endDate ? new Date(endDate).getTime() : undefined,
        color,
        icon,
      });

      toast({
        title: "Kurssi luotu!",
        description: `${title} lisätty tavoitteeseen.`,
      });

      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setIcon("BookOpen");
      setColor("emerald");
      onClose();

      if (onCourseCreated) {
        onCourseCreated(courseId);
      }
    } catch (error) {
      toast({
        title: "Virhe",
        description: "Kurssin luominen epäonnistui.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative z-10 w-full max-w-2xl glass-modal card-shadow max-h-[90vh] overflow-y-auto">
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
              <CardTitle className="text-xl">Lisää kurssi</CardTitle>
              <p className="text-sm text-muted-foreground">Lisää uusi kurssi tavoitteeseen</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kurssin nimi</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="esim. Englannin kurssi 2"
                className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kuvaus (valinnainen)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="esim. Lukion 2. vuoden englanti"
                className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Aloituspäivä
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-muted-foreground" />
                  Takaraja
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kuvake</label>
              <div className="flex gap-2 flex-wrap">
                {iconOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIcon(opt.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        icon === opt.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      title={opt.label}
                    >
                      <Icon className={`w-5 h-5 ${icon === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Väri</label>
              <div className="flex gap-2">
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

            {/* Submit */}
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Peruuta
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Luodaan...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Luo kurssi
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
