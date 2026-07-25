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
  onQuickMove 
}) {
  // Config per status
  const columnConfig = {
    "To Do": {
      icon: CircleDashed,
      headerBg: "from-blue-900/30 to-slate-800/80",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      borderColor: "border-blue-500/40",
      accentBg: "bg-blue-500",
    },
    "On Progress": {
      icon: Clock,
      headerBg: "from-amber-900/30 to-slate-800/80",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      borderColor: "border-amber-500/40",
      accentBg: "bg-amber-500",
    },
    "On Waiting": {
      icon: Hourglass,
      headerBg: "from-orange-900/30 to-slate-800/80",
      badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      borderColor: "border-orange-500/40",
      accentBg: "bg-orange-500",
    },
    "On Review": {
      icon: Eye,
      headerBg: "from-purple-900/30 to-slate-800/80",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      borderColor: "border-purple-500/40",
      accentBg: "bg-purple-500",
    },
    "Done": {
      icon: CheckCircle2,
      headerBg: "from-emerald-900/30 to-slate-800/80",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      borderColor: "border-emerald-500/40",
      accentBg: "bg-emerald-500",
    },
  };

  const config = columnConfig[status] || columnConfig["To Do"];
  const StatusIcon = config.icon;

  return (
    <div className="flex flex-col h-full bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 w-[290px] sm:w-[320px] md:w-[340px] shrink-0 transition-all">
      {/* Column Header */}
      <div
        className={`flex items-center justify-between p-3 rounded-xl bg-gradient-to-r ${config.headerBg} border border-slate-700/60 mb-3`}
      >
        <div className="flex items-center gap-2.5">
          <StatusIcon className="w-4 h-4 text-slate-300" />
          <h3 className="font-bold text-sm text-slate-100">{status}</h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${config.badgeColor}`}
          >
            {tasks.length}
          </span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => onAddTask(status)}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/70 rounded-lg transition-colors"
          title={`Add task to ${status}`}
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
                ? "bg-slate-800/50 ring-2 ring-indigo-500/40 ring-dashed"
                : ""
            }`}
          >
            {isLoading ? (
              <div className="space-y-3 p-1 animate-fade-in">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="relative overflow-hidden bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 rounded-full wave-shimmer" />
                      <div className="h-3 w-8 rounded wave-shimmer" />
                    </div>
                    <div className="h-4 w-4/5 rounded wave-shimmer" />
                    <div className="h-3 w-3/5 rounded wave-shimmer" />
                    <div className="pt-2 border-t border-slate-700/30 flex justify-between items-center">
                      <div className="h-3 w-16 rounded wave-shimmer" />
                      <div className="h-4 w-12 rounded wave-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800/80 rounded-xl text-center">
                <div className="w-9 h-9 rounded-full bg-slate-800/60 flex items-center justify-center mb-2">
                  <StatusIcon className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium">No tasks in {status}</p>
                <button
                  onClick={() => onAddTask(status)}
                  className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  + Add task
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
