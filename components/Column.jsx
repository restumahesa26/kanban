"use client";

import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import { PlusCircle, CircleDashed, Clock, CheckCircle2, Eye, Hourglass } from "lucide-react";

export default function Column({
  status,
  tasks,
  isLoading,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onQuickMove,
  onToggleSubtask,
  onReorderSubtasks
}) {
  // Config per status
  const columnConfig = {
    "To Do": {
      icon: CircleDashed,
      headerBg: "from-blue-500/10 to-indigo-500/5 dark:from-blue-900/30 dark:to-slate-800/80",
      headerBorder: "border-blue-200/80 dark:border-slate-700/60",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
      iconColor: "text-blue-500 dark:text-blue-400",
    },
    "On Progress": {
      icon: Clock,
      headerBg: "from-amber-500/10 to-yellow-500/5 dark:from-amber-900/30 dark:to-slate-800/80",
      headerBorder: "border-amber-200/80 dark:border-slate-700/60",
      badgeColor: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
      iconColor: "text-amber-500 dark:text-amber-400",
    },
    "On Waiting": {
      icon: Hourglass,
      headerBg: "from-orange-500/10 to-amber-500/5 dark:from-orange-900/30 dark:to-slate-800/80",
      headerBorder: "border-orange-200/80 dark:border-slate-700/60",
      badgeColor: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30",
      iconColor: "text-orange-500 dark:text-orange-400",
    },
    "On Review": {
      icon: Eye,
      headerBg: "from-purple-500/10 to-indigo-500/5 dark:from-purple-900/30 dark:to-slate-800/80",
      headerBorder: "border-purple-200/80 dark:border-slate-700/60",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30",
      iconColor: "text-purple-500 dark:text-purple-400",
    },
    "Done": {
      icon: CheckCircle2,
      headerBg: "from-emerald-500/10 to-teal-500/5 dark:from-emerald-900/30 dark:to-slate-800/80",
      headerBorder: "border-emerald-200/80 dark:border-slate-700/60",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
      iconColor: "text-emerald-500 dark:text-emerald-400",
    },
  };

  const config = columnConfig[status] || columnConfig["To Do"];
  const StatusIcon = config.icon;

  return (
    <div className="flex flex-col h-full bg-slate-200/40 dark:bg-slate-900/70 border border-slate-300/60 dark:border-slate-800/80 rounded-2xl p-3.5 w-[290px] sm:w-[320px] md:w-[340px] shrink-0 transition-colors">
      {/* Column Header */}
      <div
        className={`flex items-center justify-between p-3 rounded-xl bg-gradient-to-r ${config.headerBg} border ${config.headerBorder} mb-3 shadow-sm`}
      >
        <div className="flex items-center gap-2.5">
          <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{status}</h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${config.badgeColor}`}
          >
            {tasks.length}
          </span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => onAddTask(status)}
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/70 rounded-lg transition-colors"
          title={`Tambah task ke ${status}`}
        >
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Task Container */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-3 min-h-[320px] p-1.5 rounded-xl transition-colors ${
              snapshot.isDraggingOver
                ? "bg-slate-300/50 dark:bg-slate-800/50 ring-2 ring-indigo-500/40 ring-dashed"
                : ""
            }`}
          >
            {isLoading ? (
              <div className="space-y-3 p-1 animate-fade-in">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="relative overflow-hidden bg-white/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/40 rounded-xl p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 rounded-full wave-shimmer" />
                      <div className="h-3 w-8 rounded wave-shimmer" />
                    </div>
                    <div className="h-4 w-4/5 rounded wave-shimmer" />
                    <div className="h-3 w-3/5 rounded wave-shimmer" />
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/30 flex justify-between items-center">
                      <div className="h-3 w-16 rounded wave-shimmer" />
                      <div className="h-4 w-12 rounded wave-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300/80 dark:border-slate-800/80 rounded-xl text-center">
                <div className="w-9 h-9 rounded-full bg-slate-200/80 dark:bg-slate-800/60 flex items-center justify-center mb-2">
                  <StatusIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Tidak ada task di {status}</p>
                <button
                  onClick={() => onAddTask(status)}
                  className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                  + Tambah task
                </button>
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onQuickMove={onQuickMove}
                  onToggleSubtask={onToggleSubtask}
                  onReorderSubtasks={onReorderSubtasks}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
