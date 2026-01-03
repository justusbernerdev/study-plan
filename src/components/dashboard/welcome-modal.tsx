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
  Sparkles,
  User,
  Camera,
  ArrowRight,
  Check,
  Link,
} from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: Id<"users">;
  initialName: string;
  initialImageUrl?: string;
}

export function WelcomeModal({
  isOpen,
  onClose,
  userId,
  initialName,
  initialImageUrl,
}: WelcomeModalProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState(initialName.split(" ")[0] || "");
  const [lastName, setLastName] = useState(initialName.split(" ").slice(1).join(" ") || "");
  const [imageUrl, setImageUrl] = useState(initialImageUrl || "");
  const [isSaving, setIsSaving] = useState(false);

  const updateProfile = useMutation(api.users.updateProfile);

  if (!isOpen) return null;

  const fullName = `${firstName} ${lastName}`.trim();

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
        title: language === "fi" ? "Tervetuloa!" : "Welcome!",
        description: language === "fi" 
          ? "Profiilisi on valmis. Aloita opiskelemaan!"
          : "Your profile is ready. Start studying!",
      });

      onClose();
    } catch (error) {
      toast({
        title: language === "fi" ? "Virhe" : "Error",
        description: language === "fi" ? "Profiilin päivitys epäonnistui" : "Failed to update profile",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-md" />

      <Card className="relative z-10 w-full max-w-md glass-modal card-shadow overflow-hidden">
        {/* Progress indicator */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>

        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {language === "fi" ? "Tervetuloa!" : "Welcome!"}
          </CardTitle>
          <p className="text-muted-foreground">
            {step === 1 
              ? (language === "fi" ? "Kerro meille nimesi" : "Tell us your name")
              : (language === "fi" ? "Lisää profiilikuva (valinnainen)" : "Add a profile picture (optional)")
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pb-6">
          {step === 1 ? (
            <>
              {/* Name inputs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {language === "fi" ? "Etunimi" : "First name"} *
                  </label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={language === "fi" ? "Matti" : "John"}
                    className="text-lg"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {language === "fi" ? "Sukunimi" : "Last name"}
                  </label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={language === "fi" ? "Meikäläinen" : "Doe"}
                    className="text-lg"
                  />
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!firstName.trim()}
                className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                size="lg"
              >
                {language === "fi" ? "Jatka" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              {/* Profile picture */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={fullName}
                      className="w-24 h-24 rounded-full ring-4 ring-primary/20 object-cover"
                      onError={() => setImageUrl("")}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-3xl ring-4 ring-primary/20">
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="font-semibold text-lg">{fullName}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Link className="w-4 h-4 text-muted-foreground" />
                  {language === "fi" ? "Kuvan URL (valinnainen)" : "Image URL (optional)"}
                </label>
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  {language === "fi" 
                    ? "Voit lisätä kuvan myöhemmin asetuksista"
                    : "You can add an image later in settings"}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  {language === "fi" ? "Takaisin" : "Back"}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {language === "fi" ? "Aloita!" : "Start!"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

