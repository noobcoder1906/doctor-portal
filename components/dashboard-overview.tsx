"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, AlertTriangle, TrendingUp, Heart, Activity, Clock, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/firebase-hooks"

export function DashboardOverview() {
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState([
    {
      title: "Total Patients",
      value: "0",
      change: "0%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Today's Appointments",
      value: "0",
      change: "0",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Critical Alerts",
      value: "0",
      change: "0",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Task Completion",
      value: "0%",
      change: "0%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ])

  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("🔄 Fetching dashboard data...")

        // Get current doctor ID from authenticated user
        if (!user || !userProfile || userProfile.role !== "doctor") {
          console.log("❌ No authenticated doctor found")
          setLoading(false)
          return
        }

        const doctorId = user.uid
        console.log("✅ Using doctor ID:", doctorId)

        // Record dashboard view in Firebase
        await addDoc(collection(db, "dashboardViews"), {
          doctorId: doctorId,
          viewedAt: serverTimestamp(),
        })

        // Fetch patients assigned to this doctor
        const patientsQuery = query(
          collection(db, "users"),
          where("role", "==", "patient"),
          where("assignedDoctors", "array-contains", doctorId),
        )

        const patientsSnapshot = await getDocs(patientsQuery)
        const patientCount = patientsSnapshot.size

        // Fetch today's appointments for this doctor
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("doctorId", "==", doctorId),
          where("scheduledDate", ">=", today),
          where("scheduledDate", "<", tomorrow),
        )

        const appointmentsSnapshot = await getDocs(appointmentsQuery)
        const appointmentCount = appointmentsSnapshot.size

        // Fetch critical alerts for this doctor's patients
        const alertsQuery = query(
          collection(db, "healthAlerts"),
          where("severity", "==", "critical"),
          where("doctorId", "==", doctorId),
        )

        const alertsSnapshot = await getDocs(alertsQuery)
        const alertCount = alertsSnapshot.size

        // Fetch task completion rate
        const tasksQuery = query(collection(db, "taskCompletions"), orderBy("weekStarting", "desc"), limit(1))

        const tasksSnapshot = await getDocs(tasksQuery)
        let completionRate = 0

        if (!tasksSnapshot.empty) {
          completionRate = tasksSnapshot.docs[0].data().completedPercentage
        }

        // Update stats
        setStats([
          {
            title: "Total Patients",
            value: patientCount.toString(),
            change: "+12%", // In a real app, calculate this
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Today's Appointments",
            value: appointmentCount.toString(),
            change: "+3", // In a real app, calculate this
            icon: Calendar,
            color: "text-green-600",
            bgColor: "bg-green-50",
          },
          {
            title: "Critical Alerts",
            value: alertCount.toString(),
            change: "-2", // In a real app, calculate this
            icon: AlertTriangle,
            color: "text-red-600",
            bgColor: "bg-red-50",
          },
          {
            title: "Task Completion",
            value: `${completionRate}%`,
            change: "+5%", // In a real app, calculate this
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
          },
        ])

        // Fetch recent health alerts for this doctor's patients (real data)
        const recentAlertsQuery = query(
          collection(db, "notifications"),
          where("doctorId", "==", doctorId),
          where("type", "==", "alert"),
          orderBy("createdAt", "desc"),
          limit(3),
        )

        const recentAlertsSnapshot = await getDocs(recentAlertsQuery)

        if (!recentAlertsSnapshot.empty) {
          const alertsData = await Promise.all(
            recentAlertsSnapshot.docs.map(async (doc) => {
              const data = doc.data()

              // Get patient name
              let patientName = "Unknown Patient"
              try {
                const patientDoc = await getDocs(query(collection(db, "users"), where("uid", "==", data.patientId)))

                if (!patientDoc.empty) {
                  const patientData = patientDoc.docs[0].data()
                  patientName = `${patientData.firstName} ${patientData.lastName}`
                }
              } catch (error) {
                console.error("Error fetching patient name:", error)
              }

              // Calculate time ago
              const createdAt = data.createdAt.toDate()
              const now = new Date()
              const diffTime = Math.abs(now.getTime() - createdAt.getTime())
              const diffMinutes = Math.ceil(diffTime / (1000 * 60))

              let timeAgo
              if (diffMinutes < 60) {
                timeAgo = `${diffMinutes} min ago`
              } else {
                const diffHours = Math.ceil(diffMinutes / 60)
                timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
              }

              return {
                patient: patientName,
                condition: data.message || "Health Alert",
                severity: data.priority || "medium",
                time: timeAgo,
              }
            }),
          )

          setRecentAlerts(alertsData)
        } else {
          // If no real alerts, show empty state
          setRecentAlerts([])
        }

        // Fetch upcoming appointments for this doctor (real data)
        const upcomingAppointmentsQuery = query(
          collection(db, "appointments"),
          where("doctorId", "==", doctorId),
          where("scheduledDate", ">=", today),
          orderBy("scheduledDate", "asc"),
          limit(5),
        )

        const upcomingAppointmentsSnapshot = await getDocs(upcomingAppointmentsQuery)

        const appointmentsData = await Promise.all(
          upcomingAppointmentsSnapshot.docs.map(async (doc) => {
            const data = doc.data()

            // Get patient name
            let patientName = "Unknown Patient"
            let patientEmail = "Not provided"

            try {
              const patientDoc = await getDocs(query(collection(db, "users"), where("uid", "==", data.patientId)))

              if (!patientDoc.empty) {
                const patientData = patientDoc.docs[0].data()
                patientName = `${patientData.firstName} ${patientData.lastName}`
                patientEmail = patientData.email || "Not provided"
              }
            } catch (error) {
              console.error("Error fetching patient details:", error)
            }

            // Format time
            const scheduledDate = data.scheduledDate.toDate()
            const timeString = scheduledDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })

            const dateString = scheduledDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })

            return {
              id: doc.id,
              time: timeString,
              date: dateString,
              patient: patientName,
              email: patientEmail,
              type: data.type || "Consultation",
              status: data.status || "scheduled",
              notes: data.notes || "",
            }
          }),
        )

        setUpcomingAppointments(appointmentsData)

        console.log("✅ Dashboard data loaded successfully")
        setLoading(false)
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, userProfile])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-600">
                <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>{stat.change}</span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Alerts */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Critical patient notifications requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      alert.severity === "critical"
                        ? "bg-red-500 pulse-animation"
                        : alert.severity === "warning"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{alert.patient}</p>
                    <p className="text-sm text-gray-600">{alert.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      alert.severity === "critical"
                        ? "destructive"
                        : alert.severity === "warning"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {alert.severity}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Upcoming appointments and consultations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-sm text-gray-600">{appointment.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{appointment.time}</p>
                  <Badge variant="outline">{appointment.type}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Patient Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-2">94%</div>
            <Progress value={94} className="mb-2" />
            <p className="text-sm text-gray-600">Based on 156 reviews</p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Treatment Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-2">87%</div>
            <Progress value={87} className="mb-2" />
            <p className="text-sm text-gray-600">Recovery rate this month</p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Task Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-2">89%</div>
            <Progress value={89} className="mb-2" />
            <p className="text-xs text-gray-500">Patient adherence rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
