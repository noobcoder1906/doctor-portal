"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, AlertTriangle, Calendar, MessageSquare, Activity } from "lucide-react"

export function NotificationCenter() {
  const [notifications] = useState([
    {
      id: 1,
      type: "alert",
      title: "Critical Alert: Sarah Johnson",
      message: "Blood pressure reading above normal range (180/95)",
      time: "2 minutes ago",
      read: false,
      priority: "high",
    },
    {
      id: 2,
      type: "appointment",
      title: "Upcoming Appointment",
      message: "Michael Chen - Follow-up consultation in 30 minutes",
      time: "28 minutes ago",
      read: false,
      priority: "medium",
    },
    {
      id: 3,
      type: "task",
      title: "Task Completed",
      message: "Emma Davis completed daily medication log",
      time: "1 hour ago",
      read: true,
      priority: "low",
    },
    {
      id: 4,
      type: "message",
      title: "New Message",
      message: "Patient inquiry from David Wilson about medication side effects",
      time: "2 hours ago",
      read: true,
      priority: "medium",
    },
    {
      id: 5,
      type: "alert",
      title: "Missed Medication Alert",
      message: "Lisa Brown missed evening medication dose",
      time: "3 hours ago",
      read: true,
      priority: "medium",
    },
  ])

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
            <CardDescription>Stay updated with patient alerts and appointments</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-1 p-4">
                {notifications.map((notification) => (
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
                ))}
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
