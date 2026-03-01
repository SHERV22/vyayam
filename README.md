# VYAYAM

Production-ready workout planner and tracker built with React, TypeScript, Firebase, and Zustand.

## Features

- Firebase Authentication (email/password): register, login, logout, persistent auth state
- Guest mode: use full app without signup/login (local persistent storage)
- Protected routes with `AuthContext`, `useAuth`, and `PrivateRoute`
- Program builder with date range and per-day exercise planning
- Exercise management: add, edit, delete, duplicate previous day
- Workout execution mode with set progression and rest/exercise countdown timers
- Workout log persistence and progress dashboard with streak + calendar-style view

## Tech Stack

- React 19 + TypeScript + Vite
- React Router v6
- Firebase Auth + Firestore
- Zustand for workout session state

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and provide Firebase project values:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

3. Start development server:

```bash
npm run dev
```

Guest mode works even without Firebase credentials. Use “Continue as Guest” on login/register.

4. Build production bundle:

```bash
npm run build
```

## Routes

- `/login`
- `/register`
- `/dashboard`
- `/programs`
- `/programs/:id`
- `/workout/:programId/:dayId`
- `/progress`

All routes except `/login` and `/register` are protected.
