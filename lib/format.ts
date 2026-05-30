const UG_LOCALE = 'en-UG'
const DATE_LOCALE = 'en-GB'

export const formatCurrency = (amount: number, currency: string = 'UGX') => {
  return new Intl.NumberFormat(UG_LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export const formatDateTime = (date: string | Date) => {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const formatMonthYear = (date: string | Date) => {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export const formatRelativeDate = (date: string | Date) => {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now.getTime() - target.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDate(date)
}

/** Format rent due day as "5th of each month" */
export const formatDueDay = (day: number) => {
  const suffix =
    day === 1 || day === 21 || day === 31 ? 'st'
    : day === 2 || day === 22 ? 'nd'
    : day === 3 || day === 23 ? 'rd'
    : 'th'
  return `${day}${suffix} of each month`
}

/** Compute next rent due date from due_day */
export const getNextDueDate = (dueDay: number): Date => {
  const now = new Date()
  const due = new Date(now.getFullYear(), now.getMonth(), dueDay)
  if (due <= now) {
    due.setMonth(due.getMonth() + 1)
  }
  return due
}

/** Format Uganda phone numbers (+256...) */
export const formatPhoneUG = (phone: string): string => {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('256') && digits.length === 12) {
    return `+256 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  return phone
}

/** Normalize to E.164 Uganda (+256XXXXXXXXX) */
export const normalizePhoneUG = (phone: string): string | null => {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('256') && digits.length === 12) return `+${digits}`
  if (digits.startsWith('0') && digits.length === 10) return `+256${digits.slice(1)}`
  if (digits.length === 9) return `+256${digits}`
  return null
}

export const isValidPhoneUG = (phone: string): boolean => normalizePhoneUG(phone) !== null
