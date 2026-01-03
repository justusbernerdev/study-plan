"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { useLanguage } from "@/lib/language-context";
import {
  X,
  Flame,
  Trophy,
  Target,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Heart,
  Sparkles,
  MessageCircle,
  Send,
  ThumbsUp,
  Star,
  Zap,
} from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { fi, enUS } from "date-fns/locale";

interface FriendDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  friendId: Id<"users">;
  currentUserId: Id<"users">;
}

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  cyan: "bg-cyan-500",
};

const cheerOptions = [
  { emoji: "🔥", message: "Keep it up!" },
  { emoji: "💪", message: "You got this!" },
  { emoji: "⭐", message: "Amazing work!" },
  { emoji: "🎯", message: "Stay focused!" },
  { emoji: "🚀", message: "To the moon!" },
  { emoji: "❤️", message: "Proud of you!" },
];

export function FriendDetailModal({ isOpen, onClose, friendId, currentUserId }: FriendDetailModalProps) {
  const { t, language } = useLanguage();
  const dateLocale = language === "fi" ? fi : enUS;
  const [selectedCheer, setSelectedCheer] = useState<number | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [showCheerPanel, setShowCheerPanel] = useState(false);
  const [isSendingCheer, setIsSendingCheer] = useState(false);

  const friend = useQuery(api.users.get, { id: friendId });
  const friendMilestones = useQuery(api.milestones.getByUser, { userId: friendId });
  const friendCourses = useQuery(api.courses.getByUser, { userId: friendId });
  const sendCheer = useMutation(api.cheers.send);

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

  const handleSendCheer = async () => {
    if (selectedCheer === null && !customMessage.trim()) return;

    setIsSendingCheer(true);
    try {
      const cheer = selectedCheer !== null ? cheerOptions[selectedCheer] : null;
      await sendCheer({
        fromUserId: currentUserId,
        toUserId: friendId,
        message: customMessage.trim() || cheer?.message || "You're doing great!",
        emoji: cheer?.emoji || "❤️",
      });

      toast({
        title: language === "fi" ? "Kannustus lähetetty!" : "Cheer sent!",
        description: language === "fi" 
          ? `${friend.name} saa kannustuksesi!`
          : `${friend.name} will receive your cheer!`,
      });

      setShowCheerPanel(false);
      setSelectedCheer(null);
      setCustomMessage("");
    } catch (error) {
      toast({
        title: language === "fi" ? "Virhe" : "Error",
        description: language === "fi" ? "Kannustuksen lähettäminen epäonnistui" : "Failed to send cheer",
        variant: "destructive",
      });
    }
    setIsSendingCheer(false);
  };

  const totalCourseProgress = friendCourses?.length || 0;
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
                className="w-16 h-16 rounded-full ring-4 ring-primary/20 object-cover"
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCheerPanel(!showCheerPanel)}
              className="gap-2"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              {language === "fi" ? "Kannusta" : "Cheer"}
            </Button>
          </div>

          {/* Cheer Panel */}
          {showCheerPanel && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-200 dark:border-rose-800 animate-in slide-in-from-top-2">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                {language === "fi" ? "Valitse kannustus" : "Choose a cheer"}
              </p>
              
              {/* Quick cheers */}
              <div className="flex flex-wrap gap-2 mb-3">
                {cheerOptions.map((cheer, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCheer(selectedCheer === index ? null : index)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                      selectedCheer === index
                        ? "bg-rose-500 text-white border-rose-500 scale-105"
                        : "bg-background hover:bg-rose-100 dark:hover:bg-rose-900/30 border-border"
                    }`}
                  >
                    {cheer.emoji} {language === "fi" ? 
                      (cheer.message === "Keep it up!" ? "Jatka samaan malliin!" :
                       cheer.message === "You got this!" ? "Pystyt tähän!" :
                       cheer.message === "Amazing work!" ? "Mahtavaa työtä!" :
                       cheer.message === "Stay focused!" ? "Pysy keskittyneenä!" :
                       cheer.message === "To the moon!" ? "Kuuhun asti!" :
                       "Olen ylpeä sinusta!") 
                      : cheer.message}
                  </button>
                ))}
              </div>

              {/* Custom message */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={language === "fi" ? "Tai kirjoita oma viesti..." : "Or write a custom message..."}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <Button
                  onClick={handleSendCheer}
                  disabled={isSendingCheer || (selectedCheer === null && !customMessage.trim())}
                  className="gap-2 bg-rose-500 hover:bg-rose-600"
                >
                  {isSendingCheer ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {language === "fi" ? "Lähetä" : "Send"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-220px)] space-y-6">
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

          {/* Today's Activity */}
          {friendCourses && friendCourses.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                {language === "fi" ? "Tänään tehty" : "Today's Activity"}
              </h3>
              <div className="space-y-2">
                {friendCourses.map((course) => (
                  <FriendCourseWithTodayTasks
                    key={course._id}
                    courseId={course._id}
                    title={course.title}
                    color={course.color}
                    language={language}
                  />
                ))}
              </div>
            </div>
          )}

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

// Today's tasks for a course
function FriendCourseWithTodayTasks({
  courseId,
  title,
  color,
  language,
}: {
  courseId: Id<"courses">;
  title: string;
  color: string;
  language: string;
}) {
  const categories = useQuery(api.categories.getByCourse, { courseId });
  const course = useQuery(api.courses.get, { id: courseId });
  
  const todayCompleted = categories?.reduce((sum, cat) => sum + (cat.todayCompleted || 0), 0) || 0;
  const checkedItems = course?.checkedItems?.length || 0;
  const totalToday = todayCompleted + checkedItems;

  if (totalToday === 0) return null;

  const colorClass = colorMap[color] || "bg-emerald-500";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
      <div className={`w-3 h-3 rounded-full ${colorClass}`} />
      <span className="font-medium text-sm flex-1">{title}</span>
      <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        {totalToday} {language === "fi" ? "tehty" : "done"}
      </Badge>
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
