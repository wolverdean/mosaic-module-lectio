export interface IgnatianDay {
  weekNumber?: number
  weekIndex?: number
  dayOfWeek?: number
  isRestDay?: boolean
  phase?: string
  weekTitle?: string
  grace?: string
  background?: string
  day?: unknown
  totalWeeks?: number
  startDate?: string
  isPaused?: boolean
  completed?: boolean
  notStarted?: boolean
  daysUntil?: number
  needsSetup?: boolean
}

export function calcIgnatianDay(schedule: any[], startDate: string, pausedDays: number | null = null): IgnatianDay {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  let totalDays: number
  if (pausedDays !== null) {
    totalDays = pausedDays
  } else {
    const start = new Date(startDate + 'T00:00:00')
    totalDays = Math.floor((now.getTime() - start.getTime()) / 86400000)
    if (totalDays < 0) return { notStarted: true, startDate, daysUntil: Math.abs(totalDays) }
  }

  const weekIndex = Math.floor(totalDays / 7)
  const dayOfWeek = totalDays % 7

  if (weekIndex >= schedule.length) {
    return { completed: true, totalWeeks: schedule.length }
  }

  const week = schedule[weekIndex]
  const isRestDay = dayOfWeek >= 5

  return {
    weekNumber: week.week,
    weekIndex,
    dayOfWeek,
    isRestDay,
    phase: week.phase,
    weekTitle: week.title,
    grace: week.grace,
    background: week.background,
    day: isRestDay ? null : week.days[dayOfWeek],
    totalWeeks: schedule.length,
    startDate,
  }
}

export function elapsedDays(startDate: string): number {
  const start = new Date(startDate + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000))
}

export function shiftedStart(pausedDays: number | null): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(now)
  d.setDate(d.getDate() - (pausedDays ?? 0))
  return d.toISOString().slice(0, 10)
}
