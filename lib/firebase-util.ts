import { Timestamp } from "firebase/firestore"

// Utility functions for Firebase operations

export const formatFirebaseDate = (timestamp: Timestamp): string => {
  if (!timestamp) return ""
  return timestamp.toDate().toLocaleDateString()
}

export const formatFirebaseDateTime = (timestamp: Timestamp): string => {
  if (!timestamp) return ""
  return timestamp.toDate().toLocaleString()
}

export const createTimestampFromDate = (date: Date): Timestamp => {
  return Timestamp.fromDate(date)
}

export const isUpcomingAppointment = (scheduledDate: Timestamp): boolean => {
  if (!scheduledDate) return false
  return scheduledDate.toDate() > new Date()
}

export const getAppointmentStatus = (appointment: any): string => {
  const now = new Date()
  const appointmentDate = appointment.scheduledDate.toDate()

  if (appointment.status === "cancelled") return "Cancelled"
  if (appointment.status === "completed") return "Completed"
  if (appointmentDate < now && appointment.status !== "completed") return "Missed"
  if (appointmentDate > now) return "Upcoming"

  return appointment.status
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

// Error handling utilities
export const getFirebaseErrorMessage = (error: any): string => {
  switch (error.code) {
    case "auth/user-not-found":
      return "No user found with this email address."
    case "auth/wrong-password":
      return "Incorrect password."
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/weak-password":
      return "Password should be at least 6 characters."
    case "auth/invalid-email":
      return "Invalid email address."
    case "permission-denied":
      return "You do not have permission to perform this action."
    case "unavailable":
      return "Service is currently unavailable. Please try again later."
    default:
      return error.message || "An unexpected error occurred."
  }
}
