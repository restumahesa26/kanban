"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import Column from "./Column";

const COLUMNS = ["To Do", "On Progress", "On Waiting", "On Review", "Done"];

export default function KanbanBoard({ 
  tasks, 
  isLoading,
  onStatusChange, 
  onAddTask, 
  onEditTask, 
  onDeleteTask 
}) {
  // Prevent SSR hydration mismatch for DnD
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex gap-5 overflow-x-auto pb-6 pt-1 animate-pulse">
        {COLUMNS.map((col) => (
          <div key={col} className="h-96 w-[320px] shrink-0 bg-slate-800/40 rounded-2xl border border-slate-800" />
        ))}
      </div>
    );
  }

  // Drag End Handler
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
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
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-5 overflow-x-auto pb-6 pt-1 items-start min-h-[calc(100vh-180px)] scroll-smooth">
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
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
