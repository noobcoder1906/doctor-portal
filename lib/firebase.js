// Import Firebase SDK modules
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Firebase configuration (Use environment variables for security)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Helper functions for healthcare data
const addPatient = async (doctorId, patientData) => {
  try {
    const docRef = await addDoc(collection(db, "patients"), {
      doctorId,
      ...patientData,
      createdAt: new Date(),
      lastUpdated: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding patient:", error)
    throw error
  }
}

const addMedicalRecord = async (patientId, recordData) => {
  try {
    const docRef = await addDoc(collection(db, "medicalRecords"), {
      patientId,
      ...recordData,
      timestamp: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding medical record:", error)
    throw error
  }
}

const addTask = async (patientId, taskData) => {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      patientId,
      ...taskData,
      createdAt: new Date(),
      status: "pending",
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding task:", error)
    throw error
  }
}

// Export Firebase services and helper functions
export {
  app,
  auth,
  db,
  storage,
  onAuthStateChanged,
  addPatient,
  addMedicalRecord,
  addTask,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  ref,
  uploadBytes,
  getDownloadURL,
}
