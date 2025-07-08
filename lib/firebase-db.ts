import { db } from "./firebase"
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
import type {
  UserProfile,
  DoctorProfile,
  PatientProfile,
  Appointment,
  Recommendation,
  Notification,
  HealthData,
  Message,
  DoctorAvailability,
} from "./firebase-schema"

// User functions
export const createUserProfile = async (userId: string, data: Partial<UserProfile>, role: "doctor" | "patient") => {
  try {
    const userRef = doc(db, "users", userId)

    // Create base user profile
    await setDoc(
      userRef,
      {
        ...data,
        role,
        uid: userId,
        id: userId,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    )

    // Create role-specific collection entry
    if (role === "doctor") {
      const doctorRef = doc(db, "doctors", userId)
      await setDoc(
        doctorRef,
        {
          ...data,
          role,
          uid: userId,
          id: userId,
          patientIds: [],
          createdAt: serverTimestamp(),
        },
        { merge: true },
      )
    } else {
      const patientRef = doc(db, "patients", userId)
      await setDoc(
        patientRef,
        {
          ...data,
          role,
          uid: userId,
          id: userId,
          assignedDoctorIds: [],
          createdAt: serverTimestamp(),
        },
        { merge: true },
      )
    }

    console.log(`${role} profile created successfully`)
    return userId
  } catch (error) {
    console.error(`Error creating ${role} profile:`, error)
    throw error
  }
}

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as UserProfile
    }
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Get doctor profile by ID
export const getDoctorProfile = async (doctorId: string): Promise<DoctorProfile | null> => {
  try {
    const doctorRef = doc(db, "doctors", doctorId)
    const doctorSnap = await getDoc(doctorRef)

    if (doctorSnap.exists()) {
      return { id: doctorSnap.id, ...doctorSnap.data() } as DoctorProfile
    }
    return null
  } catch (error) {
    console.error("Error getting doctor profile:", error)
    throw error
  }
}

// Get patient profile by ID
export const getPatientProfile = async (patientId: string): Promise<PatientProfile | null> => {
  try {
    const patientRef = doc(db, "patients", patientId)
    const patientSnap = await getDoc(patientRef)

    if (patientSnap.exists()) {
      return { id: patientSnap.id, ...patientSnap.data() } as PatientProfile
    }
    return null
  } catch (error) {
    console.error("Error getting patient profile:", error)
    throw error
  }
}

// Get all doctors
export const getAllDoctors = async (): Promise<DoctorProfile[]> => {
  try {
    const doctorsRef = collection(db, "doctors")
    const doctorsSnap = await getDocs(doctorsRef)

    const doctors: DoctorProfile[] = []
    doctorsSnap.forEach((doc) => {
      doctors.push({ id: doc.id, ...doc.data() } as DoctorProfile)
    })

    return doctors
  } catch (error) {
    console.error("Error getting all doctors:", error)
    throw error
  }
}

// Get patients for a doctor
export const getDoctorPatients = async (doctorId: string): Promise<PatientProfile[]> => {
  try {
    const doctorRef = doc(db, "doctors", doctorId)
    const doctorSnap = await getDoc(doctorRef)

    if (!doctorSnap.exists()) {
      throw new Error("Doctor not found")
    }

    const doctorData = doctorSnap.data() as DoctorProfile
    const patientIds = doctorData.patientIds || []

    const patients: PatientProfile[] = []

    for (const patientId of patientIds) {
      const patientRef = doc(db, "patients", patientId)
      const patientSnap = await getDoc(patientRef)

      if (patientSnap.exists()) {
        patients.push({ id: patientSnap.id, ...patientSnap.data() } as PatientProfile)
      }
    }

    return patients
  } catch (error) {
    console.error("Error getting doctor patients:", error)
    throw error
  }
}

// Assign patient to doctor
export const assignPatientToDoctor = async (patientId: string, doctorId: string) => {
  try {
    const doctorRef = doc(db, "doctors", doctorId)
    const patientRef = doc(db, "patients", patientId)

    // Update doctor's patient list
    await updateDoc(doctorRef, {
      patientIds: arrayUnion(patientId),
    })

    // Update patient's doctor list
    await updateDoc(patientRef, {
      assignedDoctorIds: arrayUnion(doctorId),
    })

    console.log(`Patient ${patientId} assigned to doctor ${doctorId}`)
  } catch (error) {
    console.error("Error assigning patient to doctor:", error)
    throw error
  }
}

// Remove patient from doctor
export const removePatientFromDoctor = async (patientId: string, doctorId: string) => {
  try {
    const doctorRef = doc(db, "doctors", doctorId)
    const patientRef = doc(db, "patients", patientId)

    // Update doctor's patient list
    await updateDoc(doctorRef, {
      patientIds: arrayRemove(patientId),
    })

    // Update patient's doctor list
    await updateDoc(patientRef, {
      assignedDoctorIds: arrayRemove(doctorId),
    })

    console.log(`Patient ${patientId} removed from doctor ${doctorId}`)
  } catch (error) {
    console.error("Error removing patient from doctor:", error)
    throw error
  }
}

// Appointment functions
export const createAppointment = async (appointmentData: Omit<Appointment, "id" | "createdAt">) => {
  try {
    const appointmentsRef = collection(db, "appointments")

    const docRef = await addDoc(appointmentsRef, {
      ...appointmentData,
      createdAt: serverTimestamp(),
      status: appointmentData.status || "booked",
    })

    // Send notification to doctor
    await sendNotification({
      userId: appointmentData.doctorId,
      title: "New Appointment Booked",
      message: `A new appointment has been booked for ${appointmentData.date} at ${appointmentData.time}`,
      type: "appointment",
      referenceId: docRef.id,
    })

    console.log("Appointment created with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error creating appointment:", error)
    throw error
  }
}

// Get appointments for a doctor
export const getDoctorAppointments = async (doctorId: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, "appointments")
    const q = query(appointmentsRef, where("doctorId", "==", doctorId), orderBy("date", "asc"), orderBy("time", "asc"))

    const querySnapshot = await getDocs(q)

    const appointments: Appointment[] = []
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() } as Appointment)
    })

    return appointments
  } catch (error) {
    console.error("Error getting doctor appointments:", error)
    throw error
  }
}

// Get appointments for a patient
export const getPatientAppointments = async (patientId: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, "appointments")
    const q = query(
      appointmentsRef,
      where("patientId", "==", patientId),
      orderBy("date", "asc"),
      orderBy("time", "asc"),
    )

    const querySnapshot = await getDocs(q)

    const appointments: Appointment[] = []
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() } as Appointment)
    })

    return appointments
  } catch (error) {
    console.error("Error getting patient appointments:", error)
    throw error
  }
}

// Update appointment status
export const updateAppointmentStatus = async (appointmentId: string, status: Appointment["status"]) => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId)

    await updateDoc(appointmentRef, {
      status,
      updatedAt: serverTimestamp(),
    })

    console.log(`Appointment ${appointmentId} status updated to ${status}`)
  } catch (error) {
    console.error("Error updating appointment status:", error)
    throw error
  }
}

// Recommendation functions
export const sendRecommendation = async (recommendationData: Omit<Recommendation, "id" | "createdAt" | "read">) => {
  try {
    // Create recommendation in the patient's recommendations collection
    const recommendationsRef = collection(db, "recommendations")

    const docRef = await addDoc(recommendationsRef, {
      ...recommendationData,
      createdAt: serverTimestamp(),
      read: false,
    })

    // Send notification to the patient
    await sendNotification({
      userId: recommendationData.patientId,
      title: "New Recommendation",
      message: `Dr. ${recommendationData.doctorId} has sent you a new ${recommendationData.type} recommendation`,
      type: "recommendation",
      referenceId: docRef.id,
    })

    console.log("Recommendation sent with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error sending recommendation:", error)
    throw error
  }
}

// Get recommendations for a patient
export const getPatientRecommendations = async (patientId: string): Promise<Recommendation[]> => {
  try {
    const recommendationsRef = collection(db, "recommendations")
    const q = query(recommendationsRef, where("patientId", "==", patientId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)

    const recommendations: Recommendation[] = []
    querySnapshot.forEach((doc) => {
      recommendations.push({ id: doc.id, ...doc.data() } as Recommendation)
    })

    return recommendations
  } catch (error) {
    console.error("Error getting patient recommendations:", error)
    throw error
  }
}

// Mark recommendation as read
export const markRecommendationAsRead = async (recommendationId: string) => {
  try {
    const recommendationRef = doc(db, "recommendations", recommendationId)

    await updateDoc(recommendationRef, {
      read: true,
    })

    console.log(`Recommendation ${recommendationId} marked as read`)
  } catch (error) {
    console.error("Error marking recommendation as read:", error)
    throw error
  }
}

// Notification functions
export const sendNotification = async (notificationData: Omit<Notification, "id" | "createdAt" | "seen">) => {
  try {
    const notificationsRef = collection(db, "notifications")

    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      createdAt: serverTimestamp(),
      seen: false,
    })

    console.log("Notification sent with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error sending notification:", error)
    throw error
  }
}

// Get notifications for a user
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, "notifications")
    const q = query(notificationsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)

    const notifications: Notification[] = []
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification)
    })

    return notifications
  } catch (error) {
    console.error("Error getting user notifications:", error)
    throw error
  }
}

// Subscribe to user notifications (real-time)
export const subscribeToUserNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  try {
    const notificationsRef = collection(db, "notifications")
    const q = query(notificationsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifications: Notification[] = []
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as Notification)
      })

      callback(notifications)
    })

    return unsubscribe
  } catch (error) {
    console.error("Error subscribing to user notifications:", error)
    throw error
  }
}

// Mark notification as seen
export const markNotificationAsSeen = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId)

    await updateDoc(notificationRef, {
      seen: true,
    })

    console.log(`Notification ${notificationId} marked as seen`)
  } catch (error) {
    console.error("Error marking notification as seen:", error)
    throw error
  }
}

// Health data functions
export const addHealthData = async (healthData: Omit<HealthData, "id" | "createdAt">) => {
  try {
    const healthDataRef = collection(db, "healthData")

    const docRef = await addDoc(healthDataRef, {
      ...healthData,
      createdAt: serverTimestamp(),
    })

    console.log("Health data added with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error adding health data:", error)
    throw error
  }
}

// Get health data for a patient
export const getPatientHealthData = async (patientId: string, type?: string): Promise<HealthData[]> => {
  try {
    const healthDataRef = collection(db, "healthData")
    let q

    if (type) {
      q = query(
        healthDataRef,
        where("patientId", "==", patientId),
        where("type", "==", type),
        orderBy("createdAt", "desc"),
      )
    } else {
      q = query(healthDataRef, where("patientId", "==", patientId), orderBy("createdAt", "desc"))
    }

    const querySnapshot = await getDocs(q)

    const healthData: HealthData[] = []
    querySnapshot.forEach((doc) => {
      healthData.push({ id: doc.id, ...doc.data() } as HealthData)
    })

    return healthData
  } catch (error) {
    console.error("Error getting patient health data:", error)
    throw error
  }
}

// Message functions
export const sendMessage = async (messageData: Omit<Message, "id" | "createdAt" | "read">) => {
  try {
    const messagesRef = collection(db, "messages")

    const docRef = await addDoc(messagesRef, {
      ...messageData,
      createdAt: serverTimestamp(),
      read: false,
    })

    // Send notification to the receiver
    await sendNotification({
      userId: messageData.receiverId,
      title: "New Message",
      message: "You have received a new message",
      type: "message",
      referenceId: docRef.id,
    })

    console.log("Message sent with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

// Get conversation between two users
export const getConversation = async (userId1: string, userId2: string): Promise<Message[]> => {
  try {
    const messagesRef = collection(db, "messages")
    const q1 = query(
      messagesRef,
      where("senderId", "==", userId1),
      where("receiverId", "==", userId2),
      orderBy("createdAt", "asc"),
    )

    const q2 = query(
      messagesRef,
      where("senderId", "==", userId2),
      where("receiverId", "==", userId1),
      orderBy("createdAt", "asc"),
    )

    const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)])

    const messages: Message[] = []

    querySnapshot1.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message)
    })

    querySnapshot2.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message)
    })

    // Sort messages by createdAt
    messages.sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
      return dateA.getTime() - dateB.getTime()
    })

    return messages
  } catch (error) {
    console.error("Error getting conversation:", error)
    throw error
  }
}

// Subscribe to conversation (real-time)
export const subscribeToConversation = (userId1: string, userId2: string, callback: (messages: Message[]) => void) => {
  try {
    const messagesRef = collection(db, "messages")

    // Create two queries: one for messages from user1 to user2, and one for messages from user2 to user1
    const q1 = query(
      messagesRef,
      where("senderId", "==", userId1),
      where("receiverId", "==", userId2),
      orderBy("createdAt", "asc"),
    )

    const q2 = query(
      messagesRef,
      where("senderId", "==", userId2),
      where("receiverId", "==", userId1),
      orderBy("createdAt", "asc"),
    )

    // Subscribe to both queries
    const unsubscribe1 = onSnapshot(q1, (querySnapshot1) => {
      // When either query updates, get all messages from both queries
      getDocs(q2).then((querySnapshot2) => {
        const messages: Message[] = []

        querySnapshot1.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() } as Message)
        })

        querySnapshot2.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() } as Message)
        })

        // Sort messages by createdAt
        messages.sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
          return dateA.getTime() - dateB.getTime()
        })

        callback(messages)
      })
    })

    const unsubscribe2 = onSnapshot(q2, (querySnapshot2) => {
      // When either query updates, get all messages from both queries
      getDocs(q1).then((querySnapshot1) => {
        const messages: Message[] = []

        querySnapshot1.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() } as Message)
        })

        querySnapshot2.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() } as Message)
        })

        // Sort messages by createdAt
        messages.sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
          return dateA.getTime() - dateB.getTime()
        })

        callback(messages)
      })
    })

    // Return a function that unsubscribes from both listeners
    return () => {
      unsubscribe1()
      unsubscribe2()
    }
  } catch (error) {
    console.error("Error subscribing to conversation:", error)
    throw error
  }
}

// Mark message as read
export const markMessageAsRead = async (messageId: string) => {
  try {
    const messageRef = doc(db, "messages", messageId)

    await updateDoc(messageRef, {
      read: true,
    })

    console.log(`Message ${messageId} marked as read`)
  } catch (error) {
    console.error("Error marking message as read:", error)
    throw error
  }
}

// Doctor availability functions
export const setDoctorAvailability = async (doctorId: string, date: string, slots: DoctorAvailability["slots"]) => {
  try {
    const availabilityRef = collection(db, "doctorAvailability")
    const q = query(availabilityRef, where("doctorId", "==", doctorId), where("date", "==", date))

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      // Update existing availability
      const docId = querySnapshot.docs[0].id
      const docRef = doc(db, "doctorAvailability", docId)

      await updateDoc(docRef, {
        slots,
      })

      console.log(`Doctor ${doctorId} availability updated for ${date}`)
      return docId
    } else {
      // Create new availability
      const docRef = await addDoc(availabilityRef, {
        doctorId,
        date,
        slots,
      })

      console.log(`Doctor ${doctorId} availability set for ${date}`)
      return docRef.id
    }
  } catch (error) {
    console.error("Error setting doctor availability:", error)
    throw error
  }
}

// Get doctor availability for a specific date
export const getDoctorAvailabilityForDate = async (
  doctorId: string,
  date: string,
): Promise<DoctorAvailability | null> => {
  try {
    const availabilityRef = collection(db, "doctorAvailability")
    const q = query(availabilityRef, where("doctorId", "==", doctorId), where("date", "==", date))

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as DoctorAvailability
    }

    return null
  } catch (error) {
    console.error("Error getting doctor availability:", error)
    throw error
  }
}

// Get available doctors for a specific date and time
export const getAvailableDoctors = async (date: string, time: string): Promise<DoctorProfile[]> => {
  try {
    const availabilityRef = collection(db, "doctorAvailability")
    const q = query(availabilityRef, where("date", "==", date))

    const querySnapshot = await getDocs(q)

    const availableDoctorIds: string[] = []

    querySnapshot.forEach((doc) => {
      const availability = doc.data() as DoctorAvailability
      const slot = availability.slots.find((s) => s.time === time)

      if (slot && slot.available) {
        availableDoctorIds.push(availability.doctorId)
      }
    })

    const doctors: DoctorProfile[] = []

    for (const doctorId of availableDoctorIds) {
      const doctorProfile = await getDoctorProfile(doctorId)
      if (doctorProfile) {
        doctors.push(doctorProfile)
      }
    }

    return doctors
  } catch (error) {
    console.error("Error getting available doctors:", error)
    throw error
  }
}
