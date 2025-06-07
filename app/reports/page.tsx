"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar, TrendingUp, Users, Activity, BarChart3 } from "lucide-react"

export default function ReportsPage() {
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

  const reports = [
    {
      id: 1,
      title: "Monthly Patient Summary",
      description: "Comprehensive overview of all patient activities and outcomes",
      type: "summary",
      date: "2024-01-20",
      status: "ready",
      patients: 247,
    },
    {
      id: 2,
      title: "Medication Adherence Report",
      description: "Analysis of patient medication compliance rates",
      type: "adherence",
      date: "2024-01-18",
      status: "ready",
      patients: 189,
    },
    {
      id: 3,
      title: "Treatment Outcomes Analysis",
      description: "Statistical analysis of treatment effectiveness",
      type: "outcomes",
      date: "2024-01-15",
      status: "ready",
      patients: 156,
    },
    {
      id: 4,
      title: "Critical Alerts Summary",
      description: "Summary of all critical patient alerts and responses",
      type: "alerts",
      date: "2024-01-12",
      status: "generating",
      patients: 23,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "default"
      case "generating":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "summary":
        return <BarChart3 className="h-5 w-5 text-blue-500" />
      case "adherence":
        return <Activity className="h-5 w-5 text-green-500" />
      case "outcomes":
        return <TrendingUp className="h-5 w-5 text-purple-500" />
      case "alerts":
        return <Users className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Medical Reports
            </h1>
            <p className="text-gray-600">Generate and manage comprehensive medical reports</p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate New Report
          </Button>
        </div>

        {/* Report Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="medical-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="medical-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Patients Covered</p>
                  <p className="text-2xl font-bold text-gray-900">247</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="medical-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="medical-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">2.3h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>View and download generated medical reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getTypeIcon(report.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {report.date}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            {report.patients} patients
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                      {report.status === "ready" && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
