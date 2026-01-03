"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import {
  X,
  Flame,
  Trophy,
  Target,
  BookOpen,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { format, differenceInDays, isFuture, isPast } from "date-fns";
import { fi, enUS } from "date-fns/locale";

interface FriendDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  friendId: Id<"users">;
}

const iconMap: Record<string, any> = {
  BookOpen,
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

export function FriendDetailModal({ isOpen, onClose, friendId }: FriendDetailModalProps) {
  const { t, language } = useLanguage();
  const dateLocale = language === "fi" ? fi : enUS;

  const friend = useQuery(api.users.get, { id: friendId });
  const friendMilestones = useQuery(api.milestones.getByUser, { userId: friendId });
  const friendCourses = useQuery(api.courses.getByUser, { userId: friendId });

  if (!isOpen) return null;

  if (!friend) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
        <Card className="relative z-10 w-full max-w-2xl glass-modal card-shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </Card>
      </div>
    );
  }

  // Calculate total progress across all courses
  const totalCourseProgress = friendCourses?.reduce((acc, course) => {
    // We'd need categories for accurate progress, but we can show course count
    return acc + 1;
  }, 0) || 0;

  const completedMilestones = friendMilestones?.filter(m => m.isCompleted).length || 0;
  const totalMilestones = friendMilestones?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden glass-modal card-shadow">
        <CardHeader className="relative pb-4 border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Friend Profile Header */}
          <div className="flex items-center gap-4">
            {friend.imageUrl ? (
              <img
                src={friend.imageUrl}
                alt={friend.name}
                className="w-16 h-16 rounded-full ring-4 ring-primary/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl ring-4 ring-primary/20">
                {friend.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-xl">{friend.name}</CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary" className="gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  {friend.currentStreak || 0} {t.dayStreak}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  {friend.longestStreak || 0} {t.bestStreak}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/50 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{totalMilestones}</div>
              <div className="text-xs text-muted-foreground">{t.goals}</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 text-center">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{totalCourseProgress}</div>
              <div className="text-xs text-muted-foreground">{t.courses}</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{completedMilestones}</div>
              <div className="text-xs text-muted-foreground">
                {language === "fi" ? "Valmiit" : "Completed"}
              </div>
            </div>
          </div>

          {/* Goals & Courses */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {t.goals}
            </h3>

            {friendMilestones && friendMilestones.length > 0 ? (
              <div className="space-y-4">
                {friendMilestones.map((milestone) => {
                  const milestoneCourses = friendCourses?.filter(
                    (c) => c.milestoneId === milestone._id
                  ) || [];
                  const deadline = new Date(milestone.deadline);
                  const daysLeft = differenceInDays(deadline, new Date());
                  const isOverdue = isPast(deadline);

                  return (
                    <div
                      key={milestone._id}
                      className="p-4 rounded-xl border border-border bg-card"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {milestone.isCompleted && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                            {milestone.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {milestone.description}
                          </p>
                        </div>
                        <Badge
                          variant={isOverdue ? "destructive" : "secondary"}
                          className="shrink-0"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          {isOverdue
                            ? language === "fi"
                              ? "Myöhässä"
                              : "Overdue"
                            : `${daysLeft} ${language === "fi" ? "pv" : "days"}`}
                        </Badge>
                      </div>

                      {/* Courses under this milestone */}
                      {milestoneCourses.length > 0 ? (
                        <div className="space-y-2 mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {t.courses}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {milestoneCourses.map((course) => (
                              <FriendCourseCard
                                key={course._id}
                                courseId={course._id}
                                title={course.title}
                                color={course.color}
                                endDate={course.endDate}
                                language={language}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">
                          {language === "fi"
                            ? "Ei kursseja vielä"
                            : "No courses yet"}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>
                  {language === "fi"
                    ? "Ei tavoitteita vielä"
                    : "No goals yet"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-component for friend's course card with progress
function FriendCourseCard({
  courseId,
  title,
  color,
  endDate,
  language,
}: {
  courseId: Id<"courses">;
  title: string;
  color: string;
  endDate?: number;
  language: string;
}) {
  const categories = useQuery(api.categories.getByCourse, { courseId });

  const totalItems = categories?.reduce((sum, cat) => sum + cat.total, 0) || 0;
  const completedItems = categories?.reduce((sum, cat) => sum + cat.completed, 0) || 0;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const colorClass = colorMap[color] || "bg-emerald-500";

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${colorClass}`} />
        <span className="font-medium text-sm truncate">{title}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{progressPercent}%</span>
          <span>
            {completedItems}/{totalItems}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      {endDate && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {format(new Date(endDate), "d.M.yyyy")}
        </div>
      )}
    </div>
  );
}

