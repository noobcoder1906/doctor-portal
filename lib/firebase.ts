"use client"

import { initializeApp } from "firebase/app"
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  setDoc,
  getDoc,
  type Timestamp,
} from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Types for healthcare system
export interface UserProfile {
  uid: string
  email: string
  role: "doctor" | "patient"
  firstName: string
  lastName: string
  phone?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface DoctorProfile extends UserProfile {
  role: "doctor"
  specialization: string
  licenseNumber: string
  hospital?: string
  patients: string[] // Array of patient UIDs
}

export interface PatientProfile extends UserProfile {
  role: "patient"
  dateOfBirth: string
  gender: "male" | "female" | "other"
  bloodType?: string
  allergies?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  assignedDoctors: string[] // Array of doctor UIDs
  medicalHistory?: string[]
  currentConditions?: string[]
}

export interface Prescription {
  id?: string
  doctorId: string
  patientId: string
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }[]
  diagnosis: string
  notes?: string
  createdAt: Timestamp
  status: "active" | "completed" | "cancelled"
}

export interface Appointment {
  id?: string
  doctorId: string
  patientId: string
  scheduledDate: Timestamp
  duration: number // in minutes
  type: "consultation" | "follow-up" | "emergency"
  status: "scheduled" | "confirmed" | "completed" | "cancelled"
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Recommendation {
  id?: string
  doctorId: string
  patientId: string
  title: string
  description: string
  category: "lifestyle" | "medication" | "exercise" | "diet" | "other"
  priority: "low" | "medium" | "high"
  createdAt: Timestamp
  isRead: boolean
}

export interface HealthData {
  id?: string
  patientId: string
  type: "vitals" | "symptoms" | "medication_taken" | "exercise" | "other"
  data: {
    [key: string]: any
  }
  createdAt: Timestamp
  notes?: string
  doctorId?: string // Added to link health data to specific doctor
}

export interface DoctorNotes {
  id?: string
  doctorId: string
  patientId: string
  notes: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Authentication Functions
export const signUpUser = async (
  email: string,
  password: string,
  profile: Omit<UserProfile, "uid" | "createdAt" | "updatedAt">,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user profile in Firestore with UID as document ID for consistency
    const userProfile = {
      uid: user.uid,
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Initialize arrays for doctor-patient relationships
      ...(profile.role === "doctor" && { patients: [] }),
      ...(profile.role === "patient" && { assignedDoctors: [], medicalHistory: [], currentConditions: [] }),
    }

    // Use setDoc with UID as document ID for consistent retrieval
    await setDoc(doc(db, "users", user.uid), userProfile)

    console.log("✅ User created successfully:", user.uid)
    return user
  } catch (error) {
    console.error("❌ Error creating user:", error)
    throw error
  }
}

export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log("✅ User signed in:", userCredential.user.uid)
    return userCredential.user
  } catch (error) {
    console.error("❌ Error signing in:", error)
    throw error
  }
}

export const signOutUser = async () => {
  try {
    await signOut(auth)
    console.log("✅ User signed out")
  } catch (error) {
    console.error("❌ Error signing out:", error)
    throw error
  }
}

// User Profile Functions
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    console.log("🔄 Fetching user profile for UID:", uid)

    // First try to get document by UID as document ID
    const userDocRef = doc(db, "users", uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      console.log("✅ User profile found by document ID")
      return { id: userDoc.id, ...userDoc.data() } as UserProfile
    }

    // If not found, try querying by uid field (for legacy documents)
    console.log("🔄 Trying query by uid field...")
    const q = query(collection(db, "users"), where("uid", "==", uid))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      console.log("✅ User profile found by query")
      return { id: doc.id, ...doc.data() } as UserProfile
    }

    console.log("❌ User profile not found")
    return null
  } catch (error) {
    console.error("❌ Error fetching user profile:", error)
    throw error
  }
}

// FIXED: Remove the problematic updateUserProfile function that causes the Firebase error
// Instead, use setDoc to create or update the document
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    console.log("🔄 Updating user profile for UID:", uid)

    // Get existing profile first
    const existingProfile = await getUserProfile(uid)

    if (existingProfile) {
      // Document exists, use updateDoc
      const userDocRef = doc(db, "users", uid)
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
      console.log("✅ User profile updated using updateDoc")
    } else {
      // Document doesn't exist, use setDoc to create it
      const userDocRef = doc(db, "users", uid)
      await setDoc(userDocRef, {
        uid: uid,
        ...updates,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      console.log("✅ User profile created using setDoc")
    }
  } catch (error) {
    console.error("❌ Error updating user profile:", error)
    throw error
  }
}

// Enhanced Doctor-Patient Relationship Functions
export const assignPatientToDoctor = async (doctorId: string, patientId: string) => {
  try {
    console.log(`🔄 Assigning patient ${patientId} to doctor ${doctorId}...`)

    // Safely update doctor's patient list
    try {
      const doctorDocRef = doc(db, "users", doctorId)
      const doctorDoc = await getDoc(doctorDocRef)

      if (doctorDoc.exists()) {
        const doctorData = doctorDoc.data()
        const currentPatients = doctorData.patients || []
        if (!currentPatients.includes(patientId)) {
          await updateDoc(doctorDocRef, {
            patients: arrayUnion(patientId),
            updatedAt: serverTimestamp(),
          })
        }
      } else {
        console.log(`⚠️ Doctor document ${doctorId} not found, skipping patient assignment`)
      }
    } catch (doctorError) {
      console.error("❌ Error updating doctor document:", doctorError)
      // Continue with patient update even if doctor update fails
    }

    // Safely update patient's assigned doctors list
    try {
      const patientDocRef = doc(db, "users", patientId)
      const patientDoc = await getDoc(patientDocRef)

      if (patientDoc.exists()) {
        const patientData = patientDoc.data()
        const currentDoctors = patientData.assignedDoctors || []
        if (!currentDoctors.includes(doctorId)) {
          await updateDoc(patientDocRef, {
            assignedDoctors: arrayUnion(doctorId),
            updatedAt: serverTimestamp(),
          })
        }
      } else {
        // Create a basic patient profile if it doesn't exist
        console.log(`⚠️ Patient document ${patientId} not found, creating basic profile`)
        await setDoc(patientDocRef, {
          uid: patientId,
          role: "patient",
          assignedDoctors: [doctorId],
          firstName: "Unknown",
          lastName: "Patient",
          email: "unknown@example.com",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          medicalHistory: [],
          currentConditions: [],
        })
      }
    } catch (patientError) {
      console.error("❌ Error updating patient document:", patientError)
      // Continue even if patient update fails
    }

    // Log the assignment (this is optional and non-critical)
    try {
      await addDoc(collection(db, "doctorPatientAssignments"), {
        doctorId,
        patientId,
        assignedAt: serverTimestamp(),
        status: "active",
      })
    } catch (logError) {
      console.error("❌ Error logging assignment (non-critical):", logError)
      // Continue even if logging fails
    }

    console.log("✅ Patient assignment process completed")
  } catch (error) {
    console.error("❌ Error in assignPatientToDoctor:", error)
    // Don't throw the error - let the appointment booking continue
    console.log("⚠️ Continuing with appointment booking despite assignment error")
  }
}

export const getDoctorPatients = async (doctorId: string): Promise<PatientProfile[]> => {
  try {
    const q = query(
      collection(db, "users"),
      where("assignedDoctors", "array-contains", doctorId),
      where("role", "==", "patient"),
    )
    const querySnapshot = await getDocs(q)

    const patients = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as PatientProfile,
    )

    console.log(`✅ Found ${patients.length} patients for doctor ${doctorId}`)
    return patients
  } catch (error) {
    console.error("❌ Error fetching doctor patients:", error)
    throw error
  }
}

export const getPatientDoctors = async (patientId: string): Promise<DoctorProfile[]> => {
  try {
    const q = query(
      collection(db, "users"),
      where("patients", "array-contains", patientId),
      where("role", "==", "doctor"),
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as DoctorProfile)
  } catch (error) {
    console.error("❌ Error fetching patient doctors:", error)
    throw error
  }
}

// Prescription Functions
export const createPrescription = async (prescription: Omit<Prescription, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "prescriptions"), {
      ...prescription,
      createdAt: serverTimestamp(),
    })

    console.log("✅ Prescription created:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("❌ Error creating prescription:", error)
    throw error
  }
}

export const getPatientPrescriptions = async (patientId: string): Promise<Prescription[]> => {
  try {
    const q = query(collection(db, "prescriptions"), where("patientId", "==", patientId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Prescription)
  } catch (error) {
    console.error("❌ Error fetching patient prescriptions:", error)
    throw error
  }
}

export const updatePrescriptionStatus = async (prescriptionId: string, status: Prescription["status"]) => {
  try {
    const docRef = doc(db, "prescriptions", prescriptionId)
    await updateDoc(docRef, { status })
    console.log("✅ Prescription status updated")
  } catch (error) {
    console.error("❌ Error updating prescription status:", error)
    throw error
  }
}

// Enhanced Appointment Functions
export const scheduleAppointment = async (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => {
  try {
    console.log("🔄 Scheduling appointment...")

    // Create the appointment document first (this is the main goal)
    const docRef = await addDoc(collection(db, "appointments"), {
      ...appointment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    console.log("✅ Appointment created with ID:", docRef.id)

    // Try to establish doctor-patient relationship (non-critical)
    try {
      await assignPatientToDoctor(appointment.doctorId, appointment.patientId)
    } catch (assignError) {
      console.error("❌ Error assigning patient to doctor (non-critical):", assignError)
      // Continue - the appointment is already created
    }

    // Try to store appointment in patient's health data (non-critical)
    try {
      await addHealthData({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        type: "other",
        data: {
          appointmentId: docRef.id,
          appointmentType: appointment.type,
          doctorId: appointment.doctorId,
          scheduledDate: appointment.scheduledDate,
        },
        notes: `Appointment scheduled: ${appointment.type}`,
      })
    } catch (healthDataError) {
      console.error("❌ Error storing health data (non-critical):", healthDataError)
      // Continue - the appointment is already created
    }

    console.log("✅ Appointment scheduling completed successfully")
    return docRef.id
  } catch (error) {
    console.error("❌ Error scheduling appointment:", error)
    throw error
  }
}

export const getDoctorAppointments = async (doctorId: string): Promise<Appointment[]> => {
  try {
    const q = query(collection(db, "appointments"), where("doctorId", "==", doctorId), orderBy("scheduledDate", "asc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Appointment)
  } catch (error) {
    console.error("❌ Error fetching doctor appointments:", error)
    throw error
  }
}

export const getPatientAppointments = async (patientId: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", patientId),
      orderBy("scheduledDate", "asc"),
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Appointment)
  } catch (error) {
    console.error("❌ Error fetching patient appointments:", error)
    throw error
  }
}

export const updateAppointmentStatus = async (appointmentId: string, status: Appointment["status"]) => {
  try {
    const docRef = doc(db, "appointments", appointmentId)
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    })
    console.log("✅ Appointment status updated")
  } catch (error) {
    console.error("❌ Error updating appointment status:", error)
    throw error
  }
}

// Recommendation Functions
export const createRecommendation = async (recommendation: Omit<Recommendation, "id" | "createdAt" | "isRead">) => {
  try {
    const docRef = await addDoc(collection(db, "recommendations"), {
      ...recommendation,
      createdAt: serverTimestamp(),
      isRead: false,
    })

    console.log("✅ Recommendation created:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("❌ Error creating recommendation:", error)
    throw error
  }
}

export const getPatientRecommendations = async (patientId: string): Promise<Recommendation[]> => {
  try {
    const q = query(
      collection(db, "recommendations"),
      where("patientId", "==", patientId),
      orderBy("createdAt", "desc"),
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Recommendation)
  } catch (error) {
    console.error("❌ Error fetching patient recommendations:", error)
    throw error
  }
}

export const markRecommendationAsRead = async (recommendationId: string) => {
  try {
    const docRef = doc(db, "recommendations", recommendationId)
    await updateDoc(docRef, { isRead: true })
    console.log("✅ Recommendation marked as read")
  } catch (error) {
    console.error("❌ Error marking recommendation as read:", error)
    throw error
  }
}

// Enhanced Health Data Functions
export const addHealthData = async (healthData: Omit<HealthData, "id" | "createdAt">) => {
  try {
    console.log("🔄 Attempting to add health data:", healthData)

    const docRef = await addDoc(collection(db, "healthData"), {
      ...healthData,
      createdAt: serverTimestamp(),
    })

    console.log("✅ Health data added successfully with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("❌ Error adding health data:", error)
    console.error("❌ Error details:", error.message)
    throw error
  }
}

export const getPatientHealthData = async (patientId: string, doctorId?: string): Promise<HealthData[]> => {
  try {
    let q

    if (doctorId) {
      q = query(
        collection(db, "healthData"),
        where("patientId", "==", patientId),
        where("doctorId", "==", doctorId),
        orderBy("createdAt", "desc"),
      )
    } else {
      q = query(collection(db, "healthData"), where("patientId", "==", patientId), orderBy("createdAt", "desc"))
    }

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as HealthData)
  } catch (error) {
    console.error("❌ Error fetching patient health data:", error)
    throw error
  }
}

// Real-time Listeners
export const listenToAppointments = (
  userId: string,
  role: "doctor" | "patient",
  callback: (appointments: Appointment[]) => void,
) => {
  const field = role === "doctor" ? "doctorId" : "patientId"
  const q = query(collection(db, "appointments"), where(field, "==", userId), orderBy("scheduledDate", "asc"))

  return onSnapshot(q, (querySnapshot) => {
    const appointments = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Appointment,
    )
    callback(appointments)
  })
}

export const listenToRecommendations = (patientId: string, callback: (recommendations: Recommendation[]) => void) => {
  const q = query(collection(db, "recommendations"), where("patientId", "==", patientId), orderBy("createdAt", "desc"))

  return onSnapshot(q, (querySnapshot) => {
    const recommendations = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Recommendation,
    )
    callback(recommendations)
  })
}

export const createPatientProfile = async (
  uid: string,
  patientData: Omit<PatientProfile, "uid" | "createdAt" | "updatedAt">,
) => {
  try {
    await setDoc(doc(db, "users", uid), {
      uid,
      ...patientData,
      assignedDoctors: patientData.assignedDoctors || [],
      medicalHistory: patientData.medicalHistory || [],
      currentConditions: patientData.currentConditions || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    console.log("✅ Patient profile created")
  } catch (error) {
    console.error("❌ Error creating patient profile:", error)
    throw error
  }
}

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log("🔄 Testing Firebase connection...")
    const testDoc = await addDoc(collection(db, "test"), {
      message: "Firebase connection test",
      timestamp: serverTimestamp(),
    })
    console.log("✅ Firebase connection successful, test doc ID:", testDoc.id)
    return true
  } catch (error) {
    console.error("❌ Firebase connection failed:", error)
    return false
  }
}

export const createMissingUserProfile = async (
  uid: string,
  email: string,
  profileData: {
    role: "doctor" | "patient"
    firstName: string
    lastName: string
    phone?: string
    specialization?: string
    licenseNumber?: string
    hospital?: string
    dateOfBirth?: string
    gender?: "male" | "female" | "other"
  },
) => {
  try {
    console.log("🔄 Creating missing user profile for UID:", uid)

    const userProfile: UserProfile = {
      uid: uid,
      email: email,
      role: profileData.role,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    if (profileData.role === "doctor") {
      const doctorProfile: DoctorProfile = {
        ...userProfile,
        role: "doctor",
        specialization: profileData.specialization || "",
        licenseNumber: profileData.licenseNumber || "",
        hospital: profileData.hospital || "",
        patients: [],
      }
      await setDoc(doc(db, "users", uid), doctorProfile)
      console.log("✅ Doctor profile created")
      return doctorProfile
    } else {
      const patientProfile: PatientProfile = {
        ...userProfile,
        role: "patient",
        dateOfBirth: profileData.dateOfBirth || "",
        gender: profileData.gender || "other",
        assignedDoctors: [],
        medicalHistory: [],
        currentConditions: [],
      }
      await setDoc(doc(db, "users", uid), patientProfile)
      console.log("✅ Patient profile created")
      return patientProfile
    }
  } catch (error) {
    console.error("❌ Error creating missing user profile:", error)
    throw error
  }
}

// Add these new functions at the end of the file, before the last export statement

// Function to subscribe to real-time patient data
export const subscribeToPatientById = (patientId: string, callback: (patient: any) => void) => {
  const patientDocRef = doc(db, "users", patientId)

  return onSnapshot(patientDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const patientData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }
      callback(patientData)
    } else {
      // Try to find patient in appointments
      const appointmentsQuery = query(collection(db, "appointments"), where("patientId", "==", patientId))

      getDocs(appointmentsQuery).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Create a basic patient object from appointment data
          const appointmentData = querySnapshot.docs[0].data()
          const basicPatient = {
            id: patientId,
            uid: patientId,
            name: "Unknown Patient",
            role: "patient",
            gender: "Not specified",
            email: "Not provided",
            phone: "+1 (555) 123-4567",
            // Add other fields as needed
          }
          callback(basicPatient)
        } else {
          callback(null)
        }
      })
    }
  })
}

// Function to get doctor profile
export const getDoctorProfile = async (doctorId: string): Promise<DoctorProfile | null> => {
  try {
    const doctorDocRef = doc(db, "users", doctorId)
    const doctorDoc = await getDoc(doctorDocRef)

    if (doctorDoc.exists()) {
      return { id: doctorDoc.id, ...doctorDoc.data() } as DoctorProfile
    }

    return null
  } catch (error) {
    console.error("❌ Error fetching doctor profile:", error)
    return null
  }
}

// Function to get patient profile
export const getPatientProfile = async (patientId: string): Promise<PatientProfile | null> => {
  try {
    const patientDocRef = doc(db, "users", patientId)
    const patientDoc = await getDoc(patientDocRef)

    if (patientDoc.exists()) {
      return { id: patientDoc.id, ...patientDoc.data() } as PatientProfile
    }

    // If no profile exists, check if there are appointments for this patient
    const appointmentsQuery = query(collection(db, "appointments"), where("patientId", "==", patientId))

    const appointmentsSnapshot = await getDocs(appointmentsQuery)

    if (!appointmentsSnapshot.empty) {
      // Create a basic patient profile from appointment data
      const appointmentData = appointmentsSnapshot.docs[0].data()

      return {
        id: patientId,
        uid: patientId,
        firstName: "Unknown",
        lastName: "Patient",
        email: "Not provided",
        phone: "+1 (555) 123-4567",
        role: "patient" as const,
        dateOfBirth: "",
        gender: "other" as const,
        assignedDoctors: [appointmentData.doctorId],
        medicalHistory: [],
        currentConditions: [],
        createdAt: appointmentData.createdAt,
        updatedAt: appointmentData.updatedAt,
      }
    }

    return null
  } catch (error) {
    console.error("❌ Error fetching patient profile:", error)
    return null
  }
}

// Add a Patient type for TypeScript
export interface Patient {
  id: string
  uid: string
  name?: string
  firstName?: string
  lastName?: string
  age?: number | string
  gender?: string
  email?: string
  phone?: string
  bloodType?: string
  dateOfBirth?: string
  role: "patient"
  assignedDoctors?: string[]
  medicalHistory?: string[]
  currentConditions?: string[]
  vitals?: any[]
  tasks?: any[]
  messages?: any[]
  recommendations?: any[]
  currentMedications?: any[]
}

// Function to listen to patient medications in real-time
export const listenToPatientMedications = (patientId: string, callback: (medications: any[]) => void) => {
  const medicationsRef = collection(db, "patients", patientId, "medications")
  const q = query(medicationsRef, orderBy("createdAt", "desc"))

  return onSnapshot(q, (querySnapshot) => {
    const medications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    callback(medications)
  })
}

// Function to listen to notifications
export const listenToNotifications = (userId: string, callback: (notifications: any[]) => void) => {
  const notificationsRef = collection(db, "notifications")
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    where("read", "==", false),
    orderBy("createdAt", "desc"),
  )

  return onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    callback(notifications)
  })
}

// Function to mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId)
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
    })
    console.log("✅ Notification marked as read")
  } catch (error) {
    console.error("❌ Error marking notification as read:", error)
    throw error
  }
}

// Add this hook for authentication state management
import { useState, useEffect } from "react"

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)

        // Fetch user profile
        try {
          const profile = await getUserProfile(firebaseUser.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
          setUserProfile(null)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, userProfile, loading }
}

// Export Firebase services
export {
  app,
  auth,
  db,
  storage,
  onAuthStateChanged,
  // Firestore functions
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  serverTimestamp,
  arrayUnion,
  onSnapshot,
}
