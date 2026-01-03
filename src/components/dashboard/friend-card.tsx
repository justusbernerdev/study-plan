"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import {
  Flame,
  Heart,
  CheckCircle2,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

interface FriendCardProps {
  friendId: Id<"users">;
  onOpenDetail: () => void;
  onSendCheer: () => void;
}

export function FriendCard({ friendId, onOpenDetail, onSendCheer }: FriendCardProps) {
  const { t, language } = useLanguage();

  const friend = useQuery(api.users.get, { id: friendId });
  const friendCourses = useQuery(api.courses.getByUser, { userId: friendId });

  if (!friend) {
    return (
      <Card className="card-shadow p-3 sm:p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-24 mb-2" />
            <div className="h-3 bg-muted rounded w-16" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="card-shadow p-3 sm:p-4 cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
      onClick={onOpenDetail}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Avatar */}
        {friend.imageUrl ? (
          <img
            src={friend.imageUrl}
            alt={friend.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-transparent hover:ring-primary/30 transition-all"
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm sm:text-base">
            {friend.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-sm sm:text-base">{friend.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <Flame className="w-3 h-3 text-orange-500" />
              <span>{friend.currentStreak ?? 0} {t.dayStreak}</span>
            </div>
          </div>
        </div>

        {/* Cheer Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSendCheer();
          }}
          className="gap-1 shrink-0 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
        >
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500" />
          <span className="hidden xs:inline">{t.cheer}</span>
        </Button>
      </div>

      {/* Today's Stats */}
      <FriendTodayStats courses={friendCourses} language={language} />
    </Card>
  );
}

// Sub-component to show today's statistics
function FriendTodayStats({ 
  courses, 
  language 
}: { 
  courses: Array<{ _id: Id<"courses">; checkedItems?: string[] }> | undefined;
  language: string;
}) {
  // Calculate aggregated stats across all courses
  let totalTodayDone = 0;
  let totalCourses = courses?.length || 0;

  if (courses) {
    for (const course of courses) {
      totalTodayDone += course.checkedItems?.length || 0;
    }
  }

  if (totalCourses === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center gap-3 text-xs">
        {/* Today's completed */}
        {totalTodayDone > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>
              {totalTodayDone} {language === "fi" ? "tänään" : "today"}
            </span>
          </div>
        )}

        {/* Courses count */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
          <Target className="w-3 h-3" />
          <span>
            {totalCourses} {language === "fi" ? "kurssia" : "courses"}
          </span>
        </div>

        {/* Activity indicator */}
        {totalTodayDone > 0 && (
          <div className="flex items-center gap-1 ml-auto text-green-600 dark:text-green-400">
            <Zap className="w-3 h-3" />
            <span className="font-medium">
              {language === "fi" ? "Aktiivinen" : "Active"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

