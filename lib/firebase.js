import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase environment variables are provided
export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_api_key_here'
);

let app;
let db;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export { db };

// Collection Name
const COLLECTION_NAME = "tasks";

/**
 * Subscribe to real-time updates from Firestore tasks collection
 * @param {Function} callback - Called with updated task array
 * @param {Function} onError - Optional error handler
 * @returns {Function} Unsubscribe function
 */
export function subscribeToTasks(callback, onError) {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase is not fully configured. Using fallback local state mode.");
    return () => {};
  }

  try {
    const tasksQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasks = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || "",
            description: data.description || "",
            priority: data.priority || "Medium",
            category: data.category || "work",
            status: data.status || "To Do",
            dueDate: data.dueDate || "",
            subtasks: Array.isArray(data.subtasks) ? data.subtasks : [],
            isDeleted: Boolean(data.isDeleted),
            deletedAt: data.deletedAt?.toDate?.()
              ? data.deletedAt.toDate().toISOString()
              : (data.deletedAt || null),
            createdAt: data.createdAt?.toDate?.()
              ? data.createdAt.toDate().toISOString()
              : (data.createdAt || new Date().toISOString()),
          };
        });
        callback(tasks);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error("Error setting up tasks listener:", err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Add a new task to Firestore
 * @param {Object} taskData - { title, description, priority, category, status, dueDate, subtasks }
 */
export async function addTask(taskData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase configuration is missing in .env.local");
  }

  const payload = {
    title: taskData.title.trim(),
    description: taskData.description ? taskData.description.trim() : "",
    priority: taskData.priority || "Medium",
    category: taskData.category || "work",
    status: taskData.status || "To Do",
    dueDate: taskData.dueDate || "",
    subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
    isDeleted: false,
    deletedAt: null,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
  return docRef.id;
}

/**
 * Update an existing task document in Firestore
 * @param {string} id - Task Document ID
 * @param {Object} updateData - Key-value pair of updated fields
 */
export async function updateTask(id, updateData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase configuration is missing in .env.local");
  }

  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, updateData);
}

/**
 * Quick status update for a task in Firestore
 * @param {string} id - Task Document ID
 * @param {string} newStatus - 'To Do' | 'On Progress' | 'On Review' | 'Done'
 */
export async function updateTaskStatus(id, newStatus) {
  return updateTask(id, { status: newStatus });
}

/**
 * Soft delete a task (pindahkan ke tempat sampah)
 * @param {string} id - Task Document ID
 */
export async function softDeleteTask(id) {
  return updateTask(id, {
    isDeleted: true,
    deletedAt: serverTimestamp(),
  });
}

/**
 * Restore a soft-deleted task from trash
 * @param {string} id - Task Document ID
 */
export async function restoreTask(id) {
  return updateTask(id, {
    isDeleted: false,
    deletedAt: null,
  });
}

/**
 * Permanently delete a task document from Firestore
 * @param {string} id - Task Document ID
 */
export async function deleteTask(id) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase configuration is missing in .env.local");
  }

  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export const permanentDeleteTask = deleteTask;

/**
 * Permanently empty all tasks in trash
 * @param {Array<string>} taskIds - List of task IDs in trash
 */
export async function emptyTrash(taskIds) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase configuration is missing in .env.local");
  }

  await Promise.all(
    taskIds.map((id) => deleteDoc(doc(db, COLLECTION_NAME, id)))
  );
}
