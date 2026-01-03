"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X, Sparkles, Send, Frown, Meh, Smile, Heart, Star } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mood: number, difficulty: number, note: string) => void;
  subjectTitle: string;
  tasksCompleted: number;
}

const moodOptions = [
  { value: 1, icon: Frown, label: "Tough", color: "text-red-500" },
  { value: 2, icon: Meh, label: "Hard", color: "text-orange-500" },
  { value: 3, icon: Smile, label: "Okay", color: "text-yellow-500" },
  { value: 4, icon: Heart, label: "Good", color: "text-green-500" },
  { value: 5, icon: Star, label: "Great", color: "text-primary" },
];

const difficultyLabels = [
  { value: 1, label: "Very Easy", color: "bg-green-500" },
  { value: 2, label: "Easy", color: "bg-green-400" },
  { value: 3, label: "Medium", color: "bg-yellow-500" },
  { value: 4, label: "Hard", color: "bg-orange-500" },
  { value: 5, label: "Very Hard", color: "bg-red-500" },
];

export function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  subjectTitle,
  tasksCompleted,
}: FeedbackModalProps) {
  const [mood, setMood] = useState(4);
  const [difficulty, setDifficulty] = useState(3);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(mood, difficulty, note);
    setIsSubmitting(false);
    setNote("");
    setMood(4);
    setDifficulty(3);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative z-10 w-full max-w-md glass-modal card-shadow animate-in fade-in zoom-in duration-200">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Day Complete!</CardTitle>
              <p className="text-sm text-muted-foreground">
                {subjectTitle} - {tasksCompleted} tasks done
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mood Rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              How did studying feel today?
            </label>
            <div className="flex justify-between gap-2">
              {moodOptions.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                      mood === m.value
                        ? "border-primary bg-primary/10 scale-105"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto ${m.color}`} />
                    <div className="text-xs text-center mt-1 text-muted-foreground">
                      {m.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              How difficult was the material?
            </label>
            <div className="flex gap-2">
              {difficultyLabels.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                    difficulty === d.value
                      ? "border-primary scale-105"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`h-2 rounded-full ${d.color} mx-auto w-8 mb-1`} />
                  <div className="text-xs text-center text-muted-foreground">
                    {d.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Quick notes (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was challenging? What did you learn?"
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
            size="lg"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Save & Continue
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
