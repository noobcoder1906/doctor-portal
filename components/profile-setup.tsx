"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { User, Stethoscope, Heart } from "lucide-react"

interface ProfileSetupProps {
  onProfileCreate: (profileData: any) => Promise<void>
  userEmail: string
}

export function ProfileSetup({ onProfileCreate, userEmail }: ProfileSetupProps) {
  const [role, setRole] = useState<"doctor" | "patient" | "">("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    // Doctor fields
    specialization: "",
    licenseNumber: "",
    hospital: "",
    // Patient fields
    dateOfBirth: "",
    gender: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return

    setLoading(true)
    try {
      await onProfileCreate({
        role,
        ...formData,
      })
    } catch (error) {
      console.error("Error creating profile:", error)
      alert("Error creating profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            Complete Your Profile
          </CardTitle>
          <CardDescription>We need some additional information to set up your account for {userEmail}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">I am a:</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as "doctor" | "patient")}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="doctor" id="doctor" />
                  <Label htmlFor="doctor" className="flex items-center gap-2 cursor-pointer">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Doctor</div>
                      <div className="text-sm text-gray-600">Healthcare provider</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="patient" id="patient" />
                  <Label htmlFor="patient" className="flex items-center gap-2 cursor-pointer">
                    <Heart className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium">Patient</div>
                      <div className="text-sm text-gray-600">Seeking healthcare</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {role && (
              <>
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Doctor-specific fields */}
                {role === "doctor" && (
                  <>
                    <div>
                      <Label htmlFor="specialization">Medical Specialization *</Label>
                      <Select
                        value={formData.specialization}
                        onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                          <SelectItem value="family-medicine">Family Medicine</SelectItem>
                          <SelectItem value="pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="general-practice">General Practice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="licenseNumber">Medical License Number *</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        placeholder="MD123456789"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="hospital">Hospital/Clinic</Label>
                      <Input
                        id="hospital"
                        value={formData.hospital}
                        onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                        placeholder="General Hospital"
                      />
                    </div>
                  </>
                )}

                {/* Patient-specific fields */}
                {role === "patient" && (
                  <>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Profile..." : "Complete Setup"}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
