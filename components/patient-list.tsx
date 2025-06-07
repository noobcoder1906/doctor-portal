"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, MessageSquare, Calendar, AlertCircle, User, Phone, Mail } from "lucide-react"
import Link from "next/link"

export function PatientList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCondition, setFilterCondition] = useState("all")
  const [filterUrgency, setFilterUrgency] = useState("all")

  const patients = [
    {
      id: 1,
      name: "Sarah Johnson",
      age: 45,
      gender: "Female",
      condition: "Hypertension",
      urgency: "high",
      lastVisit: "2024-01-15",
      nextAppointment: "2024-01-22",
      phone: "+1 (555) 123-4567",
      email: "sarah.j@email.com",
      status: "active",
      completionRate: 85,
      alerts: 2,
    },
    {
      id: 2,
      name: "Michael Chen",
      age: 38,
      gender: "Male",
      condition: "Diabetes",
      urgency: "medium",
      lastVisit: "2024-01-10",
      nextAppointment: "2024-01-25",
      phone: "+1 (555) 234-5678",
      email: "m.chen@email.com",
      status: "active",
      completionRate: 92,
      alerts: 0,
    },
    {
      id: 3,
      name: "Emma Davis",
      age: 52,
      gender: "Female",
      condition: "Heart Disease",
      urgency: "high",
      lastVisit: "2024-01-12",
      nextAppointment: "2024-01-20",
      phone: "+1 (555) 345-6789",
      email: "emma.d@email.com",
      status: "monitoring",
      completionRate: 78,
      alerts: 1,
    },
    {
      id: 4,
      name: "David Wilson",
      age: 29,
      gender: "Male",
      condition: "Asthma",
      urgency: "low",
      lastVisit: "2024-01-08",
      nextAppointment: "2024-02-05",
      phone: "+1 (555) 456-7890",
      email: "d.wilson@email.com",
      status: "stable",
      completionRate: 95,
      alerts: 0,
    },
  ]

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

      {filteredPatients.length === 0 && (
        <Card className="medical-card">
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
