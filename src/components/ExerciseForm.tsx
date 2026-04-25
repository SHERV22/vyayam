import { useEffect, useState } from 'react'
import type { Exercise } from '../types'

interface ExerciseFormProps {
  initialValue?: Exercise
  onSubmit: (exercise: Exercise) => Promise<void>
  onCancel?: () => void
}

type Mode = 'reps' | 'duration'

export const ExerciseForm = ({ initialValue, onSubmit, onCancel }: ExerciseFormProps) => {
  const [name, setName] = useState(initialValue?.name ?? '')
  const [sets, setSets] = useState(initialValue?.sets ?? 3)
  const [rest, setRest] = useState(initialValue?.rest ?? 60)
  const [notes, setNotes] = useState(initialValue?.notes ?? '')
  const [mode, setMode] = useState<Mode>(initialValue?.duration ? 'duration' : 'reps')
  const [reps, setReps] = useState(initialValue?.reps ?? 10)
  const [duration, setDuration] = useState(initialValue?.duration ?? 30)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setName(initialValue?.name ?? '')
    setSets(initialValue?.sets ?? 3)
    setRest(initialValue?.rest ?? 60)
    setNotes(initialValue?.notes ?? '')
    setMode(initialValue?.duration ? 'duration' : 'reps')
    setReps(initialValue?.reps ?? 10)
    setDuration(initialValue?.duration ?? 30)
  }, [initialValue])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      setError('Exercise name is required')
      return
    }

    if (sets <= 0 || rest < 0) {
      setError('Sets and rest must be valid numbers')
      return
    }

    if (mode === 'reps' && reps <= 0) {
      setError('Reps must be greater than 0')
      return
    }

    if (mode === 'duration' && duration <= 0) {
      setError('Duration must be greater than 0')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await onSubmit({
        id: initialValue?.id ?? crypto.randomUUID(),
        name: name.trim(),
        sets,
        rest,
        notes: notes.trim() || undefined,
        reps: mode === 'reps' ? reps : undefined,
        duration: mode === 'duration' ? duration : undefined,
      })

      if (!initialValue) {
        setName('')
        setSets(3)
        setRest(60)
        setNotes('')
        setReps(10)
        setDuration(30)
        setMode('reps')
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save exercise')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="exercise-form" onSubmit={handleSubmit}>
      <div className="grid two-cols">
        <label htmlFor="exercise-name">
          Name
          <input
            id="exercise-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Bench Press"
            aria-describedby={error ? 'exercise-error' : undefined}
            aria-invalid={Boolean(error)}
          />
        </label>
        <label htmlFor="exercise-sets">
          Sets
          <input
            id="exercise-sets"
            type="number"
            min={1}
            value={sets}
            onChange={(event) => setSets(Number(event.target.value))}
            aria-describedby={error ? 'exercise-error' : undefined}
            aria-invalid={Boolean(error)}
          />
        </label>
      </div>

      <div className="grid two-cols">
        <fieldset>
          <legend>Mode</legend>
          <div className="row-actions">
            <label className="inline-choice" htmlFor="mode-reps">
              <input
                id="mode-reps"
                type="radio"
                name="exercise-mode"
                value="reps"
                checked={mode === 'reps'}
                onChange={(event) => setMode(event.target.value as Mode)}
              />
              Reps
            </label>
            <label className="inline-choice" htmlFor="mode-duration">
              <input
                id="mode-duration"
                type="radio"
                name="exercise-mode"
                value="duration"
                checked={mode === 'duration'}
                onChange={(event) => setMode(event.target.value as Mode)}
              />
              Time (seconds)
            </label>
          </div>
        </fieldset>

        {mode === 'reps' ? (
          <label htmlFor="exercise-reps">
            Reps
            <input
              id="exercise-reps"
              type="number"
              min={1}
              value={reps}
              onChange={(event) => setReps(Number(event.target.value))}
              aria-describedby={error ? 'exercise-error' : undefined}
              aria-invalid={Boolean(error)}
            />
          </label>
        ) : (
          <label htmlFor="exercise-duration">
            Duration (sec)
            <input
              id="exercise-duration"
              type="number"
              min={1}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              aria-describedby={error ? 'exercise-error' : undefined}
              aria-invalid={Boolean(error)}
            />
          </label>
        )}
      </div>

      <div className="grid two-cols">
        <label htmlFor="exercise-rest">
          Rest (sec)
          <input
            id="exercise-rest"
            type="number"
            min={0}
            value={rest}
            onChange={(event) => setRest(Number(event.target.value))}
            aria-describedby={error ? 'exercise-error' : undefined}
            aria-invalid={Boolean(error)}
          />
        </label>
        <label htmlFor="exercise-notes">
          Notes
          <input
            id="exercise-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional"
            aria-describedby={error ? 'exercise-error' : undefined}
            aria-invalid={Boolean(error)}
          />
        </label>
      </div>

      {error ? (
        <p id="exercise-error" className="error-text" role="alert">
          {error}
        </p>
      ) : null}

      <div className="row-actions">
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Saving...' : initialValue ? 'Update Exercise' : 'Add Exercise'}
        </button>
        {onCancel ? (
          <button type="button" className="ghost-button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
