type LogLevel = 'info' | 'warn' | 'error'

interface LogPayload {
  service: string
  event: string
  level?: LogLevel
  [key: string]: unknown
}

/**
 * Fields that must never appear in logs.
 * Any key whose name contains one of these substrings is replaced with "[REDACTED]".
 */
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'auth',
  'credential',
  'access_token',
  'refresh_token',
  'api_key',
  'msisdn',       // mobile number — PII
  'phone',
  'email',
  'pin',
  'cvv',
  'card',
]

function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    const lower = k.toLowerCase()
    const isSensitive = SENSITIVE_KEYS.some((s) => lower.includes(s))
    if (isSensitive) {
      result[k] = '[REDACTED]'
    } else if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      result[k] = redactSensitive(v as Record<string, unknown>)
    } else {
      result[k] = v
    }
  }
  return result
}

export function logEvent({ level = 'info', ...payload }: LogPayload) {
  const safePayload = redactSensitive(payload as Record<string, unknown>)

  const entry = {
    ...safePayload,
    level,
    timestamp: new Date().toISOString(),
  }

  const line = JSON.stringify(entry)

  if (level === 'error') {
    console.error(line)
  } else if (level === 'warn') {
    console.warn(line)
  } else {
    console.log(line)
  }
}

export function logPaymentEvent(
  event: string,
  data: Record<string, unknown>,
  level: LogLevel = 'info'
) {
  const service = typeof data.provider === 'string' ? `${data.provider}-payments` : 'payments'
  logEvent({ service, event, level, ...data })
}
