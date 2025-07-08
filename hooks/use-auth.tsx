"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import {
  auth,
  onAuthStateChanged,
  getDoctorProfile,
  getPatientProfile,
  type Doctor,
  type Patient,
} from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  userProfile: Doctor | Patient | null
  userType: "doctor" | "patient" | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  userType: null,
  loading: true,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<Doctor | Patient | null>(null)
  const [userType, setUserType] = useState<"doctor" | "patient" | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          // Try to get doctor profile first
          const doctorProfile = await getDoctorProfile(user.uid)
          if (doctorProfile) {
            setUserProfile(doctorProfile)
            setUserType("doctor")
          } else {
            // If not a doctor, try patient profile
            const patientProfile = await getPatientProfile(user.uid)
            if (patientProfile) {
              setUserProfile(patientProfile)
              setUserType("patient")
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        setUserProfile(null)
        setUserType(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, userProfile, userType, loading }}>{children}</AuthContext.Provider>
}
