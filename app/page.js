"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import KanbanBoard from "@/components/KanbanBoard";
import TaskModal from "@/components/TaskModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import {
  subscribeToTasks,
  addTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  isFirebaseConfigured
} from "@/lib/firebase";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState("To Do");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Firestore Real-Time Listener or Local Storage Fallback
  useEffect(() => {
    setIsLoadingTasks(true);
    if (isFirebaseConfigured) {
      // Clear legacy local sample data if switching to Firestore
      if (typeof window !== "undefined") {
        localStorage.removeItem("kanban_tasks");
      }

      const unsubscribe = subscribeToTasks(
        (fetchedTasks) => {
          setTasks(fetchedTasks);
          // Small delay for smooth wave transition
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

  // Helper to load tasks from window.localStorage
  const loadLocalStorageTasks = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kanban_tasks");
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
          return;
        } catch (e) {
          console.error("Failed to parse local tasks:", e);
        }
      }
      setTasks([]);
    }
  };

  // Helper to sync local storage if not using Firebase
  const updateLocalTasks = (newTasks) => {
    setTasks(newTasks);
    if (!isFirebaseConfigured && typeof window !== "undefined") {
      localStorage.setItem("kanban_tasks", JSON.stringify(newTasks));
    }
  };

  // Filter Tasks by Search Term & Priority
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchTerm, priorityFilter]);

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
    if (editingTask) {
      // Update Task
      if (isFirebaseConfigured) {
        try {
          await updateTask(editingTask.id, taskForm);
        } catch (err) {
          console.error("Error updating Firestore task:", err);
          const updated = tasks.map((t) =>
            t.id === editingTask.id ? { ...t, ...taskForm } : t
          );
          updateLocalTasks(updated);
        }
      } else {
        const updated = tasks.map((t) =>
          t.id === editingTask.id ? { ...t, ...taskForm } : t
        );
        updateLocalTasks(updated);
      }
    } else {
      // Add Task
      if (isFirebaseConfigured) {
        try {
          await addTask(taskForm);
        } catch (err) {
          console.error("Error adding Firestore task:", err);
          const newTask = {
            id: `local-${Date.now()}`,
            ...taskForm,
            createdAt: new Date().toISOString(),
          };
          updateLocalTasks([newTask, ...tasks]);
        }
      } else {
        const newTask = {
          id: `local-${Date.now()}`,
          ...taskForm,
          createdAt: new Date().toISOString(),
        };
        updateLocalTasks([newTask, ...tasks]);
      }
    }
  };

  // Handle Task Status Change (Drag and drop or quick move)
  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic UI update
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

  // Handle Open Delete Modal
  const handleOpenDeleteModal = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    const remainingTasks = tasks.filter((t) => t.id !== taskToDelete.id);

    if (isFirebaseConfigured) {
      try {
        await deleteTask(taskToDelete.id);
      } catch (err) {
        console.error("Error deleting task in Firestore:", err);
        updateLocalTasks(remainingTasks);
      }
    } else {
      updateLocalTasks(remainingTasks);
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
      />

      {/* Main Kanban Board */}
      <KanbanBoard
        tasks={filteredTasks}
        isLoading={isLoadingTasks}
        onStatusChange={handleStatusChange}
        onAddTask={handleOpenCreateModal}
        onEditTask={handleOpenEditModal}
        onDeleteTask={handleOpenDeleteModal}
      />

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialData={editingTask}
        defaultStatus={defaultColumnStatus}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || ""}
      />
    </main>
  );
}
