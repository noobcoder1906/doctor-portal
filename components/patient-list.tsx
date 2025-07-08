"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, MessageSquare, Calendar, AlertCircle, User, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { getDoctorPatients, collection, query, where, orderBy, getDocs, getDoc, doc, db } from "@/lib/firebase"
import { useAuth } from "@/lib/firebase-hooks"

export function PatientList() {
  const { user, userProfile } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCondition, setFilterCondition] = useState("all")
  const [filterUrgency, setFilterUrgency] = useState("all")
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch patients from Firebase
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        console.log("🔄 Fetching patients from Firebase...")
        console.log("User:", user?.uid)
        console.log("User Profile:", userProfile)

        // Only fetch if user is authenticated and is a doctor
        if (!user) {
          console.log("❌ No authenticated user")
          setLoading(false)
          return
        }

        if (!userProfile) {
          console.log("❌ No user profile found")
          setLoading(false)
          return
        }

        if (userProfile.role !== "doctor") {
          console.log("❌ User is not a doctor, role:", userProfile.role)
          setLoading(false)
          return
        }

        console.log("✅ User is authenticated doctor, fetching patients...")

        // Method 1: Get patients assigned to this doctor using the helper function
        const doctorPatients = await getDoctorPatients(user.uid)
        console.log("📋 Assigned patients:", doctorPatients.length)
        // Note: It's normal to see "0 assigned patients" if patients are only connected through appointments
        // and not directly assigned to the doctor in the database

        // Method 2: Get patients from appointments with this doctor
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("doctorId", "==", user.uid),
          orderBy("scheduledDate", "desc"),
        )
        const appointmentsSnapshot = await getDocs(appointmentsQuery)

        console.log("📅 Found appointments:", appointmentsSnapshot.size)

        // Collect unique patient IDs from appointments
        const appointmentPatientIds = new Set<string>()
        const appointmentPatientsData = new Map<string, any>()

        for (const appointmentDoc of appointmentsSnapshot.docs) {
          const appointmentData = appointmentDoc.data()
          const patientId = appointmentData.patientId

          if (patientId) {
            appointmentPatientIds.add(patientId)

            // Try to get patient profile from users collection
            try {
              const patientDoc = await getDoc(doc(db, "users", patientId))
              if (patientDoc.exists()) {
                appointmentPatientsData.set(patientId, {
                  id: patientId,
                  ...patientDoc.data(),
                })
              } else {
                // If no profile exists, try to get data from health data
                const healthDataQuery = query(
                  collection(db, "healthData"),
                  where("patientId", "==", patientId),
                  where("doctorId", "==", user.uid),
                  orderBy("createdAt", "desc"),
                )
                const healthDataSnapshot = await getDocs(healthDataQuery)

                if (!healthDataSnapshot.empty) {
                  const latestHealthData = healthDataSnapshot.docs[0].data()
                  const patientData = latestHealthData.data

                  appointmentPatientsData.set(patientId, {
                    id: patientId,
                    uid: patientId,
                    firstName: patientData?.name?.split(" ")[0] || "Unknown",
                    lastName: patientData?.name?.split(" ").slice(1).join(" ") || "Patient",
                    email: patientData?.email || "Not provided",
                    phone: patientData?.phone || "Not provided",
                    role: "patient",
                    dateOfBirth: "",
                    gender: "other",
                    assignedDoctors: [user.uid],
                    medicalHistory: [],
                    currentConditions: [],
                  })
                }
              }
            } catch (error) {
              console.error("Error fetching patient data for", patientId, error)
            }
          }
        }

        // Combine patients from both sources
        const allPatients = new Map<string, any>()

        // Add assigned patients
        doctorPatients.forEach((patient) => {
          allPatients.set(patient.id || patient.uid, patient)
        })

        // Add patients from appointments
        appointmentPatientsData.forEach((patient, patientId) => {
          if (!allPatients.has(patientId)) {
            allPatients.set(patientId, patient)
          }
        })

        const combinedPatients = Array.from(allPatients.values())

        if (combinedPatients.length === 0) {
          console.log("ℹ️ No patients found for this doctor")
          setPatients([])
          setLoading(false)
          return
        }

        // Transform patient data for display
        const patientsList = combinedPatients.map((patient) => {
          // Calculate age from date of birth
          const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : "Unknown"

          // Generate some sample data for demo purposes
          const urgency = Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low"
          const completionRate = 85 + Math.floor(Math.random() * 15) // Random between 85-100
          const alerts = urgency === "high" ? Math.floor(Math.random() * 3) + 1 : 0

          // Sample conditions based on common medical conditions
          const conditions = ["Hypertension", "Diabetes", "Heart Disease", "Asthma", "General"]
          const condition = conditions[Math.floor(Math.random() * conditions.length)]

          return {
            id: patient.id || patient.uid,
            name: `${patient.firstName || "Unknown"} ${patient.lastName || "Patient"}`,
            age: age,
            gender: patient.gender || "Not specified",
            condition: condition,
            urgency: urgency,
            lastVisit: "2024-01-15", // Sample date
            nextAppointment: "2024-02-01", // Sample date
            phone: patient.phone || "+1 (555) 123-4567",
            email: patient.email || "Not provided",
            status: urgency === "high" ? "active" : urgency === "medium" ? "monitoring" : "stable",
            completionRate: completionRate,
            alerts: alerts,
          }
        })

        setPatients(patientsList)
        console.log("✅ Fetched", patientsList.length, "patients from Firebase (assigned + appointments)")
        setLoading(false)
      } catch (error) {
        console.error("❌ Error fetching patients:", error)
        setLoading(false)
      }
    }

    // Only fetch if we have user and userProfile
    if (user && userProfile) {
      fetchPatients()
    } else if (!loading) {
      // If not loading but no user/profile, set loading to false
      setLoading(false)
    }
  }, [user, userProfile])

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCondition =
      filterCondition === "all" || patient.condition.toLowerCase().includes(filterCondition.toLowerCase())
    const matchesUrgency = filterUrgency === "all" || patient.urgency === filterUrgency

    return matchesSearch && matchesCondition && matchesUrgency
  })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "default"
      default:
        return "default"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "monitoring":
        return "bg-yellow-100 text-yellow-800"
      case "stable":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading patients...</span>
      </div>
    )
  }

  // Show message if user is not a doctor
  if (!user || !userProfile || userProfile.role !== "doctor") {
    return (
      <Card className="medical-card">
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">
            {!user
              ? "Please sign in to view patients."
              : !userProfile
                ? "Loading user profile..."
                : "Only doctors can access the patient list."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Patient Management</CardTitle>
          <CardDescription>Manage and monitor all your assigned patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by name or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCondition} onValueChange={setFilterCondition}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="hypertension">Hypertension</SelectItem>
                <SelectItem value="diabetes">Diabetes</SelectItem>
                <SelectItem value="heart">Heart Disease</SelectItem>
                <SelectItem value="asthma">Asthma</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="medical-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <CardDescription>
                      {patient.age} years • {patient.gender}
                    </CardDescription>
                  </div>
                </div>
                {patient.alerts > 0 && (
                  <div className="relative">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {patient.alerts}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Condition:</span>
                  <Badge variant="outline">{patient.condition}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Urgency:</span>
                  <Badge variant={getUrgencyColor(patient.urgency)}>{patient.urgency}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {patient.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {patient.email}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Task Completion</span>
                  <span className="font-medium">{patient.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${patient.completionRate}%` }} />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Link href={`/patients/${patient.id}`}>
                  <Button size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && !loading && (
        <Card className="medical-card">
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">
              {patients.length === 0
                ? "No patients have been assigned to you yet. Contact your administrator to assign patients."
                : "Try adjusting your search or filter criteria."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
