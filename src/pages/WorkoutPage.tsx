import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDayById, saveWorkoutLog } from '../firebase/firestore'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { useWorkoutStore } from '../store/useWorkoutStore'
import type { DayPlan } from '../types'

export const WorkoutPage = () => {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()
  const { programId, dayId } = useParams()

  const {
    currentExerciseIndex,
    currentSet,
    isResting,
    timer,
    workoutStarted,
    workoutStartTime,
    startWorkout,
    nextSet,
    nextExercise,
    startRest,
    resetWorkout,
    setTimer,
    completeWorkout,
  } = useWorkoutStore()

  const [day, setDay] = useState<DayPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [finishing, setFinishing] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [completedExercises, setCompletedExercises] = useState(0)

  const exercises = day?.exercises ?? []
  const currentExercise = exercises[currentExerciseIndex]

  useEffect(() => {
    const loadDay = async () => {
      if (!dayId) {
        setError('Day id is missing')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const data = await getDayById(dayId)

        if (!data) {
          setError('Workout day not found')
          return
        }

        setDay(data)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load workout day')
      } finally {
        setLoading(false)
      }
    }

    void loadDay()

    return () => {
      resetWorkout()
    }
  }, [dayId, resetWorkout])

  const handleFinishWorkout = useCallback(async () => {
    if (!user || !programId || !day) {
      return
    }

    try {
      setFinishing(true)
      const duration = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 1000) : 0

      await saveWorkoutLog({
        userId: user.uid,
        programId,
        date: day.date,
        completedExercises,
        duration,
      })

      completeWorkout()
      setShowComplete(true)
      success('Workout saved!')
    } catch (finishError) {
      const message = finishError instanceof Error ? finishError.message : 'Unable to save workout'
      setError(message)
      showError(message)
    } finally {
      setFinishing(false)
    }
  }, [completeWorkout, completedExercises, day, programId, user, workoutStartTime])

  const goToNextExercise = useCallback(() => {
    const nextIndex = currentExerciseIndex + 1

    if (nextIndex >= exercises.length) {
      void handleFinishWorkout()
      return
    }

    nextExercise(exercises.length)
    const next = exercises[nextIndex]

    if (next?.duration) {
      setTimer(next.duration)
    } else {
      setTimer(0)
    }
  }, [currentExerciseIndex, exercises, handleFinishWorkout, nextExercise, setTimer])

  const handleCompleteSet = useCallback(() => {
    if (!currentExercise) {
      return
    }

    if (currentSet < currentExercise.sets) {
      if (currentExercise.rest > 0) {
        startRest(currentExercise.rest)
      } else {
        nextSet(currentExercise.sets)
        if (currentExercise.duration) {
          setTimer(currentExercise.duration)
        }
      }
      return
    }

    setCompletedExercises((value) => value + 1)
    goToNextExercise()
  }, [currentExercise, currentSet, goToNextExercise, nextSet, setTimer, startRest])

  const handleSkipExercise = () => {
    goToNextExercise()
  }

  const handleStartWorkout = () => {
    if (!exercises.length) {
      return
    }

    setCompletedExercises(0)
    startWorkout()

    if (exercises[0].duration) {
      setTimer(exercises[0].duration ?? 0)
    }
  }

  useEffect(() => {
    if (!workoutStarted || timer <= 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setTimer(timer - 1)
    }, 1000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [setTimer, timer, workoutStarted])

  useEffect(() => {
    if (!workoutStarted || timer !== 0 || !currentExercise) {
      return
    }

    if (isResting) {
      useWorkoutStore.setState({ isResting: false })
      nextSet(currentExercise.sets)

      if (currentExercise.duration) {
        setTimer(currentExercise.duration)
      }

      return
    }

    if (currentExercise.duration) {
      handleCompleteSet()
    }
  }, [currentExercise, handleCompleteSet, isResting, nextSet, setTimer, timer, workoutStarted])

  if (loading) {
    return <p className="muted">Loading workout...</p>
  }

  if (error) {
    return <p className="error-text">{error}</p>
  }

  if (!day || !currentExercise) {
    return (
      <section className="card">
        <h2>Workout</h2>
        <p className="muted">No exercises found for this day. Add exercises in program details first.</p>
        <Link className="primary-button" to={`/programs/${programId ?? ''}`}>
          Back to Program
        </Link>
      </section>
    )
  }

  if (showComplete) {
    return (
      <section className="card complete-card">
        <div className="checkmark">✓</div>
        <h2>Workout Complete</h2>
        <p className="muted">Great session. Keep the streak alive.</p>
        <div className="row-actions">
          <button className="primary-button" onClick={() => navigate('/progress')}>
            View Progress
          </button>
          <button className="ghost-button" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className="page-stack">
      <section>
        <h2>Workout Execution</h2>
        <p className="muted">{day.date}</p>
      </section>

      <section className="card workout-card fade-in">
        <h3>{currentExercise.name}</h3>
        <p className="muted">
          Set {currentSet}/{currentExercise.sets}
        </p>

        <div className="workout-metric">
          {isResting ? (
            <>
              <p className="metric-label">Rest Timer</p>
              <p className="metric-value">{timer}s</p>
            </>
          ) : currentExercise.duration ? (
            <>
              <p className="metric-label">Exercise Timer</p>
              <p className="metric-value">{timer}s</p>
            </>
          ) : (
            <>
              <p className="metric-label">Target Reps</p>
              <p className="metric-value">{currentExercise.reps ?? 0}</p>
            </>
          )}
        </div>

        {currentExercise.notes ? <p className="muted">{currentExercise.notes}</p> : null}

        {!workoutStarted ? (
          <button className="primary-button" onClick={handleStartWorkout}>
            Start Workout
          </button>
        ) : (
          <div className="row-actions">
            <button className="primary-button" onClick={handleCompleteSet} disabled={finishing || isResting}>
              Complete Set
            </button>
            <button className="ghost-button" onClick={handleSkipExercise} disabled={finishing || isResting}>
              Skip Exercise
            </button>
            <button
              className="ghost-button"
              onClick={() => {
                void handleFinishWorkout()
              }}
              disabled={finishing}
            >
              {finishing ? 'Finishing...' : 'Finish Workout'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
