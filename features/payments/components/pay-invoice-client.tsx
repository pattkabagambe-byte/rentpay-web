'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { initiateInvoicePayment } from '@/features/payments/actions'
import {
  Loader2, CreditCard, Smartphone, ShieldCheck, Phone,
  CheckCircle2, ChevronDown, ChevronUp, Percent,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { MoneyDisplay } from '@/components/ui/money-display'
import { DateDisplay } from '@/components/ui/date-display'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { formatMonthYear, normalizePhoneUG, isValidPhoneUG, formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

type PaymentMethod = 'mobile_money' | 'card'
type AmountMode = 'full' | 'partial'

interface PayInvoiceClientProps {
  invoice: {
    id: string
    amount_due: number
    amount_paid: number
    amount_remaining: number
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
  const local = digits.startsWith('256') && digits.length > 9
    ? '0' + digits.slice(3)
    : digits
  if (local.length <= 4) return local
  if (local.length <= 7) return `${local.slice(0, 4)} ${local.slice(4)}`
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7, 11)}`
}

/** Round to nearest 500 UGX for nicer quick-pay amounts */
function roundToNearest500(n: number): number {
  return Math.round(n / 500) * 500
}

export function PayInvoiceClient({ invoice, cardCheckoutEnabled }: PayInvoiceClientProps) {
  const amountDue = invoice.amount_due
  const amountPaid = invoice.amount_paid
  const amountRemaining = invoice.amount_remaining

  const [method, setMethod] = useState<PaymentMethod>('mobile_money')
  const [amountMode, setAmountMode] = useState<AmountMode>('full')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [customAmountError, setCustomAmountError] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const { toast } = useToast()

  // The amount that will actually be paid in this transaction
  const effectiveAmount: number = (() => {
    if (amountMode === 'full') return amountRemaining
    const parsed = parseFloat(customAmount.replace(/,/g, ''))
    if (!isNaN(parsed) && parsed > 0) return Math.min(parsed, amountRemaining)
    return 0
  })()

  // Progress bar widths (as percentages of amountDue)
  const paidPct = amountDue > 0 ? Math.min((amountPaid / amountDue) * 100, 100) : 0
  const thisPct = amountDue > 0 ? Math.min((effectiveAmount / amountDue) * 100, 100 - paidPct) : 0
  const remainingPct = Math.max(0, 100 - paidPct - thisPct)

  const hasPartialHistory = amountPaid > 0 && amountPaid < amountDue

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stripped = e.target.value.replace(/\s/g, '')
    setPhone(stripped)
    setPhoneError(null)
    setError(null)
  }

  const handlePhoneBlur = () => {
    if (phone && !isValidPhoneUG(phone)) {
      setPhoneError('Enter a valid Uganda mobile number (e.g. 0700 123 456)')
    }
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '')
    setCustomAmount(val)
    setCustomAmountError(null)
    setError(null)
  }

  const setQuickAmount = useCallback((pct: number) => {
    const raw = roundToNearest500((amountRemaining * pct) / 100)
    const clamped = Math.min(raw, amountRemaining)
    setCustomAmount(String(Math.max(clamped, 1)))
    setCustomAmountError(null)
    setAmountMode('partial')
  }, [amountRemaining])

  const validateCustomAmount = (): boolean => {
    const parsed = parseFloat(customAmount.replace(/,/g, ''))
    if (isNaN(parsed) || parsed <= 0) {
      setCustomAmountError('Enter a valid payment amount.')
      return false
    }
    if (parsed > amountRemaining) {
      setCustomAmountError(`Amount cannot exceed the remaining balance of ${formatCurrency(amountRemaining, invoice.currency)}.`)
      return false
    }
    return true
  }

  const handlePay = async () => {
    setError(null)
    setPendingMessage(null)

    if (amountMode === 'partial' && !validateCustomAmount()) return

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
        paymentAmount: amountMode === 'partial' ? effectiveAmount : undefined,
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

  const payButtonLabel = (() => {
    if (effectiveAmount <= 0) return method === 'mobile_money' ? 'Pay with Mobile Money' : 'Pay with Card'
    const fmtAmount = formatCurrency(effectiveAmount, invoice.currency)
    return method === 'mobile_money'
      ? `Pay ${fmtAmount} with Mobile Money`
      : `Pay ${fmtAmount} with Card`
  })()

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <PageHeader
        title="Secure payment"
        description="Pay with MTN/Airtel Mobile Money or Visa/Mastercard via Yo! Payments."
        backHref={`/tenant/invoices/${invoice.id}`}
        backLabel="Back to invoice"
      />

      <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 md:p-10 space-y-8 shadow-sm">

        {/* ── Invoice summary card ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-muted/20 rounded-[24px]">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Invoice</p>
            <p className="font-black text-lg">{formatMonthYear(invoice.period_from)}</p>
            <p className="text-sm font-bold text-muted-foreground">
              {invoice.properties?.name}{invoice.units?.label ? ` · ${invoice.units.label}` : ''}
            </p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <StatusBadge status={invoice.status} type="invoice" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Due</p>
            <DateDisplay value={invoice.due_date} className="font-black" />
          </div>
        </div>

        {/* ── Payment progress section ─────────────────────────────────────── */}
        <div className="space-y-3 p-5 bg-muted/10 rounded-[20px] border border-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Invoice total
            </p>
            <MoneyDisplay amount={amountDue} currency={invoice.currency} size="md" emphasis="default" />
          </div>

          {/* 3-part progress bar */}
          <div
            className="flex h-3 rounded-full overflow-hidden gap-0.5"
            role="progressbar"
            aria-valuenow={Math.round(paidPct + thisPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Payment progress"
          >
            {/* Already paid — emerald */}
            {paidPct > 0 && (
              <div
                className="bg-emerald-500 dark:bg-emerald-400 rounded-l-full transition-all duration-500"
                style={{ width: `${paidPct}%` }}
              />
            )}
            {/* This payment — amber, animated */}
            {thisPct > 0 && (
              <div
                className={cn(
                  'bg-amber-400 dark:bg-amber-300 transition-all duration-500',
                  paidPct === 0 && 'rounded-l-full',
                  remainingPct === 0 && 'rounded-r-full',
                )}
                style={{ width: `${thisPct}%` }}
              />
            )}
            {/* Remaining — muted */}
            {remainingPct > 0 && (
              <div
                className={cn(
                  'bg-muted/40 dark:bg-muted/30 rounded-r-full transition-all duration-500',
                  paidPct === 0 && thisPct === 0 && 'rounded-l-full',
                )}
                style={{ width: `${remainingPct}%` }}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold">
            {hasPartialHistory && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block" />
                {formatCurrency(amountPaid, invoice.currency)} paid
              </span>
            )}
            {effectiveAmount > 0 && (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-300 inline-block" />
                {formatCurrency(effectiveAmount, invoice.currency)} this payment
              </span>
            )}
            {amountRemaining - effectiveAmount > 0 && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-muted/60 inline-block" />
                {formatCurrency(Math.max(0, amountRemaining - effectiveAmount), invoice.currency)} remaining
              </span>
            )}
            {effectiveAmount >= amountRemaining && amountRemaining > 0 && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={12} />
                Clears balance
              </span>
            )}
          </div>
        </div>

        {/* ── Amount selector ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Payment amount
          </p>

          {/* Full / Partial toggle */}
          <div className="flex bg-muted/20 border border-muted/40 rounded-2xl p-1 gap-1" role="radiogroup" aria-label="Payment amount mode">
            <button
              type="button"
              role="radio"
              aria-checked={amountMode === 'full'}
              onClick={() => { setAmountMode('full'); setCustomAmountError(null) }}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-xl text-sm font-black transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                amountMode === 'full'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Full amount
              <span className="ml-2 text-[10px] font-medium opacity-70">
                {formatCurrency(amountRemaining, invoice.currency)}
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={amountMode === 'partial'}
              onClick={() => setAmountMode('partial')}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-xl text-sm font-black transition-all duration-200 flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                amountMode === 'partial'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Percent size={12} />
              Partial amount
            </button>
          </div>

          {/* Partial amount input + quick buttons */}
          {amountMode === 'partial' && (
            <div className="space-y-3 p-4 bg-muted/10 border border-muted/30 rounded-2xl">
              {/* Quick percent buttons */}
              <div className="flex gap-2 flex-wrap">
                {[25, 50, 75].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setQuickAmount(pct)}
                    className="px-3 py-1.5 rounded-xl bg-background border border-muted/50 text-[11px] font-black hover:border-primary/40 hover:bg-primary/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Pay {pct}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setCustomAmount(''); setCustomAmountError(null) }}
                  className="px-3 py-1.5 rounded-xl bg-background border border-muted/50 text-[11px] font-black hover:border-primary/40 hover:bg-primary/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Custom
                </button>
              </div>

              {/* Currency-prefixed input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground select-none pointer-events-none">
                  {invoice.currency}
                </span>
                <Input
                  id="partial-amount"
                  type="text"
                  inputMode="decimal"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="0"
                  className={cn('pl-16', customAmountError && 'border-destructive')}
                  aria-label="Custom payment amount"
                  aria-describedby={customAmountError ? 'amount-error' : 'amount-hint'}
                  aria-invalid={!!customAmountError}
                />
              </div>
              {customAmountError ? (
                <p id="amount-error" className="text-xs font-bold text-destructive" role="alert">
                  {customAmountError}
                </p>
              ) : (
                <p id="amount-hint" className="text-xs text-muted-foreground font-medium">
                  Maximum: {formatCurrency(amountRemaining, invoice.currency)}
                  {effectiveAmount > 0 && effectiveAmount < amountRemaining && (
                    <span className="ml-2 text-amber-600 dark:text-amber-400 font-bold">
                      — {formatCurrency(amountRemaining - effectiveAmount, invoice.currency)} will remain after this payment
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Payment method selection ─────────────────────────────────────── */}
        <fieldset>
          <legend className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">
            Payment method
          </legend>
          <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Payment method">
            <button
              type="button"
              role="radio"
              aria-checked={method === 'mobile_money'}
              onClick={() => selectMethod('mobile_money')}
              className={cn(
                'flex-1 min-w-[140px] p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                method === 'mobile_money'
                  ? 'border-primary bg-primary/5 shadow-inner'
                  : 'border-muted hover:border-primary/30'
              )}
            >
              <Smartphone
                className={method === 'mobile_money' ? 'text-primary' : 'text-muted-foreground'}
                size={22}
                aria-hidden="true"
              />
              <span className="font-black text-sm">Mobile Money</span>
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">MTN & Airtel</p>
              {method === 'mobile_money' && (
                <CheckCircle2 size={14} className="text-primary" aria-hidden="true" />
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
                'flex-1 min-w-[140px] p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                !cardCheckoutEnabled && 'opacity-50 cursor-not-allowed',
                method === 'card'
                  ? 'border-accent bg-accent/5 shadow-inner'
                  : 'border-muted hover:border-accent/30'
              )}
            >
              <CreditCard
                className={method === 'card' ? 'text-accent' : 'text-muted-foreground'}
                size={22}
                aria-hidden="true"
              />
              <span className="font-black text-sm">Card</span>
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Visa & Mastercard</p>
              {method === 'card' && cardCheckoutEnabled && (
                <CheckCircle2 size={14} className="text-accent" aria-hidden="true" />
              )}
            </button>
          </div>
        </fieldset>

        {/* ── Mobile Money phone input ─────────────────────────────────────── */}
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

        {/* ── Card info ────────────────────────────────────────────────────── */}
        {method === 'card' && (
          <div className="p-4 bg-muted/20 rounded-2xl text-center space-y-1">
            <p className="text-sm font-bold">Redirecting to Yo! Payments secure checkout</p>
            <p className="text-xs text-muted-foreground font-medium">
              Pay with Visa or Mastercard. You will be returned here after payment.
            </p>
          </div>
        )}

        {/* ── Pending state ────────────────────────────────────────────────── */}
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

        {/* ── Pay button ───────────────────────────────────────────────────── */}
        {!pendingMessage && (
          <Button
            onClick={handlePay}
            disabled={loading || (amountMode === 'partial' && effectiveAmount <= 0)}
            size="lg"
            className="w-full text-base py-6"
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
                <span>{payButtonLabel}</span>
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
