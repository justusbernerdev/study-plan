"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { useLanguage } from "@/lib/language-context";
import {
  X,
  User,
  Camera,
  Save,
  Link,
  Check,
} from "lucide-react";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userId: Id<"users">;
  currentImageUrl?: string;
  currentName: string;
}

export function ProfileSettings({
  isOpen,
  onClose,
  userId,
  currentImageUrl,
  currentName,
}: ProfileSettingsProps) {
  const { language } = useLanguage();
  const [imageUrl, setImageUrl] = useState(currentImageUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateProfilePicture = useMutation(api.users.updateProfilePicture);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfilePicture({
        id: userId,
        imageUrl: imageUrl.trim(),
      });

      toast({
        title: language === "fi" ? "Tallennettu!" : "Saved!",
        description: language === "fi" 
          ? "Profiilikuvasi on päivitetty" 
          : "Your profile picture has been updated",
      });

      setSaved(true);
      setTimeout(() => {
        onClose();
        setSaved(false);
      }, 1000);
    } catch (error) {
      toast({
        title: language === "fi" ? "Virhe" : "Error",
        description: language === "fi" 
          ? "Profiilikuvan päivitys epäonnistui" 
          : "Failed to update profile picture",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative z-10 w-full max-w-md glass-modal card-shadow">
        <CardHeader className="relative pb-4 border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {language === "fi" ? "Profiiliasetukset" : "Profile Settings"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === "fi" ? "Muokkaa profiiliasi" : "Edit your profile"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Profile Picture Preview */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={currentName}
                  className="w-24 h-24 rounded-full ring-4 ring-primary/20 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-3xl ring-4 ring-primary/20">
                  {currentName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="font-medium">{currentName}</p>
          </div>

          {/* Image URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Link className="w-4 h-4 text-muted-foreground" />
              {language === "fi" ? "Profiilikuvan URL" : "Profile Picture URL"}
            </label>
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setSaved(false);
              }}
              placeholder="https://example.com/your-photo.jpg"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {language === "fi" 
                ? "Syötä kuvan URL-osoite (esim. Gravatar, Imgur, jne.)" 
                : "Enter an image URL (e.g., Gravatar, Imgur, etc.)"}
            </p>
          </div>

          {/* Quick Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {language === "fi" ? "Pikavalinnat" : "Quick Options"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImageUrl("")}
              >
                {language === "fi" ? "Käytä oletusta" : "Use default"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const gravatarUrl = `https://www.gravatar.com/avatar/${currentName.toLowerCase().replace(/\s/g, "")}?d=identicon&s=200`;
                  setImageUrl(gravatarUrl);
                }}
              >
                Gravatar
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {language === "fi" ? "Tallennetaan..." : "Saving..."}
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                {language === "fi" ? "Tallennettu!" : "Saved!"}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {language === "fi" ? "Tallenna" : "Save"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

