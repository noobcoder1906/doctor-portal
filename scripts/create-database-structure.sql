-- This is a SQL representation of the Firestore schema structure
-- It's for documentation purposes only, as Firestore is a NoSQL database

-- Doctors Collection
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  specialty TEXT,
  license TEXT,
  bio TEXT,
  preferences JSON,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Patients Collection
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  doctorId TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  age TEXT,
  gender TEXT,
  height TEXT,
  weight TEXT,
  bloodType TEXT,
  emergencyContact TEXT,
  vitals JSON,
  currentMedications JSON,
  tasks JSON,
  notifications JSON,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (doctorId) REFERENCES doctors(id)
);

-- Recommendations Collection
CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  patientId TEXT NOT NULL,
  doctorId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  status TEXT NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id),
  FOREIGN KEY (doctorId) REFERENCES doctors(id)
);

-- Notifications Collection
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL,
  read BOOLEAN NOT NULL,
  fromUserId TEXT,
  toUserId TEXT NOT NULL,
  createdAt TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_doctors_uid ON doctors(uid);
CREATE INDEX IF NOT EXISTS idx_patients_uid ON patients(uid);
CREATE INDEX IF NOT EXISTS idx_patients_doctorId ON patients(doctorId);
CREATE INDEX IF NOT EXISTS idx_recommendations_patientId ON recommendations(patientId);
CREATE INDEX IF NOT EXISTS idx_recommendations_doctorId ON recommendations(doctorId);
CREATE INDEX IF NOT EXISTS idx_notifications_toUserId ON notifications(toUserId);

-- Sample data for testing
INSERT INTO doctors (id, uid, name, email, phone, specialty, license, bio, preferences, createdAt, updatedAt)
VALUES (
  'doctor1',
  'doctor_uid_1',
  'Dr. John Smith',
  'john.smith@example.com',
  '+1 (555) 123-4567',
  'cardiology',
  'MD123456789',
  'Experienced cardiologist with over 10 years of practice.',
  '{"criticalAlerts": true, "appointmentReminders": true, "taskUpdates": true, "emailNotifications": true, "smsNotifications": false}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO patients (id, uid, doctorId, name, email, age, gender, height, weight, bloodType, emergencyContact, createdAt, updatedAt)
VALUES (
  'patient1',
  'patient_uid_1',
  'doctor1',
  'Alex Johnson',
  'alex.johnson@example.com',
  '32',
  'Non-binary',
  '5''8"',
  '165 lbs',
  'O+',
  'Jamie Johnson - (555) 123-4567',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO recommendations (id, patientId, doctorId, title, description, type, category, confidence, status, createdAt, updatedAt)
VALUES (
  'rec1',
  'patient1',
  'doctor1',
  'Increase Daily Water Intake',
  'Aim for at least 8 glasses of water per day to improve hydration and overall health.',
  'nutrition',
  'lifestyle',
  85,
  'active',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO notifications (id, type, title, message, priority, read, fromUserId, toUserId, createdAt)
VALUES (
  'notif1',
  'message',
  'Message from Doctor',
  'Please remember to take your medication as prescribed.',
  'medium',
  false,
  'doctor_uid_1',
  'patient_uid_1',
  CURRENT_TIMESTAMP
);

-- Print success message
SELECT 'Database structure created successfully!' AS message;
