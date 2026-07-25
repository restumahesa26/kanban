"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  taskTitle 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Confirm Delete</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Are you sure you want to delete <strong className="text-slate-100 font-semibold">"{taskTitle}"</strong>? This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-red-600/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
