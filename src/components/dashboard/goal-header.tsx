"use client";

import { useState, useEffect } from "react";
import { formatCountdown, getDaysRemaining } from "@/lib/utils";
import { Target, Calendar, Flame, Trophy, Clock } from "lucide-react";

interface GoalHeaderProps {
  title: string;
  deadline: Date;
  currentStreak: number;
  longestStreak: number;
  color?: string;
}

export function GoalHeader({
  title,
  deadline,
  currentStreak,
  longestStreak,
  color = "primary",
}: GoalHeaderProps) {
  const [countdown, setCountdown] = useState(formatCountdown(deadline));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCountdown(formatCountdown(deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!mounted) {
    return <div className="h-40 skeleton rounded-2xl" />;
  }

  const daysRemaining = getDaysRemaining(deadline);

  return (
    <div className="bg-card rounded-2xl card-shadow overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Goal info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/20">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Current Goal</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {title}
              </h1>
            </div>
          </div>

          {/* Countdown & Stats */}
          <div className="flex items-center gap-6">
            {/* Days counter */}
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold gradient-text">
                {daysRemaining}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                <Calendar className="w-3.5 h-3.5" />
                days left
              </div>
            </div>

            {/* Time display */}
            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
              <TimeUnit value={countdown.hours} label="hrs" />
              <span className="text-lg">:</span>
              <TimeUnit value={countdown.minutes} label="min" />
              <span className="text-lg">:</span>
              <TimeUnit value={countdown.seconds} label="sec" />
            </div>

            {/* Streak */}
            <div className="flex flex-col items-center gap-1 pl-6 border-l border-border">
              <div className="flex items-center gap-1.5">
                <Flame
                  className={`w-5 h-5 ${
                    currentStreak > 0
                      ? "text-orange-500 animate-fire"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="text-2xl font-bold text-foreground">
                  {currentStreak}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">day streak</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Trophy className="w-3 h-3 text-amber-500" />
                <span>Best: {longestStreak}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center px-3 py-2 bg-muted/50 rounded-lg min-w-[52px]">
      <div className="text-lg font-mono font-bold text-foreground">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-xs">{label}</div>
    </div>
  );
}
