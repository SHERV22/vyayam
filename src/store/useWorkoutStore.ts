import { create } from 'zustand'

interface WorkoutState {
  currentExerciseIndex: number
  currentSet: number
  isResting: boolean
  timer: number
  workoutStarted: boolean
  workoutStartTime: number | null
  startWorkout: () => void
  nextSet: (totalSets: number) => void
  nextExercise: (exerciseCount: number) => void
  startRest: (seconds: number) => void
  resetWorkout: () => void
  setTimer: (seconds: number) => void
  completeWorkout: () => void
}

const initialState = {
  currentExerciseIndex: 0,
  currentSet: 1,
  isResting: false,
  timer: 0,
  workoutStarted: false,
  workoutStartTime: null,
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  ...initialState,
  startWorkout: () =>
    set(() => ({
      ...initialState,
      workoutStarted: true,
      workoutStartTime: Date.now(),
    })),
  nextSet: (totalSets: number) =>
    set((state) => {
      if (state.currentSet < totalSets) {
        return { currentSet: state.currentSet + 1 }
      }

      return state
    }),
  nextExercise: (exerciseCount: number) =>
    set((state) => {
      if (state.currentExerciseIndex + 1 >= exerciseCount) {
        return state
      }

      return {
        currentExerciseIndex: state.currentExerciseIndex + 1,
        currentSet: 1,
        isResting: false,
        timer: 0,
      }
    }),
  startRest: (seconds: number) =>
    set(() => ({
      isResting: true,
      timer: seconds,
    })),
  resetWorkout: () => set(() => ({ ...initialState })),
  setTimer: (seconds: number) => set(() => ({ timer: seconds })),
  completeWorkout: () =>
    set(() => ({
      ...initialState,
    })),
}))
