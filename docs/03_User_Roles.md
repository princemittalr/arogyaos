# ArogyaOS

# User Roles & Permissions

Version: 1.0

---

# Overview

ArogyaOS follows a Role-Based Access Control (RBAC) model. Every user is assigned one or more roles, and each role determines the dashboards, modules, and actions available within the platform.

This ensures secure access to sensitive healthcare data while providing a tailored experience for different stakeholders.

---

# User Hierarchy

```
Super Admin
      │
      ├─────────────── District Administrator
      │                     │
      │                     ├────────────── Hospital Administrator
      │                     │                      │
      │                     │                      ├──── Doctor
      │                     │                      ├──── Nurse
      │                     │                      ├──── Pharmacist
      │                     │                      └──── Laboratory Technician
      │
      └────────────── Citizen
```

---

# 1. Super Admin

## Description

The highest authority responsible for managing the entire ArogyaOS platform.

## Responsibilities

- Platform management
- District management
- User management
- Security management
- AI configuration
- System monitoring

## Permissions

- Full access
- Manage all users
- Create districts
- Create hospitals
- Delete hospitals
- View analytics
- Configure AI
- View system logs
- Manage roles
- Platform settings

---

# 2. District Administrator

## Description

Government health official responsible for monitoring all healthcare facilities within a district.

## Responsibilities

- District monitoring
- Resource planning
- AI recommendations
- Critical alerts
- Healthcare performance

## Permissions

- View all hospitals
- View PHCs
- View CHCs
- Monitor medicine stock
- Monitor beds
- Monitor attendance
- View reports
- Receive AI alerts
- Approve resource redistribution
- Export reports

Cannot

- Delete hospitals
- Access financial settings
- Modify system configuration

---

# 3. Hospital Administrator

## Description

Responsible for complete management of a single hospital or healthcare centre.

## Responsibilities

- Manage doctors
- Manage staff
- Manage departments
- Manage pharmacy
- Manage laboratory
- Manage inventory
- Manage appointments

## Permissions

- Hospital dashboard
- Create doctors
- Create staff
- Manage rooms
- Manage beds
- Manage pharmacy inventory
- Manage laboratory
- Generate reports
- View analytics

Cannot

- Access other hospitals
- Modify district settings

---

# 4. Doctor

## Description

Healthcare professional providing consultations and treatment.

## Responsibilities

- Patient consultations
- Digital prescriptions
- Medical notes
- Follow-up scheduling

## Permissions

- Dashboard
- Today's appointments
- View assigned patients
- Patient history
- Voice consultation
- AI consultation summary
- Create prescriptions
- Recommend lab tests
- View reports

Cannot

- Modify hospital settings
- Manage inventory
- View administrative analytics

---

# 5. Nurse

## Description

Supports doctors and manages patient care.

## Responsibilities

- Admit patients
- Record vitals
- Assign beds
- Assist treatment

## Permissions

- Patient list
- Record vitals
- Assign beds
- Update patient status
- View doctor instructions

Cannot

- Prescribe medicines
- Manage hospital configuration

---

# 6. Pharmacist

## Description

Responsible for medicine inventory and dispensing.

## Responsibilities

- Dispense medicines
- Inventory management
- Stock monitoring

## Permissions

- Inventory dashboard
- View prescriptions
- Dispense medicines
- Update stock
- View expiry alerts
- Generate pharmacy reports

Cannot

- Modify prescriptions
- Access administrative settings

---

# 7. Laboratory Technician

## Description

Manages laboratory tests and diagnostic reports.

## Responsibilities

- Manage tests
- Upload reports
- Sample tracking

## Permissions

- Test dashboard
- Sample management
- Upload reports
- View appointments
- Home collection management

Cannot

- Modify prescriptions
- Access inventory

---

# 8. Citizen

## Description

Patients and family members using the platform for healthcare services.

## Responsibilities

- Appointment booking
- Medical history
- Reports
- Prescriptions

## Permissions

- Register
- Login
- Manage profile
- Add family members
- Book appointments
- Cancel appointments
- Download prescriptions
- Download reports
- View appointment history
- Receive notifications

Cannot

- Access hospital dashboards
- View other patient records
- Modify medical records

---

# Role Access Matrix

| Module | Super Admin | District Admin | Hospital Admin | Doctor | Nurse | Pharmacist | Lab | Citizen |
|----------|------------|---------------|----------------|--------|--------|------------|-----|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hospital Management | ✅ | View | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Doctors | ✅ | View | ✅ | Self | View | ❌ | ❌ | Search |
| Patients | ✅ | View | ✅ | Assigned | Assigned | View | View | Self |
| Pharmacy | ✅ | View | ✅ | View | View | ✅ | ❌ | View Prescription |
| Laboratory | ✅ | View | ✅ | Order Tests | View | ❌ | ✅ | View Reports |
| Inventory | ✅ | View | ✅ | ❌ | ❌ | ✅ | View | ❌ |
| Beds | ✅ | View | ✅ | View | Update | ❌ | ❌ | View Availability |
| AI Insights | ✅ | ✅ | ✅ | Limited | ❌ | Limited | Limited | Limited |
| Reports | ✅ | ✅ | ✅ | Own | Limited | Own | Own | Own |
| Settings | ✅ | Limited | Hospital Only | ❌ | ❌ | ❌ | ❌ | Profile Only |

---

# Security Principles

- Every action is authenticated.
- Every request is authorized based on role.
- Users can only access data they are permitted to view.
- Sensitive healthcare information is protected using role-based permissions.
- Every important action is logged for auditing.
- Patient privacy is maintained across all modules.

---

# Future Roles

The platform is designed to support additional roles in future releases:

- Insurance Provider
- Supplier
- Ambulance Operator
- Blood Bank Manager
- Telemedicine Specialist
- Public Health Researcher
- State Health Administrator