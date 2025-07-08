"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, AlertTriangle, Calendar, MessageSquare, Activity } from "lucide-react"
import { onSnapshot, collection, query, where, orderBy, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/firebase-hooks" // You'll need to create this

export function NotificationCenter() {
  const { user, userProfile } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !userProfile) {
      setLoading(false)
      return
    }

    console.log("🔄 Setting up notifications listener for user:", user.uid)

    // Listen to notifications for this user (doctor)
    const notificationsRef = collection(db, "notifications")
    const q = query(notificationsRef, where("doctorId", "==", user.uid), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      console.log("📬 Notifications updated, count:", querySnapshot.size)

      const notificationsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data()

          // Get patient name
          let patientName = data.patientName || "Unknown Patient"
          if (!data.patientName && data.patientId) {
            try {
              const { getDocs } = await import("firebase/firestore")
              const patientQuery = query(collection(db, "users"), where("uid", "==", data.patientId))
              const patientSnapshot = await getDocs(patientQuery)

              if (!patientSnapshot.empty) {
                const patientData = patientSnapshot.docs[0].data()
                patientName = `${patientData.firstName} ${patientData.lastName}`
              }
            } catch (error) {
              console.error("Error fetching patient name:", error)
            }
          }

          // Calculate time ago
          const createdAt = data.createdAt?.toDate() || new Date()
          const now = new Date()
          const diffTime = Math.abs(now.getTime() - createdAt.getTime())
          const diffMinutes = Math.ceil(diffTime / (1000 * 60))

          let timeAgo
          if (diffMinutes < 60) {
            timeAgo = `${diffMinutes} min ago`
          } else if (diffMinutes < 1440) {
            const diffHours = Math.ceil(diffMinutes / 60)
            timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
          } else {
            const diffDays = Math.ceil(diffMinutes / 1440)
            timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
          }

          return {
            id: doc.id,
            type: data.type || "appointment",
            title: data.title || "New Appointment",
            message: data.message || `${patientName} has booked an appointment`,
            time: timeAgo,
            read: data.read || false,
            priority: data.priority || "medium",
            patientName: patientName,
            patientId: data.patientId,
          }
        }),
      )

      setNotifications(notificationsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, userProfile])

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "appointment":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "task":
        return <Activity className="h-4 w-4 text-green-500" />
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-green-500 bg-green-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5 animate-pulse" />
      </Button>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
            </div>
            <CardDescription>Patient appointments and alerts</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-1 p-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 transition-colors hover:bg-gray-50 cursor-pointer ${getPriorityColor(
                        notification.priority,
                      )} ${!notification.read ? "bg-blue-50" : ""}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full" size="sm">
                View All Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

// Function to create notification when patient books appointment
export const createAppointmentNotification = async (doctorId: string, patientId: string, appointmentData: any) => {
  try {
    console.log("🔔 Creating appointment notification for doctor:", doctorId)

    await addDoc(collection(db, "notifications"), {
      doctorId: doctorId,
      patientId: patientId,
      type: "appointment",
      title: "New Appointment Booked",
      message: `A patient has booked an appointment for ${appointmentData.type || "consultation"}`,
      priority: appointmentData.urgency_level === "emergency" ? "high" : "medium",
      read: false,
      createdAt: serverTimestamp(),
      appointmentId: appointmentData.appointmentId,
      appointmentType: appointmentData.type,
      scheduledDate: appointmentData.scheduledDate,
    })

    console.log("✅ Notification created successfully")
  } catch (error) {
    console.error("❌ Error creating notification:", error)
  }
}
