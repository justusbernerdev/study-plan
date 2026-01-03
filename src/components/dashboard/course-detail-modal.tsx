"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  FileText,
  Languages,
  PenTool,
  Calculator,
  Lightbulb,
  ClipboardList,
  Target,
  Sparkles,
  Check,
  Calendar,
  CalendarCheck,
  Clock,
  TrendingUp,
  CheckCircle2,
  Circle,
  History,
} from "lucide-react";
import { PastDaysModal } from "./past-days-modal";

interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: Id<"courses">;
}

const iconOptions = [
  { value: "BookOpen", icon: BookOpen, label: "Kirja" },
  { value: "FileText", icon: FileText, label: "Teksti" },
  { value: "Languages", icon: Languages, label: "Kieli" },
  { value: "PenTool", icon: PenTool, label: "Kynä" },
  { value: "Calculator", icon: Calculator, label: "Laskuri" },
  { value: "Lightbulb", icon: Lightbulb, label: "Idea" },
  { value: "ClipboardList", icon: ClipboardList, label: "Lista" },
  { value: "Target", icon: Target, label: "Tavoite" },
];

const colorOptions = [
  { value: "emerald", label: "Vihreä", class: "bg-emerald-500" },
  { value: "blue", label: "Sininen", class: "bg-blue-500" },
  { value: "purple", label: "Violetti", class: "bg-purple-500" },
  { value: "rose", label: "Ruusu", class: "bg-rose-500" },
  { value: "amber", label: "Keltainen", class: "bg-amber-500" },
  { value: "cyan", label: "Syaani", class: "bg-cyan-500" },
];

const defaultCategories = [
  { name: "Sanasto", icon: "Languages", color: "emerald" },
  { name: "Tehtävät", icon: "ClipboardList", color: "blue" },
  { name: "Kielioppi", icon: "PenTool", color: "purple" },
];

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString("fi-FI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function getDaysRemaining(endDate: number | undefined): number {
  if (!endDate) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function calculateDailyQuota(remaining: number, daysLeft: number): number {
  if (daysLeft <= 0) return remaining;
  return Math.ceil(remaining / daysLeft);
}

export function CourseDetailModal({ isOpen, onClose, courseId }: CourseDetailModalProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryTotal, setNewCategoryTotal] = useState(10);
  const [newCategoryIcon, setNewCategoryIcon] = useState("BookOpen");
  const [newCategoryColor, setNewCategoryColor] = useState("emerald");
  const [activeTab, setActiveTab] = useState<"today" | "overview" | "categories">("today");
  const [pastDaysModalOpen, setPastDaysModalOpen] = useState(false);

  const courseWithCategories = useQuery(api.courses.getWithCategories, { id: courseId });
  const createCategory = useMutation(api.categories.create);
  const updateCategoryProgress = useMutation(api.categories.updateProgress);
  const removeCategory = useMutation(api.categories.remove);
  const toggleCheckItem = useMutation(api.courses.toggleCheckItem);

  // Calculate daily quotas
  const dailyQuotas = useMemo(() => {
    if (!courseWithCategories?.categories) return [];
    
    const daysLeft = getDaysRemaining(courseWithCategories.endDate);
    
    return courseWithCategories.categories.map((cat) => {
      const remaining = cat.total - cat.completed;
      const dailyQuota = calculateDailyQuota(remaining, daysLeft);
      return {
        ...cat,
        remaining,
        dailyQuota,
        daysLeft,
      };
    });
  }, [courseWithCategories]);

  // Today's tasks
  const todayTasks = useMemo(() => {
    const tasks: { categoryId: Id<"categories">; categoryName: string; index: number; itemId: string; color: string; icon: string }[] = [];
    
    dailyQuotas.forEach((cat) => {
      for (let i = 0; i < cat.dailyQuota; i++) {
        tasks.push({
          categoryId: cat._id,
          categoryName: cat.name,
          index: i + 1,
          itemId: `${cat._id}_${i}`,
          color: cat.color,
          icon: cat.icon,
        });
      }
    });
    
    return tasks;
  }, [dailyQuotas]);

  const checkedItems = courseWithCategories?.checkedItems || [];
  const completedToday = todayTasks.filter((t) => checkedItems.includes(t.itemId)).length;
  const allTasksComplete = todayTasks.length > 0 && completedToday === todayTasks.length;

  if (!isOpen) return null;

  const handleAddCategory = async () => {
    if (!newCategoryName || newCategoryTotal <= 0) return;

    try {
      await createCategory({
        courseId,
        name: newCategoryName,
        icon: newCategoryIcon,
        color: newCategoryColor,
        total: newCategoryTotal,
      });

      setNewCategoryName("");
      setNewCategoryTotal(10);
      setNewCategoryIcon("BookOpen");
      setNewCategoryColor("emerald");
      setIsAddingCategory(false);

      toast({
        title: "Kategoria lisätty!",
        description: `${newCategoryName} lisätty kurssille.`,
      });
    } catch (error) {
      toast({
        title: "Virhe",
        description: "Kategorian lisääminen epäonnistui.",
        variant: "destructive",
      });
    }
  };

  const handleAddDefaultCategories = async () => {
    try {
      for (const cat of defaultCategories) {
        await createCategory({
          courseId,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          total: 50,
        });
      }
      toast({
        title: "Oletuskategoriat lisätty!",
        description: "Sanasto, Tehtävät ja Kielioppi lisätty.",
      });
    } catch (error) {
      toast({
        title: "Virhe",
        description: "Kategorioiden lisääminen epäonnistui.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: Id<"categories">) => {
    try {
      await removeCategory({ id: categoryId });
      toast({
        title: "Kategoria poistettu",
      });
    } catch (error) {
      toast({
        title: "Virhe",
        description: "Kategorian poistaminen epäonnistui.",
        variant: "destructive",
      });
    }
  };

  const handleProgressChange = async (categoryId: Id<"categories">, increment: number) => {
    await updateCategoryProgress({ id: categoryId, increment });
  };

  const handleToggleTask = async (itemId: string, checked: boolean) => {
    await toggleCheckItem({ id: courseId, itemId, checked });
  };

  const getIconComponent = (iconName: string) => {
    const found = iconOptions.find((i) => i.value === iconName);
    return found ? found.icon : BookOpen;
  };

  const getColorClass = (colorName: string) => {
    const found = colorOptions.find((c) => c.value === colorName);
    return found ? found.class : "bg-emerald-500";
  };

  const categories = courseWithCategories?.categories || [];
  const totalProgress = categories.reduce((sum, cat) => sum + cat.completed, 0);
  const totalItems = categories.reduce((sum, cat) => sum + cat.total, 0);
  const progressPercent = totalItems > 0 ? Math.round((totalProgress / totalItems) * 100) : 0;
  const daysLeft = getDaysRemaining(courseWithCategories?.endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />

      <Card className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden glass-modal card-shadow">
        <CardHeader className="relative pb-4 border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl ${getColorClass(courseWithCategories?.color || "emerald")} flex items-center justify-center`}
            >
              {(() => {
                const Icon = getIconComponent(courseWithCategories?.icon || "BookOpen");
                return <Icon className="w-7 h-7 text-white" />;
              })()}
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{courseWithCategories?.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {courseWithCategories?.description || "Hallitse kategorioita ja seuraa edistymistä"}
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {progressPercent}%
            </Badge>
          </div>

          {/* Date info */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Alkaa: {formatDate(courseWithCategories?.startDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarCheck className="w-4 h-4" />
              <span>Takaraja: {formatDate(courseWithCategories?.endDate)}</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-primary" />
              <span>{daysLeft} päivää jäljellä</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${getColorClass(courseWithCategories?.color || "emerald")} transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button
              variant={activeTab === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("today")}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Tänään ({completedToday}/{todayTasks.length})
            </Button>
            <Button
              variant={activeTab === "overview" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("overview")}
              className="gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Yleiskatsaus
            </Button>
            <Button
              variant={activeTab === "categories" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("categories")}
              className="gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              Kategoriat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPastDaysModalOpen(true)}
              className="gap-2 ml-auto"
            >
              <History className="w-4 h-4" />
              Aiemmat päivät
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Today's Tasks Tab */}
          {activeTab === "today" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Päivän tehtävät</h3>
                {allTasksComplete && (
                  <Badge className="bg-emerald-500 text-white gap-1">
                    <Check className="w-3 h-3" />
                    Kaikki tehty!
                  </Badge>
                )}
              </div>

              {todayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Lisää kategorioita nähdäksesi päivittäiset tehtävät
                  </p>
                  <Button onClick={() => setActiveTab("categories")} className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Lisää kategorioita
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Group tasks by category */}
                  {dailyQuotas.map((cat) => {
                    const categoryTasks = todayTasks.filter((t) => t.categoryId === cat._id);
                    if (categoryTasks.length === 0) return null;
                    
                    const Icon = getIconComponent(cat.icon);
                    const completedInCategory = categoryTasks.filter((t) =>
                      checkedItems.includes(t.itemId)
                    ).length;

                    return (
                      <div key={cat._id} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <div className={`w-6 h-6 rounded-md ${getColorClass(cat.color)} flex items-center justify-center`}>
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                          <span>{cat.name}</span>
                          <span className="text-muted-foreground">
                            ({completedInCategory}/{categoryTasks.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pl-8">
                          {categoryTasks.map((task) => {
                            const isChecked = checkedItems.includes(task.itemId);
                            return (
                              <button
                                key={task.itemId}
                                onClick={() => handleToggleTask(task.itemId, !isChecked)}
                                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                  isChecked
                                    ? "border-emerald-500 bg-emerald-500/10"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                {isChecked ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                                )}
                                <span className={`text-sm ${isChecked ? "line-through text-muted-foreground" : ""}`}>
                                  {task.categoryName} {task.index}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Päivittäinen tavoite</h3>
              <p className="text-sm text-muted-foreground">
                Pysyäksesi aikataulussa, sinun tulee tehdä joka päivä:
              </p>

              {dailyQuotas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Lisää kategorioita nähdäksesi päivittäiset tavoitteet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dailyQuotas.map((cat) => {
                    const Icon = getIconComponent(cat.icon);
                    const percent = Math.round((cat.completed / cat.total) * 100);

                    return (
                      <div key={cat._id} className="p-4 rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${getColorClass(cat.color)} flex items-center justify-center shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{cat.name}</span>
                              <Badge variant="outline">
                                {cat.dailyQuota} / päivä
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {cat.completed} / {cat.total} valmis ({percent}%)
                              {cat.remaining > 0 && ` - ${cat.remaining} jäljellä`}
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getColorClass(cat.color)} transition-all duration-300`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <div>
                        <span className="font-medium">Yhteensä tänään: </span>
                        <span className="text-lg font-bold text-primary">
                          {dailyQuotas.reduce((sum, cat) => sum + cat.dailyQuota, 0)} tehtävää
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Kategoriat</h3>
                <span className="text-sm text-muted-foreground">
                  {totalProgress} / {totalItems} valmis
                </span>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Ei kategorioita</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Lisää kategorioita seurataksesi edistymistäsi
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={handleAddDefaultCategories} className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Lisää oletuskategoriat
                    </Button>
                    <Button onClick={() => setIsAddingCategory(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Luo oma
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => {
                    const Icon = getIconComponent(category.icon);
                    const percent = Math.round((category.completed / category.total) * 100);

                    return (
                      <div key={category._id} className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg ${getColorClass(category.color)} flex items-center justify-center shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium truncate">{category.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {category.completed} / {category.total}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getColorClass(category.color)} transition-all duration-300`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Quick actions */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleProgressChange(category._id, -1)}
                              disabled={category.completed <= 0}
                            >
                              -
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleProgressChange(category._id, 1)}
                              disabled={category.completed >= category.total}
                            >
                              +
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteCategory(category._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add category form */}
              {isAddingCategory ? (
                <div className="p-4 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 space-y-4">
                  <h4 className="font-medium">Uusi kategoria</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nimi</label>
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="esim. Sanasto"
                        className="w-full p-2 rounded-lg border border-border bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Yhteensä tehtävää</label>
                      <input
                        type="number"
                        value={newCategoryTotal}
                        onChange={(e) => setNewCategoryTotal(parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-full p-2 rounded-lg border border-border bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kuvake</label>
                    <div className="flex gap-2 flex-wrap">
                      {iconOptions.map((opt) => {
                        const IconOpt = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setNewCategoryIcon(opt.value)}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              newCategoryIcon === opt.value
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                            title={opt.label}
                          >
                            <IconOpt className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Väri</label>
                    <div className="flex gap-2">
                      {colorOptions.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setNewCategoryColor(c.value)}
                          className={`w-8 h-8 rounded-lg ${c.class} transition-all ${
                            newCategoryColor === c.value
                              ? "ring-2 ring-offset-2 ring-primary scale-110"
                              : "hover:scale-105 opacity-70"
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                      Peruuta
                    </Button>
                    <Button onClick={handleAddCategory} disabled={!newCategoryName || newCategoryTotal <= 0} className="gap-2">
                      <Check className="w-4 h-4" />
                      Lisää
                    </Button>
                  </div>
                </div>
              ) : categories.length > 0 ? (
                <Button variant="outline" onClick={() => setIsAddingCategory(true)} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Lisää kategoria
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Days Modal */}
      {courseWithCategories?.userId && (
        <PastDaysModal
          isOpen={pastDaysModalOpen}
          onClose={() => setPastDaysModalOpen(false)}
          courseId={courseId}
          userId={courseWithCategories.userId}
        />
      )}
    </div>
  );
}
