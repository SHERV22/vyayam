import { useMemo } from 'react'
import { toDateKey } from '../utils/date'

interface WorkoutCalendarProps {
  completedDates: string[]
}

export const WorkoutCalendar = ({ completedDates }: WorkoutCalendarProps) => {
  const { monthLabel, leadingEmptyCells, daysInMonth, completedSet } = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const label = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    const start = firstDay.getDay()

    return {
      monthLabel: label,
      leadingEmptyCells: start,
      daysInMonth: lastDay.getDate(),
      completedSet: new Set(completedDates),
    }
  }, [completedDates])

  return (
    <section className="card">
      <h3 className="card-title">Workout Calendar</h3>
      <p className="muted">{monthLabel}</p>

      <div className="calendar-grid weekday-row">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <span key={day} className="calendar-weekday">
            {day}
          </span>
        ))}
      </div>

      <div className="calendar-grid">
        {Array.from({ length: leadingEmptyCells }).map((_, index) => (
          <span key={`empty-${index}`} className="calendar-cell empty" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const dayNumber = index + 1
          const date = new Date()
          date.setDate(1)
          date.setMonth(date.getMonth())
          date.setDate(dayNumber)

          const dateKey = toDateKey(date)
          const done = completedSet.has(dateKey)

          return (
            <span key={dateKey} className={done ? 'calendar-cell complete' : 'calendar-cell'}>
              {dayNumber}
            </span>
          )
        })}
      </div>
    </section>
  )
}
