import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft,
    Receipt,
    Calendar,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Building2,
    Clock,
    User,
    MapPin,
    CalendarDays,
    Smartphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MoneyDisplay } from '@/components/ui/money-display'
import { formatDate } from '@/lib/format'

export default async function InvoiceDetailPage({ params }: { params: { invoiceId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, properties(*), units(*), landlord:landlord_id(*)')
    .eq('id', params.invoiceId)
    .eq('tenant_id', user?.id)
    .single()

  if (!invoice) {
    notFound()
  }

  // Load payment history for this invoice
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', params.invoiceId)
    .order('created_at', { ascending: false })

  const i = invoice as any

  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode; borderTop: string }> = {
    paid: {
      label: 'Paid',
      bg: 'bg-emerald-500',
      text: 'text-white',
      borderTop: 'bg-emerald-500',
      icon: <CheckCircle2 size={16} />,
    },
    overdue: {
      label: 'Overdue',
      bg: 'bg-red-500',
      text: 'text-white',
      borderTop: 'bg-red-500',
      icon: <AlertCircle size={16} />,
    },
    due: {
      label: 'Due',
      bg: 'bg-amber-500',
      text: 'text-white',
      borderTop: 'bg-amber-500',
      icon: <Clock size={16} />,
    },
  }
  const sc = statusConfig[i.status] ?? statusConfig.due

  return (
    <div className="space-y-8 pb-20">
      {/* Back + Title row */}
      <div className="space-y-4">
        <Link
          href="/tenant/invoices"
          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          All Invoices
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Invoice Detail</h1>
            <p className="text-sm text-muted-foreground font-medium">
              {i.properties?.name ?? 'Property'} &bull; {i.units?.label ?? 'Unit'}
            </p>
          </div>
          <span className={cn(
            'self-start sm:self-auto px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm',
            sc.bg, sc.text
          )}>
            {sc.icon}
            {sc.label}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Invoice Card */}
        <div className="lg:col-span-2 space-y-6">

          {/* Overdue warning */}
          {i.status === 'overdue' && (
            <div className="rounded-2xl p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-start gap-3" role="alert">
              <AlertCircle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-sm text-red-800 dark:text-red-300">This invoice is overdue</p>
                <p className="text-xs font-bold text-red-600/80 dark:text-red-400/80 mt-0.5">
                  Payment was due on {formatDate(i.due_date)}. Please pay immediately to avoid any late fees.
                </p>
              </div>
            </div>
          )}

          {/* Invoice body */}
          <div className="bg-background border-2 border-muted/50 rounded-[40px] overflow-hidden shadow-sm">
            {/* Coloured top bar */}
            <div className={cn('h-2 w-full', sc.borderTop)} />

            <div className="p-8 md:p-10 space-y-8">
              {/* Property + Unit */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Property</p>
                  <h2 className="text-xl font-black">{i.properties?.name ?? '—'}</h2>
                  {i.properties?.address_text && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium">
                      <MapPin size={13} className="shrink-0 text-primary" />
                      {i.properties.address_text}
                    </div>
                  )}
                </div>
                <div className="sm:text-right space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Unit</p>
                  <h3 className="text-xl font-black">{i.units?.label ?? '—'}</h3>
                </div>
              </div>

              {/* Dates grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-muted/20 rounded-[28px]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <CalendarDays size={11} /> Period From
                  </div>
                  <p className="font-black text-sm">{formatDate(i.period_from)}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <CalendarDays size={11} /> Period To
                  </div>
                  <p className="font-black text-sm">{formatDate(i.period_to)}</p>
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Clock size={11} /> Due Date
                  </div>
                  <p className={cn('font-black text-sm', i.status === 'overdue' && 'text-red-500 dark:text-red-400')}>
                    {formatDate(i.due_date)}
                  </p>
                </div>
              </div>

              {/* Amount breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                  <span className="text-sm font-bold text-muted-foreground">Monthly Rent</span>
                  <MoneyDisplay amount={Number(i.amount_due)} currency={i.currency} size="md" />
                </div>
                <div className={cn(
                  'flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-6 md:p-8 rounded-[28px] shadow-lg',
                  i.status === 'paid' ? 'bg-emerald-500' :
                  i.status === 'overdue' ? 'bg-red-500' : 'bg-primary'
                )}>
                  <span className="text-base font-bold text-white/80">Total Amount Due</span>
                  <MoneyDisplay
                    amount={Number(i.amount_due)}
                    currency={i.currency}
                    size="xl"
                    className="text-white"
                  />
                </div>
              </div>

              {/* Pay CTA */}
              {i.status !== 'paid' && (
                <Link
                  href={`/tenant/invoices/${i.id}/pay`}
                  className={cn(
                    'w-full flex items-center justify-center gap-3 py-5 rounded-[24px] font-black text-lg hover:opacity-90 transition-all shadow-lg block text-center',
                    i.status === 'overdue'
                      ? 'bg-red-600 text-white shadow-red-500/20'
                      : 'bg-foreground text-background shadow-foreground/20'
                  )}
                >
                  <Smartphone size={22} />
                  Pay with Mobile Money
                </Link>
              )}

              {/* Paid confirmation */}
              {i.status === 'paid' && (
                <div className="flex items-center justify-center gap-3 py-5 rounded-[24px] bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800/50">
                  <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="font-black text-emerald-700 dark:text-emerald-400">Invoice Fully Paid</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          {payments && payments.length > 0 && (
            <div className="bg-background border-2 border-muted/50 rounded-[40px] overflow-hidden shadow-sm">
              <div className="p-8 border-b border-muted">
                <div className="flex items-center gap-2">
                  <Receipt size={18} className="text-primary" />
                  <h3 className="font-black text-lg">Payment History</h3>
                </div>
              </div>
              <div className="divide-y divide-muted">
                {payments.map((payment: any) => (
                  <div key={payment.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-sm capitalize">{payment.method || 'Mobile Money'}</p>
                        {payment.provider_reference && (
                          <p className="text-[10px] font-mono text-muted-foreground uppercase">
                            Ref: {payment.provider_reference}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-0.5">
                      <MoneyDisplay amount={Number(payment.amount)} currency={payment.currency} size="md" emphasis="positive" />
                      {payment.paid_at && (
                        <p className="text-xs text-muted-foreground font-medium">{formatDate(payment.paid_at)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Landlord Card */}
          <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-6 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Recipient</h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 text-primary shrink-0">
                {i.landlord?.avatar_url
                  ? <img src={i.landlord.avatar_url} alt={i.landlord.full_name} className="w-full h-full object-cover rounded-full" />
                  : <User size={22} />
                }
              </div>
              <div className="min-w-0">
                <p className="font-black truncate">{i.landlord?.full_name ?? '—'}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Landlord</p>
              </div>
            </div>
          </div>

          {/* Invoice Summary Card */}
          <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-5 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Summary</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground">Invoice Ref</span>
                <span className="font-mono font-bold text-xs">RP-{i.id.split('-')[0].toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground">Currency</span>
                <span className="font-black text-sm">{i.currency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground">Status</span>
                <span className={cn(
                  'font-black text-xs uppercase tracking-widest px-2.5 py-1 rounded-full',
                  i.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                  i.status === 'overdue' ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' :
                  'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                )}>
                  {sc.label}
                </span>
              </div>
            </div>
          </div>

          {/* Help card */}
          <div className="bg-muted/30 border-2 border-muted/50 rounded-[40px] p-8 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle size={18} />
              <h4 className="font-black text-sm">Need help?</h4>
            </div>
            <p className="text-xs font-bold text-muted-foreground leading-relaxed">
              If you have a dispute or questions about this invoice, please contact your landlord directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
