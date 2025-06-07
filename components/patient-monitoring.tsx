"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Activity, Heart, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Target } from "lucide-react"

interface PatientMonitoringProps {
  patientId: string
}

export function PatientMonitoring({ patientId }: PatientMonitoringProps) {
  // Mock data for charts
  const bloodPressureData = [
    { date: "Jan 1", systolic: 140, diastolic: 90 },
    { date: "Jan 3", systolic: 138, diastolic: 88 },
    { date: "Jan 5", systolic: 135, diastolic: 85 },
    { date: "Jan 7", systolic: 132, diastolic: 82 },
    { date: "Jan 9", systolic: 130, diastolic: 80 },
    { date: "Jan 11", systolic: 128, diastolic: 78 },
    { date: "Jan 13", systolic: 125, diastolic: 75 },
    { date: "Jan 15", systolic: 122, diastolic: 72 },
    { date: "Jan 17", systolic: 120, diastolic: 70 },
    { date: "Jan 19", systolic: 118, diastolic: 68 },
  ]

  const taskCompletionData = [
    { week: "Week 1", completed: 85, missed: 15 },
    { week: "Week 2", completed: 92, missed: 8 },
    { week: "Week 3", completed: 78, missed: 22 },
    { week: "Week 4", completed: 95, missed: 5 },
  ]

  const medicationAdherenceData = [
    { name: "Taken", value: 87, color: "#10b981" },
    { name: "Missed", value: 8, color: "#ef4444" },
    { name: "Late", value: 5, color: "#f59e0b" },
  ]

  const vitalSigns = [
    {
      name: "Blood Pressure",
      current: "118/68",
      target: "<120/80",
      status: "normal",
      trend: "down",
      change: "-12%",
    },
    {
      name: "Heart Rate",
      current: "72 bpm",
      target: "60-100 bpm",
      status: "normal",
      trend: "stable",
      change: "0%",
    },
    {
      name: "Weight",
      current: "165 lbs",
      target: "160-170 lbs",
      status: "normal",
      trend: "down",
      change: "-3%",
    },
    {
      name: "Blood Glucose",
      current: "95 mg/dL",
      target: "<100 mg/dL",
      status: "normal",
      trend: "down",
      change: "-8%",
    },
  ]

  const healthAlerts = [
    {
      type: "improvement",
      message: "Blood pressure showing consistent improvement over 2 weeks",
      severity: "positive",
      date: "2 days ago",
    },
    {
      type: "adherence",
      message: "Medication adherence rate above 90% this month",
      severity: "positive",
      date: "1 week ago",
    },
    {
      type: "concern",
      message: "Missed 3 blood pressure readings this week",
      severity: "warning",
      date: "3 days ago",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "positive":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Vital Signs Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {vitalSigns.map((vital, index) => (
          <Card key={index} className="medical-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{vital.name}</h3>
                {getTrendIcon(vital.trend)}
              </div>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${getStatusColor(vital.status)}`}>{vital.current}</p>
                <p className="text-xs text-gray-500">Target: {vital.target}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={vital.status === "normal" ? "default" : "destructive"} className="text-xs">
                    {vital.status}
                  </Badge>
                  <span
                    className={`text-xs ${
                      vital.trend === "down"
                        ? "text-green-600"
                        : vital.trend === "up"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {vital.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Blood Pressure Trend */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Blood Pressure Trend
            </CardTitle>
            <CardDescription>Daily blood pressure readings over the past 3 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bloodPressureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Completion */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Task Completion Rate
            </CardTitle>
            <CardDescription>Weekly task completion and adherence tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="missed" fill="#ef4444" name="Missed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Medication Adherence */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Medication Adherence
            </CardTitle>
            <CardDescription>Monthly medication compliance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={medicationAdherenceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {medicationAdherenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {medicationAdherenceData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Alerts */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Health Insights
            </CardTitle>
            <CardDescription>AI-powered health alerts and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                  {getAlertIcon(alert.severity)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Performance Summary
          </CardTitle>
          <CardDescription>Overall patient health and compliance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overall Health Score</span>
                <span className="font-medium">87/100</span>
              </div>
              <Progress value={87} className="h-2" />
              <p className="text-xs text-gray-500">Excellent progress this month</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Treatment Adherence</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-gray-500">Above target compliance</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Symptom Improvement</span>
                <span className="font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-xs text-gray-500">Steady improvement trend</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
