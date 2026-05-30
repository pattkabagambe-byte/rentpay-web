import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}))

vi.mock('@/lib/pesapal', () => ({
  getPesapalAuthToken: vi.fn().mockResolvedValue('token'),
  getPesapalTransactionStatus: vi.fn().mockResolvedValue({
    status_code: 1,
    payment_method: 'MTN Mobile Money',
  }),
}))

vi.mock('@/lib/rate-limit', () => ({
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  rateLimit: vi.fn().mockReturnValue({ success: true, limit: 30, remaining: 29, resetAt: Date.now() + 60000 }),
}))

import { GET } from '@/app/api/payments/pesapal-ipn/route'

describe('Pesapal IPN route', () => {
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
              provider_reference: 'track-123',
            },
            error: null,
          }),
        }),
      }),
    })
    mockRpc.mockResolvedValue({ data: { ok: true, reason: 'completed' }, error: null })
  })

  it('returns 400 when OrderTrackingId is missing', async () => {
    const req = new Request('http://localhost/api/payments/pesapal-ipn')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown orders', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })

    const req = new Request('http://localhost/api/payments/pesapal-ipn?OrderTrackingId=unknown')
    const res = await GET(req)
    expect(res.status).toBe(404)
  })

  it('processes valid IPN callbacks', async () => {
    const req = new Request(
      'http://localhost/api/payments/pesapal-ipn?OrderTrackingId=track-123&OrderMerchantReference=inv-1'
    )
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(mockRpc).toHaveBeenCalledWith('complete_pesapal_payment', expect.objectContaining({
      p_order_tracking_id: 'track-123',
      p_status_code: 1,
    }))
  })

  it('rejects merchant reference mismatch', async () => {
    const req = new Request(
      'http://localhost/api/payments/pesapal-ipn?OrderTrackingId=track-123&OrderMerchantReference=wrong-id'
    )
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('short-circuits already completed payments', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'pay-1',
              invoice_id: 'inv-1',
              status: 'completed',
              provider_reference: 'track-123',
            },
            error: null,
          }),
        }),
      }),
    })

    const req = new Request('http://localhost/api/payments/pesapal-ipn?OrderTrackingId=track-123')
    const res = await GET(req)
    const body = await res.json()
    expect(body.reason).toBe('already_completed')
    expect(mockRpc).not.toHaveBeenCalled()
  })
})
