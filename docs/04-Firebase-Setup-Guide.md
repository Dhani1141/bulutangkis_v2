---
title: BukkuTangkis - Firebase Setup Guide
date: 2026-09-30
tags:
  - firebase
  - firestore
  - setup-guide
  - deployment
  - hosting
  - configuration
aliases:
  - Firebase Setup Guide
  - Firebase Configuration
---

# 🔥 BukkuTangkis — Firebase Setup Guide

This guide walks you through connecting BukkuTangkis to **Google Firebase Firestore** from scratch, configuring development and production security rules, and optionally deploying the application to **Firebase Hosting**.

---

## 📋 Prerequisites

Before proceeding, ensure you have:
1. A **Google Account** to access the Firebase Console.
2. **Node.js** (v18.0.0 or higher) and **npm** installed on your workstation.
3. The BukkuTangkis repository cloned and dependencies installed (`npm install`).

---

## 🛠️ Step 1: Create a Firebase Project

1. Open your web browser and navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** (or **"Create a project"**).
3. Enter your project name (e.g., `bukkutangkis-app`) and click **Continue**.
4. *(Optional)* **Google Analytics**:
   - For a casual club or local tournament app, you can disable Google Analytics to simplify setup.
   - If enabled, select or create an Analytics account.
5. Click **Create project** and wait for Google Cloud to provision the resources. Once ready, click **Continue**.

---

## 🗄️ Step 2: Enable Cloud Firestore Database

1. In the left navigation sidebar of the Firebase Console, go to **Build** $\rightarrow$ **Firestore Database**.
2. Click the **"Create database"** button.
3. **Database Location**:
   - Select a regional location geographically closest to your badminton courts for the lowest network latency.
   - *Recommended for Southeast Asia*: `asia-southeast2` (Jakarta) or `asia-southeast1` (Singapore).
   - *Recommended for North America*: `us-central1` (Iowa).
4. **Security Rules Mode**:
   - Select **Start in test mode** for immediate local development. This enables open read/write access for 30 days while you set up the app.
   - Click **Next** and then **Enable**.

---

## 🔑 Step 3: Register Web App & Obtain Config

1. In the Firebase Console, navigate to **Project settings** (click the gear icon ⚙️ in the top-left sidebar).
2. Under the **General** tab, scroll down to the **"Your apps"** card.
3. Click the **Web** icon (`</>`) to register a new web application.
4. **App Nickname**: Enter a descriptive name such as `bukkutangkis-web`.
5. *(Optional)* Leave **"Also set up Firebase Hosting"** unchecked for now (we cover hosting in [[#Step 6 (Optional): Deploy to Firebase Hosting|Step 6]]).
6. Click **Register app**.
7. Firebase will display your `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-EXAMPLE_KEY_HERE-abcdefg",
  authDomain: "bukkutangkis-app.firebaseapp.com",
  projectId: "bukkutangkis-app",
  storageBucket: "bukkutangkis-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};
```

---

## 📝 Step 4: Configure `src/firebase.js`

Open `src/firebase.js` in your project editor and replace the placeholder values with the keys from your Firebase Console.

### Current File Structure (`src/firebase.js`)

```javascript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// ┌─────────────────────────────────────────────────────┐
// │  Replace with your Firebase project configuration   │
// │  See docs/04-Firebase-Setup-Guide.md for details    │
// └─────────────────────────────────────────────────────┘
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export default app
```

### 💡 Best Practice: Using Environment Variables (`.env.local`)

To avoid committing sensitive credentials to public GitHub repositories, you can use Vite environment variables:

1. Create a `.env.local` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyD-EXAMPLE_KEY_HERE-abcdefg
   VITE_FIREBASE_AUTH_DOMAIN=bukkutangkis-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=bukkutangkis-app
   VITE_FIREBASE_STORAGE_BUCKET=bukkutangkis-app.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
   ```
2. Update `src/firebase.js`:
   ```javascript
   const firebaseConfig = {
     apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId:             import.meta.env.VITE_FIREBASE_APP_ID,
   }
   ```

---

## 🔒 Step 5: Set Firestore Security Rules

Navigate to **Firestore Database** $\rightarrow$ **Rules** in the Firebase Console.

### Development Rules (Testing)
For local development and testing during friendly sessions, use open access rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Open read and write access for development
    match /sessions/{sessionId} {
      allow read, write: if true;
    }
  }
}
```

### Production Rules (Hardened)
Before releasing BukkuTangkis to public club members, enforce collection constraints to prevent unauthorized tampering or deletion:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      // Allow reading any session document
      allow read: if true;

      // Allow creating sessions with required fields
      allow create: if request.resource.data.keys().hasAll(['createdAt', 'fieldCount', 'status'])
                    && request.resource.data.status == 'active';

      // Allow updating existing sessions (logging matches or ending sessions)
      allow update: if resource != null;

      // Prevent accidental document deletion
      allow delete: if false;
    }
  }
}
```

Click **Publish** to apply the rules immediately.

---

## 🌐 Step 6 (Optional): Deploy to Firebase Hosting

You can deploy BukkuTangkis to Google's worldwide CDN using Firebase Hosting.

### 1. Install the Firebase CLI
Open your terminal and install the CLI globally:
```bash
npm install -g firebase-tools
```

### 2. Login to Google
Authenticate your CLI session:
```bash
firebase login
```

### 3. Initialize Firebase Hosting in the Project
Run the initialization command from the project root (`bukkutangkis v2`):
```bash
firebase init hosting
```

When prompted:
- **Project Setup**: Choose **"Use an existing project"** and select your project (`bukkutangkis-app`).
- **What do you want to use as your public directory?**: Type `dist` (Vite's build output folder).
- **Configure as a single-page app (rewrite all urls to /index.html)?**: Type `Yes` (`y`).
- **Set up automatic builds and deploys with GitHub?**: Type `No` (`N`) (or `y` if you want GitHub Actions).
- **File dist/index.html already exists. Overwrite?**: Type `No` (`N`).

### 4. Build and Deploy
Execute a production build and deploy to Firebase Hosting:
```bash
# 1. Build optimized production bundle
npm run build

# 2. Deploy to Firebase Hosting
firebase deploy --only hosting
```

Upon completion, Firebase CLI will provide your live hosting URL:
```text
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/bukkutangkis-app/overview
Hosting URL: https://bukkutangkis-app.web.app
```

---

## ❓ Troubleshooting Common Errors

### 1. `FirebaseError: Missing or insufficient permissions`
- **Cause**: Your Firestore test rules expired (30-day limit) or rules are set to `allow read, write: if false;`.
- **Solution**: Go to Firebase Console $\rightarrow$ Firestore $\rightarrow$ Rules and ensure read/write permissions are allowed as described in [[#Step 5 Set Firestore Security Rules|Step 5]].

### 2. `Firebase: Error (auth/api-key-not-valid)`
- **Cause**: The placeholder values in `src/firebase.js` were not replaced or `.env.local` variables are missing.
- **Solution**: Check that `apiKey` starts with `AIzaSy...` and does not contain `"YOUR_API_KEY"`.

### 3. "Failed to create session" on Setup Page
- **Cause**: Firestore database has not been enabled or the project ID does not match.
- **Solution**: Verify in Firebase Console that Cloud Firestore Database is activated and initialized.

### 4. Stale Session Stuck in Browser
- **Cause**: `localStorage` retains an old session ID that was deleted from Firestore.
- **Solution**: Open browser Developer Tools (`F12`), switch to the **Application** / **Storage** tab, choose **Local Storage**, and delete `currentSessionId`, then reload the page.

---

## 🔗 Related Documentation

- 🏸 **[[00-Project-Overview]]** — Architecture overview, tech stack, and feature roadmap.
- 🏗️ **[[01-System-Architecture]]** — Firestore schema and hybrid state management details.
- 🧮 **[[02-Matchmaking-Logic]]** — Priority queue algorithm and rotation mechanics.
- 📜 **[[03-Changelog]]** — Development milestones across all 6 phases.
