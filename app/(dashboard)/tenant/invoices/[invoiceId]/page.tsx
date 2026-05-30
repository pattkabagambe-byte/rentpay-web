import { createClient } from '@/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft,
    Receipt,
    Calendar,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Download,
    Building2,
    Clock,
    User
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

  const i = invoice as any

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <Link
            href="/tenant/invoices"
            className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Invoices
        </Link>
        <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black tracking-tight">Invoice Detail</h1>
            <div className={cn(
                "px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm",
                i.status === 'paid' ? 'bg-green-500 text-white' :
                i.status === 'overdue' ? 'bg-red-500 text-white' : 'bg-primary text-white'
            )}>
                {i.status === 'paid' ? <CheckCircle2 size={16} /> : i.status === 'overdue' ? <AlertCircle size={16} /> : <Clock size={16} />}
                {i.status}
            </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Invoice Card */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-background border-2 border-muted/50 rounded-[40px] p-10 shadow-sm space-y-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Property</p>
                        <h2 className="text-2xl font-black">{i.properties.name}</h2>
                        <p className="text-sm font-bold text-muted-foreground">{i.properties.address_text}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Unit</p>
                        <h3 className="text-2xl font-black">{i.units.label}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 bg-muted/20 rounded-[32px]">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Period From</p>
                        <p className="font-black text-sm">{new Date(i.period_from).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Period To</p>
                        <p className="font-black text-sm">{new Date(i.period_to).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Due Date</p>
                        <p className={cn("font-black text-sm", i.status === 'overdue' && "text-red-500")}>
                            {new Date(i.due_date).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                        <span className="font-bold text-muted-foreground">Monthly Rent</span>
                        <span className="font-black">{i.currency} {i.amount_due.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-8 bg-primary text-white rounded-[32px] shadow-xl shadow-primary/20">
                        <span className="text-lg font-bold opacity-80">Total Amount Due</span>
                        <span className="text-4xl font-black">{i.currency} {i.amount_due.toLocaleString()}</span>
                    </div>
                </div>

                {i.status !== 'paid' && (
                    <Link
                        href={`/tenant/invoices/${i.id}/pay`}
                        className="w-full bg-foreground text-background py-5 rounded-[24px] font-black text-xl hover:opacity-90 transition-opacity shadow-lg block text-center"
                    >
                        Pay with Mobile Money
                    </Link>
                )}
            </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8">
            {/* Landlord Card */}
            <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-6">
                 <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Payment Recipient</h4>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="font-black">{i.landlord.full_name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Landlord</p>
                    </div>
                 </div>
            </div>

            {/* Support/Info */}
            <div className="bg-accent/10 border-2 border-accent/20 rounded-[40px] p-8 space-y-4">
                <div className="flex items-center gap-2 text-accent">
                    <AlertCircle size={20} />
                    <h4 className="font-black tracking-tight">Need help?</h4>
                </div>
                <p className="text-xs font-bold text-accent/80 leading-relaxed">
                    If you have issues with this invoice, please contact your landlord directly or reach out to RentPay support.
                </p>
                <button className="w-full bg-accent text-white py-3 rounded-2xl font-black text-sm shadow-lg shadow-accent/20">
                    Contact Support
                </button>
            </div>

            <button className="w-full flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                <Download size={18} /> Download PDF Receipt
            </button>
        </div>
      </div>
    </div>
  )
}
