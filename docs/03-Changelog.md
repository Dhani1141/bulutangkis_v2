---
title: BukkuTangkis - Changelog
date: 2026-09-30
tags:
  - changelog
  - release-notes
  - version-history
  - bukkutangkis
aliases:
  - Changelog
  - Release Notes
---

# 📜 BukkuTangkis — Changelog

All notable changes to the **BukkuTangkis** project are documented in this file. The project adheres to [Semantic Versioning](https://semver.org/).

---

## 🚀 [v1.0.0] — 2026-09-30

### 🏆 Initial Production Release (All 6 Phases Completed)

BukkuTangkis v1.0.0 is the foundational release of the automated badminton matchmaking and court management web application. The release delivers a complete end-to-end tournament and social session workflow across 6 planned phases.

---

### 📦 Phase 1: Project Scaffolding & Design System
- **Framework & Tooling**:
  - Bootstrapped single-page application using **React 18** and **Vite 5**.
  - Configured ES module bundling and fast HMR developer workflow.
  - Added **React Router DOM v6** for view routing.
- **Design System & Tailwind CSS**:
  - Configured **Tailwind CSS 3** with extended dark-mode palette (`dark-900: #0a0a0f`, `dark-800: #12121a`, `dark-700: #1a1a2e`, `dark-600: #242438`).
  - Added vibrant neon accents (`accent-blue`, `accent-purple`, `accent-cyan`, `accent-green`, `accent-orange`, `accent-pink`).
  - Built custom glassmorphic utility classes:
    - `.glass`: 16px backdrop blur with translucent borders (`rgba(255, 255, 255, 0.05)`).
    - `.glass-strong`: 24px backdrop blur for modal dialogs and overlays.
    - `.glass-input`: Modern rounded form fields with focus glow.
    - `.glass-button`, `.glass-button-primary`, `.glass-button-danger`, `.glass-button-success`: Reusable tactile buttons with interactive scale animations.
  - Added ambient background animations: `animate-float`, `animate-glow`, and `animate-pulse-slow`.
- **Iconography & Assets**:
  - Integrated **Lucide React** icon library for feather-weight SVG icons.
- **Firebase Initialization**:
  - Configured Firebase v10 SDK in `src/firebase.js` with exported Firestore database instance.
- **Atomic Components**:
  - Created `GlassCard.jsx` container component with entrance and hover animations.
  - Created `PlayerInput.jsx` with numbered indexing and dynamic removal triggers.

---

### 📝 Phase 2: Setup Page & Player Registration
- **Date-Derived Session IDs**:
  - Implemented automatic daily session ID generation (`Session-DD-MM-YYYY`, e.g., `Session-30-09-2026`) in `src/pages/SetupPage.jsx`.
- **Court Allocation Toggle**:
  - Added selectable 1-Court or 2-Court configurations with dynamic badge indicators.
- **Participant Registration**:
  - Dynamic player list allowing arbitrary number of participants (minimum 4).
  - Add/remove controls with automatic index renumbering.
- **Strict Client-Side Validation**:
  - Minimum 4 players requirement for single-court play.
  - Enforced **even player count** to guarantee clean 2v2 doubles pairings.
  - Unique name validation (case-insensitive deduplication).
  - Minimum 8 players validation when 2 courts are enabled (4 per court).
- **Automated Team Generation**:
  - Integrated `generateTeams()` using the [[02-Matchmaking-Logic#1. Team Generation (`generateTeams`)|Fisher-Yates shuffle algorithm]] to randomly pair players into initial doubles squads.
  - Balanced split algorithm for dual-court setups.
- **Firestore Document Provisioning**:
  - Implemented `createSession()` in `src/lib/firebaseHelpers.js` to create the initial document under `sessions/{sessionId}`.
  - Persisted `currentSessionId` and `fieldCount` to browser `localStorage` for reload survival.

---

### ⚡ Phase 3: Match Dashboard & Fair Rotation Engine
- **Fair Rotation Matchmaking Engine**:
  - Engineered priority queue logic in `src/lib/matchmaking.js`:
    - Priority queue comparator sorting by `matchesPlayed ASC`, then `lastPlayedOrder ASC`.
    - Guarantees the two teams with the least court time and oldest play timestamps are selected next (`teamA` and `teamB`).
    - After match completion, active teams receive `+1` match count and jump to the back of the queue.
- **"Waiting Room - Next Up" for Odd Teams**:
  - Seamless handling for odd team counts (e.g., 3 teams = 6 players, 5 teams = 10 players).
  - The team at queue position `[2]` is designated as the **Waiting Room Team** and displayed prominently in the UI.
  - Mathematically guarantees that the waiting team plays in the very next match.
- **Live Match Court Interface**:
  - Visual 2v2 team match display with player names.
  - Non-restrictive score inputs allowing any rally score (e.g. 21, 30, deuce).
- **Winner Evaluation**:
  - Implemented `determineWinner()` using arithmetic comparison `Math.max(scoreA, scoreB)`.
  - Tie validation prevents submission until a winner is declared.
- **Lightweight Cloud Persistence**:
  - Built `submitMatchResult()` in `src/lib/firebaseHelpers.js`.
  - Uses Firestore `increment(1)` to update `total_matches` for all 4 players and `total_wins` for the 2 winners.
  - Discards raw point scores after evaluation to minimize bandwidth and latency.
- **Queue Rehydration**:
  - Implemented `deriveTeamStats()` to reconstruct team metrics and priority queue order if the page is refreshed during a session.

---

### 🛡️ Phase 4: Session Termination & Safety Safeguards
- **In-Progress Match Interceptor**:
  - Added detection logic on the "End Session" action to check if a match is actively in progress.
- **Safety Warning Modal (`EndSessionModal.jsx`)**:
  - Designed translucent overlay dialog with warning iconography.
  - Provides two distinct, safe options:
    1. **"Wait"**: Dismisses the modal and allows the active game to finish naturally.
    2. **"Cancel Match & End"**: Aborts the active game without logging stats and immediately marks the session as finished.
- **Session Finalization**:
  - Implemented `endFieldSession()` in `src/lib/firebaseHelpers.js` to update field status to `'ended'` in Firestore.
  - Automatically transitions the host to the leaderboard page.

---

### 📊 Phase 5: Dynamic Leaderboard & Statistics
- **Auto-Calculated Standings**:
  - Automatically fetches the finalized session document via `getSession()`.
  - Calculates **Win Rate (%)** for each player:
    $$\text{Win Rate} = \left(\frac{\text{total\_wins}}{\text{total\_matches}}\right) \times 100$$
  - Multi-tier sorting: primary sort by **Win Rate (%)** descending, secondary sort by **Total Wins**, tertiary sort by **Total Matches**.
- **Interactive Podium & Medals**:
  - Visual podium cards for 1st Place (Gold 🥇), 2nd Place (Silver 🥈), and 3rd Place (Bronze 🥉).
  - Glowing colored borders corresponding to rank tiers.
- **Animated Numerical Counters**:
  - Integrated `react-countup` to roll up win percentages, match counts, and victory totals upon page entrance.
- **Session Continuity & Navigation**:
  - Read `currentSessionId` from `localStorage` on mount to support direct bookmarking or sharing.
  - "Start New Session" resets `localStorage` and returns to `/`.
  - "Back to Match" button to resume if the session is still marked as active.

---

### 📚 Phase 6: Obsidian Documentation Suite
- Created a fully linked, production-grade documentation vault located in `docs/`:
  - **[[00-Project-Overview]]**: Project background, executive summary, tech stack table, feature breakdown, and high-level architecture Mermaid diagram.
  - **[[01-System-Architecture]]**: Component hierarchy tree, complete TypeScript/JSON Firestore data model, client routing table, and three-tier hybrid state architecture.
  - **[[02-Matchmaking-Logic]]**: In-depth algorithmic documentation covering Fisher-Yates pairing, priority queue mechanics, mathematical anti-starvation proof, unconstrained scoring, and match lifecycle Mermaid flowchart.
  - **[[03-Changelog]]**: Full project changelog with details on all 6 phases and upcoming roadmap.
  - **[[04-Firebase-Setup-Guide]]**: Step-by-step setup tutorial covering Firebase Console project creation, Firestore provisioning, security rules, environment configuration, and Firebase Hosting deployment.
- Optimized for Obsidian with standard YAML frontmatter, wikilinks (`[[...]]`), tags (`#...`), callout blocks (`> [!NOTE]`), and Mermaid diagrams.

---

## 🔮 Future Roadmap & Upcoming Features

### Proposed for v1.1.0:
- [ ] **Singles (1v1) Matchmaking Mode**: Toggle between 2v2 doubles and 1v1 singles during session setup.
- [ ] **Custom Player Handicaps**: Assign handicap points to beginners for closer matchups.
- [ ] **Export Session Summary**: Download match statistics and leaderboard as PDF report or CSV table.
- [ ] **Spectator Live View**: Read-only public URL allowing club members to follow court status on their phones.
- [ ] **Offline PWA Support**: Service Worker caching for seamless local operation if court Wi-Fi disconnects.

---

## 🔗 Related Documentation

- 🏸 **[[00-Project-Overview]]** — High-level feature roadmap and tech stack specification.
- 🏗️ **[[01-System-Architecture]]** — Component hierarchy, data schemas, and state model.
- 🧮 **[[02-Matchmaking-Logic]]** — Algorithmic specifications and rotation logic.
- 🔥 **[[04-Firebase-Setup-Guide]]** — Firebase provisioning, security rules, and hosting guide.
