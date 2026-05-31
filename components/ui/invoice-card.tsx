import React from 'react'
import Link from 'next/link'
import { Receipt, AlertCircle, CheckCircle2, Clock, CalendarDays, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MoneyDisplay } from './money-display'
import { DateDisplay } from './date-display'
import { Button } from './button'
import { formatCurrency } from '@/lib/format'

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type InvoiceStatus = 'paid' | 'due' | 'overdue' | 'pending' | 'partial'

interface InvoiceCardProps {
  id: string
  periodFrom: string
  dueDate: string
  amount: number
  currency?: string
  status: InvoiceStatus | string
  propertyName: string
  unitLabel: string
  /** Show an inline "Pay Now" button for due/overdue invoices */
  showPayButton?: boolean
  onPay?: (id: string) => void
  /** Amount already paid towards this invoice (for partial payment progress) */
  amountPaid?: number
  /** Amount still outstanding (may differ from amount when partial payments exist) */
  amountRemaining?: number
}

/* -------------------------------------------------------------------------- */
/*  Status config                                                              */
/* -------------------------------------------------------------------------- */

interface InvoiceStatusConfig {
  icon: LucideIcon
  label: string
  iconColor: string
  badgeBg: string
  badgeText: string
  borderAccent: string
  amountEmphasis: 'default' | 'positive' | 'negative' | 'primary' | 'muted'
  urgency: boolean
}

const statusConfig: Record<string, InvoiceStatusConfig> = {
  paid: {
    icon: CheckCircle2,
    label: 'Paid',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    borderAccent: 'border-l-emerald-400 dark:border-l-emerald-600',
    amountEmphasis: 'positive',
    urgency: false,
  },
  due: {
    icon: Clock,
    label: 'Due',
    iconColor: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/50',
    badgeText: 'text-amber-700 dark:text-amber-400',
    borderAccent: 'border-l-amber-400 dark:border-l-amber-600',
    amountEmphasis: 'primary',
    urgency: false,
  },
  overdue: {
    icon: AlertCircle,
    label: 'Overdue',
    iconColor: 'text-red-500 dark:text-red-400',
    badgeBg: 'bg-red-50 dark:bg-red-950/50',
    badgeText: 'text-red-700 dark:text-red-400',
    borderAccent: 'border-l-red-500 dark:border-l-red-600',
    amountEmphasis: 'negative',
    urgency: true,
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    iconColor: 'text-slate-400 dark:text-slate-500',
    badgeBg: 'bg-slate-50 dark:bg-slate-900',
    badgeText: 'text-slate-600 dark:text-slate-400',
    borderAccent: 'border-l-slate-300 dark:border-l-slate-600',
    amountEmphasis: 'muted',
    urgency: false,
  },
  partial: {
    icon: Clock,
    label: 'Partially paid',
    iconColor: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/50',
    badgeText: 'text-amber-700 dark:text-amber-400',
    borderAccent: 'border-l-amber-400 dark:border-l-amber-500',
    amountEmphasis: 'primary',
    urgency: false,
  },
}

const fallbackStatus = statusConfig.pending

/* -------------------------------------------------------------------------- */
/*  InvoiceCard                                                                */
/* -------------------------------------------------------------------------- */

export function InvoiceCard({
  id,
  periodFrom,
  dueDate,
  amount,
  currency = 'UGX',
  status,
  propertyName,
  unitLabel,
  showPayButton = true,
  onPay,
  amountPaid,
  amountRemaining,
}: InvoiceCardProps) {
  const sc = statusConfig[status] ?? fallbackStatus
  const StatusIcon = sc.icon
  const canPay = (status === 'due' || status === 'overdue' || status === 'partial') && showPayButton

  // Determine if we should show a partial progress bar
  const hasPartial = typeof amountPaid === 'number' && amountPaid > 0 && amountPaid < amount
  const paidPct = hasPartial && amount > 0 ? Math.min((amountPaid! / amount) * 100, 100) : 0

  const cardContent = (
    <div
      className={cn(
        /* Base */
        'group bg-card border border-border rounded-2xl overflow-hidden',
        /* Left accent border */
        'border-l-4',
        sc.borderAccent,
        /* Hover */
        'hover:shadow-md hover:border-primary/20 hover:-translate-y-px',
        'transition-all duration-200',
        /* Urgency pulse for overdue */
        sc.urgency && 'animate-[pulse_3s_ease-in-out_infinite]'
      )}
    >
      <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
            sc.badgeBg
          )}
          aria-hidden="true"
        >
          <Receipt size={20} className={sc.iconColor} strokeWidth={2} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Period + status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-black text-foreground group-hover:text-primary transition-colors duration-200">
              <DateDisplay value={periodFrom} variant="month" />
            </span>
            {/* Status badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border',
                sc.badgeBg,
                sc.badgeText,
                'border-current/20'
              )}
              aria-label={`Status: ${sc.label}`}
            >
              <StatusIcon size={9} className={sc.iconColor} strokeWidth={2.5} />
              {sc.label}
            </span>
          </div>

          {/* Property + unit */}
          <p className="text-sm text-muted-foreground font-medium truncate">
            {propertyName} &bull; {unitLabel}
          </p>

          {/* Partial payment progress bar */}
          {hasPartial && (
            <div className="pt-1.5 space-y-1">
              <div className="flex h-1.5 rounded-full overflow-hidden bg-muted/40">
                <div
                  className="bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(amountPaid!, currency)} paid
                </span>
                {typeof amountRemaining === 'number' && (
                  <span className="ml-1.5">
                    &middot; {formatCurrency(amountRemaining, currency)} remaining
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Trailing: due date + amount + optional pay button */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
          {/* Due date */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <CalendarDays size={12} aria-hidden="true" />
            <span className="text-[11px] font-semibold">
              <DateDisplay value={dueDate} className="text-[11px]" />
            </span>
          </div>

          {/* Amount — show remaining if partial, else full amount */}
          <MoneyDisplay
            amount={hasPartial && typeof amountRemaining === 'number' ? amountRemaining : amount}
            currency={currency}
            size="lg"
            emphasis={sc.amountEmphasis}
          />

          {/* Pay button (non-link, acts as CTA inside the wrapping link) */}
          {canPay && onPay && (
            <Button
              size="sm"
              variant={status === 'overdue' ? 'destructive' : 'primary'}
              className="text-[11px] h-7 px-3"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onPay(id)
              }}
            >
              Pay Now
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Link
      href={`/tenant/invoices/${id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-2xl"
      aria-label={`Invoice for ${periodFrom} — ${sc.label} — ${amount.toLocaleString()} ${currency}`}
    >
      {cardContent}
    </Link>
  )
}
