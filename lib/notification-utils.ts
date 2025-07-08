import { addDoc, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Function to create notification when patient books appointment
export const createAppointmentNotification = async (doctorId: string, patientId: string, appointmentData: any) => {
  try {
    console.log("🔔 Creating appointment notification for doctor:", doctorId)

    // Get patient name for the notification
    let patientName = "Unknown Patient"
    try {
      const patientQuery = query(collection(db, "users"), where("uid", "==", patientId))
      const patientSnapshot = await getDocs(patientQuery)

      if (!patientSnapshot.empty) {
        const patientData = patientSnapshot.docs[0].data()
        patientName = `${patientData.firstName} ${patientData.lastName}`
      }
    } catch (error) {
      console.error("Error fetching patient name:", error)
    }

    // Get doctor name for better notification context
    let doctorName = "Doctor"
    try {
      const doctorQuery = query(collection(db, "users"), where("uid", "==", doctorId))
      const doctorSnapshot = await getDocs(doctorQuery)

      if (!doctorSnapshot.empty) {
        const doctorData = doctorSnapshot.docs[0].data()
        doctorName = `Dr. ${doctorData.firstName} ${doctorData.lastName}`
      }
    } catch (error) {
      console.error("Error fetching doctor name:", error)
    }

    await addDoc(collection(db, "notifications"), {
      doctorId: doctorId,
      patientId: patientId,
      type: "appointment",
      title: "New Appointment Booked",
      message: `${patientName} has booked an appointment for ${appointmentData.type || "consultation"}`,
      priority: appointmentData.urgency_level === "emergency" ? "high" : "medium",
      read: false,
      createdAt: serverTimestamp(),
      appointmentId: appointmentData.appointmentId,
      appointmentType: appointmentData.type,
      scheduledDate: appointmentData.scheduledDate,
      patientName: patientName,
      doctorName: doctorName,
    })

    console.log("✅ Notification created successfully")
    return true
  } catch (error) {
    console.error("❌ Error creating notification:", error)
    return false
  }
}

// Function to create different types of notifications
export const createNotification = async (
  doctorId: string,
  patientId: string,
  notificationData: {
    type: "appointment" | "alert" | "message" | "task"
    title: string
    message: string
    priority?: "low" | "medium" | "high"
    additionalData?: any
  },
) => {
  try {
    console.log("🔔 Creating notification:", notificationData.type)

    await addDoc(collection(db, "notifications"), {
      doctorId: doctorId,
      patientId: patientId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      priority: notificationData.priority || "medium",
      read: false,
      createdAt: serverTimestamp(),
      ...notificationData.additionalData,
    })

    console.log("✅ Notification created successfully")
    return true
  } catch (error) {
    console.error("❌ Error creating notification:", error)
    return false
  }
}

// Function to mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { updateDoc, doc } = await import("firebase/firestore")
    const notificationRef = doc(db, "notifications", notificationId)
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
    })
    console.log("✅ Notification marked as read")
    return true
  } catch (error) {
    console.error("❌ Error marking notification as read:", error)
    return false
  }
}

// Function to get notifications for a doctor
export const getDoctorNotifications = async (doctorId: string) => {
  try {
    const { orderBy, limit } = await import("firebase/firestore")
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("doctorId", "==", doctorId),
      orderBy("createdAt", "desc"),
      limit(50),
    )

    const notificationsSnapshot = await getDocs(notificationsQuery)

    const notifications = await Promise.all(
      notificationsSnapshot.docs.map(async (doc) => {
        const data = doc.data()

        // Get patient name if not already in notification
        let patientName = data.patientName || "Unknown Patient"
        if (!data.patientName && data.patientId) {
          try {
            const patientQuery = query(collection(db, "users"), where("uid", "==", data.patientId))
            const patientSnapshot = await getDocs(patientQuery)

            if (!patientSnapshot.empty) {
              const patientData = patientSnapshot.docs[0].data()
              patientName = `${patientData.firstName} ${patientData.lastName}`
            }
          } catch (error) {
            console.error("Error fetching patient name:", error)
          }
        }

        // Calculate time ago
        const createdAt = data.createdAt?.toDate() || new Date()
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - createdAt.getTime())
        const diffMinutes = Math.ceil(diffTime / (1000 * 60))

        let timeAgo
        if (diffMinutes < 60) {
          timeAgo = `${diffMinutes} min ago`
        } else if (diffMinutes < 1440) {
          const diffHours = Math.ceil(diffMinutes / 60)
          timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
        } else {
          const diffDays = Math.ceil(diffMinutes / 1440)
          timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
        }

        return {
          id: doc.id,
          type: data.type || "appointment",
          title: data.title || "New Notification",
          message: data.message || `${patientName} has an update`,
          time: timeAgo,
          read: data.read || false,
          priority: data.priority || "medium",
          patientName: patientName,
          patientId: data.patientId,
          createdAt: data.createdAt,
          ...data,
        }
      }),
    )

    return notifications
  } catch (error) {
    console.error("❌ Error fetching notifications:", error)
    return []
  }
}
