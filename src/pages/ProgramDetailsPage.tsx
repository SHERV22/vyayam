import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ConfirmModal } from '../components/ConfirmModal'
import { ExerciseForm } from '../components/ExerciseForm'
import {
  deleteExerciseFromDay,
  duplicateDayExercises,
  getDaysByProgram,
  getProgramById,
  upsertDayExercises,
} from '../firebase/firestore'
import { useToast } from '../context/ToastContext'
import type { DayPlan, Exercise, Program } from '../types'
import { formatReadableDate, generateDateRange } from '../utils/date'

export const ProgramDetailsPage = () => {
  const { id } = useParams()
  const { success, error: showError, info } = useToast()

  const [program, setProgram] = useState<Program | null>(null)
  const [days, setDays] = useState<DayPlan[]>([])
  const [formDate, setFormDate] = useState<string | null>(null)
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [deletingExercise, setDeletingExercise] = useState<{ dayId: string; exerciseId: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    if (!id) {
      return
    }

    try {
      setLoading(true)
      setError('')
      const [programData, dayData] = await Promise.all([getProgramById(id), getDaysByProgram(id)])

      if (!programData) {
        setError('Program not found')
        return
      }

      const sortedDays = [...dayData].sort((a, b) => (a.date > b.date ? 1 : -1))
      setProgram(programData)
      setDays(sortedDays)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load program')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const dateRange = useMemo(() => {
    if (!program) {
      return []
    }

    return generateDateRange(program.startDate, program.endDate)
  }, [program])

  const dayByDate = useMemo(() => {
    return new Map(days.map((day) => [day.date, day]))
  }, [days])

  const handleSaveExercise = async (date: string, exercise: Exercise) => {
    if (!program) {
      return
    }

    const day = dayByDate.get(date)
    const list = day?.exercises ?? []
    const existingIndex = list.findIndex((item) => item.id === exercise.id)

    const nextExercises =
      existingIndex === -1
        ? [...list, exercise]
        : list.map((item) => (item.id === exercise.id ? exercise : item))

    await upsertDayExercises(program.id, date, nextExercises)
    setFormDate(null)
    setEditingExercise(undefined)
    await load()
    success(existingIndex === -1 ? 'Exercise added.' : 'Exercise updated.')
  }

  const handleEditExercise = (date: string, exercise: Exercise) => {
    setFormDate(date)
    setEditingExercise(exercise)
  }

  const handleDeleteExercise = async () => {
    if (!deletingExercise) {
      return
    }

    try {
      setDeleting(true)
      await deleteExerciseFromDay(deletingExercise.dayId, deletingExercise.exerciseId)
      await load()
      success('Exercise deleted.')
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Unable to delete exercise'
      setError(message)
      showError(message)
    } finally {
      setDeleting(false)
      setDeletingExercise(null)
    }
  }

  const duplicateFromPrevious = async (targetDate: string) => {
    if (!program) {
      return
    }

    const index = dateRange.findIndex((value) => value === targetDate)
    if (index <= 0) {
      setError('No previous day to duplicate from.')
      info('No previous day to duplicate from.')
      return
    }

    const sourceDate = dateRange[index - 1]

    try {
      await duplicateDayExercises(program.id, sourceDate, targetDate)
      await load()
      success('Day duplicated from previous date.')
    } catch (duplicateError) {
      const message = duplicateError instanceof Error ? duplicateError.message : 'Unable to duplicate day'
      setError(message)
      showError(message)
    }
  }

  if (loading) {
    return <p className="muted">Loading program...</p>
  }

  if (!program) {
    return <p className="error-text">Program not found.</p>
  }

  return (
    <div className="page-stack">
      <section>
        <h2>{program.title}</h2>
        <p className="muted">
          {program.startDate} → {program.endDate}
        </p>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="days-stack">
        {dateRange.map((date) => {
          const day = dayByDate.get(date)
          const isFormOpen = formDate === date

          return (
            <article className="card day-card" key={date}>
              <div className="day-header">
                <div>
                  <h3>{formatReadableDate(date)}</h3>
                  <p className="muted">{day?.exercises.length ?? 0} exercises</p>
                </div>

                <div className="row-actions">
                  <button
                    className="ghost-button"
                    onClick={() => {
                      setFormDate(date)
                      setEditingExercise(undefined)
                    }}
                  >
                    Quick Add Exercise
                  </button>
                  <button className="ghost-button" onClick={() => void duplicateFromPrevious(date)}>
                    Duplicate Day
                  </button>
                  {day ? (
                    <Link className="primary-button" to={`/workout/${program.id}/${day.id}`}>
                      Start Workout
                    </Link>
                  ) : null}
                </div>
              </div>

              {isFormOpen ? (
                <ExerciseForm
                  initialValue={editingExercise}
                  onSubmit={(exercise) => handleSaveExercise(date, exercise)}
                  onCancel={() => {
                    setFormDate(null)
                    setEditingExercise(undefined)
                  }}
                />
              ) : null}

              {day?.exercises.length ? (
                <ul className="exercise-list">
                  {day.exercises.map((exercise) => (
                    <li key={exercise.id} className="exercise-item">
                      <div>
                        <strong>{exercise.name}</strong>
                        <p className="muted">
                          {exercise.sets} sets •{' '}
                          {exercise.reps ? `${exercise.reps} reps` : `${exercise.duration ?? 0}s`} • rest {exercise.rest}
                          s
                        </p>
                        {exercise.notes ? <p className="muted">{exercise.notes}</p> : null}
                      </div>

                      <div className="row-actions">
                        <button className="ghost-button" onClick={() => handleEditExercise(date, exercise)}>
                          Edit
                        </button>
                        <button
                          className="ghost-button"
                          onClick={() => {
                            if (day) {
                              setDeletingExercise({ dayId: day.id, exerciseId: exercise.id })
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No exercises added for this day.</p>
              )}
            </article>
          )
        })}
      </section>

      <ConfirmModal
        isOpen={Boolean(deletingExercise)}
        title="Delete Exercise"
        message="This exercise will be removed from the selected day. This action cannot be undone."
        confirmLabel="Delete Exercise"
        onConfirm={() => void handleDeleteExercise()}
        onCancel={() => setDeletingExercise(null)}
        isConfirming={deleting}
      />
    </div>
  )
}
