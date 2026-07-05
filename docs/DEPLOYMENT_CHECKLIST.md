# ArogyaOS Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] `npm run lint` passes with 0 errors and 0 warnings
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm run build` completes successfully (Exit Code: 0)
- [ ] No `console.log` statements in production code (only `console.warn` for fallbacks)
- [ ] No hardcoded API keys or secrets in source code

### ✅ Environment Variables
- [ ] `.env.local` created from `.env.example`
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` set
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` set
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` set
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` set
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` set
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` set
- [ ] `FIREBASE_PROJECT_ID` set (server-only)
- [ ] `FIREBASE_CLIENT_EMAIL` set (server-only)
- [ ] `FIREBASE_PRIVATE_KEY` set (server-only)
- [ ] `GEMINI_API_KEY` set (server-only, optional for demo)
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL

### ✅ Firebase Setup
- [ ] Firebase project created at console.firebase.google.com
- [ ] Authentication enabled (Email/Password + Google sign-in)
- [ ] Firestore database created (region: asia-south1 for India)
- [ ] Firestore security rules configured (see README)
- [ ] Storage bucket created (if file uploads needed)
- [ ] Firebase Admin SDK service account key downloaded

### ✅ Demo Accounts
- [ ] Create `citizen@demo.arogyaos.in` with role: `citizen`
- [ ] Create `doctor@demo.arogyaos.in` with role: `doctor`
- [ ] Create `hospital@demo.arogyaos.in` with role: `hospital_admin`
- [ ] Create `pharmacy@demo.arogyaos.in` with role: `pharmacist`
- [ ] Create `district@demo.arogyaos.in` with role: `district_admin`
- [ ] Set custom claims for each account via Firebase Admin SDK

### ✅ Vercel Deployment
- [ ] Vercel project created and linked to GitHub repo
- [ ] All environment variables added to Vercel project settings
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Node.js version: 20.x
- [ ] Deploy to production and verify at production URL
- [ ] Test all 5 role-based login flows on production URL
- [ ] Verify district data seeds on first load

### ✅ Post-Deployment Verification
- [ ] Landing page loads and animations work
- [ ] Login/Register forms work
- [ ] Google OAuth sign-in works (add production domain to Firebase Authorized Domains)
- [ ] District Command Center loads with seeded facilities
- [ ] AI features return data (with or without Gemini key)
- [ ] Mobile responsive layout verified
- [ ] Dark mode toggle works

---

## Custom Claims Setup (Firebase Admin SDK)

To set user roles, run this Node.js snippet with your Admin SDK credentials:

```javascript
const admin = require('firebase-admin');

// Initialize admin SDK
admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json')
});

async function setRole(email, role) {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { role });
  console.log(`Set role '${role}' for ${email}`);
}

// Set roles for demo accounts
setRole('district@demo.arogyaos.in', 'district_admin');
setRole('hospital@demo.arogyaos.in', 'hospital_admin');
setRole('doctor@demo.arogyaos.in', 'doctor');
setRole('pharmacy@demo.arogyaos.in', 'pharmacist');
setRole('citizen@demo.arogyaos.in', 'citizen');
```

---

## Hackathon Demo Checklist

### Before Demo
- [ ] Production build tested and working
- [ ] All 5 demo account passwords verified
- [ ] District data seeded (login as district_admin once)
- [ ] AI Stock Forecast tested (pharmacy account)
- [ ] Doctor AI Summary tested with sample notes
- [ ] Health Score gauge verified (hospital account)
- [ ] AI Chat panel tested with sample queries
- [ ] Screen resolution set to 1440px wide for best layout
- [ ] Dark mode enabled (looks best for demo)
- [ ] Browser cache cleared

### During Demo (5–7 min)
1. **[0:00–0:30]** Show landing page → click "Launch Platform"
2. **[0:30–2:30]** District Command Center
   - Login as `district@demo.arogyaos.in`
   - Show GIS map with facility markers
   - Click a red-status facility pin → view capacity drawer
   - Show AI recommendations panel → click "Mark Reviewed"
   - Navigate to Resource Redistribution → click "Approve Transfer"
   - Show AI Intelligence Hub → District Brief tab
3. **[2:30–3:30]** Pharmacy AI Forecast
   - Login as `pharmacy@demo.arogyaos.in`
   - Go to AI Forecast page
   - Click "Run AI Forecast" → show shortage predictions with risk levels
4. **[3:30–4:30]** Doctor AI Summary
   - Login as `doctor@demo.arogyaos.in`
   - Go to AI Summary page → click "Load Sample" → "Generate"
   - Show diagnosis, symptoms, and prescription draft output
5. **[4:30–5:00]** Hospital Health Score
   - Login as `hospital@demo.arogyaos.in`
   - Go to AI Health Score → adjust sliders → Calculate
   - Show arc gauge and factor breakdown
6. **[5:00–6:00]** AI Chat
   - Go to District AI → Operations Assistant tab
   - Type: "Which hospitals are running low on insulin?"
   - Show structured response with insight cards
7. **[6:00–6:30]** Wrap up — mention tech stack, security, scalability
