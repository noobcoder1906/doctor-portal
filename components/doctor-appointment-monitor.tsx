"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { collection, onSnapshot, query, orderBy, updateDoc, doc, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  LucideCalendar,
  LucideClock,
  LucideUser,
  CheckCircle,
  AlertCircle,
  Bell,
  Phone,
  MessageSquare,
} from "lucide-react"
import type { Appointment } from "@/lib/firebase"

interface DoctorAppointmentMonitorProps {
  doctorId: string
}

export function DoctorAppointmentMonitor({ doctorId }: DoctorAppointmentMonitorProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [newAppointmentAlert, setNewAppointmentAlert] = useState<string | null>(null)

  useEffect(() => {
    if (!doctorId) return

    // Real-time listener for appointments
    const appointmentsRef = collection(db, "appointments")
    const q = query(appointmentsRef, where("doctorId", "==", doctorId), orderBy("scheduledDate", "asc"))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && !loading) {
          const data = change.doc.data()
          // Get patient name from the appointment data or fetch from users collection
          const patientName = data.patientName || "Patient"
          setNewAppointmentAlert(`New appointment booked by ${patientName}`)
          setTimeout(() => setNewAppointmentAlert(null), 5000)
        }
      })

      const appointmentData = []

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data()

        // Fetch patient name from users collection
        let patientName = "Unknown Patient"
        try {
          const patientQuery = query(collection(db, "users"), where("uid", "==", data.patientId))
          const patientSnapshot = await getDocs(patientQuery)
          if (!patientSnapshot.empty) {
            const patientData = patientSnapshot.docs[0].data()
            patientName = `${patientData.firstName || ""} ${patientData.lastName || ""}`.trim()
          }
        } catch (error) {
          console.error("Error fetching patient name:", error)
        }

        appointmentData.push({
          id: docSnapshot.id,
          ...data,
          patientName,
        } as Appointment & { patientName: string })
      }

      setAppointments(appointmentData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [doctorId, loading])

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error("Error updating appointment:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading appointments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* New Appointment Alert */}
      {newAppointmentAlert && (
        <Alert className="border-green-200 bg-green-50 animate-pulse">
          <Bell className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            🎉 {newAppointmentAlert}! Check your appointments below.
          </AlertDescription>
        </Alert>
      )}

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <LucideCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments</h3>
          <p className="text-gray-600">Patient appointment bookings will appear here in real-time.</p>
        </div>
      ) : (
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <LucideUser className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{(appointment as any).patientName || "Patient"}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <LucideClock className="h-4 w-4" />
                          <span>
                            {appointment.scheduledDate?.toDate
                              ? appointment.scheduledDate.toDate().toLocaleDateString()
                              : new Date(appointment.scheduledDate).toLocaleDateString()}{" "}
                            at{" "}
                            {appointment.scheduledDate?.toDate
                              ? appointment.scheduledDate.toDate().toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : new Date(appointment.scheduledDate).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <LucideCalendar className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Appointment Details</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="ml-2 font-medium">{appointment.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-2 font-medium">{appointment.duration} min</span>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="mt-2">
                          <span className="text-gray-600">Reason:</span>
                          <p className="text-gray-700 mt-1">{appointment.notes}</p>
                        </div>
                      )}
                    </div>

                    {appointment.status === "scheduled" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id!, "confirmed")}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Patient
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id!, "cancelled")}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {appointment.status === "confirmed" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id!, "completed")}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </div>  
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}


