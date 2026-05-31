'use client'

import { useState } from 'react'
import Link from 'next/link'
import { initiateInvoicePayment } from '@/features/payments/actions'
import { Loader2, CreditCard, Smartphone, ShieldCheck, Phone, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { MoneyDisplay } from '@/components/ui/money-display'
import { DateDisplay } from '@/components/ui/date-display'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { formatMonthYear, normalizePhoneUG, isValidPhoneUG } from '@/lib/format'
import { cn } from '@/lib/utils'

type PaymentMethod = 'mobile_money' | 'card'

interface PayInvoiceClientProps {
  invoice: {
    id: string
    amount_due: number
    currency: string
    due_date: string
    period_from: string
    status: string
    properties: { name: string } | null
    units: { label: string } | null
  }
  cardCheckoutEnabled: boolean
}

/** Format a raw phone input as Uganda local format: 0700 123 456 */
function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  // Normalise +256 → 0
  const local = digits.startsWith('256') && digits.length > 9
    ? '0' + digits.slice(3)
    : digits
  if (local.length <= 4) return local
  if (local.length <= 7) return `${local.slice(0, 4)} ${local.slice(4)}`
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7, 11)}`
}

export function PayInvoiceClient({ invoice, cardCheckoutEnabled }: PayInvoiceClientProps) {
  const [method, setMethod] = useState<PaymentMethod>('mobile_money')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const { toast } = useToast()

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Strip spaces for state; format for display
    const stripped = raw.replace(/\s/g, '')
    setPhone(stripped)
    setPhoneError(null)
    setError(null)
  }

  const handlePhoneBlur = () => {
    if (phone && !isValidPhoneUG(phone)) {
      setPhoneError('Enter a valid Uganda mobile number (e.g. 0700 123 456)')
    }
  }

  const handlePay = async () => {
    setError(null)
    setPendingMessage(null)

    // Client-side phone validation before network call
    if (method === 'mobile_money') {
      if (!phone.trim()) {
        setPhoneError('Enter your Mobile Money number to continue')
        return
      }
      if (!isValidPhoneUG(phone)) {
        setPhoneError('Enter a valid Uganda mobile number (MTN or Airtel, e.g. 0700 123 456)')
        return
      }
    }

    setLoading(true)

    try {
      const result = await initiateInvoicePayment({
        invoiceId: invoice.id,
        method,
        phone: method === 'mobile_money' ? (normalizePhoneUG(phone) ?? phone) : undefined,
      })

      if (result.error) {
        setError(result.error)
        toast(result.error, 'error')
        setLoading(false)
        return
      }

      if (result.redirect_url && method === 'card') {
        toast('Redirecting to card checkout…', 'info')
        window.location.href = result.redirect_url
        return
      }

      if (result.status === 'pending' && result.message) {
        setPendingMessage(result.message)
        toast(result.message, 'info')
        setLoading(false)
        return
      }

      toast(result.message ?? 'Payment submitted.', 'success')
      if (result.redirect_url) {
        window.location.href = result.redirect_url
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed'
      setError(message)
      toast('Payment could not be started. Please try again.', 'error')
      setLoading(false)
    }
  }

  const selectMethod = (m: PaymentMethod) => {
    if (m === 'card' && !cardCheckoutEnabled) return
    setMethod(m)
    setError(null)
    setPhoneError(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <PageHeader
        title="Secure payment"
        description="Pay with MTN/Airtel Mobile Money or Visa/Mastercard via Yo! Payments."
        backHref={`/tenant/invoices/${invoice.id}`}
        backLabel="Back to invoice"
      />

      <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 md:p-10 space-y-8 shadow-sm">
        {/* Invoice summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-muted/20 rounded-[24px]">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Invoice</p>
            <p className="font-black text-lg">{formatMonthYear(invoice.period_from)}</p>
            <p className="text-sm font-bold text-muted-foreground">
              {invoice.properties?.name} · {invoice.units?.label}
            </p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <StatusBadge status={invoice.status} type="invoice" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Due</p>
            <DateDisplay value={invoice.due_date} className="font-black" />
          </div>
        </div>

        {/* Amount */}
        <div className="text-center space-y-2 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount to pay</p>
          <MoneyDisplay amount={Number(invoice.amount_due)} currency={invoice.currency} size="xl" emphasis="primary" />
        </div>

        {/* Payment method selection */}
        <fieldset>
          <legend className="sr-only">Payment method</legend>
          <div className="grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="Payment method">
            <button
              type="button"
              role="radio"
              aria-checked={method === 'mobile_money'}
              onClick={() => selectMethod('mobile_money')}
              className={cn(
                'p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition-all text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                method === 'mobile_money'
                  ? 'border-primary bg-primary/5 shadow-inner'
                  : 'border-muted hover:border-primary/30'
              )}
            >
              <Smartphone
                className={method === 'mobile_money' ? 'text-primary' : 'text-muted-foreground'}
                size={28}
                aria-hidden="true"
              />
              <span className="font-black">Mobile Money</span>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">MTN & Airtel Uganda</p>
                <p className="text-[10px] text-muted-foreground font-medium">Instant payment prompt on your phone</p>
              </div>
              {method === 'mobile_money' && (
                <CheckCircle2 size={16} className="text-primary" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={method === 'card'}
              onClick={() => selectMethod('card')}
              disabled={!cardCheckoutEnabled}
              title={cardCheckoutEnabled ? undefined : 'Card checkout is not available at this time'}
              aria-disabled={!cardCheckoutEnabled}
              className={cn(
                'p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition-all text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                !cardCheckoutEnabled && 'opacity-50 cursor-not-allowed',
                method === 'card'
                  ? 'border-accent bg-accent/5 shadow-inner'
                  : 'border-muted hover:border-accent/30'
              )}
            >
              <CreditCard
                className={method === 'card' ? 'text-accent' : 'text-muted-foreground'}
                size={28}
                aria-hidden="true"
              />
              <span className="font-black">Card</span>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Visa & Mastercard</p>
                <p className="text-[10px] text-muted-foreground font-medium">Redirects to Yo! Payments secure checkout</p>
              </div>
              {method === 'card' && cardCheckoutEnabled && (
                <CheckCircle2 size={16} className="text-accent" aria-hidden="true" />
              )}
            </button>
          </div>
        </fieldset>

        {/* Mobile Money phone input */}
        {method === 'mobile_money' && (
          <div className="space-y-2">
            <label htmlFor="pay-phone" className="text-sm font-bold flex items-center gap-2">
              <Phone size={16} aria-hidden="true" />
              Mobile Money number
              <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground select-none pointer-events-none">
                +256
              </span>
              <Input
                id="pay-phone"
                type="tel"
                value={formatPhoneDisplay(phone)}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                placeholder="700 123 456"
                autoComplete="tel"
                inputMode="tel"
                className="pl-16"
                aria-describedby="pay-phone-hint"
                aria-invalid={!!phoneError}
              />
            </div>
            {phoneError ? (
              <p id="pay-phone-hint" className="text-xs font-bold text-destructive" role="alert">
                {phoneError}
              </p>
            ) : (
              <p id="pay-phone-hint" className="text-xs text-muted-foreground font-medium">
                MTN or Airtel Uganda number. You will receive a PIN prompt on your phone to confirm.
              </p>
            )}
          </div>
        )}

        {/* Card info */}
        {method === 'card' && (
          <div className="p-4 bg-muted/20 rounded-2xl text-center space-y-1">
            <p className="text-sm font-bold">Redirecting to Yo! Payments secure checkout</p>
            <p className="text-xs text-muted-foreground font-medium">
              Pay with Visa or Mastercard. You will be returned here after payment.
            </p>
          </div>
        )}

        {/* Pending state */}
        {pendingMessage && (
          <div
            role="status"
            aria-live="polite"
            className="p-5 bg-primary/10 border border-primary/20 rounded-2xl text-sm font-bold text-primary text-center space-y-2"
          >
            <CheckCircle2 className="mx-auto mb-2" size={24} aria-hidden="true" />
            <p>{pendingMessage}</p>
            <p className="text-xs font-medium text-primary/80">
              Check your phone and enter your Mobile Money PIN to confirm.
            </p>
            <div className="mt-4">
              <Link href={`/tenant/invoices/${invoice.id}`} className="underline underline-offset-4 text-xs">
                Return to invoice
              </Link>
            </div>
          </div>
        )}

        {error && <FormErrorBanner message={error} />}

        {/* Pay button */}
        {!pendingMessage && (
          <Button
            onClick={handlePay}
            disabled={loading}
            size="lg"
            className="w-full text-lg py-6"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                <span>Processing payment…</span>
              </>
            ) : (
              <>
                <ShieldCheck aria-hidden="true" />
                <span>{method === 'mobile_money' ? 'Pay with Mobile Money' : 'Pay with card'}</span>
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-muted-foreground font-bold text-center">
          Payments processed securely by Yo! Payments Uganda
        </p>
      </div>
    </div>
  )
}
