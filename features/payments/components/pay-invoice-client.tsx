'use client'

import { useState } from 'react'
import Link from 'next/link'
import { initiateInvoicePayment } from '@/features/payments/actions'
import { Loader2, CreditCard, Smartphone, ShieldCheck, Phone } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { MoneyDisplay } from '@/components/ui/money-display'
import { DateDisplay } from '@/components/ui/date-display'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { formatMonthYear } from '@/lib/format'
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

export function PayInvoiceClient({ invoice, cardCheckoutEnabled }: PayInvoiceClientProps) {
  const [method, setMethod] = useState<PaymentMethod>('mobile_money')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const { toast } = useToast()

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    setPendingMessage(null)

    try {
      const result = await initiateInvoicePayment({
        invoiceId: invoice.id,
        method,
        phone: method === 'mobile_money' ? phone : undefined,
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
      toast('Payment could not be started.', 'error')
      setLoading(false)
    }
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

        <div className="text-center space-y-2 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount to pay</p>
          <MoneyDisplay amount={Number(invoice.amount_due)} currency={invoice.currency} size="xl" emphasis="primary" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setMethod('mobile_money')}
            className={cn(
              'p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition-all text-left md:text-center',
              method === 'mobile_money' ? 'border-primary bg-primary/5 shadow-inner' : 'border-muted hover:border-primary/30'
            )}
          >
            <Smartphone className="text-primary" size={28} aria-hidden="true" />
            <span className="font-black">Mobile Money</span>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">MTN & Airtel</p>
          </button>
          <button
            type="button"
            onClick={() => cardCheckoutEnabled && setMethod('card')}
            disabled={!cardCheckoutEnabled}
            title={cardCheckoutEnabled ? undefined : 'Card checkout URL not configured'}
            className={cn(
              'p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition-all',
              !cardCheckoutEnabled && 'opacity-50 cursor-not-allowed',
              method === 'card' ? 'border-accent bg-accent/5 shadow-inner' : 'border-muted hover:border-accent/30'
            )}
          >
            <CreditCard className="text-accent" size={28} aria-hidden="true" />
            <span className="font-black">Card</span>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Visa & Mastercard</p>
          </button>
        </div>

        {method === 'mobile_money' && (
          <div className="space-y-2">
            <label htmlFor="pay-phone" className="text-sm font-bold flex items-center gap-2">
              <Phone size={16} aria-hidden="true" />
              Mobile Money number
            </label>
            <Input
              id="pay-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0700 123 456"
              autoComplete="tel"
            />
            <p className="text-xs text-muted-foreground font-medium">
              You will receive a prompt on your phone to enter your Mobile Money PIN.
            </p>
          </div>
        )}

        {method === 'card' && (
          <p className="text-sm text-muted-foreground font-medium text-center p-4 bg-muted/20 rounded-2xl">
            You will be redirected to Yo! Payments secure checkout for Visa or Mastercard.
          </p>
        )}

        {pendingMessage && (
          <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl text-sm font-bold text-primary text-center">
            {pendingMessage}
            <div className="mt-4">
              <Link href={`/tenant/invoices/${invoice.id}`} className="underline underline-offset-4">
                Return to invoice
              </Link>
            </div>
          </div>
        )}

        {error && <FormErrorBanner message={error} />}

        {!pendingMessage && (
          <Button onClick={handlePay} disabled={loading} size="lg" className="w-full text-lg py-6">
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
            {method === 'mobile_money' ? 'Pay with Mobile Money' : 'Pay with card'}
          </Button>
        )}

        <p className="text-xs text-muted-foreground font-bold text-center">
          Payments processed securely by Yo! Payments Uganda
        </p>
      </div>
    </div>
  )
}
