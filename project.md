You are helping me build a production-ready workout planner web app called:

VYAYAM

Meaning: “Exercise” in Sanskrit/Hindi.
Brand identity: Strong, minimal, disciplined, performance-focused.
Theme: Dark mode default, clean modern UI, fitness-first aesthetic.

--------------------------------------------------
APP PURPOSE
--------------------------------------------------

VYAYAM is a structured workout program builder and workout tracker.

Users can:

1. Create workout programs (weekly, monthly, or custom date range)
2. Add workout days
3. Add exercises per day
4. Set:
   - Sets
   - Reps OR time (seconds)
   - Rest time (seconds)
   - Notes
5. Start workout in "Workout Execution Mode"
6. Track completed workouts
7. View progress and streaks
8. See workouts in a calendar-style layout

No AI.
No social features.
No nutrition tracking.

--------------------------------------------------
AUTHENTICATION
--------------------------------------------------

Use Firebase Authentication:

- Email/Password signup
- Login
- Logout
- Persistent auth state

Create:
- AuthContext
- useAuth hook
- PrivateRoute wrapper

Protect all routes except /login and /register.

--------------------------------------------------
FIRESTORE DATABASE STRUCTURE
--------------------------------------------------

Collections:

users/{userId}
  - name
  - email
  - createdAt

programs/{programId}
  - userId
  - title
  - startDate
  - endDate
  - createdAt

days/{dayId}
  - programId
  - date
  - exercises (array of exercise objects)

workoutLogs/{logId}
  - userId
  - programId
  - date
  - completedExercises
  - duration
  - createdAt

Exercise object structure:

{
  id: string,
  name: string,
  sets: number,
  reps?: number,
  duration?: number,
  rest: number,
  notes?: string
}

--------------------------------------------------
ROUTES
--------------------------------------------------

/login
/register
/dashboard
/programs
/programs/:id
/workout/:programId/:dayId
/progress

Use React Router v6.

--------------------------------------------------
CORE FEATURES
--------------------------------------------------

1. Dashboard
- Show total workouts completed
- Show current streak
- Show active program
- Quick "Start Today’s Workout" button

2. Create Program Page
- Form for title + date range
- Create Firestore document

3. Program Details Page
- Display days in date range
- Add exercises to each day
- Duplicate Day feature
- Edit/Delete exercises
- Quick Add Exercise button

4. Workout Execution Mode
- Show one exercise at a time
- Show:
   - Exercise name
   - Current set (e.g., 2/4)
   - Reps or countdown timer
   - Rest countdown timer
- Buttons:
   - Complete Set
   - Skip Exercise
   - Finish Workout
- Automatically move to next set
- Automatically start rest timer
- Smooth transitions between exercises

Store workout session state in Zustand:

{
  currentExerciseIndex,
  currentSet,
  isResting,
  timer,
  workoutStarted,
  workoutStartTime
}

5. Workout Completion
- Save workout log in Firestore
- Calculate duration
- Update streak logic
- Show workout complete animation (confetti or checkmark)

6. Progress Page
- List previous workout logs
- Show:
   - Total workouts
   - Weekly workouts
   - Current streak
   - Calendar-style completed workout view

--------------------------------------------------
STATE MANAGEMENT (ZUSTAND)
--------------------------------------------------

Create useWorkoutStore with:

- startWorkout
- nextSet
- nextExercise
- startRest
- resetWorkout
- setTimer
- completeWorkout

Keep state clean and modular.

--------------------------------------------------
UI REQUIREMENTS
--------------------------------------------------

Brand Name: VYAYAM

Design Direction:
- Dark theme default
- Strong typography
- Minimalistic
- Clean card-based layout
- Fitness aesthetic (bold headings)
- Smooth micro-animations
- Fully responsive (mobile-first)

Navbar:
- Logo: VYAYAM
- Dashboard
- Programs
- Progress
- Logout

--------------------------------------------------
FOLDER STRUCTURE
--------------------------------------------------

/components
/pages
/context
/store
/firebase
/hooks
/utils

Keep logic separated from UI.
Use reusable components.
Use async/await.
Handle errors properly.

--------------------------------------------------
CODE QUALITY
--------------------------------------------------

- Use functional components only
- Modular structure
- Production-style clean code
- Avoid unnecessary re-renders
- Do not overcomplicate
- Write scalable architecture

Assume this is a real production SaaS app.