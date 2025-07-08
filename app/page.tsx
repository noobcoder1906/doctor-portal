"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup"
import { Stethoscope, Shield, Users, Calendar, FileText } from "lucide-react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("login")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">MediCare Portal</h1>
            </div>
            <div className="text-sm text-gray-600">Healthcare Management System</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Modern Healthcare Management</h2>
              <p className="text-xl text-gray-600 mb-8">
                Streamline patient care with our comprehensive healthcare portal designed for doctors and patients.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Patient Management</h3>
                  <p className="text-gray-600">
                    Efficiently manage patient records, appointments, and medical history.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Appointment Scheduling</h3>
                  <p className="text-gray-600">Smart scheduling system with automated reminders and notifications.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Digital Prescriptions</h3>
                  <p className="text-gray-600">Create and manage digital prescriptions with medication tracking.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure & Compliant</h3>
                  <p className="text-gray-600">HIPAA-compliant platform ensuring patient data security and privacy.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Forms */}
          <div className="lg:max-w-md mx-auto w-full">
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Welcome to MediCare</CardTitle>
                <CardDescription>Sign in to your account or create a new one to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4 mt-6">
                    <LoginForm />
                    <div className="text-center text-sm">
                      <span className="text-gray-600">Don't have an account? </span>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-semibold"
                        onClick={() => setActiveTab("signup")}
                      >
                        Sign up here
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4 mt-6">
                    <SignupForm />
                    <div className="text-center text-sm">
                      <span className="text-gray-600">Already have an account? </span>
                      <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => setActiveTab("login")}>
                        Sign in here
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 MediCare Portal. All rights reserved.</p>
            <p className="text-sm mt-2">Secure healthcare management for the digital age.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
