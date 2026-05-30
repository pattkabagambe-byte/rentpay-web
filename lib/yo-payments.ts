/**
 * Yo! Payments XML API client (Uganda mobile money + card checkout URL).
 * @see https://paymentsweb.yo.co.ug/index.php/developers
 */

export interface YoApiResponse {
  status: string | null
  statusCode: string | null
  statusMessage: string | null
  transactionStatus: string | null
  transactionReference: string | null
  errorMessage: string | null
  errorMessageCode: string | null
}

function getYoApiUrl() {
  if (process.env.YO_API_URL) return process.env.YO_API_URL
  return process.env.NODE_ENV === 'production'
    ? 'https://paymentsapi1.yo.co.ug/ybs/task.php'
    : 'https://sandbox.yo.co.ug/services/yopaymentsdev/task.php'
}

function getYoCredentials() {
  const username = process.env.YO_API_USERNAME
  const password = process.env.YO_API_PASSWORD
  if (!username || !password) {
    throw new Error('Missing YO_API_USERNAME or YO_API_PASSWORD')
  }
  return { username, password }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function parseYoXmlResponse(xml: string): YoApiResponse {
  const pick = (tag: string) => {
    const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`, 'i'))
    return match?.[1]?.trim() ?? null
  }

  return {
    status: pick('Status'),
    statusCode: pick('StatusCode'),
    statusMessage: pick('StatusMessage'),
    transactionStatus: pick('TransactionStatus'),
    transactionReference: pick('TransactionReference'),
    errorMessage: pick('ErrorMessage'),
    errorMessageCode: pick('ErrorMessageCode'),
  }
}

export function isYoTransactionSucceeded(response: YoApiResponse): boolean {
  if (response.status?.toUpperCase() !== 'OK') return false
  if (response.statusCode !== '0') return false
  const ts = response.transactionStatus
  return ts === 'SUCCEEDED' || ts === '1'
}

export function isYoTransactionFailed(response: YoApiResponse): boolean {
  const ts = response.transactionStatus
  return ts === 'FAILED' || ts === '0'
}

async function postYoXml(xml: string): Promise<string> {
  const response = await fetch(getYoApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      'Content-transfer-encoding': 'text',
    },
    body: xml,
  })

  if (!response.ok) {
    throw new Error(`Yo! Payments API HTTP ${response.status}`)
  }

  return response.text()
}

export interface YoDepositParams {
  msisdn: string
  amount: number
  narrative: string
  externalReference: string
  instantNotificationUrl?: string
  failureNotificationUrl?: string
}

export async function yoDepositFunds(params: YoDepositParams): Promise<YoApiResponse> {
  const { username, password } = getYoCredentials()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const instantUrl = params.instantNotificationUrl ?? `${appUrl}/api/payments/yo/ipn`
  const failureUrl = params.failureNotificationUrl ?? `${appUrl}/api/payments/yo/ipn/failure`

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AutoCreate>
  <Request>
    <APIUsername>${escapeXml(username)}</APIUsername>
    <APIPassword>${escapeXml(password)}</APIPassword>
    <Method>acdepositfunds</Method>
    <NonBlocking>TRUE</NonBlocking>
    <Account>${escapeXml(params.msisdn)}</Account>
    <Amount>${params.amount}</Amount>
    <Narrative>${escapeXml(params.narrative)}</Narrative>
    <ExternalReference>${escapeXml(params.externalReference)}</ExternalReference>
    <InstantNotificationUrl>${escapeXml(instantUrl)}</InstantNotificationUrl>
    <FailureNotificationUrl>${escapeXml(failureUrl)}</FailureNotificationUrl>
  </Request>
</AutoCreate>`

  const raw = await postYoXml(xml)
  return parseYoXmlResponse(raw)
}

export async function yoCheckTransactionStatus(
  transactionReference?: string,
  externalReference?: string
): Promise<YoApiResponse> {
  const { username, password } = getYoCredentials()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AutoCreate>
  <Request>
    <APIUsername>${escapeXml(username)}</APIUsername>
    <APIPassword>${escapeXml(password)}</APIPassword>
    <Method>actransactioncheckstatus</Method>
    ${transactionReference ? `<TransactionReference>${escapeXml(transactionReference)}</TransactionReference>` : ''}
    ${externalReference ? `<PrivateTransactionReference>${escapeXml(externalReference)}</PrivateTransactionReference>` : ''}
    <DepositTransactionType>PULL</DepositTransactionType>
  </Request>
</AutoCreate>`

  const raw = await postYoXml(xml)
  return parseYoXmlResponse(raw)
}

/** Hosted card checkout URL (configure when Yo enables Visa/Mastercard on your account). */
export function buildYoCardCheckoutUrl(params: {
  amount: number
  currency: string
  externalReference: string
  returnUrl: string
}): string | null {
  const template = process.env.YO_CARD_CHECKOUT_URL
  if (!template) return null

  return template
    .replaceAll('{amount}', String(params.amount))
    .replaceAll('{currency}', params.currency)
    .replaceAll('{external_ref}', params.externalReference)
    .replaceAll('{return_url}', encodeURIComponent(params.returnUrl))
}

export function isYoCardCheckoutConfigured() {
  return Boolean(process.env.YO_CARD_CHECKOUT_URL)
}
