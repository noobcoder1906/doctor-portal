"use client"

import { useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { auth, getUserProfile, createMissingUserProfile } from "@/lib/firebase"
import type { UserProfile } from "@/lib/firebase"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileMissing, setProfileMissing] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)

      if (user) {
        try {
          console.log("🔄 Checking user profile for:", user.uid)
          const profile = await getUserProfile(user.uid)

          if (!profile) {
            console.log("⚠️ User profile missing, flagging for creation")
            setProfileMissing(true)
            setUserProfile(null)
          } else {
            console.log("✅ User profile found:", profile.role)
            setProfileMissing(false)
            setUserProfile(profile)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
          setUserProfile(null)
          setProfileMissing(true)
        }
      } else {
        setUserProfile(null)
        setProfileMissing(false)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const createProfile = async (profileData: {
    role: "doctor" | "patient"
    firstName: string
    lastName: string
    phone?: string
    specialization?: string
    licenseNumber?: string
    hospital?: string
    dateOfBirth?: string
    gender?: "male" | "female" | "other"
  }) => {
    if (!user) return

    try {
      setLoading(true)
      const newProfile = await createMissingUserProfile(user.uid, user.email!, profileData)
      setUserProfile(newProfile as UserProfile)
      setProfileMissing(false)
      console.log("✅ Profile created successfully")
    } catch (error) {
      console.error("❌ Error creating profile:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { user, userProfile, loading, profileMissing, createProfile }
}
