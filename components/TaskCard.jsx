"use client";

import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { 
  Calendar, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  ListTodo, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronUp,
  Briefcase,
  Home
} from "lucide-react";

const COLUMNS = ["To Do", "On Progress", "On Waiting", "On Review", "Done"];

export default function TaskCard({ 
  task, 
  index, 
  onEdit, 
  onDelete, 
  onQuickMove, 
  onToggleSubtask, 
  onReorderSubtasks 
}) {
  const { id, title, description, priority, category, status, dueDate } = task;
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  const [isExpanded, setIsExpanded] = useState(false);

  const completedCount = subtasks.filter((st) => st.completed).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleMoveSubtask = (stIndex, targetIndex) => {
    if (targetIndex < 0 || targetIndex >= subtasks.length) return;
    const updated = Array.from(subtasks);
    const [moved] = updated.splice(stIndex, 1);
    updated.splice(targetIndex, 0, moved);
    if (onReorderSubtasks) {
      onReorderSubtasks(id, updated);
    }
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

  const currentPriorityStyle = priorityStyles[priority] || priorityStyles.Medium;

  // Check if due date is overdue or today
  const getDueDateStatus = () => {
    if (!dueDate) return null;
    const today = new Date().toISOString().split("T")[0];
    if (dueDate < today && status !== "Done") {
      return { 
        label: "Overdue", 
        color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30" 
      };
    } else if (dueDate === today && status !== "Done") {
      return { 
        label: "Hari Ini", 
        color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30" 
      };
    }
    return { 
      label: dueDate, 
      color: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700" 
    };
  };

  const dueDateInfo = getDueDateStatus();
  const currentColumnIndex = COLUMNS.indexOf(status);

  // Category info
  const isPersonal = category === "personal";

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(task)}
          className={`group relative bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-4 transition-all duration-200 hover:border-indigo-400 dark:hover:border-indigo-500/60 shadow-sm hover:shadow-md dark:shadow-none hover:shadow-indigo-500/5 cursor-pointer ${
            snapshot.isDragging ? "is-dragging border-indigo-500 shadow-2xl" : ""
          }`}
        >
          {/* Card Top: Badges (Category & Priority) + Action Buttons */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Category Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isPersonal
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                    : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30"
                }`}
              >
                {isPersonal ? (
                  <>
                    <Home className="w-2.5 h-2.5 shrink-0" />
                    <span>Rumah</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-2.5 h-2.5 shrink-0" />
                    <span>Kerja</span>
                  </>
                )}
              </span>

              {/* Priority Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentPriorityStyle.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${currentPriorityStyle.dot}`} />
                {currentPriorityStyle.label}
              </span>
            </div>

            {/* Actions: Edit & Delete */}
            <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
                title="Edit Task"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
                title="Hapus Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug mb-1.5 line-clamp-2">
            {title}
          </h4>

          {/* Description */}
          {description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-3 leading-relaxed">
              {description}
            </p>
          )}

          {/* Subtasks Progress & Interactive Checklist */}
          {subtasks.length > 0 && (
            <div className="mb-3 space-y-1.5 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="w-full flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors py-0.5"
              >
                <span className="flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Subtasks ({completedCount}/{subtasks.length})</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <span>{progressPercent}%</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </span>
              </button>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-300/40 dark:border-slate-700/40">
                <div
                  className={`h-full transition-all duration-300 ${
                    progressPercent === 100 ? "bg-emerald-500" : "bg-indigo-600 dark:bg-indigo-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Expandable Subtask Checklist */}
              {isExpanded && (
                <div className="mt-2 space-y-1 max-h-36 overflow-y-auto pt-1 border-t border-slate-200 dark:border-slate-800 custom-scrollbar">
                  {subtasks.map((st, idx) => (
                    <div
                      key={st.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleSubtask) onToggleSubtask(id, st.id);
                      }}
                      className="flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/90 cursor-pointer transition-colors group/item"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {st.completed ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 shrink-0" />
                        )}
                        <span
                          className={`text-[11px] truncate leading-tight ${
                            st.completed 
                              ? "line-through text-slate-400 dark:text-slate-500" 
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {st.text}
                        </span>
                      </div>
                      {subtasks.length > 1 && (
                        <div className="flex items-center gap-0.5 opacity-50 group-hover/item:opacity-100 transition-opacity shrink-0">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveSubtask(idx, idx - 1);
                              }}
                              className="p-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700/60"
                              title="Pindah ke atas"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                          )}
                          {idx < subtasks.length - 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveSubtask(idx, idx + 1);
                              }}
                              className="p-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700/60"
                              title="Pindah ke bawah"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer: Due Date & Quick Status Controls */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/50 mt-2 text-xs">
            {/* Due Date Indicator */}
            {dueDateInfo ? (
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium ${dueDateInfo.color}`}
              >
                <Calendar className="w-3 h-3" />
                <span>{dueDateInfo.label}</span>
              </div>
            ) : (
              <div className="text-slate-400 dark:text-slate-500 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> Tanpa deadline
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
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-750 rounded transition-colors"
                  title={`Pindahkan ke ${COLUMNS[currentColumnIndex - 1]}`}
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
                className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-750 rounded transition-colors"
                  title={`Pindahkan ke ${COLUMNS[currentColumnIndex + 1]}`}
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
