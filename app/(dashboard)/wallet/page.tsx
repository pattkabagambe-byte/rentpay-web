import Link from 'next/link'
import { createClient } from '@/supabase/server'
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, FileText } from 'lucide-react'
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

      <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-primary shadow-2xl shadow-primary/30 relative overflow-hidden group p-8 md:p-10">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform" aria-hidden="true">
          <Wallet size={200} />
        </div>
        <div className="relative z-10 space-y-6 md:space-y-8">
          <div className="flex justify-between items-center">
            <p className="text-base md:text-lg font-bold opacity-80">Available Balance</p>
            <RefreshCw size={18} className="opacity-50 cursor-pointer hover:opacity-100 transition-opacity" aria-hidden="true" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">{formatCurrency(balance)}</h2>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <button disabled className="flex-1 bg-white/10 text-white/60 py-4 rounded-2xl font-bold cursor-not-allowed" title="Coming soon">
              Withdraw (soon)
            </button>
            <button disabled className="flex-1 bg-white/10 text-white/60 py-4 rounded-2xl font-bold cursor-not-allowed" title="Coming soon">
              Deposit (soon)
            </button>
          </div>
        </div>
      </Card>

      <section className="space-y-6" aria-labelledby="transactions-heading">
        <h2 id="transactions-heading" className="text-xl font-black">Recent Transactions</h2>
        <div className="grid gap-4">
          {transactions && transactions.length > 0 ? (
            transactions.map((tx) => (
              <Card key={tx.id} className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
                    tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  )}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={24} aria-hidden="true" /> : <ArrowUpRight size={24} aria-hidden="true" />}
                  </div>
                  <div>
                    <p className="font-black text-base md:text-lg capitalize">{tx.type} Payment</p>
                    <time dateTime={tx.created_at} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {formatDate(tx.created_at)}
                    </time>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className={cn(
                    'text-lg md:text-xl font-black',
                    tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Number(tx.amount), tx.currency)}
                  </p>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full">{tx.status}</span>
                    {tx.type === 'debit' && tx.status === 'completed' && (
                      <Link
                        href={`/tenant/receipts/${tx.provider_reference}`}
                        className="text-[10px] font-black text-primary uppercase hover:underline"
                      >
                        Receipt
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={Wallet}
              title="No transactions yet"
              description="Your wallet transactions will appear here once you make a payment."
            />
          )}
        </div>
      </section>
    </div>
  )
}
