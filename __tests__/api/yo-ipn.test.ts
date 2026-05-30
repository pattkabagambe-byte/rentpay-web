import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}))

vi.mock('@/lib/yo-payments', () => ({
  yoCheckTransactionStatus: vi.fn().mockResolvedValue({
    status: 'OK',
    statusCode: '0',
    transactionStatus: 'SUCCEEDED',
    transactionReference: 'TX-456',
  }),
}))

vi.mock('@/lib/yo-ipn', () => ({
  parseYoFormBody: vi.fn(async (req: Request) => {
    const form = await req.formData()
    return Object.fromEntries(form.entries()) as Record<string, string>
  }),
  verifyYoPaymentNotification: vi.fn().mockReturnValue(true),
}))

vi.mock('@/lib/rate-limit', () => ({
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  rateLimit: vi.fn().mockReturnValue({ success: true, limit: 60, remaining: 59, resetAt: Date.now() + 60000 }),
}))

import { POST } from '@/app/api/payments/yo/ipn/route'

describe('Yo! Payments IPN route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'pay-1',
              invoice_id: 'inv-1',
              status: 'pending',
              provider_reference: 'TX-456',
            },
            error: null,
          }),
        }),
      }),
    })
    mockRpc.mockResolvedValue({ data: { ok: true, reason: 'completed' }, error: null })
  })

  it('processes verified IPN callbacks', async () => {
    const form = new FormData()
    form.set('date_time', '2026-05-30')
    form.set('amount', '850000')
    form.set('narrative', 'Rent')
    form.set('network_ref', 'TX-456')
    form.set('external_ref', 'pay-1')
    form.set('msisdn', '256770000000')
    form.set('signature', 'abc')

    const req = new Request('http://localhost/api/payments/yo/ipn', { method: 'POST', body: form })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockRpc).toHaveBeenCalledWith('complete_yo_payment', expect.objectContaining({
      p_external_reference: 'pay-1',
      p_succeeded: true,
    }))
  })

  it('returns 404 for unknown payments', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })

    const form = new FormData()
    form.set('date_time', '2026-05-30')
    form.set('amount', '850000')
    form.set('narrative', 'Rent')
    form.set('network_ref', 'TX-456')
    form.set('external_ref', 'unknown')
    form.set('msisdn', '256770000000')
    form.set('signature', 'abc')

    const req = new Request('http://localhost/api/payments/yo/ipn', { method: 'POST', body: form })
    const res = await POST(req)
    expect(res.status).toBe(404)
  })
})
