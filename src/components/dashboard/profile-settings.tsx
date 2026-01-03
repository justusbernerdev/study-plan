"use client";

import { useState, useEffect, useRef } from "react";
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
  Upload,
  Loader2,
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
  const [firstName, setFirstName] = useState(currentName.split(" ")[0] || "");
  const [lastName, setLastName] = useState(currentName.split(" ").slice(1).join(" ") || "");
  const [imageUrl, setImageUrl] = useState(currentImageUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = useMutation(api.users.updateProfile);
  const updateProfileImage = useMutation(api.users.updateProfileImage);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFirstName(currentName.split(" ")[0] || "");
      setLastName(currentName.split(" ").slice(1).join(" ") || "");
      setImageUrl(currentImageUrl || "");
      setSaved(false);
    }
  }, [isOpen, currentName, currentImageUrl]);

  if (!isOpen) return null;

  const fullName = `${firstName} ${lastName}`.trim();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: language === "fi" ? "Virhe" : "Error",
        description: language === "fi" 
          ? "Valitse kuvatiedosto (jpg, png, gif, webp)" 
          : "Please select an image file (jpg, png, gif, webp)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: language === "fi" ? "Virhe" : "Error",
        description: language === "fi" 
          ? "Kuva on liian suuri (max 5MB)" 
          : "Image is too large (max 5MB)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();

      // Update the user's profile image using the storage ID
      const newImageUrl = await updateProfileImage({
        id: userId,
        storageId: storageId,
      });
      
      setImageUrl(newImageUrl);
      
      toast({
        title: language === "fi" ? "Ladattu!" : "Uploaded!",
        description: language === "fi" 
          ? "Kuva ladattiin onnistuneesti" 
          : "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: language === "fi" ? "Virhe" : "Error",
        description: language === "fi" 
          ? "Kuvan lataus epäonnistui" 
          : "Failed to upload image",
        variant: "destructive",
      });
    }
    setIsUploading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      toast({
        title: language === "fi" ? "Virhe" : "Error",
        description: language === "fi" ? "Etunimi on pakollinen" : "First name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        id: userId,
        name: fullName,
        imageUrl: imageUrl.trim() || undefined,
      });

      toast({
        title: language === "fi" ? "Tallennettu!" : "Saved!",
        description: language === "fi" 
          ? "Profiilisi on päivitetty" 
          : "Your profile has been updated",
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
          ? "Profiilin päivitys epäonnistui" 
          : "Failed to update profile",
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

      <Card className="relative z-10 w-full max-w-md glass-modal card-shadow max-h-[90vh] overflow-y-auto">
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
          {/* Profile Picture Preview with Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={fullName}
                  className="w-24 h-24 rounded-full ring-4 ring-primary/20 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "";
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-3xl ring-4 ring-primary/20">
                  {firstName.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              
              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
              
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <p className="text-xs text-muted-foreground">
              {language === "fi" 
                ? "Klikkaa kuvaa ladataksesi uusi" 
                : "Click the image to upload a new one"}
            </p>
          </div>

          {/* Name Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === "fi" ? "Etunimi" : "First name"} *
              </label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setSaved(false);
                }}
                placeholder={language === "fi" ? "Matti" : "John"}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === "fi" ? "Sukunimi" : "Last name"}
              </label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setSaved(false);
                }}
                placeholder={language === "fi" ? "Meikäläinen" : "Doe"}
              />
            </div>
          </div>

          {/* Image URL Input (alternative to upload) */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Link className="w-4 h-4 text-muted-foreground" />
              {language === "fi" ? "Tai syötä kuvan URL" : "Or enter image URL"}
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
          </div>

          {/* Quick Options */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {language === "fi" ? "Lataa kuva" : "Upload image"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImageUrl("")}
            >
              {language === "fi" ? "Poista kuva" : "Remove image"}
            </Button>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving || !firstName.trim()}
            className="w-full gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
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
