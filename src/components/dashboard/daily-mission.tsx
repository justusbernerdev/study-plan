"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { calculateDailyQuota, calculateProgress, getDaysRemaining } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Target,
  Calendar,
  Sparkles,
  PartyPopper,
  BookOpen,
  Languages,
  PenTool,
  Calculator,
  Atom,
  GraduationCap,
  FileText,
} from "lucide-react";

interface Subject {
  _id: string;
  title: string;
  color: string;
  icon: string;
  totalVocabulary: number;
  completedVocabulary: number;
  totalExercises: number;
  completedExercises: number;
  totalGrammar: number;
  completedGrammar: number;
  todayVocabulary: number;
  todayExercises: number;
  todayGrammar: number;
  checkedItems: string[];
}

interface DailyMissionProps {
  subject: Subject;
  deadline: Date;
  onToggleItem: (subjectId: string, itemId: string, checked: boolean) => void;
  onFinishDay: (subjectId: string) => void;
  isCompleted: boolean;
  canEdit: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Languages,
  PenTool,
  Calculator,
  Atom,
  GraduationCap,
  FileText,
};

const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200", light: "bg-blue-50 dark:bg-blue-950/30" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", border: "border-purple-200", light: "bg-purple-50 dark:bg-purple-950/30" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-200", light: "bg-rose-50 dark:bg-rose-950/30" },
  cyan: { bg: "bg-cyan-500", text: "text-cyan-600", border: "border-cyan-200", light: "bg-cyan-50 dark:bg-cyan-950/30" },
  orange: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-200", light: "bg-orange-50 dark:bg-orange-950/30" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200", light: "bg-emerald-50 dark:bg-emerald-950/30" },
};

export function DailyMission({
  subject,
  deadline,
  onToggleItem,
  onFinishDay,
  isCompleted,
  canEdit,
}: DailyMissionProps) {
  const Icon = iconMap[subject.icon] || BookOpen;
  const colors = colorMap[subject.color] || colorMap.blue;
  const daysRemaining = getDaysRemaining(deadline);

  const vocabQuota = calculateDailyQuota(subject.totalVocabulary, subject.completedVocabulary, deadline);
  const exerciseQuota = calculateDailyQuota(subject.totalExercises, subject.completedExercises, deadline);
  const grammarQuota = calculateDailyQuota(subject.totalGrammar, subject.completedGrammar, deadline);

  const checklistItems = useMemo(() => {
    const items: { id: string; label: string; type: string }[] = [];

    for (let i = 1; i <= vocabQuota; i++) {
      items.push({ id: `vocab_${i}`, label: `Vocabulary ${i}`, type: "vocab" });
    }
    for (let i = 1; i <= exerciseQuota; i++) {
      items.push({ id: `exercise_${i}`, label: `Exercise ${i}`, type: "exercise" });
    }
    for (let i = 1; i <= grammarQuota; i++) {
      items.push({ id: `grammar_${i}`, label: `Grammar ${i}`, type: "grammar" });
    }

    return items;
  }, [vocabQuota, exerciseQuota, grammarQuota]);

  const checkedCount = subject.checkedItems.length;
  const totalItems = checklistItems.length;
  const allChecked = totalItems > 0 && checkedCount >= totalItems;
  const progressPercent = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  const totalTasks = subject.totalVocabulary + subject.totalExercises + subject.totalGrammar;
  const completedTasks = subject.completedVocabulary + subject.completedExercises + subject.completedGrammar;
  const overallProgress = calculateProgress(completedTasks, totalTasks);

  return (
    <Card
      className={`card-shadow card-shadow-hover overflow-hidden transition-all ${
        isCompleted ? "success-glow" : ""
      } ${allChecked && !isCompleted ? "ring-2 ring-primary ring-offset-2" : ""}`}
    >
      <CardHeader className={`${colors.light} border-b ${colors.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{subject.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{daysRemaining} days left</span>
              </div>
            </div>
          </div>

          {isCompleted && (
            <Badge className="gap-1 bg-success text-white">
              <PartyPopper className="w-3 h-3" />
              Complete
            </Badge>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} indicatorClassName="progress-gradient" />
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className={`p-4 rounded-xl ${colors.light} border ${colors.border}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className={`w-5 h-5 ${colors.text}`} />
              <span className={`font-semibold ${colors.text}`}>Today&apos;s Mission</span>
            </div>
            <Badge variant="outline" className={colors.border}>
              {checkedCount}/{totalItems} tasks
            </Badge>
          </div>
          <Progress
            value={progressPercent}
            className="h-2"
            indicatorClassName={isCompleted ? "bg-success" : colors.bg}
          />
        </div>

        {totalItems > 0 ? (
          <div className="space-y-2">
            {checklistItems.map((item) => {
              const isChecked = subject.checkedItems.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    isChecked
                      ? "bg-success/5 border-success/30"
                      : "bg-card border-border hover:border-primary/30 hover:bg-muted/30"
                  } ${isCompleted || !canEdit ? "opacity-60 pointer-events-none" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleItem(subject._id, item.id, !isChecked)}
                    className="flex-shrink-0"
                    disabled={isCompleted || !canEdit}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  <span className={`flex-1 ${isChecked ? "line-through text-muted-foreground" : ""}`}>
                    {item.label}
                  </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {item.type}
                  </Badge>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No tasks remaining for this subject.</p>
          </div>
        )}

        {allChecked && !isCompleted && totalItems > 0 && canEdit && (
          <Button
            onClick={() => onFinishDay(subject._id)}
            className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
            size="lg"
          >
            <PartyPopper className="w-5 h-5" />
            Finish Day
          </Button>
        )}

        {isCompleted && (
          <div className="text-center py-4 text-success">
            <p className="font-medium">Great work today!</p>
            <p className="text-sm text-muted-foreground">Come back tomorrow for your next mission.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
