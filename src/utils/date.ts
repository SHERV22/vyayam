export const toDateKey = (value: Date) => value.toISOString().slice(0, 10)

export const parseDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export const formatReadableDate = (value: string) => {
  const date = parseDateKey(value)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export const generateDateRange = (start: string, end: string) => {
  const startDate = parseDateKey(start)
  const endDate = parseDateKey(end)
  const range: string[] = []

  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    range.push(toDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return range
}

export const getCurrentWeekWindow = () => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const start = new Date(today)
  start.setDate(today.getDate() - diff)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return {
    start: toDateKey(start),
    end: toDateKey(end),
  }
}

export const calculateCurrentStreak = (dates: string[]) => {
  if (!dates.length) {
    return 0
  }

  const unique = [...new Set(dates)].sort((a, b) => (a > b ? -1 : 1))
  const todayKey = toDateKey(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = toDateKey(yesterday)

  if (unique[0] !== todayKey && unique[0] !== yesterdayKey) {
    return 0
  }

  let streak = 1

  for (let index = 1; index < unique.length; index += 1) {
    const previous = parseDateKey(unique[index - 1])
    const current = parseDateKey(unique[index])
    const diffMs = previous.getTime() - current.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      streak += 1
    } else {
      break
    }
  }

  return streak
}
