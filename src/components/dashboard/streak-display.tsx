"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  missedDay?: boolean;
  userName: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  missedDay,
  userName,
}: StreakDisplayProps) {
  const { t } = useLanguage();
  const isOnFire = currentStreak >= 3;
  const isNewRecord = currentStreak >= longestStreak && currentStreak > 0;

  if (missedDay) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 card-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                {t.noWorries}, {userName}!
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                {t.redistributedTasks}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300">
                  <Calendar className="w-3 h-3 mr-1" />
                  {t.newDayFreshStart}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`card-shadow overflow-hidden ${
        isOnFire
          ? "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800"
          : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Current Streak */}
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isOnFire
                  ? "bg-gradient-to-br from-orange-500 to-amber-500"
                  : "bg-gradient-to-br from-primary/10 to-accent/10"
              }`}
            >
              <Flame
                className={`w-8 h-8 ${
                  isOnFire ? "text-white animate-fire" : "text-primary"
                }`}
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-bold ${
                    isOnFire ? "text-orange-600 dark:text-orange-400" : "text-foreground"
                  }`}
                >
                  {currentStreak}
                </span>
                <span className="text-muted-foreground">{t.dayStreak}</span>
              </div>
              {isOnFire && (
                <Badge className="mt-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                  <Flame className="w-3 h-3 mr-1" />
                  {t.youreOnFire}
                </Badge>
              )}
              {isNewRecord && currentStreak > 0 && (
                <Badge className="mt-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                  <Trophy className="w-3 h-3 mr-1" />
                  {t.newRecord}
                </Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{longestStreak}</div>
              <div className="text-xs text-muted-foreground">{t.bestStreak}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {Math.round((currentStreak / Math.max(longestStreak, 1)) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">{t.ofBest}</div>
            </div>
          </div>
        </div>

        {currentStreak > 0 && currentStreak < 3 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {3 - currentStreak}
            </span>{" "}
            {t.moreDaysUntilFire}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
