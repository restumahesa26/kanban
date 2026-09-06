"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  X, 
  Calendar, 
  AlertCircle, 
  Check, 
  ListTodo, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  GripVertical,
  Briefcase,
  Home
} from "lucide-react";

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null,
  defaultStatus = "To Do",
  defaultCategory = "work"
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("work");
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
      setCategory(initialData.category || defaultCategory || "work");
      setStatus(initialData.status || "To Do");
      setDueDate(initialData.dueDate || "");
      setSubtasks(Array.isArray(initialData.subtasks) ? initialData.subtasks : []);
    } else {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setCategory(defaultCategory === "personal" ? "personal" : "work");
      setStatus(defaultStatus || "To Do");
      setDueDate("");
      setSubtasks([]);
    }
    setNewSubtaskText("");
    setError("");
    setIsSubmitting(false);
  }, [initialData, defaultStatus, defaultCategory, isOpen]);

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
      setError("Judul task wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      // Small delay for smooth wave transition
      await new Promise((resolve) => setTimeout(resolve, 400));
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        status,
        dueDate,
        subtasks,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
      setIsSubmitting(false);
      setError(err.message || "Gagal menyimpan task");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors">
        {/* Ocean Wave Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-fade-in">
            <div className="relative flex items-center justify-center">
              <div className="wave-pulse-ring" />
              <div className="water-loader-sphere flex items-center justify-center">
                <div className="water-wave-1" />
                <div className="water-wave-2" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300 tracking-wide animate-pulse">
                {initialData ? "Menyimpan Perubahan..." : "Membuat Task Baru..."}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Sinkronisasi data tersimpan</p>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 shrink-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {initialData ? "Edit Task" : "Tambah Task Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kategori Task <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setCategory("work")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  category === "work"
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-750"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>💼 Kerja (Work)</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory("personal")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  category === "personal"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-750"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>🏠 Rumah / Personal</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Judul Task <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Selesaikan presentasi Q3 atau Beli susu & telur"
              maxLength={100}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Deskripsi <span className="text-slate-400 dark:text-slate-500 font-normal">(Opsional)</span>
            </label>
            <textarea
              placeholder="Tambahkan detail, catatan, atau link penting..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
            />
          </div>

          {/* Subtasks / Checklist Section */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                <ListTodo className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>To Do Checklist (Subtasks)</span>
              </label>
              {subtasks.length > 0 && (
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                  {completedSubtasksCount} dari {subtasks.length} selesai
                </span>
              )}
            </div>

            {/* Input field to add subtask */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tambahkan rincian poin tugas..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors shrink-0 font-medium shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
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
                              className={`flex items-center justify-between gap-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-lg px-2.5 py-1.5 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm ${
                                snapshot.isDragging ? "bg-slate-100 dark:bg-slate-700/90 border-indigo-500 shadow-xl" : ""
                              }`}
                            >
                              <div
                                {...draggableProvided.dragHandleProps}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                                title="Geser untuk mengatur urutan"
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleSubtaskItem(item.id)}
                                className="flex items-center gap-2 text-left flex-1 min-w-0"
                              >
                                {item.completed ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0 transition-colors" />
                                )}
                                <span
                                  className={`text-xs truncate ${
                                    item.completed
                                      ? "line-through text-slate-400 dark:text-slate-500"
                                      : "text-slate-800 dark:text-slate-200"
                                  }`}
                                >
                                  {item.text}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubtaskItem(item.id)}
                                className="text-slate-400 hover:text-red-500 p-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0"
                                title="Hapus subtask"
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
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                Belum ada rincian checklist. Ketik di atas untuk menambahkan.
              </p>
            )}
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tingkat Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="Low">🔵 Rendah (Low)</option>
                <option value="Medium">🟡 Sedang (Medium)</option>
                <option value="High">🔴 Tinggi (High)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kolom Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Batas Waktu (Due Date) <span className="text-slate-400 dark:text-slate-500 font-normal">(Opsional)</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors scheme-light dark:scheme-dark"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialData ? "Simpan Perubahan" : "Buat Task"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
