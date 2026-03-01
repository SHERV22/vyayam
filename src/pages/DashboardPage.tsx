import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatCard } from '../components/StatCard'
import { getDaysByProgram, getProgramsByUser, getWorkoutLogsByUser } from '../firebase/firestore'
import { useAuth } from '../hooks/useAuth'
import type { Program, WorkoutLog } from '../types'
import { calculateCurrentStreak, toDateKey } from '../utils/date'

export const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [programs, setPrograms] = useState<Program[]>([])
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user) {
        return
      }

      try {
        setLoading(true)
        const [programData, logData] = await Promise.all([
          getProgramsByUser(user.uid),
          getWorkoutLogsByUser(user.uid),
        ])
        setPrograms(programData)
        setLogs(logData)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [user])

  const activeProgram = useMemo(() => {
    const today = toDateKey(new Date())
    return programs.find((program) => program.startDate <= today && program.endDate >= today) ?? programs[0]
  }, [programs])

  const handleStartToday = async () => {
    if (!activeProgram) {
      navigate('/programs')
      return
    }

    setStarting(true)
    setError('')

    try {
      const days = await getDaysByProgram(activeProgram.id)
      const today = toDateKey(new Date())
      const todaysDay = days.find((day) => day.date === today)

      if (!todaysDay) {
        setError('No day plan found for today in active program.')
        return
      }

      navigate(`/workout/${activeProgram.id}/${todaysDay.id}`)
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Unable to start workout')
    } finally {
      setStarting(false)
    }
  }

  const streak = calculateCurrentStreak(logs.map((log) => log.date))

  if (loading) {
    return <p className="muted">Loading dashboard...</p>
  }

  return (
    <div className="page-stack">
      <section>
        <h2>Dashboard</h2>
        <p className="muted">Track progress. Stay disciplined.</p>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="stats-grid">
        <StatCard title="Total Workouts" value={logs.length} />
        <StatCard title="Current Streak" value={`${streak} days`} />
        <StatCard
          title="Active Program"
          value={activeProgram?.title ?? 'None'}
          action={
            <button className="primary-button" onClick={() => void handleStartToday()} disabled={starting}>
              {starting ? 'Starting...' : 'Start Today’s Workout'}
            </button>
          }
        />
      </section>
    </div>
  )
}
