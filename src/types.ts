export interface Exercise {
  id: string
  name: string
  sets: number
  reps?: number
  duration?: number
  rest: number
  notes?: string
}

export interface Program {
  id: string
  userId: string
  title: string
  startDate: string
  endDate: string
  createdAt?: Date
}

export interface DayPlan {
  id: string
  programId: string
  date: string
  exercises: Exercise[]
}

export interface WorkoutLog {
  id: string
  userId: string
  programId: string
  date: string
  completedExercises: number
  duration: number
  createdAt?: Date
}

export interface DashboardStats {
  totalWorkouts: number
  currentStreak: number
  weeklyWorkouts: number
}
