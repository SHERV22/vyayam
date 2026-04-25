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
    <section className="card" aria-label="Monthly workout completion calendar">
      <h3 className="card-title">Workout Calendar</h3>
      <p className="muted">{monthLabel}</p>

      <div className="calendar-grid weekday-row" role="row">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <span key={day} className="calendar-weekday" role="columnheader">
            {day}
          </span>
        ))}
      </div>

      <div className="calendar-grid" role="grid" aria-label={`${monthLabel} completion grid`}>
        {Array.from({ length: leadingEmptyCells }).map((_, index) => (
          <span key={`empty-${index}`} className="calendar-cell empty" aria-hidden="true" />
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
            <time
              key={dateKey}
              dateTime={dateKey}
              className={done ? 'calendar-cell complete' : 'calendar-cell'}
              role="gridcell"
              aria-label={done ? `${dateKey}: workout complete` : `${dateKey}: no workout logged`}
            >
              {dayNumber}
            </time>
          )
        })}
      </div>
    </section>
  )
}
