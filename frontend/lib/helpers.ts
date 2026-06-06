/**
 * Helper to generate an array of last N dates (YYYY-MM-DD)
 * This ensures your chart has an entry even if a day has 0 calls.
 */
export function getLastNDays(days: number): string[] {
  const dates = []
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates.reverse()
}

/**
 * Helper to generate an array of last 12 months (YYYY-MM)
 */
export function getLast12Months(): string[] {
  const months = []
  for (let i = 0; i < 12; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    months.push(`${year}-${month}`)
  }
  return months.reverse()
}
