"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, User, Bell, Shield, Palette, Save } from "lucide-react"
import { createDoctorProfile, updateDoctorProfile, getDoctorProfile, type Doctor } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [doctorId, setDoctorId] = useState<string>()
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    phone: "",
    specialty: "",
    license: "",
    bio: "",
  })
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    appointmentReminders: true,
    taskUpdates: true,
    emailNotifications: true,
    smsNotifications: false,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
    if (user) {
      loadDoctorProfile()
    }
  }, [user, loading, router])

  const loadDoctorProfile = async () => {
    if (!user) return

    try {
      const doctorProfile = await getDoctorProfile(user.uid)

      if (doctorProfile) {
        setDoctorId(doctorProfile.id!)
        setProfile({
          displayName: doctorProfile.name || "",
          email: doctorProfile.email || "",
          phone: doctorProfile.phone || "",
          specialty: doctorProfile.specialty || "",
          license: doctorProfile.license || "",
          bio: doctorProfile.bio || "",
        })

        if (doctorProfile.preferences) {
          setNotifications({
            criticalAlerts: doctorProfile.preferences.criticalAlerts,
            appointmentReminders: doctorProfile.preferences.appointmentReminders,
            taskUpdates: doctorProfile.preferences.taskUpdates,
            emailNotifications: doctorProfile.preferences.emailNotifications,
            smsNotifications: doctorProfile.preferences.smsNotifications,
          })
        }
      }
    } catch (error) {
      console.error("Error loading doctor profile:", error)
      toast({
        title: "Error",
        description: "Failed to load doctor profile",
        variant: "destructive",
      })
    }
  }

  const handleProfileSave = async () => {
    if (!user) return

    try {
      const doctorData = {
        uid: user.uid,
        name: profile.displayName,
        email: profile.email,
        phone: profile.phone,
        specialty: profile.specialty,
        license: profile.license,
        bio: profile.bio,
      }

      if (doctorId) {
        // Update existing doctor
        await updateDoctorProfile(doctorId, doctorData)
      } else {
        // Create new doctor
        const newDoctorId = await createDoctorProfile(doctorData as Omit<Doctor, "createdAt" | "updatedAt">)
        setDoctorId(newDoctorId)
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      })
    }
  }

  const handleNotificationSave = async () => {
    if (!doctorId) return

    try {
      await updateDoctorProfile(doctorId, {
        preferences: notifications,
      })

      toast({
        title: "Success",
        description: "Notification preferences updated successfully",
      })
    } catch (error) {
      console.error("Error saving notification preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      })
    }
  }

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-8 w-8 text-primary" />
              Settings
            </h1>
            <p className="text-gray-600">Manage your account and application preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal and professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input
                      id="displayName"
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Medical Specialty</Label>
                    <Select
                      value={profile.specialty}
                      onValueChange={(value) => setProfile({ ...profile, specialty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                        <SelectItem value="family-medicine">Family Medicine</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="license">Medical License Number</Label>
                  <Input
                    id="license"
                    value={profile.license}
                    onChange={(e) => setProfile({ ...profile, license: e.target.value })}
                    placeholder="MD123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Brief description of your medical background and expertise..."
                    className="min-h-24"
                  />
                </div>
                <Button onClick={handleProfileSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-500" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure how you receive alerts and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="criticalAlerts">Critical Patient Alerts</Label>
                      <p className="text-sm text-gray-600">Immediate notifications for critical patient conditions</p>
                    </div>
                    <Switch
                      id="criticalAlerts"
                      checked={notifications.criticalAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, criticalAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="appointmentReminders">Appointment Reminders</Label>
                      <p className="text-sm text-gray-600">Notifications for upcoming appointments</p>
                    </div>
                    <Switch
                      id="appointmentReminders"
                      checked={notifications.appointmentReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, appointmentReminders: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="taskUpdates">Task Updates</Label>
                      <p className="text-sm text-gray-600">Notifications when patients complete or miss tasks</p>
                    </div>
                    <Switch
                      id="taskUpdates"
                      checked={notifications.taskUpdates}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, taskUpdates: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive critical alerts via SMS</p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                    />
                  </div>
                </div>
                <Button onClick={handleNotificationSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security and privacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" placeholder="Enter current password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="Enter new password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                </div>
                <Button>Update Password</Button>

                <div className="pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  Application Preferences
                </CardTitle>
                <CardDescription>Customize your application experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select defaultValue="light">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="est">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      <SelectItem value="cst">Central Time (CST)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
