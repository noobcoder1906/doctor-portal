// This file defines the database schema types for the healthcare application

// User types
export interface UserProfile {
  id: string
  uid: string // Firebase Auth UID
  email: string
  name: string
  phone?: string
  role: "doctor" | "patient"
  createdAt: Date
  photoURL?: string
  lastActive?: Date
}

export interface DoctorProfile extends UserProfile {
  role: "doctor"
  specialty: string
  licenseNumber: string
  bio?: string
  education?: string[]
  experience?: number // Years of experience
  languages?: string[]
  availabilityHours?: {
    [day: string]: { start: string; end: string }[]
  }
  patientIds: string[] // IDs of patients assigned to this doctor
  rating?: number
  reviewCount?: number
}

export interface PatientProfile extends UserProfile {
  role: "patient"
  dateOfBirth: Date
  gender: string
  bloodType?: string
  height?: number
  weight?: number
  allergies?: string[]
  medicalConditions?: string[]
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  assignedDoctorIds: string[] // IDs of doctors assigned to this patient
}

// Appointment types
export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  time: string
  type: string // e.g., 'consultation', 'follow-up', 'checkup'
  reason: string
  status: "booked" | "confirmed" | "completed" | "cancelled" | "no-show"
  notes?: string
  createdAt: Date
  updatedAt?: Date
}

// Recommendation types
export interface Recommendation {
  id: string
  patientId: string
  doctorId: string
  title: string
  message: string
  type: "medication" | "exercise" | "diet" | "lifestyle" | "note"
  createdAt: Date
  read: boolean
  followUpDate?: Date
  priority?: "low" | "medium" | "high"
}

// Medication recommendation
export interface MedicationRecommendation extends Recommendation {
  type: "medication"
  medicationDetails: {
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
    sideEffects?: string[]
    warnings?: string[]
  }
}

// Notification types
export interface Notification {
  id: string
  userId: string // Recipient user ID
  title: string
  message: string
  type: string // e.g., 'appointment', 'recommendation', 'message'
  referenceId?: string // ID of the related entity (appointment, recommendation, etc.)
  createdAt: Date
  seen: boolean
}

// Health data types
export interface HealthData {
  id: string
  patientId: string
  type: string // e.g., 'vitals', 'lab-result', 'symptom'
  data: any // Specific health data
  recordedBy: string // User ID of who recorded this (patient or doctor)
  createdAt: Date
}

// Vital signs
export interface VitalSigns extends HealthData {
  type: "vitals"
  data: {
    bloodPressure?: {
      systolic: number
      diastolic: number
    }
    heartRate?: number
    temperature?: number
    respiratoryRate?: number
    oxygenSaturation?: number
    bloodGlucose?: number
  }
}

// Message types
export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: Date
  read: boolean
  attachments?: {
    type: string
    url: string
    name: string
  }[]
}

// Doctor availability
export interface DoctorAvailability {
  id: string
  doctorId: string
  date: string
  slots: {
    time: string
    available: boolean
    appointmentId?: string
  }[]
}
