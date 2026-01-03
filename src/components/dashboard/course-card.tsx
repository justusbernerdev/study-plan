"use client";

import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseMenu } from "./course-menu";
import {
  BookOpen,
  FileText,
  Languages,
  PenTool,
  Calculator,
  Lightbulb,
  ClipboardList,
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface CourseCardProps {
  courseId: Id<"courses">;
  onOpenDetail: () => void;
}

const iconMap: Record<string, any> = {
  BookOpen,
  FileText,
  Languages,
  PenTool,
  Calculator,
  Lightbulb,
  ClipboardList,
  Target,
};

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  cyan: "bg-cyan-500",
};

function getDaysRemaining(endDate: number | undefined): number {
  if (!endDate) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function calculateDailyQuota(remaining: number, daysLeft: number): number {
  if (daysLeft <= 0) return remaining;
  return Math.ceil(remaining / daysLeft);
}

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString("fi-FI", {
    day: "numeric",
    month: "numeric",
  });
}

export function CourseCard({ courseId, onOpenDetail }: CourseCardProps) {
  const courseWithCategories = useQuery(api.courses.getWithCategories, { id: courseId });
  const toggleCheckItem = useMutation(api.courses.toggleCheckItem);

  // Calculate daily quotas
  const dailyQuotas = useMemo(() => {
    if (!courseWithCategories?.categories) return [];

    const daysLeft = getDaysRemaining(courseWithCategories.endDate);

    return courseWithCategories.categories.map((cat) => {
      const remaining = cat.total - cat.completed;
      const dailyQuota = calculateDailyQuota(remaining, daysLeft);
      return {
        ...cat,
        remaining,
        dailyQuota,
        daysLeft,
      };
    });
  }, [courseWithCategories]);

  // Today's tasks
  const todayTasks = useMemo(() => {
    const tasks: {
      categoryId: Id<"categories">;
      categoryName: string;
      index: number;
      itemId: string;
      color: string;
      icon: string;
    }[] = [];

    dailyQuotas.forEach((cat) => {
      for (let i = 0; i < Math.min(cat.dailyQuota, 5); i++) {
        // Max 5 per category in card
        tasks.push({
          categoryId: cat._id,
          categoryName: cat.name,
          index: i + 1,
          itemId: `${cat._id}_${i}`,
          color: cat.color,
          icon: cat.icon,
        });
      }
    });

    return tasks.slice(0, 8); // Max 8 tasks shown in card
  }, [dailyQuotas]);

  const handleToggleTask = async (e: React.MouseEvent, itemId: string, checked: boolean) => {
    e.stopPropagation();
    await toggleCheckItem({ id: courseId, itemId, checked });
  };

  if (!courseWithCategories) {
    return (
      <Card className="card-shadow animate-pulse">
        <CardContent className="p-5">
          <div className="h-24 bg-muted rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const Icon = iconMap[courseWithCategories.icon] || BookOpen;
  const colorClass = colorMap[courseWithCategories.color] || "bg-emerald-500";
  const checkedItems = courseWithCategories.checkedItems || [];
  const completedToday = todayTasks.filter((t) => checkedItems.includes(t.itemId)).length;
  const totalTodayTasks = dailyQuotas.reduce((sum, cat) => sum + cat.dailyQuota, 0);
  const daysLeft = getDaysRemaining(courseWithCategories.endDate);

  const categories = courseWithCategories.categories || [];
  const totalProgress = categories.reduce((sum, cat) => sum + cat.completed, 0);
  const totalItems = categories.reduce((sum, cat) => sum + cat.total, 0);
  const progressPercent = totalItems > 0 ? Math.round((totalProgress / totalItems) * 100) : 0;

  const isStarted = !courseWithCategories.startDate || courseWithCategories.startDate <= Date.now();
  const isEnded = courseWithCategories.endDate && courseWithCategories.endDate < Date.now();

  return (
    <Card
      className={`card-shadow cursor-pointer hover:scale-[1.02] transition-all duration-200 ${
        completedToday === totalTodayTasks && totalTodayTasks > 0 ? "ring-2 ring-emerald-500" : ""
      }`}
      onClick={onOpenDetail}
    >
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{courseWithCategories.title}</h3>
            {courseWithCategories.description && (
              <p className="text-sm text-muted-foreground truncate">{courseWithCategories.description}</p>
            )}
          </div>
          <CourseMenu
            courseId={courseId}
            courseTitle={courseWithCategories.title}
            onEdit={onOpenDetail}
          />
        </div>

        {/* Date info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {courseWithCategories.startDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(courseWithCategories.startDate)}</span>
            </div>
          )}
          {courseWithCategories.endDate && (
            <>
              <span>-</span>
              <div className="flex items-center gap-1">
                <span>{formatDate(courseWithCategories.endDate)}</span>
              </div>
              <div className={`flex items-center gap-1 font-medium ${daysLeft <= 7 ? "text-rose-500" : "text-primary"}`}>
                <Clock className="w-3 h-3" />
                <span>{daysLeft} pv</span>
              </div>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Edistyminen</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${colorClass} transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Today's tasks */}
        {isStarted && !isEnded && categories.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tänään</span>
              <span className="font-medium">
                {completedToday} / {totalTodayTasks}
              </span>
            </div>

            {todayTasks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {todayTasks.map((task) => {
                  const isChecked = checkedItems.includes(task.itemId);
                  const TaskIcon = iconMap[task.icon] || BookOpen;
                  return (
                    <button
                      key={task.itemId}
                      onClick={(e) => handleToggleTask(e, task.itemId, !isChecked)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all text-xs ${
                        isChecked
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Circle className="w-3 h-3" />
                      )}
                      <span className={isChecked ? "line-through" : ""}>
                        {task.categoryName.substring(0, 3)} {task.index}
                      </span>
                    </button>
                  );
                })}
                {totalTodayTasks > todayTasks.length && (
                  <Badge variant="outline" className="text-xs">
                    +{totalTodayTasks - todayTasks.length}
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Ei tehtäviä tänään</p>
            )}
          </div>
        )}

        {/* Not started message */}
        {!isStarted && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Alkaa {formatDate(courseWithCategories.startDate)}</span>
          </div>
        )}

        {/* No categories message */}
        {categories.length === 0 && (
          <p className="text-xs text-muted-foreground">Klikkaa lisätäksesi kategorioita</p>
        )}
      </CardContent>
    </Card>
  );
}

