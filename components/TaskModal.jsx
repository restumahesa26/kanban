"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, AlertCircle, Check } from "lucide-react";

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
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setPriority(initialData.priority || "Medium");
      setStatus(initialData.status || "To Do");
      setDueDate(initialData.dueDate || "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setStatus(defaultStatus || "To Do");
      setDueDate("");
    }
    setError("");
    setIsSubmitting(false);
  }, [initialData, defaultStatus, isOpen]);

  if (!isOpen) return null;

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
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
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
