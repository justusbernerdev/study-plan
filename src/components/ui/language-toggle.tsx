"use client";

import { useLanguage } from "@/lib/language-context";
import { Button } from "./button";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fi" : "en");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      title={language === "en" ? "Switch to Finnish" : "Vaihda englanniksi"}
      className="relative"
    >
      <Languages className="w-5 h-5" />
      <span className="absolute -bottom-0.5 -right-0.5 text-[10px] font-bold uppercase bg-primary text-primary-foreground rounded px-1">
        {language}
      </span>
    </Button>
  );
}

