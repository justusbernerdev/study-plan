"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";
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
  Sparkles,
} from "lucide-react";

interface LocalNotification {
  id: string;
  type: "daily_goal" | "streak_at_risk" | "milestone_approaching" | "member_completed";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface NotificationsProps {
  notifications: LocalNotification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  userId?: Id<"users">;
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
  userId,
}: NotificationsProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch cheers from Convex
  const cheers = useQuery(
    api.cheers.getUnread,
    userId ? { userId } : "skip"
  );
  const cheersWithSender = useQuery(
    api.cheers.getByRecipient,
    userId ? { userId } : "skip"
  );
  const markCheerAsRead = useMutation(api.cheers.markAsRead);
  const markAllCheersAsRead = useMutation(api.cheers.markAllAsRead);

  // Get sender names for cheers
  const allUsers = useQuery(api.users.list);
  
  const getUserName = (userId: Id<"users">) => {
    return allUsers?.find(u => u._id === userId)?.name || "Someone";
  };

  const unreadCheersCount = cheers?.length || 0;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const totalUnread = unreadCheersCount + unreadNotificationsCount;

  const handleMarkCheerAsRead = async (cheerId: Id<"cheers">) => {
    await markCheerAsRead({ id: cheerId });
  };

  const handleClearAll = async () => {
    onDismissAll();
    if (userId) {
      await markAllCheersAsRead({ userId });
    }
  };

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
        {totalUnread > 0 && notificationsEnabled && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-xs flex items-center justify-center text-white font-bold">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50">
            <Card className="card-shadow">
              <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm sm:text-base">
                  {language === "fi" ? "Ilmoitukset" : "Notifications"}
                </h3>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleNotifications}
                    className="text-xs h-7 px-2"
                  >
                    {notificationsEnabled 
                      ? (language === "fi" ? "Pois" : "Off") 
                      : (language === "fi" ? "Päällä" : "On")}
                  </Button>
                  {(notifications.length > 0 || (cheersWithSender && cheersWithSender.length > 0)) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-xs h-7 px-2"
                    >
                      {language === "fi" ? "Tyhjennä" : "Clear"}
                    </Button>
                  )}
                </div>
              </div>

              <CardContent className="p-0 max-h-80 overflow-y-auto">
                {!notificationsEnabled ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {language === "fi" ? "Ilmoitukset pois päältä" : "Notifications disabled"}
                    </p>
                  </div>
                ) : (notifications.length === 0 && (!cheersWithSender || cheersWithSender.length === 0)) ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success" />
                    <p className="text-sm">
                      {language === "fi" ? "Ei uusia ilmoituksia!" : "All caught up!"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {/* Cheers */}
                    {cheersWithSender?.map((cheer) => (
                      <div
                        key={cheer._id}
                        className={`p-3 sm:p-4 flex gap-3 ${!cheer.read ? "bg-rose-50/50 dark:bg-rose-950/20" : ""}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                          {cheer.emoji ? (
                            <span className="text-lg">{cheer.emoji}</span>
                          ) : (
                            <Heart className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {getUserName(cheer.fromUserId)} {language === "fi" ? "kannusti sinua!" : "cheered you!"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            "{cheer.message}"
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(cheer.timestamp, language)}
                          </p>
                        </div>
                        {!cheer.read && (
                          <button
                            onClick={() => handleMarkCheerAsRead(cheer._id)}
                            className="flex-shrink-0 p-1 rounded hover:bg-muted"
                            title={language === "fi" ? "Merkitse luetuksi" : "Mark as read"}
                          >
                            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Local notifications */}
                    {notifications.map((notification) => {
                      const Icon = iconMap[notification.type] || Bell;
                      const colorClass = colorMap[notification.type] || colorMap.daily_goal;

                      return (
                        <div
                          key={notification.id}
                          className={`p-3 sm:p-4 flex gap-3 ${!notification.read ? "bg-primary/5" : ""}`}
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
                              {formatTimeAgo(notification.timestamp, language)}
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

function formatTimeAgo(timestamp: number, language: string): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return language === "fi" ? "Juuri nyt" : "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}${language === "fi" ? " min sitten" : "m ago"}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}${language === "fi" ? " t sitten" : "h ago"}`;
  return `${Math.floor(seconds / 86400)}${language === "fi" ? " pv sitten" : "d ago"}`;
}
