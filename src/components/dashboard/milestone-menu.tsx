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
  CheckCircle,
} from "lucide-react";

interface MilestoneMenuProps {
  milestoneId: Id<"milestones">;
  milestoneTitle: string;
  onEdit: () => void;
  onDeleted: () => void;
}

export function MilestoneMenu({ milestoneId, milestoneTitle, onEdit, onDeleted }: MilestoneMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const removeMilestone = useMutation(api.milestones.remove);

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
      await removeMilestone({ id: milestoneId });
      toast({
        title: "Tavoite poistettu",
        description: `"${milestoneTitle}" on poistettu.`,
      });
      setIsOpen(false);
      setShowDeleteConfirm(false);
      onDeleted();
    } catch (error) {
      toast({
        title: "Virhe",
        description: "Tavoitteen poistaminen epäonnistui.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    setIsOpen(false);
    onEdit();
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 ml-1"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setShowDeleteConfirm(false);
        }}
      >
        <MoreVertical className="w-3 h-3" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-8 z-50 min-w-[160px] rounded-xl border border-border bg-card shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
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
              <p className="text-sm font-medium">Poista tavoite?</p>
              <p className="text-xs text-muted-foreground">
                Tämä poistaa tavoitteen ja kaikki sen kurssit.
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

