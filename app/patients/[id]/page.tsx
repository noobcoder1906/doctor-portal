"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Heart,
  Activity,
  MessageSquare,
  Pill,
  ClipboardList,
  TrendingUp,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react"
import { subscribeToPatientById, type Patient } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string
  const { userProfile, userType } = useAuth()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (patientId) {
      const unsubscribe = subscribeToPatientById(patientId, (patientData) => {
        setPatient(patientData)
        setLoading(false)
      })

      return unsubscribe
    }
  }, [patientId])

  const getTaskCompletionRate = () => {
    if (!patient?.tasks || patient.tasks.length === 0) return 0
    const completedTasks = patient.tasks.filter((task) => task.status === "completed").length
    return Math.round((completedTasks / patient.tasks.length) * 100)
  }

  const getRecentVitals = () => {
    if (!patient?.vitals) return []
    return patient.vitals.sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime()).slice(0, 5)
  }

  const getActiveMedications = () => {
    if (!patient?.currentMedications) return []
    return patient.currentMedications.filter((med) => med.active)
  }

  const getPendingTasks = () => {
    if (!patient?.tasks) return []
    return patient.tasks.filter((task) => task.status === "pending")
  }

  const getRecentMessages = () => {
    if (!patient?.messages) return []
    return patient.messages.sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime()).slice(0, 10)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading patient data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Patient not found</h3>
          <p className="text-gray-600">The patient you're looking for doesn't exist or you don't have access.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Patient Header */}
        <Card className="medical-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{patient.name}</CardTitle>
                  <CardDescription className="text-lg">
                    {patient.age} years old • {patient.gender} • Blood Type: {patient.bloodType}
                  </CardDescription>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {patient.phone || "No phone"}
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {patient.email}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">
                  Patient ID: {patient.id}
                </Badge>
                <div className="text-sm text-gray-600">Task Completion: {getTaskCompletionRate()}%</div>
                <Progress value={getTaskCompletionRate()} className="w-32 mt-1" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Real-time Data Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getActiveMedications().length}</div>
                  <p className="text-xs text-muted-foreground">Currently prescribed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getPendingTasks().length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting completion</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {patient.messages?.filter((m) => !m.read && m.fromUserId === patient.uid).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">From patient</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{patient.recommendations?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Total given</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getRecentVitals().length > 0 ? (
                      getRecentVitals().map((vital) => (
                        <div key={vital.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{vital.type}</p>
                            <p className="text-sm text-gray-600">{vital.timestamp.toDate().toLocaleDateString()}</p>
                          </div>
                          <Badge variant="outline">
                            {vital.value} {vital.unit}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No vitals recorded</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getActiveMedications().length > 0 ? (
                      getActiveMedications()
                        .slice(0, 5)
                        .map((medication) => (
                          <div key={medication.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{medication.name}</p>
                              <p className="text-sm text-gray-600">{medication.frequency}</p>
                            </div>
                            <Badge variant="outline">{medication.dosage}</Badge>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500">No active medications</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs History</CardTitle>
                <CardDescription>Real-time monitoring of patient vitals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getRecentVitals().length > 0 ? (
                    getRecentVitals().map((vital) => (
                      <div key={vital.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Heart className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium">{vital.type}</p>
                            <p className="text-sm text-gray-600">
                              Recorded on {vital.timestamp.toDate().toLocaleDateString()} at{" "}
                              {vital.timestamp.toDate().toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {vital.value} {vital.unit}
                          </p>
                          <p className="text-sm text-gray-600">By {vital.recordedBy || "Patient"}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No vital signs recorded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Medications</CardTitle>
                <CardDescription>Active prescriptions and medication history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getActiveMedications().length > 0 ? (
                    getActiveMedications().map((medication) => (
                      <div key={medication.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Pill className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="font-medium text-lg">{medication.name}</p>
                            <p className="text-sm text-gray-600">{medication.instructions}</p>
                            <p className="text-xs text-gray-500">
                              Prescribed on {medication.prescribedDate.toDate().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            {medication.dosage}
                          </Badge>
                          <p className="text-sm text-gray-600">{medication.frequency}</p>
                          <p className="text-xs text-gray-500">Next due: {medication.nextDue}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No active medications</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Tasks</CardTitle>
                <CardDescription>Patient tasks and their completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.tasks && patient.tasks.length > 0 ? (
                    patient.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Activity className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-600">{task.description}</p>
                            <p className="text-xs text-gray-500">Due: {task.dueDate.toDate().toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              task.status === "completed"
                                ? "default"
                                : task.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {task.status}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">{task.priority} priority</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No tasks assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Message History</CardTitle>
                <CardDescription>Real-time communication with patient</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {getRecentMessages().length > 0 ? (
                    getRecentMessages().map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.fromUserId === userProfile?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.fromUserId === userProfile?.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs mt-1 opacity-75">{message.timestamp.toDate().toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No messages yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Health Recommendations</CardTitle>
                <CardDescription>AI-powered and doctor recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.recommendations && patient.recommendations.length > 0 ? (
                    patient.recommendations.map((recommendation) => (
                      <div key={recommendation.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <Badge variant="outline">{recommendation.confidence}% confidence</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Category: {recommendation.category}</span>
                          <span>Type: {recommendation.type}</span>
                          <span>Status: {recommendation.status}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No recommendations yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
