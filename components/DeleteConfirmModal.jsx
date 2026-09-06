"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  taskTitle,
  isPermanent = false,
  customMessage = ""
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {isPermanent ? "Konfirmasi Hapus Permanen" : "Pindahkan ke Tempat Sampah"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
            {customMessage ? (
              customMessage
            ) : isPermanent ? (
              <>
                Apakah Anda yakin ingin menghapus task <strong className="text-slate-900 dark:text-slate-100 font-semibold">"{taskTitle}"</strong> secara permanen? Data akan dihapus selamanya dan tidak dapat dipulihkan.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin memindahkan task <strong className="text-slate-900 dark:text-slate-100 font-semibold">"{taskTitle}"</strong> ke Tempat Sampah? Anda dapat memulihkannya kembali kapan saja dari Halaman Sampah.
              </>
            )}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {isPermanent ? "Hapus Permanen" : "Pindahkan ke Sampah"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
