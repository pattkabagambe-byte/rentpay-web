import crypto from 'crypto'

export interface YoIpnPayload {
  date_time?: string
  amount?: string
  narrative?: string
  network_ref?: string
  external_ref?: string
  msisdn?: string
  signature?: string
}

export interface YoFailureIpnPayload {
  failed_transaction_reference?: string
  transaction_init_date?: string
  verification?: string
}

function getYoPublicKeyPem(): string | null {
  const inline = process.env.YO_PUBLIC_KEY_PEM
  if (inline) return inline.replace(/\\n/g, '\n')
  return null
}

export function verifyYoPaymentNotification(body: YoIpnPayload): boolean {
  const publicKeyPem = getYoPublicKeyPem()

  if (!publicKeyPem) {
    return process.env.NODE_ENV !== 'production'
  }

  const required = ['date_time', 'amount', 'narrative', 'network_ref', 'external_ref', 'msisdn', 'signature'] as const
  for (const key of required) {
    if (!body[key]) return false
  }

  const data =
    body.date_time! +
    body.amount! +
    body.narrative! +
    body.network_ref! +
    body.external_ref! +
    body.msisdn!

  try {
    const signature = Buffer.from(body.signature!, 'base64')
    return crypto.verify(
      'RSA-SHA1',
      Buffer.from(data, 'utf8'),
      publicKeyPem,
      signature
    )
  } catch {
    return false
  }
}

export function verifyYoFailureNotification(body: YoFailureIpnPayload): boolean {
  const publicKeyPem = getYoPublicKeyPem()

  if (!publicKeyPem) {
    return process.env.NODE_ENV !== 'production'
  }

  if (!body.failed_transaction_reference || !body.transaction_init_date || !body.verification) {
    return false
  }

  const data = body.failed_transaction_reference + body.transaction_init_date

  try {
    const signature = Buffer.from(body.verification, 'base64')
    return crypto.verify(
      'RSA-SHA1',
      Buffer.from(data, 'utf8'),
      publicKeyPem,
      signature
    )
  } catch {
    return false
  }
}

export async function parseYoFormBody(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text()
    return Object.fromEntries(new URLSearchParams(text))
  }

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    const out: Record<string, string> = {}
    form.forEach((value, key) => {
      out[key] = String(value)
    })
    return out
  }

  try {
    const json = await request.json()
    if (json && typeof json === 'object') {
      return Object.fromEntries(
        Object.entries(json as Record<string, unknown>).map(([k, v]) => [k, String(v)])
      )
    }
  } catch {
    // fall through
  }

  return {}
}
