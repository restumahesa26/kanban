"use client";

import React from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Kanban, 
  CheckCircle2, 
  X,
  AlertTriangle
} from "lucide-react";

export default function Header({ 
  searchTerm, 
  setSearchTerm, 
  priorityFilter, 
  setPriorityFilter, 
  onAddTask,
  totalTasks,
  isFirebaseConfigured
}) {
  return (
    <header className="mb-6 flex flex-col gap-4">
      {/* Top Banner Warning if Firebase is not configured yet */}
      {!isFirebaseConfigured && (
        <div className="flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Firebase Config Missing:</strong> Currently running in local interactive mode. Rename <code>.env.local.example</code> to <code>.env.local</code> with your credentials to sync with Firestore.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* App Title & Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Personal Kanban
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {totalTasks} {totalTasks === 1 ? "Task" : "Tasks"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive task tracking & real-time monitoring
            </p>
          </div>
        </div>

        {/* Controls: Search, Filter, Add Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
              className="bg-slate-800/90 border border-slate-700/80 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-200 appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🔵 Low</option>
            </select>
          </div>

          {/* "+ Add Task" Button */}
          <button
            onClick={() => onAddTask("To Do")}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
