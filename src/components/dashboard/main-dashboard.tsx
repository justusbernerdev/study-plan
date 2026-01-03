"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { GoalHeader } from "./goal-header";
import { FeedbackModal } from "./feedback-modal";
import { StreakDisplay } from "./streak-display";
import { NewGoalForm } from "./new-goal-form";
import { NotificationsPanel } from "./notifications";
import { InviteFriend } from "./invite-friend";
import { CourseDetailModal } from "./course-detail-modal";
import { AddCourseModal } from "./add-course-modal";
import { CourseMenu } from "./course-menu";
import { MilestoneMenu } from "./milestone-menu";
import { CourseCard } from "./course-card";
import { FriendDetailModal } from "./friend-detail-modal";
import { ProfileSettings } from "./profile-settings";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import {
  Loader2,
  Plus,
  LogOut,
  BookOpen,
  Users,
  Heart,
  UserPlus,
  Flame,
  ChevronRight,
  FileText,
  Languages,
  PenTool,
  Calculator,
  Lightbulb,
  ClipboardList,
  Target,
} from "lucide-react";

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

export function MainDashboard() {
  const { t, language } = useLanguage();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  // Get or create user in Convex
  const getOrCreateUser = useMutation(api.users.getOrCreate);
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null);

  // Sync Clerk user to Convex
  useEffect(() => {
    if (clerkUser) {
      getOrCreateUser({
        clerkId: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || "User",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        imageUrl: clerkUser.imageUrl,
      }).then((userId) => {
        setConvexUserId(userId);
      });
    }
  }, [clerkUser, getOrCreateUser]);

  // Queries
  const currentUser = useQuery(
    api.users.get,
    convexUserId ? { id: convexUserId } : "skip"
  );
  const milestones = useQuery(
    api.milestones.getByUser,
    convexUserId ? { userId: convexUserId } : "skip"
  );
  const courses = useQuery(
    api.courses.getByUser,
    convexUserId ? { userId: convexUserId } : "skip"
  );
  const friends = useQuery(
    api.connections.getFriends,
    convexUserId ? { userId: convexUserId } : "skip"
  );

  // State
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<Id<"milestones"> | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState<Id<"courses"> | null>(null);
  const [newGoalFormOpen, setNewGoalFormOpen] = useState(false);
  const [inviteFriendOpen, setInviteFriendOpen] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [courseDetailOpen, setCourseDetailOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<Id<"courses"> | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [friendDetailOpen, setFriendDetailOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<Id<"users"> | null>(null);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);

  // Mutations
  const createMilestone = useMutation(api.milestones.create);
  const sendCheer = useMutation(api.cheers.send);

  // Auto-select first milestone
  useEffect(() => {
    if (milestones && milestones.length > 0 && !selectedMilestoneId) {
      setSelectedMilestoneId(milestones[0]._id);
    }
  }, [milestones, selectedMilestoneId]);

  // Handlers
  const handleCreateGoal = async (goal: any) => {
    if (!convexUserId) return;

    const milestoneId = await createMilestone({
      userId: convexUserId,
      title: goal.title,
      description: goal.description,
      deadline: new Date(goal.deadline).getTime(),
      color: goal.color,
    });

    toast({
      title: t.goalCreated,
      description: `"${goal.title}"`,
    });

    setSelectedMilestoneId(milestoneId);
  };

  const handleSendCheer = async (toUserId: Id<"users">) => {
    if (!convexUserId) return;

    await sendCheer({
      fromUserId: convexUserId,
      toUserId,
      message: "Keep it up!",
    });

    toast({
      title: t.cheerSent,
      description: t.cheerSentDesc,
    });
  };

  const handleCourseClick = (courseId: Id<"courses">) => {
    setSelectedCourseId(courseId);
    setCourseDetailOpen(true);
  };

  const handleCourseCreated = (courseId: Id<"courses">) => {
    setSelectedCourseId(courseId);
    setCourseDetailOpen(true);
  };

  // Loading state
  if (!isClerkLoaded || !clerkUser) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern-bg">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!convexUserId || currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern-bg">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t.preparingProfile}</p>
        </div>
      </div>
    );
  }

  const selectedMilestone = milestones?.find((m) => m._id === selectedMilestoneId);
  const milestoneCourses = courses?.filter((c) => c.milestoneId === selectedMilestoneId) || [];

  return (
    <div className="min-h-screen pattern-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border safe-area-bottom">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-base sm:text-xl font-bold gradient-text hidden xs:block">{t.appName}</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              
              {/* Mobile: Only show essential toggles */}
              <div className="flex sm:hidden items-center gap-1">
                <LanguageToggle />
                <ThemeToggle />
              </div>

              <div className="hidden sm:block">
                <NotificationsPanel
                  notifications={notifications}
                  onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
                  onDismissAll={() => setNotifications([])}
                  notificationsEnabled={notificationsEnabled}
                  onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
                />
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-3 border-l border-border">
                <button
                  onClick={() => setProfileSettingsOpen(true)}
                  className="relative group cursor-pointer"
                  title={language === "fi" ? "Muokkaa profiilia" : "Edit profile"}
                >
                  {currentUser?.imageUrl || clerkUser.imageUrl ? (
                    <img
                      src={currentUser?.imageUrl || clerkUser.imageUrl}
                      alt={clerkUser.fullName || "User"}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-transparent group-hover:ring-primary transition-all object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs sm:text-sm ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                      {(clerkUser.fullName || clerkUser.firstName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[8px] text-white">✎</span>
                  </div>
                </button>
                <span className="hidden md:inline text-sm font-medium max-w-[100px] truncate">
                  {clerkUser.fullName || clerkUser.firstName}
                </span>
                <SignOutButton>
                  <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-9 sm:h-9" title={t.signOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </SignOutButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Milestone Selector - Scrollable on mobile */}
        {milestones && milestones.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1 hide-scrollbar">
            <span className="text-xs sm:text-sm text-muted-foreground shrink-0">{t.goals}:</span>
            {milestones.map((milestone) => (
              <div key={milestone._id} className="flex items-center shrink-0">
                <Button
                  variant={selectedMilestoneId === milestone._id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMilestoneId(milestone._id)}
                  className="gap-1 sm:gap-2 pr-1 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <span className="max-w-[100px] sm:max-w-none truncate">{milestone.title}</span>
                  <MilestoneMenu
                    milestoneId={milestone._id}
                    milestoneTitle={milestone.title}
                    onEdit={() => {
                      setSelectedMilestoneId(milestone._id);
                      // TODO: Open edit milestone modal
                    }}
                    onDeleted={() => {
                      if (selectedMilestoneId === milestone._id) {
                        setSelectedMilestoneId(null);
                      }
                    }}
                  />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewGoalFormOpen(true)}
              className="gap-1 shrink-0 text-xs sm:text-sm h-8 sm:h-9"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">{t.addGoal}</span>
            </Button>
          </div>
        )}

        {/* Empty state - no milestones */}
        {(!milestones || milestones.length === 0) && (
          <Card className="card-shadow">
            <CardContent className="p-6 sm:p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{t.createFirstGoal}</h2>
              <p className="text-muted-foreground mb-6">
                {t.setGoalToStart}
              </p>
              <Button onClick={() => setNewGoalFormOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                {t.createGoal}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Goal Header */}
        {selectedMilestone && currentUser && (
          <GoalHeader
            title={selectedMilestone.title}
            deadline={new Date(selectedMilestone.deadline)}
            currentStreak={currentUser.currentStreak ?? 0}
            longestStreak={currentUser.longestStreak ?? 0}
          />
        )}

        {/* Streak Display */}
        {currentUser && (
          <StreakDisplay
            currentStreak={currentUser.currentStreak ?? 0}
            longestStreak={currentUser.longestStreak ?? 0}
            userName={currentUser.name}
          />
        )}

        {/* Courses Section */}
        {selectedMilestoneId && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-foreground">{t.courses}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddCourseOpen(true)}
                className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{t.addCourse}</span>
                <span className="xs:hidden">{language === "fi" ? "Lisää" : "Add"}</span>
              </Button>
            </div>

            {milestoneCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {milestoneCourses.map((course, index) => (
                  <div
                    key={course._id}
                    className="fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CourseCard
                      courseId={course._id}
                      onOpenDetail={() => handleCourseClick(course._id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="card-shadow">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">{t.noCourses}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-4">
                    {t.noCoursesDesc}
                  </p>
                  <Button onClick={() => setAddCourseOpen(true)} className="gap-2 text-sm">
                    <Plus className="w-4 h-4" />
                    {t.addFirstCourse}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Study Partners Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h2 className="text-base sm:text-xl font-bold text-foreground">{t.studyPartners}</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInviteFriendOpen(true)}
              className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
            >
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{t.inviteFriend}</span>
              <span className="xs:hidden">{language === "fi" ? "Lisää" : "Add"}</span>
            </Button>
          </div>

          {friends && friends.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {friends.map((friend) => (
                <Card 
                  key={friend._id} 
                  className="card-shadow p-3 sm:p-4 cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
                  onClick={() => {
                    setSelectedFriendId(friend._id);
                    setFriendDetailOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {friend.imageUrl ? (
                      <img
                        src={friend.imageUrl}
                        alt={friend.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm sm:text-base">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm sm:text-base">{friend.name}</p>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span>{friend.currentStreak ?? 0} {t.dayStreak}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleSendCheer(friend._id);
                      }}
                      className="gap-1 shrink-0 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">{t.cheer}</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">{t.noFriendsYet}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t.noFriendsDesc}
                </p>
                <Button
                  onClick={() => setInviteFriendOpen(true)}
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {t.inviteFriend}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{t.stayFocused}</p>
        </div>
      </footer>

      {/* Modals */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={() => {}}
        subjectTitle=""
        tasksCompleted={0}
      />

      <NewGoalForm
        isOpen={newGoalFormOpen}
        onClose={() => setNewGoalFormOpen(false)}
        onSubmit={handleCreateGoal}
      />

      {convexUserId && (
        <InviteFriend
          isOpen={inviteFriendOpen}
          onClose={() => setInviteFriendOpen(false)}
          userId={convexUserId}
        />
      )}

      {convexUserId && selectedMilestoneId && (
        <AddCourseModal
          isOpen={addCourseOpen}
          onClose={() => setAddCourseOpen(false)}
          milestoneId={selectedMilestoneId}
          userId={convexUserId}
          onCourseCreated={handleCourseCreated}
        />
      )}

      {selectedCourseId && (
        <CourseDetailModal
          isOpen={courseDetailOpen}
          onClose={() => setCourseDetailOpen(false)}
          courseId={selectedCourseId}
        />
      )}

      {selectedFriendId && convexUserId && (
        <FriendDetailModal
          isOpen={friendDetailOpen}
          onClose={() => {
            setFriendDetailOpen(false);
            setSelectedFriendId(null);
          }}
          friendId={selectedFriendId}
          currentUserId={convexUserId}
        />
      )}

      {convexUserId && currentUser && (
        <ProfileSettings
          isOpen={profileSettingsOpen}
          onClose={() => setProfileSettingsOpen(false)}
          userId={convexUserId}
          currentImageUrl={currentUser.imageUrl}
          currentName={currentUser.name}
        />
      )}
    </div>
  );
}
