'use client'

import { useState } from 'react'
import { initiateInvoicePayment } from '@/features/payments/actions'
import { Loader2, CreditCard, Smartphone, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { MoneyDisplay } from '@/components/ui/money-display'
import { DateDisplay } from '@/components/ui/date-display'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { formatMonthYear } from '@/lib/format'

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
}

export function PayInvoiceClient({ invoice }: PayInvoiceClientProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await initiateInvoicePayment(invoice.id)
      if (result.redirect_url) {
        toast('Redirecting to secure payment…', 'info')
        window.location.href = result.redirect_url
      } else {
        setError(result.error || 'Failed to initiate payment')
        toast('Payment could not be started.', 'error')
        setLoading(false)
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
        description="Pay your rent via Mobile Money or card through Pesapal."
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

        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="text-primary" size={40} aria-hidden="true" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-6 border-2 border-muted rounded-3xl flex flex-col items-center gap-3 bg-muted/5">
            <Smartphone className="text-primary" size={28} aria-hidden="true" />
            <span className="font-bold">Mobile Money</span>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">MTN & Airtel</p>
          </div>
          <div className="p-6 border-2 border-muted rounded-3xl flex flex-col items-center gap-3 bg-muted/5">
            <CreditCard className="text-accent" size={28} aria-hidden="true" />
            <span className="font-bold">Card payment</span>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Visa & Mastercard</p>
          </div>
        </div>

        {error && <FormErrorBanner message={error} />}

        <Button onClick={handlePay} disabled={loading} size="lg" className="w-full text-lg py-6">
          {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
          Pay now
        </Button>

        <p className="text-xs text-muted-foreground font-bold text-center">
          Payments processed securely by Pesapal Uganda
        </p>
      </div>
    </div>
  )
}
