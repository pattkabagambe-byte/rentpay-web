import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft,
    Receipt,
    ArrowRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    Droplets,
    Zap,
    Trash2,
    FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { refreshAllInvoiceStatuses } from '@/features/invoices/actions'
import { UtilityBillForm } from '@/features/utilities/components/utility-bill-form'
import { markUtilityPaid } from '@/features/utilities/actions'

export default async function LandlordUnitInvoicesPage({ params }: { params: { propertyId: string, unitId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await refreshAllInvoiceStatuses()

  const { data: unit } = await supabase
    .from('units')
    .select('*, properties(name)')
    .eq('id', params.unitId)
    .eq('owner_id', user?.id)
    .single()

  if (!unit) {
    notFound()
  }

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, profiles:tenant_id(full_name)')
    .eq('unit_id', params.unitId)
    .order('period_from', { ascending: false })

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select('id')
    .eq('unit_id', params.unitId)
    .eq('status', 'active')
    .single()

  const { data: utilityBills } = await supabase
    .from('utility_bills')
    .select('*')
    .eq('tenancy_id', tenancy?.id)
    .order('created_at', { ascending: false })

  const getUtilityIcon = (type: string) => {
    switch (type) {
        case 'water': return <Droplets className="text-blue-500" />
        case 'power': return <Zap className="text-amber-500" />
        case 'rubbish': return <Trash2 className="text-secondary" />
        default: return <FileText className="text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-4">
        <Link
            href={`/landlord/properties/${params.propertyId}/units/${params.unitId}`}
            className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Unit
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">Financials</h1>
            <p className="text-muted-foreground font-medium">History for {unit.label} at {(unit.properties as any).name}</p>
          </div>
          {tenancy && <div className="w-full md:w-80"><UtilityBillForm tenancyId={tenancy.id} /></div>}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Rent Invoices */}
        <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Rent Invoices</h3>
            <div className="grid gap-4">
                {invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                    <div
                    key={invoice.id}
                    className="bg-background border-2 border-muted/50 rounded-[32px] p-6 flex items-center justify-between group shadow-sm"
                    >
                    <div className="flex items-center gap-4 min-w-0">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                            invoice.status === 'paid' ? 'bg-green-100 text-green-600' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        )}>
                            <Receipt size={24} />
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-black truncate">{new Date(invoice.period_from).toLocaleString('default', { month: 'short', year: 'numeric' })}</h4>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                    invoice.status === 'paid' ? 'bg-green-500 text-white' :
                                    invoice.status === 'overdue' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                                )}>
                                    {invoice.status}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">UGX {invoice.amount_due.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    {invoice.status !== 'paid' && (
                        <button className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-colors">
                            Mark Paid
                        </button>
                    )}
                    </div>
                ))
                ) : (
                <div className="bg-background border-2 border-dashed border-muted/50 rounded-[32px] p-10 text-center text-muted-foreground italic text-sm">
                    No rent invoices.
                </div>
                )}
            </div>
        </div>

        {/* Utility Bills */}
        <div className="space-y-6">
             <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Utility Bills</h3>
             <div className="grid gap-4">
                {utilityBills && utilityBills.length > 0 ? (
                    utilityBills.map((bill) => (
                        <div key={bill.id} className="bg-background border-2 border-muted/50 rounded-[32px] p-6 flex items-center justify-between group shadow-sm">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                    bill.status === 'paid' ? 'bg-green-100' : 'bg-muted/30'
                                )}>
                                    {getUtilityIcon(bill.type)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black truncate capitalize">{bill.type} Bill</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                            bill.status === 'paid' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                                        )}>
                                            {bill.status}
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{bill.currency} {bill.amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {bill.status === 'pending' && (
                                    <form action={async () => {
                                        'use server'
                                        const { createClient } = await import('@/supabase/server')
                                        const supabase = createClient()
                                        await supabase.from('utility_bills').update({ status: 'paid' }).eq('id', bill.id)
                                    }}>
                                        <button type="submit" className="bg-foreground text-background px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-colors">
                                            Mark Paid
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-background border-2 border-dashed border-muted/50 rounded-[32px] p-10 text-center text-muted-foreground italic text-sm">
                        No utility bills sent.
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>
  )
}
