import Link from 'next/link'
import { createClient } from '@/supabase/server'
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { formatCurrency, formatDate } from '@/lib/format'

// ── Group transactions by date ─────────────────────────────────────────────────

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (sameDay(date, today)) return 'Today'
  if (sameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function WalletPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  const balance = transactions?.reduce((acc, curr) => {
    return curr.type === 'credit' ? acc + Number(curr.amount) : acc - Number(curr.amount)
  }, 0) || 0

  const totalCredits = transactions?.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const totalDebits = transactions?.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0) ?? 0

  // Group transactions by date
  const grouped: Array<{ label: string; items: typeof transactions }> = []
  for (const tx of transactions ?? []) {
    const label = getDateGroup(tx.created_at)
    const last = grouped[grouped.length - 1]
    if (last && last.label === label) {
      last.items!.push(tx)
    } else {
      grouped.push({ label, items: [tx] })
    }
  }

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Wallet"
        description="Manage your funds via MTN Mobile Money and Airtel Money."
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/tenant/statement"
              className="bg-background border-2 border-muted px-4 md:px-5 py-2.5 md:py-3 rounded-2xl font-bold text-sm hover:border-emerald-500/30 transition-all flex items-center gap-2"
            >
              <FileText size={16} aria-hidden="true" />
              Statement
            </Link>
            <span
              className="bg-muted text-muted-foreground p-2.5 md:p-3 rounded-2xl opacity-50 cursor-not-allowed"
              title="Wallet top-up coming soon"
              aria-label="Add funds (coming soon)"
            >
              <Plus size={20} aria-hidden="true" />
            </span>
          </div>
        }
      />

      {/* ── Premium Balance Card ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-2xl shadow-slate-900/30 p-8 md:p-10">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-600/8 blur-2xl" aria-hidden="true" />
        <div className="absolute top-6 right-6 opacity-[0.06] pointer-events-none" aria-hidden="true">
          <Wallet size={180} />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400/70">
                Available Balance
              </p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                {formatCurrency(balance)}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <CreditCard size={20} className="text-white/70" aria-hidden="true" />
            </div>
          </div>

          {/* Mini stats */}
          {transactions && transactions.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-4 space-y-1.5 border border-white/10">
                <div className="flex items-center gap-1.5 text-emerald-400/80">
                  <TrendingDown size={13} aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Total In</span>
                </div>
                <p className="text-lg font-black">{formatCurrency(totalCredits)}</p>
              </div>
              <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-4 space-y-1.5 border border-white/10">
                <div className="flex items-center gap-1.5 text-rose-400/80">
                  <TrendingUp size={13} aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Total Out</span>
                </div>
                <p className="text-lg font-black">{formatCurrency(totalDebits)}</p>
              </div>
            </div>
          )}

          {/* Disabled action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              disabled
              className="flex-1 bg-white/8 border border-white/10 text-white/40 py-3.5 rounded-2xl font-bold text-sm cursor-not-allowed transition-all"
              title="Coming soon"
            >
              Add Funds (soon)
            </button>
            <button
              disabled
              className="flex-1 bg-white/8 border border-white/10 text-white/40 py-3.5 rounded-2xl font-bold text-sm cursor-not-allowed transition-all"
              title="Coming soon"
            >
              Withdraw (soon)
            </button>
          </div>
        </div>
      </div>

      {/* ── Transactions ────────────────────────────────────────────────────── */}
      <section className="space-y-6" aria-labelledby="transactions-heading">
        <div className="flex items-center justify-between">
          <h2 id="transactions-heading" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Transaction History
          </h2>
          {transactions && transactions.length > 0 && (
            <span className="text-[10px] font-bold text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {transactions && transactions.length > 0 ? (
          <div className="space-y-8">
            {grouped.map(({ label, items }) => (
              <div key={label} className="space-y-2">
                {/* Date group header */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
                  <div className="flex-1 h-px bg-border/60" aria-hidden="true" />
                </div>

                {/* Transaction items */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
                  {(items ?? []).map((tx) => {
                    const isCredit = tx.type === 'credit'
                    return (
                      <div key={tx.id} className="flex items-center gap-4 px-4 py-4 hover:bg-muted/20 transition-colors">
                        {/* Icon */}
                        <div className={cn(
                          'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0',
                          isCredit
                            ? 'bg-emerald-100 dark:bg-emerald-950/50'
                            : 'bg-red-100 dark:bg-red-950/50'
                        )}>
                          {isCredit
                            ? <ArrowDownLeft size={20} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                            : <ArrowUpRight size={20} className="text-red-600 dark:text-red-400" aria-hidden="true" />
                          }
                        </div>

                        {/* Description */}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm capitalize truncate">
                            {tx.description || (isCredit ? 'Rent Payment Received' : 'Rent Payment Sent')}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn(
                              'text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full',
                              tx.status === 'completed'
                                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                                : tx.status === 'failed'
                                ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400'
                                : 'bg-muted text-muted-foreground'
                            )}>
                              {tx.status}
                            </span>
                          </div>
                        </div>

                        {/* Amount + receipt */}
                        <div className="text-right shrink-0">
                          <p className={cn(
                            'text-base font-black tabular-nums',
                            isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                          )}>
                            {isCredit ? '+' : '-'}{formatCurrency(Number(tx.amount), tx.currency)}
                          </p>
                          {!isCredit && tx.status === 'completed' && tx.provider_reference && (
                            <Link
                              href={`/tenant/receipts/${tx.provider_reference}`}
                              className="text-[10px] font-black text-primary hover:underline"
                            >
                              View Receipt
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center gap-6 text-center">
            {/* Wallet illustration */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950/60 dark:to-emerald-900/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Wallet size={40} className="text-emerald-500/60" aria-hidden="true" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-300/30 blur-sm" aria-hidden="true" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-emerald-400/20 blur-sm" aria-hidden="true" />
            </div>
            <div className="space-y-2 max-w-xs">
              <h3 className="font-black text-lg">No transactions yet</h3>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Your wallet transactions will appear here once you make or receive a rent payment.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
