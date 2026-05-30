type LogLevel = 'info' | 'warn' | 'error'

interface LogPayload {
  service: string
  event: string
  level?: LogLevel
  [key: string]: unknown
}

export function logEvent({ level = 'info', ...payload }: LogPayload) {
  const entry = {
    ...payload,
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
  logEvent({ service: 'pesapal-ipn', event, level, ...data })
}
