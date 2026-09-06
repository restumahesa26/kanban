"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Header from "@/components/Header";
import KanbanBoard from "@/components/KanbanBoard";
import TaskModal from "@/components/TaskModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Trash2, RotateCcw } from "lucide-react";
import {
  subscribeToTasks,
  addTask,
  updateTask,
  updateTaskStatus,
  softDeleteTask,
  restoreTask,
  deleteTask,
  isFirebaseConfigured
} from "@/lib/firebase";

const SAMPLE_TASKS = [
  // Task Kerja
  {
    id: "sample-work-1",
    title: "Selesaikan Laporan Sprint & Backlog",
    description: "Evaluasi fitur yang telah selesai pada sprint minggu ini dan susun prioritas sprint berikutnya.",
    priority: "High",
    category: "work",
    status: "To Do",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    subtasks: [
      { id: "st-w1", text: "Kumpulkan metrics burndown chart", completed: true },
      { id: "st-w2", text: "Rangkum feedback dari tim QA", completed: false },
      { id: "st-w3", text: "Susun dokumen presentasi sprint review", completed: false }
    ],
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-work-2",
    title: "Refactor API Endpoint & Optimasi Query",
    description: "Optimasi query response time dan tambahkan unit test untuk module authentication.",
    priority: "Medium",
    category: "work",
    status: "On Progress",
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
    subtasks: [
      { id: "st-w4", text: "Audit query lambat di database", completed: true },
      { id: "st-w5", text: "Implementasi caching Redis", completed: false }
    ],
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-work-3",
    title: "Meeting Koordinasi dengan Client",
    description: "Diskusi demo progress implementasi fitur dan verifikasi acceptance criteria.",
    priority: "Medium",
    category: "work",
    status: "On Review",
    dueDate: new Date().toISOString().split("T")[0],
    subtasks: [],
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-work-4",
    title: "Setup CI/CD Pipeline Otomatis",
    description: "Konfigurasi GitHub Actions untuk build dan deploy preview otomatis ke staging server.",
    priority: "Low",
    category: "work",
    status: "Done",
    dueDate: "",
    subtasks: [
      { id: "st-w6", text: "Buat Dockerfile production", completed: true },
      { id: "st-w7", text: "Integrasi webhook Discord notification", completed: true }
    ],
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date().toISOString()
  },

  // Task Rumah / Personal
  {
    id: "sample-personal-1",
    title: "Belanja Bulanan & Kebutuhan Dapur",
    description: "Beli stok bahan masakan, bumbu, perlengkapan mandi, dan vitamin untuk 2 minggu.",
    priority: "Medium",
    category: "personal",
    status: "To Do",
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0],
    subtasks: [
      { id: "st-p1", text: "Beras & minyak goreng 2 liter", completed: true },
      { id: "st-p2", text: "Buah apel, pisang, dan sayuran", completed: false },
      { id: "st-p3", text: "Sabun, deterjen, & pasta gigi", completed: false }
    ],
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-personal-2",
    title: "Jadwal Servis AC Ruang Tamu & Kamar",
    description: "Hubungi teknisi langganan untuk cuci AC berkala dan cek tekanan freon.",
    priority: "High",
    category: "personal",
    status: "On Waiting",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    subtasks: [],
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-personal-3",
    title: "Olahraga Pagi & Jogging 5 KM",
    description: "Rutin lari pagi di taman komplek untuk menjaga kesehatan dan kebugaran tubuh.",
    priority: "Low",
    category: "personal",
    status: "Done",
    dueDate: "",
    subtasks: [
      { id: "st-p4", text: "Pemanasan statis 10 menit", completed: true },
      { id: "st-p5", text: "Jogging interval 30 menit", completed: true }
    ],
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date().toISOString()
  }
];

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Workspace Mode State ("work" | "personal" | "all")
  const [workspaceMode, setWorkspaceMode] = useState("work");

  // Theme State ("dark" | "light")
  const [theme, setTheme] = useState("dark");

  // Toast State for Drag & Drop to Trash
  const [trashToast, setTrashToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState("To Do");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Initialize Theme & Workspace Mode from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("kanban_theme") || "dark";
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      const savedMode = localStorage.getItem("kanban_workspace_mode");
      if (savedMode && ["work", "personal", "all"].includes(savedMode)) {
        setWorkspaceMode(savedMode);
      }
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("kanban_theme", nextTheme);
    }
  };

  const handleWorkspaceChange = (mode) => {
    setWorkspaceMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("kanban_workspace_mode", mode);
    }
  };

  // Helper to load tasks from window.localStorage with fallback sample tasks
  const loadLocalStorageTasks = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kanban_tasks");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTasks(parsed);
            return;
          }
        } catch (e) {
          console.error("Failed to parse local tasks:", e);
        }
      }
      // Populate sample tasks on first launch
      setTasks(SAMPLE_TASKS);
      localStorage.setItem("kanban_tasks", JSON.stringify(SAMPLE_TASKS));
    }
  };

  // Firestore Real-Time Listener or Local Storage Fallback
  useEffect(() => {
    setIsLoadingTasks(true);
    if (isFirebaseConfigured) {
      const unsubscribe = subscribeToTasks(
        (fetchedTasks) => {
          if (fetchedTasks.length === 0) {
            loadLocalStorageTasks();
          } else {
            setTasks(fetchedTasks);
          }
          setTimeout(() => setIsLoadingTasks(false), 400);
        },
        (error) => {
          console.warn("Falling back to local state due to Firestore error:", error);
          loadLocalStorageTasks();
          setTimeout(() => setIsLoadingTasks(false), 400);
        }
      );

      return () => unsubscribe();
    } else {
      loadLocalStorageTasks();
      setTimeout(() => setIsLoadingTasks(false), 400);
    }
  }, []);

  // Helper to sync local storage if not using Firebase
  const updateLocalTasks = (newTasks) => {
    setTasks(newTasks);
    if (!isFirebaseConfigured && typeof window !== "undefined") {
      localStorage.setItem("kanban_tasks", JSON.stringify(newTasks));
    }
  };

  // Count active tasks by category (excluding trash)
  const workCount = useMemo(() => {
    return tasks.filter((t) => !t.isDeleted && (t.category || "work") === "work").length;
  }, [tasks]);

  const personalCount = useMemo(() => {
    return tasks.filter((t) => !t.isDeleted && t.category === "personal").length;
  }, [tasks]);

  // Count trashed tasks
  const trashedCount = useMemo(() => {
    return tasks.filter((t) => t.isDeleted).length;
  }, [tasks]);

  // Filter Tasks by Workspace Mode, Search Term, & Priority (excluding soft-deleted tasks)
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Exclude soft-deleted tasks from the Kanban board
      if (task.isDeleted) return false;

      // 1. Workspace mode filter (Work vs Personal vs All)
      const taskCategory = task.category || "work";
      if (workspaceMode !== "all" && taskCategory !== workspaceMode) {
        return false;
      }

      // 2. Search keyword filter
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());

      // 3. Priority filter
      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, workspaceMode, searchTerm, priorityFilter]);

  // Handle Open Create Modal
  const handleOpenCreateModal = (status = "To Do") => {
    setEditingTask(null);
    setDefaultColumnStatus(status);
    setIsTaskModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Handle Save Task (Create or Update)
  const handleSaveTask = async (taskForm) => {
    const formWithCategory = {
      ...taskForm,
      category: taskForm.category || (workspaceMode === "personal" ? "personal" : "work"),
      isDeleted: false,
      deletedAt: null,
    };

    if (editingTask) {
      // Update Task
      if (isFirebaseConfigured) {
        try {
          await updateTask(editingTask.id, formWithCategory);
        } catch (err) {
          console.error("Error updating Firestore task:", err);
          const updated = tasks.map((t) =>
            t.id === editingTask.id ? { ...t, ...formWithCategory } : t
          );
          updateLocalTasks(updated);
        }
      } else {
        const updated = tasks.map((t) =>
          t.id === editingTask.id ? { ...t, ...formWithCategory } : t
        );
        updateLocalTasks(updated);
      }
    } else {
      // Add Task
      if (isFirebaseConfigured) {
        try {
          await addTask(formWithCategory);
        } catch (err) {
          console.error("Error adding Firestore task:", err);
          const newTask = {
            id: `local-${Date.now()}`,
            ...formWithCategory,
            createdAt: new Date().toISOString(),
          };
          updateLocalTasks([newTask, ...tasks]);
        }
      } else {
        const newTask = {
          id: `local-${Date.now()}`,
          ...formWithCategory,
          createdAt: new Date().toISOString(),
        };
        updateLocalTasks([newTask, ...tasks]);
      }
    }
  };

  // Handle Task Status Change (Drag and drop or quick move)
  const handleStatusChange = async (taskId, newStatus) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );

    if (isFirebaseConfigured) {
      try {
        await updateTaskStatus(taskId, newStatus);
      } catch (err) {
        console.error("Error updating status in Firestore:", err);
        updateLocalTasks(updatedTasks);
      }
    } else {
      updateLocalTasks(updatedTasks);
    }
  };

  // Handle Toggle Subtask item directly from task card
  const handleToggleSubtask = async (taskId, subtaskId) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || !Array.isArray(targetTask.subtasks)) return;

    const updatedSubtasks = targetTask.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t
    );

    if (isFirebaseConfigured) {
      try {
        await updateTask(taskId, { subtasks: updatedSubtasks });
      } catch (err) {
        console.error("Error updating subtask in Firestore:", err);
        updateLocalTasks(updatedTasks);
      }
    } else {
      updateLocalTasks(updatedTasks);
    }
  };

  // Handle Reorder Subtasks directly on task card or modal
  const handleReorderSubtasks = async (taskId, newSubtasks) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, subtasks: newSubtasks } : t
    );

    if (isFirebaseConfigured) {
      try {
        await updateTask(taskId, { subtasks: newSubtasks });
      } catch (err) {
        console.error("Error reordering subtasks in Firestore:", err);
        updateLocalTasks(updatedTasks);
      }
    } else {
      updateLocalTasks(updatedTasks);
    }
  };

  // Handle Drag & Drop to Trash Dropzone
  const handleTrashDrop = async (taskId) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const nowIso = new Date().toISOString();
    const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? { ...t, isDeleted: true, deletedAt: nowIso }
        : t
    );

    if (isFirebaseConfigured) {
      try {
        await softDeleteTask(taskId);
      } catch (err) {
        console.error("Error soft deleting task via drag drop:", err);
        updateLocalTasks(updatedTasks);
      }
    } else {
      updateLocalTasks(updatedTasks);
    }

    // Set toast notification with undo option
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setTrashToast({
      taskId: targetTask.id,
      title: targetTask.title,
    });
    toastTimeoutRef.current = setTimeout(() => {
      setTrashToast(null);
    }, 6000);
  };

  // Handle Undo Trash
  const handleUndoTrash = async (taskId) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, isDeleted: false, deletedAt: null } : t
    );

    if (isFirebaseConfigured) {
      try {
        await restoreTask(taskId);
      } catch (err) {
        console.error("Error restoring task:", err);
        updateLocalTasks(updatedTasks);
      }
    } else {
      updateLocalTasks(updatedTasks);
    }

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setTrashToast(null);
  };

  // Handle Open Delete Modal (Pindahkan ke Sampah)
  const handleOpenDeleteModal = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Handle Confirm Soft Delete (Move to Trash)
  const handleConfirmSoftDelete = async () => {
    if (!taskToDelete) return;

    const nowIso = new Date().toISOString();
    const updatedTasks = tasks.map((t) =>
      t.id === taskToDelete.id
        ? { ...t, isDeleted: true, deletedAt: nowIso }
        : t
    );

    if (isFirebaseConfigured) {
      try {
        await softDeleteTask(taskToDelete.id);
      } catch (err) {
        console.error("Error soft deleting task in Firestore:", err);
        updateLocalTasks(updatedTasks);
      }
    } else {
      updateLocalTasks(updatedTasks);
    }

    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  return (
    <main className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
      {/* Header Bar */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        onAddTask={handleOpenCreateModal}
        totalTasks={filteredTasks.length}
        isFirebaseConfigured={isFirebaseConfigured}
        workspaceMode={workspaceMode}
        setWorkspaceMode={handleWorkspaceChange}
        workCount={workCount}
        personalCount={personalCount}
        trashedCount={trashedCount}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Kanban Board */}
      <KanbanBoard
        tasks={filteredTasks}
        isLoading={isLoadingTasks}
        onStatusChange={handleStatusChange}
        onAddTask={handleOpenCreateModal}
        onEditTask={handleOpenEditModal}
        onDeleteTask={handleOpenDeleteModal}
        onToggleSubtask={handleToggleSubtask}
        onReorderSubtasks={handleReorderSubtasks}
        onTrashDrop={handleTrashDrop}
      />

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialData={editingTask}
        defaultStatus={defaultColumnStatus}
        defaultCategory={workspaceMode === "personal" ? "personal" : "work"}
      />

      {/* Soft Delete Confirmation Modal (Pindahkan ke Tempat Sampah) */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmSoftDelete}
        taskTitle={taskToDelete?.title || ""}
        isPermanent={false}
      />

      {/* Floating Toast Notification on Drag & Drop Trash */}
      {trashToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900/95 dark:bg-slate-900/95 text-white border border-rose-500/50 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-slide-up">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col max-w-[200px] sm:max-w-xs">
            <span className="text-xs font-bold text-slate-100 truncate">
              &quot;{trashToast.title}&quot;
            </span>
            <span className="text-[10px] text-slate-400">
              Dipindahkan ke Tempat Sampah
            </span>
          </div>
          <button
            onClick={() => handleUndoTrash(trashToast.taskId)}
            className="ml-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all active:scale-95 shrink-0"
            title="Kembalikan task ke board"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Batalkan</span>
          </button>
        </div>
      )}
    </main>
  );
}
