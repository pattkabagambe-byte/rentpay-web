import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/yo-payments', () => ({
  yoDepositFunds: vi.fn().mockResolvedValue({
    status: 'OK',
    statusCode: '0',
    transactionStatus: 'PENDING',
    transactionReference: 'TX-123',
  }),
  buildYoCardCheckoutUrl: vi.fn(),
  isYoCardCheckoutConfigured: vi.fn().mockReturnValue(false),
  isYoTransactionSucceeded: vi.fn().mockReturnValue(false),
}))

import { createClient } from '@/supabase/server'
import { initiateInvoicePayment } from '@/features/payments/actions'

describe('initiateInvoicePayment (Yo! Payments)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthenticated users', async () => {
    vi.mocked(createClient).mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never)

    await expect(
      initiateInvoicePayment({ invoiceId: '00000000-0000-0000-0000-000000000001', method: 'mobile_money', phone: '0700123456' })
    ).rejects.toThrow('Unauthorized')
  })

  it('requires phone for mobile money', async () => {
    vi.mocked(createClient).mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    } as never)

    const result = await initiateInvoicePayment({
      invoiceId: '00000000-0000-0000-0000-000000000001',
      method: 'mobile_money',
    })
    expect(result.error).toBeTruthy()
  })
})
