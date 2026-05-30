import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/pesapal', () => ({
  getPesapalAuthToken: vi.fn().mockResolvedValue('token'),
  registerPesapalIPN: vi.fn().mockResolvedValue({ ipn_id: 'ipn-123' }),
  submitPesapalOrder: vi.fn().mockResolvedValue({
    redirect_url: 'https://pay.pesapal.com/checkout',
    order_tracking_id: 'track-123',
  }),
}))

import { createClient } from '@/supabase/server'
import { initiateInvoicePayment } from '@/features/payments/actions'

describe('initiateInvoicePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthenticated users', async () => {
    vi.mocked(createClient).mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never)

    await expect(initiateInvoicePayment('inv-1')).rejects.toThrow('Unauthorized')
  })

  it('rejects invoices not belonging to the tenant', async () => {
    vi.mocked(createClient).mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1', email: 't@test.ug' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
            }),
          }),
        }),
      }),
    } as never)

    await expect(initiateInvoicePayment('inv-1')).rejects.toThrow('Invoice not found')
  })

  it('returns error for already paid invoices', async () => {
    vi.mocked(createClient).mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 't@test.ug', user_metadata: {} } },
      }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'inv-1', status: 'paid', properties: { name: 'Test' } },
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as never)

    const result = await initiateInvoicePayment('inv-1')
    expect(result.error).toMatch(/already been paid/)
  })
})
