"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, AlertTriangle, TrendingUp, Heart, Activity, Clock, CheckCircle } from "lucide-react"

export function DashboardOverview() {
  const stats = [
    {
      title: "Total Patients",
      value: "247",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Today's Appointments",
      value: "18",
      change: "+3",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Critical Alerts",
      value: "5",
      change: "-2",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Task Completion",
      value: "89%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const recentAlerts = [
    {
      patient: "Sarah Johnson",
      condition: "High Blood Pressure",
      severity: "critical",
      time: "2 min ago",
    },
    {
      patient: "Michael Chen",
      condition: "Missed Medication",
      severity: "warning",
      time: "15 min ago",
    },
    {
      patient: "Emma Davis",
      condition: "Task Overdue",
      severity: "normal",
      time: "1 hour ago",
    },
  ]

  const upcomingAppointments = [
    {
      time: "09:00 AM",
      patient: "John Smith",
      type: "Follow-up",
      condition: "Diabetes",
    },
    {
      time: "10:30 AM",
      patient: "Lisa Brown",
      type: "Consultation",
      condition: "Hypertension",
    },
    {
      time: "02:00 PM",
      patient: "David Wilson",
      type: "Check-up",
      condition: "Heart Disease",
    },
  ]

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
            <p className="text-sm text-gray-600">Patient adherence rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
