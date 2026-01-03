"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import {
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";

interface CourseMenuProps {
  courseId: Id<"courses">;
  courseTitle: string;
  onEdit: () => void;
}

export function CourseMenu({ courseId, courseTitle, onEdit }: CourseMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const removeCourse = useMutation(api.courses.remove);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      await removeCourse({ id: courseId });
      toast({
        title: "Kurssi poistettu",
        description: `"${courseTitle}" on poistettu.`,
      });
      setIsOpen(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      toast({
        title: "Virhe",
        description: "Kurssin poistaminen epäonnistui.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    setIsOpen(false);
    onEdit();
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setShowDeleteConfirm(false);
        }}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 min-w-[160px] rounded-xl border border-border bg-card shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors text-left"
              >
                <Edit3 className="w-4 h-4 text-muted-foreground" />
                Muokkaa
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-destructive/10 text-destructive transition-colors text-left"
              >
                <Trash2 className="w-4 h-4" />
                Poista
              </button>
            </>
          ) : (
            <div className="p-3 space-y-3">
              <p className="text-sm font-medium">Poista kurssi?</p>
              <p className="text-xs text-muted-foreground">
                Tämä poistaa kurssin ja kaikki sen kategoriat.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1"
                >
                  Peruuta
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="flex-1"
                >
                  Poista
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

