"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard-overview"
import { PatientList } from "@/components/patient-list"
import { NotificationCenter } from "@/components/notification-center"
import { ProfileSetup } from "@/components/profile-setup"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PrescriptionForm from "@/components/prescription-form"

export default function DashboardPage() {
  const { user, userProfile, loading, profileMissing, createProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center healthcare-gradient">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Show profile setup if profile is missing
  if (profileMissing) {
    return <ProfileSetup onProfileCreate={createProfile} userEmail={user.email || ""} />
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center healthcare-gradient">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Profile...</h2>
          <p className="text-gray-600">Please wait while we load your profile information.</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600">Welcome back, Dr. {user.displayName || user.email}</p>
          </div>
          <NotificationCenter />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="form">Prescriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <PatientList />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{/* Analytics content */}</div>
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            <PrescriptionForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
