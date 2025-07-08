"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { collection, query, where, onSnapshot, db, orderBy } from "@/lib/firebase"
import { Users, Activity, Eye, MessageSquare, Calendar } from "lucide-react"
import type { PatientProfile, HealthData } from "@/lib/firebase"
import Link from "next/link"
import { getDocs } from "firebase/firestore"

interface PatientOverviewProps {
  doctorId: string
}

export function PatientOverview({ doctorId }: PatientOverviewProps) {
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [patientHealthData, setPatientHealthData] = useState<Record<string, HealthData[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!doctorId) return

    // Load patients assigned to this doctor
    const loadPatients = async () => {
      try {
        console.log("🔄 Loading patients for doctor:", doctorId)

        // Query patients directly from users collection
        const patientsQuery = query(
          collection(db, "users"),
          where("role", "==", "patient"),
          where("assignedDoctors", "array-contains", doctorId),
        )

        const patientsSnapshot = await getDocs(patientsQuery)

        if (patientsSnapshot.empty) {
          console.log("ℹ️ No patients assigned to this doctor")
          setLoading(false)
          return
        }

        console.log(`🔄 Found ${patientsSnapshot.size} patients assigned to doctor`)

        // Get each patient's full profile
        const patientProfiles: PatientProfile[] = []

        for (const patientDoc of patientsSnapshot.docs) {
          const patientData = patientDoc.data() as PatientProfile
          patientProfiles.push({
            ...patientData,
            id: patientDoc.id,
            uid: patientDoc.id, // Ensure uid is set
          })

          // Set up real-time listener for this patient's health data
          const healthDataRef = collection(db, "healthData")
          const healthQuery = query(
            healthDataRef,
            where("patientId", "==", patientDoc.id),
            where("doctorId", "==", doctorId),
            orderBy("createdAt", "desc"),
          )

          onSnapshot(healthQuery, (snapshot) => {
            const healthData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as HealthData[]

            setPatientHealthData((prev) => ({
              ...prev,
              [patientDoc.id]: healthData,
            }))

            console.log(`✅ Real-time health data loaded for patient ${patientDoc.id}`)
          })
        }

        setPatients(patientProfiles)
        console.log("✅ Patient profiles loaded:", patientProfiles.length)
        setLoading(false)
      } catch (error) {
        console.error("❌ Error loading patients:", error)
        setLoading(false)
      }
    }

    loadPatients()
  }, [doctorId])

  const getHealthStatus = (patientId: string) => {
    const healthData = patientHealthData[patientId] || []
    const recentData = healthData.slice(0, 3)

    if (recentData.length === 0) return { status: "unknown", color: "bg-gray-100 text-gray-800" }

    // Simple health assessment based on recent data
    const hasVitals = recentData.some((data) => data.type === "vitals")
    const hasSymptoms = recentData.some((data) => data.type === "symptoms")

    if (hasSymptoms) return { status: "needs attention", color: "bg-yellow-100 text-yellow-800" }
    if (hasVitals) return { status: "stable", color: "bg-green-100 text-green-800" }

    return { status: "monitoring", color: "bg-blue-100 text-blue-800" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading patients...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {patients.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Assigned</h3>
          <p className="text-gray-600">Patients assigned to you will appear here with their health status.</p>
        </div>
      ) : (
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {patients.map((patient) => {
              const healthStatus = getHealthStatus(patient.uid)
              const recentHealthData = patientHealthData[patient.uid]?.slice(0, 2) || []

              return (
                <Card key={patient.uid} className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : "Unknown"} years •{" "}
                            {patient.gender}
                          </p>
                        </div>
                      </div>
                      <Badge className={healthStatus.color}>{healthStatus.status}</Badge>
                    </div>

                    {/* Patient Info */}
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Blood Type:</span>
                        <span className="ml-2 font-medium">{patient.bloodType || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">DOB:</span>
                        <span className="ml-2">{patient.dateOfBirth}</span>
                      </div>
                    </div>

                    {/* Allergies */}
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Allergies:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patient.allergies.map((allergy, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Health Data */}
                    {recentHealthData.length > 0 && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">Recent Health Data</span>
                        </div>
                        <div className="space-y-1">
                          {recentHealthData.map((data, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              <span className="font-medium">{data.type}:</span>
                              {data.data?.bloodPressure && <span className="ml-1">BP: {data.data.bloodPressure}</span>}
                              {data.data?.heartRate && <span className="ml-1">HR: {data.data.heartRate}</span>}
                              {data.notes && <span className="ml-1">- {data.notes.substring(0, 50)}...</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/patients/${patient.uid}`}>
                        <Button size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return "Unknown"
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}
