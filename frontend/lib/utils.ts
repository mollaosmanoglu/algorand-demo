import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format ISO datetime string to relative date for display.
 * Returns "Today", "Yesterday", "X days ago", or formatted date.
 * Following UX best practices: relative for recent dates, absolute for older.
 */
export function formatDate(isoString: string | null): string {
  if (!isoString) return ''

  const date = new Date(isoString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const daysDiff = Math.floor((today.getTime() - dateDay.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff === 0) return "Today"
  if (daysDiff === 1) return "Yesterday"
  if (daysDiff > 1 && daysDiff <= 7) return `${daysDiff} days ago`

  // For dates older than 7 days, show absolute date
  // Current week: show day + month (e.g., "19 Nov")
  // Older: show full date with year
  const isCurrentYear = date.getFullYear() === now.getFullYear()

  if (isCurrentYear && daysDiff <= 30) {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Format ISO datetime string to time for display (HH:MM).
 */
export function formatTime(isoString: string | null): string {
  if (!isoString) return ''

  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Format duration from seconds to M:SS format.
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format ISO datetime to combined relative date + time.
 * Examples: "Today at 21:57", "Yesterday at 14:30", "19 Nov at 09:15"
 * Best for tables/lists where both date and time context matter.
 */
export function formatRelativeDateTime(isoString: string | null): string {
  if (!isoString) return ''

  const date = new Date(isoString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const daysDiff = Math.floor((today.getTime() - dateDay.getTime()) / (1000 * 60 * 60 * 24))
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  if (daysDiff === 0) return `Today at ${time}`
  if (daysDiff === 1) return `Yesterday at ${time}`
  if (daysDiff > 1 && daysDiff <= 7) return `${daysDiff} days ago at ${time}`

  // For older dates: "19 Nov at 14:30"
  const dateStr = date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' })
  })

  return `${dateStr} at ${time}`
}

/**
 * Format phone number to international format.
 * Converts Dutch mobile numbers from 06... to +316...
 * Examples: "0612345678" -> "+31 6 12345678"
 */
export function formatPhoneNumber(phoneNumber: string | null): string {
  if (!phoneNumber) return ''

  // Remove any spaces, dashes, or parentheses
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '')

  // If it starts with 06, replace with +31 6
  if (cleaned.startsWith('06')) {
    const rest = cleaned.substring(2)
    return `+31 6 ${rest}`
  }

  // If it starts with +316, format it nicely
  if (cleaned.startsWith('+316')) {
    const rest = cleaned.substring(4)
    return `+31 6 ${rest}`
  }

  // Return as-is for other formats
  return phoneNumber
}
