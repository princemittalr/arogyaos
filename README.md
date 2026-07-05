# 🏥 ArogyaOS — AI-Powered Unified Healthcare Operating System

> **Google Hackathon 2026 Submission**
> Transforming public healthcare delivery through AI-driven intelligence, real-time resource orchestration, and unified multi-role clinical workflows.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Feature List](#feature-list)
- [AI Capabilities](#ai-capabilities)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [Deployment](#deployment)
- [Security](#security)
- [Project Structure](#project-structure)

---

## Overview

**ArogyaOS** is a full-stack healthcare operating system that connects every stakeholder in the public health ecosystem — citizens, doctors, pharmacists, hospital administrators, and district health officers — into a single synchronized intelligence network powered by **Google Gemini AI**.

**The core problem it solves:** India's public health system suffers from fragmented data, medicine stock-outs, inefficient resource distribution, and lack of real-time visibility across district health facilities.

**ArogyaOS delivers:**
- Real-time medicine inventory tracking with AI-powered shortage prediction
- Automated resource redistribution recommendations between facilities
- A live district command center with interactive GIS facility maps
- AI-generated clinical consultation summaries for doctors
- Patient footfall forecasting and bed occupancy optimization

---

## Feature List

### 🧑‍🤝‍🧑 Citizen Portal
- Personal health dashboard with family member records
- Hospital discovery and appointment booking
- Prescription and lab report history
- Notification center

### 👨‍⚕️ Doctor Workspace
- Patient queue and today's schedule
- Live consultation room with clinical note-taking
- **AI-powered consultation summary** (diagnosis + prescription draft)
- Lab order management and follow-up tracking

### 🏥 Hospital Administrator Workspace
- Department and staff management
- Real-time bed occupancy monitoring
- **AI Hospital Health Score** (0–100 operational rating)
- Appointment scheduling and patient records

### 💊 Pharmacy & Inventory Management
- Real-time medicine inventory with threshold alerts
- Dispensing records and expiry tracking
- **AI Stock Shortage Forecast** — predicts stock-outs before they happen

### 🗺️ District AI Command Center *(Flagship Feature)*
- **Interactive GIS facility map** — color-coded health status for all hospitals, PHCs, and CHCs
- **AI-generated district operational brief** using live facility data
- **Resource redistribution engine** — approve/reject AI-proposed supply transfers
- Real-time critical alert stream with emergency routing
- Bed occupancy and doctor attendance analytics
- Medicine monitoring heatmap across the district

---

## AI Capabilities

All AI features use **Google Gemini 2.5 Flash** via secure server-side Next.js Route Handlers. The API key is never exposed to the browser.

| Feature | Endpoint | Description |
|---|---|---|
| Medicine Stock Forecast | `POST /api/ai/stock-forecast` | Predicts shortage dates, risk levels, and refill quantities |
| Patient Footfall Forecast | `POST /api/ai/patient-forecast` | Forecasts OPD/IPD volumes and wait times |
| Hospital Health Score | `POST /api/ai/health-score` | Generates 0–100 score from occupancy, attendance, alerts |
| Resource Redistribution | `POST /api/ai/resource-redistribution` | Recommends supply transfers between facilities |
| Doctor Consultation Summary | `POST /api/ai/doctor-summary` | Converts clinical notes to structured diagnosis + prescription |
| District Executive Brief | `POST /api/ai/district-summary` | Compiles district-wide operational intelligence report |
| Natural Language Chat | `POST /api/ai/chat` | Query district status in plain English |

> **Graceful Fallback:** If `GEMINI_API_KEY` is not set, all features return high-fidelity demo data computed from real input parameters. The UI is fully functional without an API key.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Authentication | Firebase Authentication |
| Database | Firebase Firestore |
| File Storage | Firebase Storage |
| AI Engine | Google Gemini 2.5 Flash |
| State Management | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Charts | Recharts |
| Theme | next-themes |
| Icons | Lucide React |
| Notifications | Sonner |
| Deployment | Vercel |

---

## Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── api/ai/                   # 7 server-side Gemini AI route handlers
│   ├── dashboard/
│   │   ├── (citizen)/            # Citizen Portal routes
│   │   ├── (doctor)/             # Doctor Workspace routes
│   │   ├── (hospital)/           # Hospital Admin routes
│   │   ├── (pharmacy)/           # Pharmacy routes
│   │   └── (district)/           # District Command Center routes
│   ├── login/register/           # Auth pages
│   └── layout.tsx                # Root layout with metadata
│
├── features/                     # Domain-driven modules
│   ├── ai/                       # AI Engine
│   │   ├── components/           # 6 reusable AI UI components
│   │   ├── hooks/useAI.ts        # TanStack Query hooks for all AI features
│   │   ├── prompts/              # 7 structured Gemini prompts
│   │   ├── services/             # 7 AI service classes with fallbacks
│   │   └── utils/gemini.ts       # Server-side Gemini client
│   ├── citizen/                  # Citizen domain
│   ├── doctor/                   # Doctor domain
│   ├── hospital/                 # Hospital Admin domain
│   ├── pharmacy/                 # Pharmacy domain
│   └── district/                 # District domain
│
├── firebase/                     # Firebase config
│   ├── client.ts                 # Client SDK init
│   ├── admin.ts                  # Admin SDK init (server only)
│   └── types.ts                  # Firestore document types
│
├── providers/                    # Context providers
│   ├── AuthProvider.tsx          # Firebase Auth state
│   └── QueryProvider.tsx         # TanStack Query client
│
└── middleware.ts                 # Edge auth + role-based routing
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Firebase project with Authentication and Firestore enabled
- (Optional) A Google Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/arogyaOS.git
cd arogyaOS

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase and Gemini credentials

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# App URL (used for metadata canonical URL)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Client SDK (browser-safe)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin SDK (server-only, never exposed to browser)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Gemini AI (server-only — optional, enables live AI features)
GEMINI_API_KEY=...
```

> **Security Note:** Variables without `NEXT_PUBLIC_` prefix are **server-only** and never bundled into client JavaScript.

---

## Demo Credentials

For hackathon judging, use these pre-configured demo accounts:

| Role | Email | Password | Access |
|---|---|---|---|
| 🧑 Citizen | `citizen@demo.arogyaos.in` | `Demo@2026` | Health portal, appointments, family records |
| 👨‍⚕️ Doctor | `doctor@demo.arogyaos.in` | `Demo@2026` | Patient queue, consultation, AI summaries |
| 🏥 Hospital Admin | `hospital@demo.arogyaos.in` | `Demo@2026` | Full hospital management workspace |
| 💊 Pharmacist | `pharmacy@demo.arogyaos.in` | `Demo@2026` | Inventory, dispensing, AI stock forecast |
| 🗺️ District Officer | `district@demo.arogyaos.in` | `Demo@2026` | **District Command Center + all AI features** |

> **Demo note:** District data (facilities, alerts, AI recommendations) is auto-seeded on first load. No manual setup required.

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Required environment variables in Vercel Dashboard:**

All variables from `.env.example` must be added to your Vercel project settings under **Settings → Environment Variables**.

### Vercel Compatibility Checklist

- [x] Next.js 15 App Router — fully supported
- [x] Edge Middleware — uses `NextResponse`, no Node.js APIs
- [x] Server Components — uses `fetch` API only
- [x] Image Optimization — configured in `next.config.ts`
- [x] Environment variables — all sensitive vars are server-only
- [x] API Routes — standard Next.js route handlers
- [x] No custom server — pure Next.js serverless

---

## Security

| Concern | Implementation |
|---|---|
| API Key exposure | `GEMINI_API_KEY` only in server-side route handlers |
| Auth enforcement | Edge middleware validates Firebase JWT on every `/dashboard/*` request |
| Role-based routing | Middleware redirects users to role-appropriate paths |
| HTTP security headers | X-Frame-Options, HSTS, X-Content-Type-Options in `next.config.ts` |
| Firestore rules | Recommended: restrict reads/writes to authenticated users with matching UID |
| Input validation | Zod schemas on all forms; services validate before Gemini calls |
| Session expiry | Middleware checks `exp` claim on Firebase tokens |

### Recommended Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /district_facilities/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'district_admin';
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Project Structure (abbreviated)

```
arogyaOS/
├── scripts/
│   └── seedDemo.ts              # Demo data reference + seed guidance
├── src/
│   ├── app/
│   │   ├── api/ai/              # 7 Gemini route handlers
│   │   ├── dashboard/           # 40+ pages across 5 roles
│   │   └── (auth pages)
│   ├── features/
│   │   ├── ai/                  # Complete AI engine module
│   │   ├── citizen/
│   │   ├── doctor/
│   │   ├── hospital/
│   │   ├── pharmacy/
│   │   └── district/
│   └── middleware.ts            # Edge auth guard
├── .env.example                 # Environment variable template
├── next.config.ts               # Performance + security config
└── package.json
```

---

## 5–7 Minute Demo Flow

1. **Landing Page** (30s) — Show the hero, features overview
2. **District Command Center** (2min) — Login as District Officer → Show GIS map → Click facility pin → View AI recommendations → Approve redistribution proposal
3. **Pharmacy AI Forecast** (1min) — Login as Pharmacist → Navigate to AI Forecast → Run forecast → Show shortage predictions
4. **Doctor AI Summary** (1min) — Login as Doctor → Navigate to AI Summary → Paste clinical notes → Generate → Show diagnosis + prescription
5. **Hospital Health Score** (30s) — Navigate to AI Health Score → Adjust sliders → Show computed score with factor breakdown
6. **AI Chat** (1min) — Go to District AI → Operations Assistant → Type "Which hospitals are running low on insulin?" → Show structured response
7. **Architecture Walkthrough** (30s) — Briefly show server-only Gemini calls, role-based routing

---

## Judge Q&A

**Q: Is the AI actually connected to Gemini?**
A: Yes — all AI calls go through server-side Next.js Route Handlers that call the Gemini 2.5 Flash API. The `GEMINI_API_KEY` is never exposed to the browser. If the key isn't set, services return high-fidelity computed fallback data.

**Q: How is data security handled?**
A: Firebase JWT tokens are validated on every dashboard request via Edge Middleware. Role-based routing prevents cross-role access. Gemini API key is server-only. HTTP security headers (HSTS, X-Frame-Options) are enforced in `next.config.ts`.

**Q: Can this scale to real production use?**
A: Yes. The architecture is Vercel-native serverless, Firebase scales automatically, and TanStack Query handles optimistic updates and cache invalidation. The AI layer can be swapped to Cloud Run or Vertex AI for enterprise scale.

**Q: What real-world problem does this solve?**
A: India's public health system loses ₹2,000+ crore annually due to medicine wastage and stock-outs. ArogyaOS uses predictive AI to flag shortages 14–30 days in advance and automates inter-facility redistribution to prevent stock-outs before they happen.

**Q: How are the AI prompts designed?**
A: All 7 prompts instruct Gemini to return strictly structured JSON with typed schemas. This makes parsing deterministic and the UI can render meaningful structured content (cards, tables, badges) instead of raw text.
