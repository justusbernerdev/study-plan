"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Users,
  Trophy,
  Flame,
  CheckCircle2,
  Target,
  Copy,
  Check,
  Crown,
  Edit3,
  Eye,
} from "lucide-react";
import { useState } from "react";

interface GroupMember {
  _id: string;
  name: string;
  avatarUrl?: string;
  role: "admin" | "editor" | "viewer";
  currentStreak: number;
  progress: number;
  lastCompletedDate?: string;
}

interface GroupStats {
  totalMembers: number;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  averageStreak: number;
  membersCompletedToday: number;
}

interface GroupDashboardProps {
  groupName: string;
  inviteCode: string;
  members: GroupMember[];
  stats: GroupStats;
  currentUserId: string;
  currentUserRole: "admin" | "editor" | "viewer";
  onUpdateRole?: (memberId: string, role: "admin" | "editor" | "viewer") => void;
}

const roleIcons = {
  admin: Crown,
  editor: Edit3,
  viewer: Eye,
};

const roleColors = {
  admin: "text-amber-500",
  editor: "text-primary",
  viewer: "text-muted-foreground",
};

export function GroupDashboard({
  groupName,
  inviteCode,
  members,
  stats,
  currentUserId,
  currentUserRole,
  onUpdateRole,
}: GroupDashboardProps) {
  const [copied, setCopied] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>{groupName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {stats.totalMembers} member{stats.totalMembers !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyInviteCode}
              className="gap-2"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : inviteCode}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Collective Mastery */}
      <Card className="card-shadow bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <CardTitle>Collective Mastery</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-sm text-muted-foreground">Group Progress</span>
              <span className="text-3xl font-bold gradient-text">{stats.progress}%</span>
            </div>
            <Progress value={stats.progress} className="h-3" indicatorClassName="progress-gradient" />
            <p className="text-sm text-muted-foreground">
              {stats.completedTasks.toLocaleString()} of {stats.totalTasks.toLocaleString()} tasks completed
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold">{stats.averageStreak}</div>
              <div className="text-xs text-muted-foreground">Avg Streak</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <div className="text-2xl font-bold">{stats.membersCompletedToday}</div>
              <div className="text-xs text-muted-foreground">Done Today</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">{stats.totalMembers - stats.membersCompletedToday}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => {
            const RoleIcon = roleIcons[member.role];
            const completedToday = member.lastCompletedDate === today;

            return (
              <div
                key={member._id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  completedToday
                    ? "bg-success/5 border-success/30"
                    : "bg-card border-border"
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{member.name}</span>
                    <RoleIcon className={`w-4 h-4 ${roleColors[member.role]}`} />
                    {member._id === currentUserId && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {member.currentStreak} day streak
                    </span>
                    {completedToday && (
                      <Badge variant="outline" className="text-xs text-success border-success/30">
                        Done today
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="text-right">
                  <div className="text-lg font-bold">{member.progress}%</div>
                  <Progress value={member.progress} className="w-20 h-1.5" />
                </div>

                {/* Role Selector (Admin only) */}
                {currentUserRole === "admin" && member._id !== currentUserId && onUpdateRole && (
                  <select
                    value={member.role}
                    onChange={(e) => onUpdateRole(member._id, e.target.value as any)}
                    className="text-xs p-1 rounded border border-border bg-background"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

