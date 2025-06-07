"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PatientList } from "@/components/patient-list"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"

export default function PatientsPage() {
  const { user, loading } = useAuth()
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Patient Management
            </h1>
            <p className="text-gray-600">Manage and monitor all your assigned patients</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Patient
          </Button>
        </div>
        <PatientList />
      </div>
    </DashboardLayout>
  )
}
