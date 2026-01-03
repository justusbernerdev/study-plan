"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import {
  X,
  UserPlus,
  Copy,
  Check,
  Users,
  Hash,
  ArrowRight,
  Flame,
  User,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface InviteFriendProps {
  isOpen: boolean;
  onClose: () => void;
  userId: Id<"users">;
}

export function InviteFriend({ isOpen, onClose, userId }: InviteFriendProps) {
  const { t, language } = useLanguage();
  const [friendCode, setFriendCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useQuery(api.users.get, { id: userId });
  const connectByCode = useMutation(api.connections.connectByStudyCode);
  
  // Preview friend when code is 6 characters
  const friendPreview = useQuery(
    api.users.previewByStudyCode,
    friendCode.length === 6 ? { studyCode: friendCode } : "skip"
  );

  // Clear error when code changes
  const handleCodeChange = (value: string) => {
    setFriendCode(value.toUpperCase());
    setError(null);
  };

  if (!isOpen) return null;

  const isOwnCode = currentUser?.studyCode && friendCode.toUpperCase() === currentUser.studyCode;

  const handleCopyCode = () => {
    if (currentUser?.studyCode) {
      navigator.clipboard.writeText(currentUser.studyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: t.copied,
        description: t.studyCodeCopied,
      });
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCode.trim()) return;

    // Check if trying to add own code
    if (currentUser?.studyCode && friendCode.trim().toUpperCase() === currentUser.studyCode) {
      setError(t.cantAddYourself);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await connectByCode({
        userId,
        studyCode: friendCode.trim(),
      });

      toast({
        title: t.friendAdded,
        description: `${result.friendName} ${t.isNowYourFriend}`,
        variant: "success",
      });
      setFriendCode("");
      onClose();
    } catch (error: any) {
      // Parse the error message
      let errorMessage: string = t.error;
      const errorText = error.message || error.data?.message || "";
      
      if (errorText.includes("itseäsi") || errorText.includes("yourself")) {
        errorMessage = t.cantAddYourself;
      } else if (errorText.includes("ei löydy") || errorText.includes("not found")) {
        errorMessage = t.codeNotFound;
      } else if (errorText.includes("jo kavereita") || errorText.includes("already")) {
        errorMessage = t.alreadyFriends;
      }

      setError(errorMessage);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative z-10 w-full max-w-lg glass-modal card-shadow">
        <CardHeader className="relative pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{t.addFriend}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t.shareCodeOrAdd}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Your Study Code */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Hash className="w-4 h-4 text-primary" />
              {t.yourStudyCode}
            </div>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">
                {t.shareThisCode}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-4 rounded-xl bg-background font-mono text-2xl font-bold text-primary tracking-widest text-center">
                  {currentUser?.studyCode || "..."}
                </code>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCopyCode}
                  className="shrink-0 gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t.copy}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t.or}</span>
            </div>
          </div>

          {/* Add Friend's Code */}
          <form onSubmit={handleAddFriend} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <UserPlus className="w-4 h-4 text-muted-foreground" />
              {t.addFriendsCode}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={friendCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="ABCD12"
                maxLength={6}
                className={`flex-1 p-4 rounded-xl border bg-background text-foreground font-mono text-xl font-bold tracking-widest uppercase text-center placeholder:text-muted-foreground placeholder:font-normal focus:outline-none focus:ring-2 ${
                  error || isOwnCode ? "border-destructive focus:ring-destructive" : friendPreview ? "border-green-500 focus:ring-green-500" : "border-border focus:ring-primary"
                }`}
              />
              <Button
                type="submit"
                disabled={isSubmitting || friendCode.length < 6 || !friendPreview || !!isOwnCode}
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-6"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    {t.add}
                  </>
                )}
              </Button>
            </div>

            {/* Friend Preview */}
            {friendCode.length === 6 && !isOwnCode && friendPreview && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  {friendPreview.imageUrl ? (
                    <img
                      src={friendPreview.imageUrl}
                      alt={friendPreview.name}
                      className="w-12 h-12 rounded-full ring-2 ring-green-500/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-green-500/30">
                      {friendPreview.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{friendPreview.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span>{friendPreview.currentStreak} {t.dayStreak}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    {language === "fi" ? "Löydetty" : "Found"}
                  </Badge>
                </div>
              </div>
            )}

            {/* No user found */}
            {friendCode.length === 6 && !isOwnCode && friendPreview === null && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                {t.codeNotFound}
              </div>
            )}

            {/* Own code warning */}
            {isOwnCode && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {t.cantAddYourself}
              </div>
            )}

            {/* Error message */}
            {error && !isOwnCode && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
          </form>

          {/* Instructions */}
          <div className="p-4 rounded-xl bg-muted/30 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4 text-primary" />
              {t.howItWorks}
            </div>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>{t.step1}</li>
              <li>{t.step2}</li>
              <li>{t.step3}</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
