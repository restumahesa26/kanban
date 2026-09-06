"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import Column from "./Column";
import { Trash2 } from "lucide-react";

const COLUMNS = ["To Do", "On Progress", "On Waiting", "On Review", "Done"];

export default function KanbanBoard({ 
  tasks, 
  isLoading,
  onStatusChange, 
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  onToggleSubtask,
  onReorderSubtasks,
  onTrashDrop
}) {
  // Prevent SSR hydration mismatch for DnD
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex gap-5 overflow-x-auto pb-6 pt-1 animate-pulse">
        {COLUMNS.map((col) => (
          <div key={col} className="h-96 w-[320px] shrink-0 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl border border-slate-300 dark:border-slate-800" />
        ))}
      </div>
    );
  }

  // Drag Start Handler
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Drag End Handler
  const handleDragEnd = (result) => {
    setIsDragging(false);
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Check if dropped into trash zone
    if (destination.droppableId === "trash-dropzone") {
      if (onTrashDrop) {
        onTrashDrop(draggableId);
      }
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    onStatusChange(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative">
        {/* Main Columns Container */}
        <div className="flex gap-5 overflow-x-auto pb-16 pt-1 items-start min-h-[calc(100vh-180px)] scroll-smooth">
          {COLUMNS.map((status) => {
            const columnTasks = tasks.filter((t) => t.status === status);
            return (
              <Column
                key={status}
                status={status}
                tasks={columnTasks}
                isLoading={isLoading}
                onAddTask={onAddTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onQuickMove={onStatusChange}
                onToggleSubtask={onToggleSubtask}
                onReorderSubtasks={onReorderSubtasks}
              />
            );
          })}
        </div>

        {/* Floating Trash Droppable Section */}
        <Droppable droppableId="trash-dropzone">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`fixed bottom-7 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out flex items-center gap-3 px-6 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${
                snapshot.isDraggingOver
                  ? "bg-rose-600 border-rose-400 text-white scale-110 ring-4 ring-rose-500/40 shadow-rose-600/40"
                  : "bg-white/95 dark:bg-slate-900/95 border-rose-500/60 text-rose-600 dark:text-rose-400 shadow-xl shadow-rose-500/10 hover:border-rose-500"
              } ${
                isDragging
                  ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
                  : "translate-y-16 opacity-0 scale-90 pointer-events-none"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  snapshot.isDraggingOver
                    ? "bg-white/20 text-white animate-bounce"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}
              >
                <Trash2 className="w-5 h-5" />
              </div>

              <div className="flex flex-col text-left">
                <span className="text-xs font-bold tracking-tight">
                  {snapshot.isDraggingOver
                    ? "Lepaskan untuk buang ke Sampah!"
                    : "Tarik ke sini untuk membuang"}
                </span>
                <span
                  className={`text-[10px] ${
                    snapshot.isDraggingOver
                      ? "text-rose-100"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Task akan otomatis masuk ke daftar sampah
                </span>
              </div>

              {/* Placeholder element required by hello-pangea/dnd */}
              <div className="hidden">{provided.placeholder}</div>
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
