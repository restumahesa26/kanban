"use client";

import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { 
  Calendar, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  AlertCircle
} from "lucide-react";

const COLUMNS = ["To Do", "On Progress", "On Waiting", "On Review", "Done"];

export default function TaskCard({ 
  task, 
  index, 
  onEdit, 
  onDelete, 
  onQuickMove 
}) {
  const { id, title, description, priority, status, dueDate } = task;

  // Priority Styles Mapping
  const priorityStyles = {
    High: {
      badge: "bg-red-500/10 text-red-400 border-red-500/30",
      dot: "bg-red-500",
    },
    Medium: {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      dot: "bg-amber-500",
    },
    Low: {
      badge: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      dot: "bg-sky-500",
    },
  };

  const currentPriorityStyle = priorityStyles[priority] || priorityStyles.Medium;

  // Check if due date is overdue or today
  const getDueDateStatus = () => {
    if (!dueDate) return null;
    const today = new Date().toISOString().split("T")[0];
    if (dueDate < today && status !== "Done") {
      return { label: "Overdue", color: "text-red-400 bg-red-500/10 border-red-500/30" };
    } else if (dueDate === today && status !== "Done") {
      return { label: "Due Today", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
    }
    return { label: dueDate, color: "text-slate-400 bg-slate-800/60 border-slate-700" };
  };

  const dueDateInfo = getDueDateStatus();
  const currentColumnIndex = COLUMNS.indexOf(status);

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 transition-all duration-200 hover:border-slate-600 hover:shadow-lg ${
            snapshot.isDragging ? "is-dragging border-indigo-500" : ""
          }`}
        >
          {/* Card Top: Priority & Action Buttons */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentPriorityStyle.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentPriorityStyle.dot}`} />
              {priority} Priority
            </span>

            {/* Actions: Edit & Delete */}
            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60 rounded-lg transition-colors"
                title="Edit Task"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                }}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-slate-100 leading-snug mb-1.5 line-clamp-2">
            {title}
          </h4>

          {/* Description */}
          {description && (
            <p className="text-xs text-slate-400 line-clamp-3 mb-3 leading-relaxed">
              {description}
            </p>
          )}

          {/* Footer: Due Date & Quick Status Controls */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-700/50 mt-2 text-xs">
            {/* Due Date Indicator */}
            {dueDateInfo ? (
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${dueDateInfo.color}`}
              >
                <Calendar className="w-3 h-3" />
                <span>{dueDateInfo.label}</span>
              </div>
            ) : (
              <div className="text-slate-500 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> No deadline
              </div>
            )}

            {/* Quick Move Buttons & Dropdown */}
            <div className="flex items-center gap-1">
              {/* Quick Move Left */}
              {currentColumnIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickMove(id, COLUMNS[currentColumnIndex - 1]);
                  }}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title={`Move to ${COLUMNS[currentColumnIndex - 1]}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Status Select for Direct Jump */}
              <select
                value={status}
                onChange={(e) => {
                  e.stopPropagation();
                  onQuickMove(id, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 text-[11px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
              >
                {COLUMNS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>

              {/* Quick Move Right */}
              {currentColumnIndex < COLUMNS.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickMove(id, COLUMNS[currentColumnIndex + 1]);
                  }}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title={`Move to ${COLUMNS[currentColumnIndex + 1]}`}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
