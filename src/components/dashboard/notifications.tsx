"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  BellOff,
  X,
  Clock,
  AlertTriangle,
  Calendar,
  Users,
  CheckCircle2,
  Heart,
} from "lucide-react";

interface Notification {
  id: string;
  type: "daily_goal" | "streak_at_risk" | "milestone_approaching" | "member_completed" | "cheer_received";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
}

const iconMap = {
  daily_goal: Clock,
  streak_at_risk: AlertTriangle,
  milestone_approaching: Calendar,
  member_completed: Users,
  cheer_received: Heart,
};

const colorMap = {
  daily_goal: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
  streak_at_risk: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
  milestone_approaching: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
  member_completed: "text-green-500 bg-green-50 dark:bg-green-950/30",
  cheer_received: "text-rose-500 bg-rose-50 dark:bg-rose-950/30",
};

export function NotificationsPanel({
  notifications,
  onDismiss,
  onDismissAll,
  notificationsEnabled,
  onToggleNotifications,
}: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {notificationsEnabled ? (
          <Bell className="w-5 h-5 text-muted-foreground" />
        ) : (
          <BellOff className="w-5 h-5 text-muted-foreground" />
        )}
        {unreadCount > 0 && notificationsEnabled && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-xs flex items-center justify-center text-white font-bold">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-80 z-50">
            <Card className="card-shadow">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleNotifications}
                    className="text-xs"
                  >
                    {notificationsEnabled ? "Disable" : "Enable"}
                  </Button>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDismissAll}
                      className="text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>

              <CardContent className="p-0 max-h-80 overflow-y-auto">
                {!notificationsEnabled ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Notifications are disabled</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success" />
                    <p className="text-sm">All caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => {
                      const Icon = iconMap[notification.type] || Bell;
                      const colorClass = colorMap[notification.type] || colorMap.daily_goal;

                      return (
                        <div
                          key={notification.id}
                          className={`p-4 flex gap-3 ${!notification.read ? "bg-primary/5" : ""}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                          <button
                            onClick={() => onDismiss(notification.id)}
                            className="flex-shrink-0 p-1 rounded hover:bg-muted"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
