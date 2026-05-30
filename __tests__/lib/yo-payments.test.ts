import { describe, it, expect } from 'vitest'
import { parseYoXmlResponse, isYoTransactionSucceeded, buildYoCardCheckoutUrl } from '@/lib/yo-payments'

describe('yo-payments', () => {
  it('parses successful deposit XML', () => {
    const xml = `<?xml version="1.0"?><AutoCreate><Response><Status>OK</Status><StatusCode>0</StatusCode><TransactionStatus>SUCCEEDED</TransactionStatus><TransactionReference>TX123</TransactionReference></Response></AutoCreate>`
    const parsed = parseYoXmlResponse(xml)
    expect(parsed.status).toBe('OK')
    expect(parsed.transactionReference).toBe('TX123')
    expect(isYoTransactionSucceeded(parsed)).toBe(true)
  })

  it('builds card checkout URL from template', () => {
    process.env.YO_CARD_CHECKOUT_URL = 'https://pay.example.com?amount={amount}&ref={external_ref}&return={return_url}'
    const url = buildYoCardCheckoutUrl({
      amount: 50000,
      currency: 'UGX',
      externalReference: 'pay-1',
      returnUrl: 'https://rentpay.ug/done',
    })
    expect(url).toContain('amount=50000')
    expect(url).toContain('ref=pay-1')
    delete process.env.YO_CARD_CHECKOUT_URL
  })
})
