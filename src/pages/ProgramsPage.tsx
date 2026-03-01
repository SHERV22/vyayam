import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createProgram, deleteProgramById, getProgramsByUser } from '../firebase/firestore'
import { useAuth } from '../hooks/useAuth'
import type { Program } from '../types'
import { toDateKey } from '../utils/date'

export const ProgramsPage = () => {
  const { user } = useAuth()
  const [programs, setPrograms] = useState<Program[]>([])
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(toDateKey(new Date()))
  const [endDate, setEndDate] = useState(toDateKey(new Date()))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadPrograms = async () => {
    if (!user) {
      return
    }

    const data = await getProgramsByUser(user.uid)
    const sorted = [...data].sort((a, b) => (a.startDate > b.startDate ? -1 : 1))
    setPrograms(sorted)
  }

  useEffect(() => {
    void loadPrograms()
  }, [user])

  const handleCreateProgram = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user) {
      return
    }

    if (!title.trim()) {
      setError('Program title is required')
      return
    }

    if (startDate > endDate) {
      setError('Start date cannot be after end date')
      return
    }

    try {
      setLoading(true)
      setError('')

      await createProgram(user.uid, title.trim(), startDate, endDate)
      setTitle('')
      await loadPrograms()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create program')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (programId: string) => {
    if (!window.confirm('Delete this program and all its days?')) {
      return
    }

    try {
      await deleteProgramById(programId)
      await loadPrograms()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete program')
    }
  }

  return (
    <div className="page-stack">
      <section>
        <h2>Programs</h2>
        <p className="muted">Create weekly, monthly, or custom plans.</p>
      </section>

      <section className="card">
        <h3 className="card-title">Create Program</h3>

        <form className="program-form" onSubmit={handleCreateProgram}>
          <label>
            Program Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Strength Cycle"
              required
            />
          </label>

          <div className="grid two-cols">
            <label>
              Start Date
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </label>

            <label>
              End Date
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
            </label>
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Program'}
          </button>
        </form>
      </section>

      <section className="program-list">
        {programs.length === 0 ? (
          <p className="muted">No programs yet. Create your first one.</p>
        ) : (
          programs.map((program) => (
            <article key={program.id} className="card program-card">
              <div>
                <h3>{program.title}</h3>
                <p className="muted">
                  {program.startDate} → {program.endDate}
                </p>
              </div>
              <div className="row-actions">
                <Link className="primary-button" to={`/programs/${program.id}`}>
                  Open
                </Link>
                <button className="ghost-button" onClick={() => void handleDelete(program.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
