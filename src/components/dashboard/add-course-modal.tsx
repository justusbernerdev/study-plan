"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { useLanguage } from "@/lib/language-context";
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
  const { language } = useLanguage();
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
        title: language === "fi" ? "Kurssi luotu!" : "Course created!",
        description: `${title} ${language === "fi" ? "lisätty tavoitteeseen" : "added to goal"}.`,
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
        title: language === "fi" ? "Virhe" : "Error",
        description: language === "fi" ? "Kurssin luominen epäonnistui." : "Failed to create course.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative z-10 w-full sm:max-w-lg glass-modal card-shadow max-h-[90vh] sm:max-h-[85vh] overflow-hidden rounded-t-2xl sm:rounded-2xl">
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
                {language === "fi" ? "Lisää kurssi" : "Add Course"}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {language === "fi" ? "Lisää uusi kurssi tavoitteeseen" : "Add a new course to your goal"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 overflow-y-auto max-h-[calc(90vh-100px)] sm:max-h-[calc(85vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Title */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                {language === "fi" ? "Kurssin nimi" : "Course name"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={language === "fi" ? "esim. Englannin kurssi 2" : "e.g. English Course 2"}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                {language === "fi" ? "Kuvaus (valinnainen)" : "Description (optional)"}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === "fi" ? "esim. Lukion 2. vuoden englanti" : "e.g. 2nd year English"}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="truncate">{language === "fi" ? "Aloitus" : "Start"}</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
                  <CalendarCheck className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="truncate">{language === "fi" ? "Takaraja" : "Deadline"}</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Icon - Scrollable on mobile */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                {language === "fi" ? "Kuvake" : "Icon"}
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 hide-scrollbar">
                {iconOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIcon(opt.value)}
                      className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all shrink-0 ${
                        icon === opt.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      title={opt.label}
                    >
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${icon === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                {language === "fi" ? "Väri" : "Color"}
              </label>
              <div className="flex gap-2">
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
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none text-sm">
                {language === "fi" ? "Peruuta" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title}
                className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-sm"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {language === "fi" ? "Luo kurssi" : "Create"}
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
