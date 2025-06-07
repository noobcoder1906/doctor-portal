"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { User, Phone, Mail, MapPin, Calendar, Heart, Pill, FileText, Edit, Save } from "lucide-react"
import { useState } from "react"

interface PatientProfileProps {
  patientId: string
}

export function PatientProfile({ patientId }: PatientProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(
    "Patient shows good compliance with medication regimen. Blood pressure has been stable over the past month. Continue current treatment plan and monitor weekly.",
  )

  // Mock patient data - in real app, fetch from Firebase
  const patient = {
    id: patientId,
    name: "Sarah Johnson",
    age: 45,
    gender: "Female",
    phone: "+1 (555) 123-4567",
    email: "sarah.j@email.com",
    address: "123 Main St, Anytown, ST 12345",
    emergencyContact: "John Johnson - +1 (555) 987-6543",
    bloodType: "A+",
    allergies: ["Penicillin", "Shellfish"],
    conditions: ["Hypertension", "Type 2 Diabetes"],
    lastVisit: "2024-01-15",
    nextAppointment: "2024-01-22",
  }

  const appointmentHistory = [
    {
      date: "2024-01-15",
      type: "Follow-up",
      diagnosis: "Hypertension Management",
      treatment: "Adjusted medication dosage, lifestyle counseling",
      notes: "Blood pressure improved, patient responding well to treatment",
    },
    {
      date: "2024-01-01",
      type: "Consultation",
      diagnosis: "Annual Check-up",
      treatment: "Routine examination, blood work ordered",
      notes: "Overall health good, continue current medications",
    },
    {
      date: "2023-12-15",
      type: "Emergency",
      diagnosis: "Hypertensive Crisis",
      treatment: "Emergency medication, hospitalization",
      notes: "Patient stabilized, medication regimen updated",
    },
  ]

  const currentMedications = [
    {
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      prescribed: "2023-12-15",
      notes: "For blood pressure control",
    },
    {
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribed: "2023-10-01",
      notes: "For diabetes management",
    },
    {
      name: "Aspirin",
      dosage: "81mg",
      frequency: "Once daily",
      prescribed: "2023-12-15",
      notes: "Cardioprotective therapy",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
                <p className="text-gray-600">
                  {patient.age} years • {patient.gender}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-3 text-gray-400" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-3 text-gray-400" />
                <span>{patient.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                <span>{patient.address}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-2">Emergency Contact</h4>
              <p className="text-sm text-gray-600">{patient.emergencyContact}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Blood Type</Label>
                <p className="text-lg font-semibold text-gray-900">{patient.bloodType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Last Visit</Label>
                <p className="text-sm text-gray-900">{patient.lastVisit}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600 mb-2 block">Allergies</Label>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600 mb-2 block">Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {patient.conditions.map((condition, index) => (
                  <Badge key={index} variant="secondary">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Next Appointment</span>
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {patient.nextAppointment}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor's Notes */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Doctor's Notes
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
          <CardDescription>Clinical observations and treatment notes</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-32"
              placeholder="Enter your clinical notes here..."
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">{notes}</p>
          )}
        </CardContent>
      </Card>

      {/* Appointment History */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Appointment History
          </CardTitle>
          <CardDescription>Previous consultations and treatments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointmentHistory.map((appointment, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.date}</p>
                      <Badge variant="outline">{appointment.type}</Badge>
                    </div>
                  </div>
                </div>
                <div className="ml-13 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Diagnosis: </span>
                    <span className="text-sm text-gray-900">{appointment.diagnosis}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Treatment: </span>
                    <span className="text-sm text-gray-900">{appointment.treatment}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Notes: </span>
                    <span className="text-sm text-gray-700">{appointment.notes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Medications */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-purple-500" />
            Current Medications
          </CardTitle>
          <CardDescription>Active prescriptions and dosage information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentMedications.map((medication, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Pill className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{medication.name}</p>
                      <p className="text-sm text-gray-600">
                        {medication.dosage} • {medication.frequency}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="ml-13 space-y-1">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Prescribed: </span>
                    <span className="text-sm text-gray-900">{medication.prescribed}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Notes: </span>
                    <span className="text-sm text-gray-700">{medication.notes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
