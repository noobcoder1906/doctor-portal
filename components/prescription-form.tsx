"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, User, Pill, Clock, FileText, CheckCircle, AlertCircle, Search } from "lucide-react"
import { useAuth } from "@/lib/firebase-hooks"
import {
  getDoctorPatients,
  createPrescription,
  createRecommendation,
  addDoc,
  collection,
  db,
  serverTimestamp,
  type PatientProfile,
  query,
  where,
  getDocs,
  orderBy,
  getDoc,
  doc,
} from "@/lib/firebase"

interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

export default function PrescriptionForm() {
  const { user, userProfile } = useAuth()
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [patientSearch, setPatientSearch] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [loadingPatients, setLoadingPatients] = useState(true)

  // Load doctor's patients
  useEffect(() => {
    const loadPatients = async () => {
      if (user && userProfile?.role === "doctor") {
        try {
          setLoadingPatients(true)
          console.log("🔄 Loading patients for doctor:", user.uid)

          // Method 1: Get patients assigned to this doctor using the helper function
          const doctorPatients = await getDoctorPatients(user.uid)
          console.log("📋 Assigned patients:", doctorPatients.length)

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
                    uid: patientId,
                    ...patientDoc.data(),
                  })
                } else {
                  // Create a basic patient profile if it doesn't exist
                  appointmentPatientsData.set(patientId, {
                    id: patientId,
                    uid: patientId,
                    firstName: "Unknown",
                    lastName: "Patient",
                    email: "patient@example.com",
                    phone: "+1 (555) 123-4567",
                    role: "patient",
                    dateOfBirth: "",
                    gender: "other",
                    assignedDoctors: [user.uid],
                    medicalHistory: [],
                    currentConditions: [],
                  })
                }
              } catch (error) {
                console.error("Error fetching patient data for", patientId, error)
              }
            }
          }

          // Method 3: Get all patients from users collection as fallback
          if (doctorPatients.length === 0 && appointmentPatientIds.size === 0) {
            console.log("🔄 No patients found, checking all patients in users collection...")
            const allPatientsQuery = query(collection(db, "users"), where("role", "==", "patient"))
            const allPatientsSnapshot = await getDocs(allPatientsQuery)

            allPatientsSnapshot.docs.forEach((doc) => {
              const patientData = doc.data()
              appointmentPatientsData.set(doc.id, {
                id: doc.id,
                uid: doc.id,
                ...patientData,
              })
            })
            console.log("📋 Found", allPatientsSnapshot.size, "total patients")
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
          setPatients(combinedPatients)
          console.log("✅ Loaded", combinedPatients.length, "patients for prescription form")
        } catch (error) {
          console.error("❌ Error loading patients:", error)
          setErrorMessage("Failed to load patients. Please try again.")
        } finally {
          setLoadingPatients(false)
        }
      } else {
        setLoadingPatients(false)
      }
    }

    loadPatients()
  }, [user, userProfile])

  // Filter patients based on search
  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.email.toLowerCase().includes(patientSearch.toLowerCase()),
  )

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = medications.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    setMedications(updated)
  }

  const validateForm = () => {
    if (!selectedPatient) {
      setErrorMessage("Please select a patient")
      return false
    }
    if (!diagnosis.trim()) {
      setErrorMessage("Please enter a diagnosis")
      return false
    }
    if (medications.some((med) => !med.name.trim() || !med.dosage.trim() || !med.frequency.trim())) {
      setErrorMessage("Please fill in all required medication fields")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) return

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      console.log("🔄 Submitting prescription to Firebase...")

      // Create prescription data
      const medicationData = {
        doctorId: user.uid,
        doctorName: `${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`.trim(),
        patientId: selectedPatient,
        diagnosis,
        medications: medications.filter((med) => med.name.trim()),
        notes: notes.trim(),
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      // Write to the nested collection path for patient medications
      const patientMedicationsRef = collection(db, "patients", selectedPatient, "medications")
      const medicationDocRef = await addDoc(patientMedicationsRef, medicationData)

      // Also create a prescription in the main prescriptions collection for doctor's reference
      const prescriptionId = await createPrescription({
        doctorId: user.uid,
        patientId: selectedPatient,
        medications: medications.filter((med) => med.name.trim()),
        diagnosis,
        notes: notes.trim(),
        status: "active",
      })

      // Create smart recommendations based on the prescription
      const recommendations = []

      // Generate medication-specific recommendations
      for (const med of medications.filter((m) => m.name.trim())) {
        recommendations.push({
          doctorId: user.uid,
          patientId: selectedPatient,
          title: `Take ${med.name} as prescribed`,
          description: `Remember to take ${med.name} ${med.frequency.toLowerCase()}. ${med.instructions || "Follow your doctor's instructions."}`,
          category: "medication",
          priority: "high",
          type: "prescription",
          confidence: 95,
          medicationName: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          prescriptionId: prescriptionId,
        })

        // Add medication reminders
        recommendations.push({
          doctorId: user.uid,
          patientId: selectedPatient,
          title: `Set medication reminder for ${med.name}`,
          description: `Set up daily reminders to take ${med.name} at the same time each day for better effectiveness.`,
          category: "lifestyle",
          priority: "medium",
          type: "reminder",
          confidence: 88,
        })
      }

      // Add diagnosis-specific recommendations
      if (diagnosis.toLowerCase().includes("blood pressure") || diagnosis.toLowerCase().includes("hypertension")) {
        recommendations.push({
          doctorId: user.uid,
          patientId: selectedPatient,
          title: "Monitor Blood Pressure Daily",
          description: "Track your blood pressure daily and log the readings. Aim for readings below 130/80 mmHg.",
          category: "monitoring",
          priority: "high",
          type: "health_tracking",
          confidence: 92,
        })
      }

      if (diagnosis.toLowerCase().includes("diabetes")) {
        recommendations.push({
          doctorId: user.uid,
          patientId: selectedPatient,
          title: "Blood Sugar Monitoring",
          description: "Check your blood sugar levels as recommended and maintain a food diary.",
          category: "monitoring",
          priority: "high",
          type: "health_tracking",
          confidence: 94,
        })
      }

      // Add general health recommendations
      recommendations.push({
        doctorId: user.uid,
        patientId: selectedPatient,
        title: "Schedule Follow-up Appointment",
        description: `Schedule a follow-up appointment in 2-4 weeks to monitor your progress with the new prescription.`,
        category: "preventive",
        priority: "medium",
        type: "appointment",
        confidence: 90,
      })

      // Store all recommendations in Firebase
      for (const recommendation of recommendations) {
        await createRecommendation(recommendation)
      }

      // Store prescription activity in Firebase for real-time updates
      await addDoc(collection(db, "prescriptionActivity"), {
        doctorId: user.uid,
        patientId: selectedPatient,
        prescriptionId: prescriptionId,
        medicationId: medicationDocRef.id,
        action: "created",
        timestamp: serverTimestamp(),
        medicationCount: medications.filter((med) => med.name.trim()).length,
        diagnosis: diagnosis,
        recommendationsGenerated: recommendations.length,
      })

      // Create real-time notification for patient
      await addDoc(collection(db, "notifications"), {
        userId: selectedPatient,
        type: "prescription",
        title: "New Prescription Available",
        message: `Dr. ${userProfile?.firstName} ${userProfile?.lastName} has prescribed new medication for you.`,
        data: {
          prescriptionId: prescriptionId,
          doctorId: user.uid,
          medicationCount: medications.filter((med) => med.name.trim()).length,
        },
        read: false,
        createdAt: serverTimestamp(),
      })

      console.log("✅ Prescription written to:", `patients/${selectedPatient}/medications/${medicationDocRef.id}`)
      console.log("✅ Generated", recommendations.length, "smart recommendations")
      console.log("✅ Prescription activity logged to Firebase")

      setSubmitStatus("success")

      // Reset form
      setTimeout(() => {
        setSelectedPatient("")
        setPatientSearch("")
        setDiagnosis("")
        setNotes("")
        setMedications([{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }])
        setSubmitStatus("idle")
      }, 2000)
    } catch (error) {
      console.error("❌ Error submitting prescription:", error)
      setSubmitStatus("error")
      setErrorMessage("Failed to submit prescription. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPatientInfo = patients.find((p) => (p.uid || p.id) === selectedPatient)

  // Show loading state
  if (loadingPatients) {
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
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Doctor Access Only</h3>
        <p className="text-gray-600">Prescription form is only available for doctors.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Patient Selection */}
      <Card className="border-2 border-blue-100">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <User className="h-5 w-5" />
            Select Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by name or email..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <SelectItem key={patient.uid || patient.id} value={patient.uid || patient.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{patient.email}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-patients" disabled>
                    No patients found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {patients.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No patients found. Patients will appear here after they book appointments with you or are assigned to
                  your care.
                </AlertDescription>
              </Alert>
            )}

            {selectedPatientInfo && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Selected Patient</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">
                      {selectedPatientInfo.firstName} {selectedPatientInfo.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2">{selectedPatientInfo.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">DOB:</span>
                    <span className="ml-2">{selectedPatientInfo.dateOfBirth || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Blood Type:</span>
                    <span className="ml-2">{selectedPatientInfo.bloodType || "Not specified"}</span>
                  </div>
                </div>
                {selectedPatientInfo.allergies && selectedPatientInfo.allergies.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-600">Allergies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPatientInfo.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis */}
      <Card className="border-2 border-green-100">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <FileText className="h-5 w-5" />
            Diagnosis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea
            placeholder="Enter the patient's diagnosis..."
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="min-h-[100px] resize-none"
            required
          />
        </CardContent>
      </Card>

      {/* Medications */}
      <Card className="border-2 border-purple-100">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Pill className="h-5 w-5" />
            Medications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {medications.map((medication, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Medication {index + 1}</h4>
                  {medications.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`med-name-${index}`}>Medication Name *</Label>
                    <Input
                      id={`med-name-${index}`}
                      placeholder="e.g., Amoxicillin"
                      value={medication.name}
                      onChange={(e) => updateMedication(index, "name", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`med-dosage-${index}`}>Dosage *</Label>
                    <Input
                      id={`med-dosage-${index}`}
                      placeholder="e.g., 500mg"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`med-frequency-${index}`}>Frequency *</Label>
                    <Select
                      value={medication.frequency}
                      onValueChange={(value) => updateMedication(index, "frequency", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                        <SelectItem value="Four times daily">Four times daily</SelectItem>
                        <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                        <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                        <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`med-duration-${index}`}>Duration</Label>
                    <Input
                      id={`med-duration-${index}`}
                      placeholder="e.g., 7 days"
                      value={medication.duration}
                      onChange={(e) => updateMedication(index, "duration", e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor={`med-instructions-${index}`}>Special Instructions</Label>
                  <Textarea
                    id={`med-instructions-${index}`}
                    placeholder="e.g., Take with food, avoid alcohol..."
                    value={medication.instructions}
                    onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                    className="mt-1 resize-none"
                    rows={2}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addMedication}
              className="w-full border-dashed border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Medication
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card className="border-2 border-orange-100">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <FileText className="h-5 w-5" />
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea
            placeholder="Any additional notes, warnings, or follow-up instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Status Messages */}
      {submitStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Prescription submitted successfully! The patient will receive real-time updates and smart recommendations.
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || !selectedPatient}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
        >
          {isSubmitting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Submitting Prescription...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Submit Prescription
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
