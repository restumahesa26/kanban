"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Trash2, 
  RotateCcw, 
  Search, 
  Briefcase, 
  Home, 
  Layers, 
  Sun, 
  Moon, 
  Calendar, 
  ListTodo, 
  CheckSquare, 
  AlertTriangle,
  Clock,
  Sparkles
} from "lucide-react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import {
  subscribeToTasks,
  restoreTask,
  deleteTask,
  emptyTrash,
  isFirebaseConfigured
} from "@/lib/firebase";

export default function TrashPage() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("dark");

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [isEmptyTrashModalOpen, setIsEmptyTrashModalOpen] = useState(false);

  // Initialize Theme from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("kanban_theme") || "dark";
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("kanban_theme", nextTheme);
    }
  };

  // Helper to load tasks from localStorage
  const loadLocalStorageTasks = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kanban_tasks");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setTasks(parsed);
            return;
          }
        } catch (e) {
          console.error("Failed to parse local tasks:", e);
        }
      }
      setTasks([]);
    }
  };

  // Sync local storage
  const updateLocalTasks = (newTasks) => {
    setTasks(newTasks);
    if (!isFirebaseConfigured && typeof window !== "undefined") {
      localStorage.setItem("kanban_tasks", JSON.stringify(newTasks));
    }
  };

  // Subscribe to real-time updates or local state
  useEffect(() => {
    setIsLoading(true);
    if (isFirebaseConfigured) {
      const unsubscribe = subscribeToTasks(
        (fetchedTasks) => {
          setTasks(fetchedTasks);
          setTimeout(() => setIsLoading(false), 300);
        },
        (error) => {
          console.warn("Falling back to local storage:", error);
          loadLocalStorageTasks();
          setTimeout(() => setIsLoading(false), 300);
        }
      );
      return () => unsubscribe();
    } else {
      loadLocalStorageTasks();
      setTimeout(() => setIsLoading(false), 300);
    }
  }, []);

  // Filter only soft-deleted tasks
  const trashedTasks = useMemo(() => {
    return tasks.filter((t) => t.isDeleted);
  }, [tasks]);

  // Count by category
  const workTrashedCount = useMemo(() => {
    return trashedTasks.filter((t) => (t.category || "work") === "work").length;
  }, [trashedTasks]);

  const personalTrashedCount = useMemo(() => {
    return trashedTasks.filter((t) => t.category === "personal").length;
  }, [trashedTasks]);

  // Filtered Trashed Tasks
  const displayedTasks = useMemo(() => {
    return trashedTasks
      .filter((task) => {
        // Category filter
        const taskCategory = task.category || "work";
        if (categoryFilter !== "all" && taskCategory !== categoryFilter) {
          return false;
        }

        // Search term
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.deletedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.deletedAt || b.createdAt || 0).getTime();
        return dateB - dateA; // Most recently deleted first
      });
  }, [trashedTasks, categoryFilter, searchTerm]);

  // Format date
  const formatDeletedDate = (isoString) => {
    if (!isoString) return "Baru saja";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  // Handle Restore Task
  const handleRestore = async (task) => {
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, isDeleted: false, deletedAt: null } : t
    );

    if (isFirebaseConfigured) {
      try {
        await restoreTask(task.id);
      } catch (err) {
        console.error("Error restoring task:", err);
        updateLocalTasks(updatedTasks);
      }
    } else {
      updateLocalTasks(updatedTasks);
    }
  };

  // Handle Open Permanent Delete Modal for Single Task
  const handleOpenPermanentDelete = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Handle Confirm Permanent Delete
  const handleConfirmPermanentDelete = async () => {
    if (!taskToDelete) return;

    const remainingTasks = tasks.filter((t) => t.id !== taskToDelete.id);

    if (isFirebaseConfigured) {
      try {
        await deleteTask(taskToDelete.id);
      } catch (err) {
        console.error("Error permanently deleting task:", err);
        updateLocalTasks(remainingTasks);
      }
    } else {
      updateLocalTasks(remainingTasks);
    }

    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  // Handle Confirm Empty Trash
  const handleConfirmEmptyTrash = async () => {
    const trashedIds = trashedTasks.map((t) => t.id);
    const remainingTasks = tasks.filter((t) => !t.isDeleted);

    if (isFirebaseConfigured) {
      try {
        await emptyTrash(trashedIds);
      } catch (err) {
        console.error("Error emptying trash:", err);
        updateLocalTasks(remainingTasks);
      }
    } else {
      updateLocalTasks(remainingTasks);
    }

    setIsEmptyTrashModalOpen(false);
  };

  // Priority Styles Mapping
  const priorityStyles = {
    High: {
      badge: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30",
      dot: "bg-red-500",
      label: "Tinggi",
    },
    Medium: {
      badge: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
      dot: "bg-amber-500",
      label: "Sedang",
    },
    Low: {
      badge: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/30",
      dot: "bg-sky-500",
      label: "Rendah",
    },
  };

  return (
    <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation & Header Bar */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
              title="Kembali ke Kanban Board"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                  <span>Daftar Sampah (Trash)</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                  {trashedTasks.length} {trashedTasks.length === 1 ? "Task" : "Tasks"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Task yang dihapus sementara. Pulihkan kembali atau hapus secara permanen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
              title={theme === "dark" ? "Beralih ke Mode Terang (Light Mode)" : "Beralih ke Mode Gelap (Dark Mode)"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Empty Trash Button */}
            {trashedTasks.length > 0 && (
              <button
                onClick={() => setIsEmptyTrashModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-md shadow-rose-600/20 active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Sampah</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row: Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 p-3 rounded-xl">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700/60 self-start">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                categoryFilter === "all"
                  ? "bg-slate-800 dark:bg-slate-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semua</span>
              <span className="text-[10px] ml-0.5 opacity-80">({trashedTasks.length})</span>
            </button>
            <button
              onClick={() => setCategoryFilter("work")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                categoryFilter === "work"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Kerja</span>
              <span className="text-[10px] ml-0.5 opacity-80">({workTrashedCount})</span>
            </button>
            <button
              onClick={() => setCategoryFilter("personal")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                categoryFilter === "personal"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Rumah</span>
              <span className="text-[10px] ml-0.5 opacity-80">({personalTrashedCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari task di sampah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Task List or Empty State */}
      {isLoading ? (
        <div className="space-y-3 animate-fade-in">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 rounded-full wave-shimmer" />
                <div className="h-4 w-20 rounded-full wave-shimmer" />
              </div>
              <div className="h-4 w-3/4 rounded wave-shimmer" />
              <div className="h-3 w-1/2 rounded wave-shimmer" />
            </div>
          ))}
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="bg-white/70 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500 shadow-inner">
            <Trash2 className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            {searchTerm || categoryFilter !== "all"
              ? "Tidak ada task yang cocok di tempat sampah"
              : "Tempat Sampah Kosong"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">
            {searchTerm || categoryFilter !== "all"
              ? "Coba gunakan kata kunci pencarian yang berbeda atau ubah filter kategori."
              : "Semua task yang Anda hapus dari board akan masuk ke sini sebelum dihapus secara permanen."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Kanban Board</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTasks.map((task) => {
            const isPersonal = task.category === "personal";
            const currentPriorityStyle =
              priorityStyles[task.priority] || priorityStyles.Medium;
            const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
            const completedSubtasks = subtasks.filter((s) => s.completed).length;

            return (
              <div
                key={task.id}
                className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Badges & Deletion Timestamp */}
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Category Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isPersonal
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                            : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30"
                        }`}
                      >
                        {isPersonal ? (
                          <>
                            <Home className="w-3 h-3 shrink-0" />
                            <span>Rumah</span>
                          </>
                        ) : (
                          <>
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span>Kerja</span>
                          </>
                        )}
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${currentPriorityStyle.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${currentPriorityStyle.dot}`} />
                        {currentPriorityStyle.label}
                      </span>

                      {/* Previous Status Badge */}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {task.status}
                      </span>
                    </div>

                    {/* Deleted Timestamp */}
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDeletedDate(task.deletedAt)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                    {task.title}
                  </h3>

                  {/* Description */}
                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Subtask preview */}
                  {subtasks.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
                      <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        {completedSubtasks} dari {subtasks.length} subtask selesai
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions: Restore & Permanent Delete */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <button
                    onClick={() => handleRestore(task)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Pulihkan Task</span>
                  </button>

                  <button
                    onClick={() => handleOpenPermanentDelete(task)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 px-3 py-1.5 rounded-xl transition-all active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Permanen</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Permanent Delete of Single Task */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmPermanentDelete}
        taskTitle={taskToDelete?.title || ""}
        isPermanent={true}
      />

      {/* Confirmation Modal for Emptying Entire Trash */}
      <DeleteConfirmModal
        isOpen={isEmptyTrashModalOpen}
        onClose={() => setIsEmptyTrashModalOpen(false)}
        onConfirm={handleConfirmEmptyTrash}
        taskTitle={`Semua ${trashedTasks.length} task di tempat sampah`}
        isPermanent={true}
        customMessage={`Apakah Anda yakin ingin mengosongkan seluruh tempat sampah (${trashedTasks.length} task)? Semua task di dalam daftar sampah akan terhapus secara permanen dan tidak dapat dipulihkan.`}
      />
    </main>
  );
}
