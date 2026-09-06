"use client";

import React from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  Kanban, 
  X,
  AlertTriangle,
  Briefcase,
  Home,
  Layers,
  Sun,
  Moon,
  Trash2
} from "lucide-react";

export default function Header({ 
  searchTerm, 
  setSearchTerm, 
  priorityFilter, 
  setPriorityFilter, 
  onAddTask,
  totalTasks,
  isFirebaseConfigured,
  workspaceMode,
  setWorkspaceMode,
  workCount = 0,
  personalCount = 0,
  trashedCount = 0,
  theme,
  onToggleTheme
}) {
  return (
    <header className="mb-6 flex flex-col gap-4">
      {/* Top Banner Warning if Firebase is not configured yet */}
      {!isFirebaseConfigured && (
        <div className="flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Mode Lokal Aktif:</strong> Firebase Firestore belum dihubungkan. Data tersimpan di <code>localStorage</code> browser Anda.
            </span>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm transition-colors">
        {/* App Title & Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Personal Kanban
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                {totalTasks} {totalTasks === 1 ? "Task" : "Tasks"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pelacakan tugas kerja & personal secara terorganisir
            </p>
          </div>
        </div>

        {/* Workspace Mode Switcher (Kerja vs Rumah / Personal vs Semua) */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 rounded-xl self-start lg:self-center overflow-x-auto max-w-full">
          {/* Tab Mode Kerja */}
          <button
            onClick={() => setWorkspaceMode("work")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              workspaceMode === "work"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Kerja</span>
            <span
              className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                workspaceMode === "work"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {workCount}
            </span>
          </button>

          {/* Tab Mode Rumah / Personal */}
          <button
            onClick={() => setWorkspaceMode("personal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              workspaceMode === "personal"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Rumah / Personal</span>
            <span
              className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                workspaceMode === "personal"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {personalCount}
            </span>
          </button>

          {/* Tab Semua (All) */}
          <button
            onClick={() => setWorkspaceMode("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              workspaceMode === "all"
                ? "bg-slate-800 dark:bg-slate-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua</span>
            <span
              className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                workspaceMode === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {workCount + personalCount}
            </span>
          </button>
        </div>

        {/* Controls: Search, Filter, Theme Toggle, Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-56 lg:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari task..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-800 dark:text-slate-200 appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
            >
              <option value="All">Semua Prioritas</option>
              <option value="High">🔴 Tinggi</option>
              <option value="Medium">🟡 Sedang</option>
              <option value="Low">🔵 Rendah</option>
            </select>
          </div>

          {/* Theme Mode Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
            title={theme === "dark" ? "Beralih ke Mode Terang (Light Mode)" : "Beralih ke Mode Gelap (Dark Mode)"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Link to Trash Page (Tempat Sampah) */}
          <Link
            href="/trash"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 group"
            title="Buka Halaman Tempat Sampah"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-red-500 transition-colors" />
            <span className="hidden sm:inline">Sampah</span>
            {trashedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {trashedCount}
              </span>
            )}
          </Link>

          {/* "+ Add Task" Button */}
          <button
            onClick={() => onAddTask("To Do")}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
