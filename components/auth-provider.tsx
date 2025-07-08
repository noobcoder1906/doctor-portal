"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { auth, getUserProfile } from "@/lib/firebase"
import type { UserProfile } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔄 Auth state changed:", user?.uid)
      setUser(user)

      if (user) {
        try {
          // Fetch user profile from Firestore
          const profile = await getUserProfile(user.uid)

          if (profile) {
            console.log("✅ User profile loaded:", profile.role, profile.firstName, profile.lastName)
            setUserProfile(profile)

            // Route based on user role
            const currentPath = window.location.pathname
            if (currentPath === "/" || currentPath === "/login" || currentPath === "/signup") {
              if (profile.role === "doctor") {
                router.push("/dashboard")
              } else if (profile.role === "patient") {
                router.push("/dashboard")
              }
            }
          } else {
            console.log("❌ No user profile found - user needs to complete setup")
            setUserProfile(null)
            // Don't redirect here - let the page handle missing profile
          }
        } catch (error) {
          console.error("❌ Error fetching user profile:", error)
          setUserProfile(null)
        }
      } else {
        console.log("🔄 User signed out")
        setUserProfile(null)
        // Only redirect to login if not already on auth pages
        const currentPath = window.location.pathname
        if (currentPath !== "/" && currentPath !== "/login" && currentPath !== "/signup") {
          router.push("/")
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    try {
      const { signOutUser } = await import("@/lib/firebase")
      await signOutUser()
      setUser(null)
      setUserProfile(null)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut: handleSignOut }}>
      {children}  
    </AuthContext.Provider>
  )
}
