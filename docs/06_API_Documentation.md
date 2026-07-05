# ArogyaOS

# Database Design

Version: 1.0

---

# Overview

ArogyaOS uses Firebase Firestore as its primary NoSQL database.

The database is designed using a collection-document model to ensure scalability, real-time synchronization, and efficient querying for healthcare operations.

---

# Database Principles

- Role-Based Data Access
- Real-Time Updates
- AI Ready
- Scalable
- Secure
- Cloud Native

---

# Collections Overview

users

districts

hospitals

departments

doctors

patients

appointments

prescriptions

medicines

inventory

laboratories

lab_tests

reports

beds

rooms

attendance

notifications

ai_predictions

settings

---

# Collection: users

Stores every platform user.

Fields

- uid
- fullName
- email
- phone
- role
- hospitalId
- districtId
- profileImage
- status
- createdAt
- updatedAt

---

# Collection: districts

Fields

- districtId
- districtName
- state
- hospitalsCount
- population
- createdAt

---

# Collection: hospitals

Fields

- hospitalId
- hospitalName
- hospitalType
- districtId
- address
- phone
- email
- location
- totalBeds
- availableBeds
- departments
- status
- createdAt

---

# Collection: departments

Fields

- departmentId
- hospitalId
- departmentName
- description
- status

---

# Collection: doctors

Fields

- doctorId
- hospitalId
- departmentId
- name
- specialization
- qualification
- experience
- phone
- email
- availability
- attendance
- consultationFee
- createdAt

---

# Collection: patients

Fields

- patientId
- fullName
- gender
- age
- bloodGroup
- mobile
- email
- address
- emergencyContact
- medicalHistory
- allergies
- createdAt

---

# Collection: appointments

Fields

- appointmentId
- patientId
- doctorId
- hospitalId
- appointmentDate
- appointmentTime
- appointmentType
- tokenNumber
- status
- notes
- createdAt

---

# Collection: prescriptions

Fields

- prescriptionId
- patientId
- doctorId
- appointmentId
- diagnosis
- medicines
- labTests
- followUpDate
- createdAt

---

# Collection: medicines

Fields

- medicineId
- medicineName
- manufacturer
- category
- unit
- description

---

# Collection: inventory

Fields

- inventoryId
- hospitalId
- medicineId
- quantity
- minimumStock
- expiryDate
- batchNumber
- supplier
- updatedAt

---

# Collection: laboratories

Fields

- laboratoryId
- hospitalId
- laboratoryName
- status

---

# Collection: lab_tests

Fields

- testId
- laboratoryId
- testName
- price
- duration
- homeCollectionAvailable
- availability

---

# Collection: reports

Fields

- reportId
- patientId
- doctorId
- laboratoryId
- reportFile
- reportType
- uploadedAt

---

# Collection: beds

Fields

- bedId
- roomId
- hospitalId
- bedNumber
- status
- patientId

---

# Collection: rooms

Fields

- roomId
- hospitalId
- roomNumber
- roomType
- floor
- totalBeds
- occupiedBeds

---

# Collection: attendance

Fields

- attendanceId
- userId
- date
- checkIn
- checkOut
- status

---

# Collection: notifications

Fields

- notificationId
- userId
- title
- message
- type
- isRead
- createdAt

---

# Collection: ai_predictions

Fields

- predictionId
- hospitalId
- predictionType
- prediction
- confidence
- recommendation
- generatedAt

---

# Collection: settings

Fields

- settingId
- language
- theme
- notificationPreferences

---

# Firestore Relationships

District

↓

Hospitals

↓

Departments

↓

Doctors

↓

Appointments

↓

Prescriptions

↓

Pharmacy

↓

Inventory

↓

District Dashboard

↓

AI Predictions

---

# Index Strategy

Create indexes for

- hospitalId
- districtId
- doctorId
- patientId
- appointmentDate
- status
- medicineId
- roomId

---

# Security Rules

Users can only access data based on role.

Patients can only access their own records.

Doctors can only access assigned patients.

Hospitals can only access their own data.

District Administrators can only access facilities inside their district.

Super Admin has full access.

---

# AI Data Sources

Gemini receives structured data from

- Appointments
- Inventory
- Beds
- Attendance
- Reports

to generate

- Demand Forecasts
- Medicine Predictions
- Hospital Health Scores
- Resource Recommendations
- Operational Insights

---

# Future Collections

ambulances

blood_bank

insurance

suppliers

payments

telemedicine

iot_devices

wearables