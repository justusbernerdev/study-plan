"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import {
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  History,
} from "lucide-react";
import { format, addDays, subDays, startOfDay, isToday, isFuture } from "date-fns";
import { fi, enUS } from "date-fns/locale";

interface PastDaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: Id<"courses">;
  userId: Id<"users">;
}

export function PastDaysModal({ isOpen, onClose, courseId, userId }: PastDaysModalProps) {
  const { t, language } = useLanguage();
  const dateLocale = language === "fi" ? fi : enUS;

  const [selectedDate, setSelectedDate] = useState<Date>(subDays(new Date(), 1)); // Default to yesterday
  const [entries, setEntries] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const categories = useQuery(api.categories.getByCourse, { courseId });
  const course = useQuery(api.courses.get, { id: courseId });
  
  const dateString = format(selectedDate, "yyyy-MM-dd");
  const existingEntries = useQuery(api.dailyEntries.getByDateAndCourse, {
    courseId,
    date: dateString,
  });

  const saveDay = useMutation(api.dailyEntries.saveDay);

  // Load existing entries when date changes
  useEffect(() => {
    if (existingEntries) {
      const entryMap: Record<string, number> = {};
      existingEntries.forEach((entry) => {
        entryMap[entry.categoryId] = entry.completed;
      });
      setEntries(entryMap);
      setSaved(false);
    }
  }, [existingEntries]);

  if (!isOpen) return null;

  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
    setSaved(false);
  };

  const handleNextDay = () => {
    const next = addDays(selectedDate, 1);
    if (!isFuture(next) && !isToday(next)) {
      setSelectedDate(next);
      setSaved(false);
    }
  };

  const handleEntryChange = (categoryId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setEntries((prev) => ({
      ...prev,
      [categoryId]: Math.max(0, numValue),
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!categories) return;

    setIsSaving(true);
    try {
      const entryData = categories.map((cat) => ({
        categoryId: cat._id,
        completed: entries[cat._id] || 0,
      }));

      await saveDay({
        courseId,
        userId,
        date: dateString,
        entries: entryData,
      });

      setSaved(true);
    } catch (error) {
      console.error("Failed to save entries:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isNextDisabled = isFuture(addDays(selectedDate, 1)) || isToday(addDays(selectedDate, 1));
  const totalForDay = Object.values(entries).reduce((sum, val) => sum + val, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative z-10 w-full max-w-lg glass-modal card-shadow">
        <CardHeader className="relative pb-4 border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {language === "fi" ? "Lisää aiemmat päivät" : "Add Past Days"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {course?.title}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Date Navigator */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousDay}
              className="shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="w-5 h-5 text-primary" />
                {format(selectedDate, "EEEE", { locale: dateLocale })}
              </div>
              <span className="text-sm text-muted-foreground">
                {format(selectedDate, "d. MMMM yyyy", { locale: dateLocale })}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextDay}
              disabled={isNextDisabled}
              className="shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Entries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {language === "fi" ? "Tehdyt tehtävät" : "Completed tasks"}
              </h3>
              <Badge variant="secondary">
                {language === "fi" ? "Yhteensä" : "Total"}: {totalForDay}
              </Badge>
            </div>

            {categories && categories.length > 0 ? (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.completed} / {category.total}{" "}
                        {language === "fi" ? "tehty" : "completed"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={entries[category._id] || ""}
                        onChange={(e) =>
                          handleEntryChange(category._id, e.target.value)
                        }
                        placeholder="0"
                        className="w-20 text-center"
                      />
                      <span className="text-sm text-muted-foreground">
                        {language === "fi" ? "kpl" : "items"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  {language === "fi"
                    ? "Ei kategorioita. Lisää ensin kategorioita kurssille."
                    : "No categories. Add categories to the course first."}
                </p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving || !categories || categories.length === 0}
            className="w-full gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {language === "fi" ? "Tallennetaan..." : "Saving..."}
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                {language === "fi" ? "Tallennettu!" : "Saved!"}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {language === "fi" ? "Tallenna" : "Save"}
              </>
            )}
          </Button>

          {/* Info */}
          <p className="text-xs text-center text-muted-foreground">
            {language === "fi"
              ? "Voit navigoida päivien välillä nuolinäppäimillä. Syötä kuinka monta tehtävää teit kunakin päivänä."
              : "Navigate between days using arrows. Enter how many tasks you completed each day."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

