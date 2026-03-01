import { useEffect, useMemo, useState } from 'react'
import { StatCard } from '../components/StatCard'
import { WorkoutCalendar } from '../components/WorkoutCalendar'
import { getWorkoutLogsByUser } from '../firebase/firestore'
import { useAuth } from '../hooks/useAuth'
import type { WorkoutLog } from '../types'
import { calculateCurrentStreak, getCurrentWeekWindow } from '../utils/date'

export const ProgressPage = () => {
  const { user } = useAuth()
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user) {
        return
      }

      try {
        setLoading(true)
        const data = await getWorkoutLogsByUser(user.uid)
        const sorted = [...data].sort((a, b) => (a.date > b.date ? -1 : 1))
        setLogs(sorted)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load progress')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [user])

  const weeklyWorkouts = useMemo(() => {
    const weekWindow = getCurrentWeekWindow()
    return logs.filter((log) => log.date >= weekWindow.start && log.date <= weekWindow.end).length
  }, [logs])

  const streak = useMemo(() => calculateCurrentStreak(logs.map((log) => log.date)), [logs])

  return (
    <div className="page-stack">
      <section>
        <h2>Progress</h2>
        <p className="muted">Consistency compounds performance.</p>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="stats-grid">
        <StatCard title="Total Workouts" value={logs.length} />
        <StatCard title="Weekly Workouts" value={weeklyWorkouts} />
        <StatCard title="Current Streak" value={`${streak} days`} />
      </section>

      <WorkoutCalendar completedDates={logs.map((log) => log.date)} />

      <section className="card">
        <h3 className="card-title">Workout History</h3>
        {loading ? <p className="muted">Loading logs...</p> : null}

        {!loading && logs.length === 0 ? <p className="muted">No completed workouts yet.</p> : null}

        <ul className="log-list">
          {logs.map((log) => (
            <li key={log.id} className="log-item">
              <div>
                <strong>{log.date}</strong>
                <p className="muted">Exercises: {log.completedExercises}</p>
              </div>
              <span>{Math.round(log.duration / 60)} min</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
