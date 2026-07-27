"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { X, Calendar, AlertCircle, Check, ListTodo, Plus, Trash2, CheckSquare, Square, GripVertical } from "lucide-react";

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null,
  defaultStatus = "To Do"
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("To Do");
  const [dueDate, setDueDate] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setPriority(initialData.priority || "Medium");
      setStatus(initialData.status || "To Do");
      setDueDate(initialData.dueDate || "");
      setSubtasks(Array.isArray(initialData.subtasks) ? initialData.subtasks : []);
    } else {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setStatus(defaultStatus || "To Do");
      setDueDate("");
      setSubtasks([]);
    }
    setNewSubtaskText("");
    setError("");
    setIsSubmitting(false);
  }, [initialData, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e) => {
    if (e) e.preventDefault();
    const text = newSubtaskText.trim();
    if (!text) return;
    const newItem = {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text,
      completed: false,
    };
    setSubtasks((prev) => [...prev, newItem]);
    setNewSubtaskText("");
  };

  const handleToggleSubtaskItem = (id) => {
    setSubtasks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteSubtaskItem = (id) => {
    setSubtasks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubtaskDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(subtasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSubtasks(items);
  };

  const completedSubtasksCount = subtasks.filter((st) => st.completed).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Small smooth delay for liquid wave animation
      await new Promise((resolve) => setTimeout(resolve, 600));
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate,
        subtasks,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
      setIsSubmitting(false);
      setError(err.message || "Failed to save task");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Ocean Wave Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 z-20 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-fade-in">
            <div className="relative flex items-center justify-center">
              <div className="wave-pulse-ring" />
              <div className="water-loader-sphere flex items-center justify-center">
                <div className="water-wave-1" />
                <div className="water-wave-2" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-indigo-300 tracking-wide animate-pulse">
                {initialData ? "Updating Task..." : "Saving Task..."}
              </p>
              <p className="text-[11px] text-slate-400">Syncing with Firestore database</p>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <h2 className="text-base font-bold text-slate-100">
            {initialData ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Design Landing Page wireframes"
              maxLength={100}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              placeholder="Add details, notes, or acceptance criteria..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Subtasks / Checklist Section */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <ListTodo className="w-4 h-4 text-indigo-400" />
                <span>To Do Checklist</span>
              </label>
              {subtasks.length > 0 && (
                <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  {completedSubtasksCount} of {subtasks.length} done
                </span>
              )}
            </div>

            {/* Input field to add subtask */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add detail kerjaan..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="inline-flex items-center gap-1 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors shrink-0 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* List of subtasks */}
            {subtasks.length > 0 ? (
              <DragDropContext onDragEnd={handleSubtaskDragEnd}>
                <Droppable droppableId="modal-subtasks-droppable">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar"
                    >
                      {subtasks.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(draggableProvided, snapshot) => (
                            <div
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.draggableProps}
                              className={`flex items-center justify-between gap-2 bg-slate-800/80 border border-slate-700/50 rounded-lg px-2.5 py-1.5 group hover:border-slate-600 transition-colors ${
                                snapshot.isDragging ? "bg-slate-700/90 border-indigo-500 shadow-xl" : ""
                              }`}
                            >
                              <div
                                {...draggableProvided.dragHandleProps}
                                className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                                title="Drag to reorder subtask"
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleSubtaskItem(item.id)}
                                className="flex items-center gap-2 text-left flex-1 min-w-0"
                              >
                                {item.completed ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-indigo-400 transition-colors" />
                                )}
                                <span
                                  className={`text-xs truncate ${
                                    item.completed
                                      ? "line-through text-slate-500"
                                      : "text-slate-200"
                                  }`}
                                >
                                  {item.text}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubtaskItem(item.id)}
                                className="text-slate-500 hover:text-red-400 p-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0"
                                title="Delete subtask"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <p className="text-[11px] text-slate-500 italic">
                No checklist items added yet. Type above to add detail subtasks.
              </p>
            )}
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Low">🔵 Low</option>
                <option value="Medium">🟡 Medium</option>
                <option value="High">🔴 High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="To Do">To Do</option>
                <option value="On Progress">On Progress</option>
                <option value="On Waiting">On Waiting</option>
                <option value="On Review">On Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Due Date <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 scheme-dark"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialData ? "Save Changes" : "Create Task"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
