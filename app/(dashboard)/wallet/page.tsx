import Link from 'next/link'
import { createClient } from '@/supabase/server'
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, FileText, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/format'

export default async function WalletPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  const balance = transactions?.reduce((acc, curr) => {
    return curr.type === 'credit' ? acc + curr.amount : acc - curr.amount
  }, 0) || 0

  const totalCredits = transactions?.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const totalDebits = transactions?.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0) ?? 0

  return (
    <div className="space-y-10">
      <PageHeader
        title="Wallet"
        description="Manage your funds via MTN Mobile Money and Airtel Money."
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/tenant/statement"
              className="bg-background border-2 border-muted px-4 md:px-6 py-3 md:py-4 rounded-2xl font-bold text-sm hover:border-primary/30 transition-all flex items-center gap-2"
            >
              <FileText size={18} aria-hidden="true" />
              Statement
            </Link>
            <span
              className="bg-primary/10 text-primary p-3 md:p-4 rounded-2xl opacity-60 cursor-not-allowed"
              title="Wallet top-up coming soon"
              aria-label="Add funds (coming soon)"
            >
              <Plus size={24} aria-hidden="true" />
            </span>
          </div>
        }
      />

      {/* Balance card */}
      <Card className="bg-gradient-to-br from-emerald-600 via-primary to-teal-600 text-white border-0 shadow-2xl shadow-primary/25 relative overflow-hidden p-8 md:p-10">
        <div className="absolute top-0 right-0 p-8 opacity-[0.07]" aria-hidden="true">
          <Wallet size={220} />
        </div>
        <div className="relative z-10 space-y-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-white/70 uppercase tracking-widest mb-1">
                Available Balance
              </p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                {formatCurrency(balance)}
              </h2>
            </div>
            <RefreshCw
              size={18}
              className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer mt-1"
              aria-label="Refresh balance"
            />
          </div>

          {/* Mini stats */}
          {transactions && transactions.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-white/70">
                  <TrendingDown size={14} aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wide">Total In</span>
                </div>
                <p className="text-lg font-black">{formatCurrency(totalCredits)}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-white/70">
                  <TrendingUp size={14} aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wide">Total Out</span>
                </div>
                <p className="text-lg font-black">{formatCurrency(totalDebits)}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              disabled
              className="flex-1 bg-white/10 text-white/50 py-3.5 rounded-2xl font-bold text-sm cursor-not-allowed"
              title="Coming soon"
            >
              Withdraw (soon)
            </button>
            <button
              disabled
              className="flex-1 bg-white/10 text-white/50 py-3.5 rounded-2xl font-bold text-sm cursor-not-allowed"
              title="Coming soon"
            >
              Deposit (soon)
            </button>
          </div>
        </div>
      </Card>

      {/* Transactions */}
      <section className="space-y-5" aria-labelledby="transactions-heading">
        <div className="flex items-center justify-between">
          <h2 id="transactions-heading" className="text-xl font-black">Transaction History</h2>
          {transactions && transactions.length > 0 && (
            <span className="text-xs font-bold text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="grid gap-3">
          {transactions && transactions.length > 0 ? (
            transactions.map((tx) => (
              <Card key={tx.id} className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn(
                    'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0',
                    tx.type === 'credit'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  )}>
                    {tx.type === 'credit'
                      ? <ArrowDownLeft size={22} aria-hidden="true" />
                      : <ArrowUpRight size={22} aria-hidden="true" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm md:text-base capitalize truncate">
                      {tx.description || (tx.type === 'credit' ? 'Rent Payment Received' : 'Rent Payment Sent')}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <time
                        dateTime={tx.created_at}
                        className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
                      >
                        {formatDate(tx.created_at)}
                      </time>
                      <span className={cn(
                        'text-[10px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full',
                        tx.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : tx.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={cn(
                    'text-base md:text-lg font-black',
                    tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Number(tx.amount), tx.currency)}
                  </p>
                  {tx.type === 'debit' && tx.status === 'completed' && (
                    <Link
                      href={`/tenant/receipts/${tx.provider_reference}`}
                      className="text-[10px] font-black text-primary hover:underline"
                    >
                      View Receipt
                    </Link>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={Wallet}
              title="No transactions yet"
              description="Your wallet transactions will appear here once you make or receive a rent payment."
              color="primary"
            />
          )}
        </div>
      </section>
    </div>
  )
}
