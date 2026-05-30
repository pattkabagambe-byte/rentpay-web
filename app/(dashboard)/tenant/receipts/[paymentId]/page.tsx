import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Receipt, CheckCircle2, User, Building2, Calendar, CreditCard, Hash, Fingerprint } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SignatureForm } from '@/features/documents/components/signature-form'

export default async function ReceiptPage({ params }: { params: { paymentId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: payment } = await supabase
    .from('payments')
    .select(`
      *,
      invoices(*),
      tenancies(*, properties(*), units(*), landlord:landlord_id(*)),
      payer:payer_id(full_name, email)
    `)
    .eq('id', params.paymentId)
    .eq('payer_id', user?.id)
    .single()

  if (!payment) {
    notFound()
  }

  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('type', 'receipt')
    .eq('tenancy_id', payment.tenancy_id)
    .contains('signature_data', { payment_id: payment.id }) // We should add payment_id to signature_data
    .maybeSingle()

  // Fallback check if the above contains filter is too strict or if we haven't implemented it yet
  // For now let's just find any receipt for this tenancy created around the same time or better,
  // let's update the signReceipt action to include payment_id in signature_data.

  const p = payment as any

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col gap-4">
        <Link
            href="/wallet"
            className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Wallet
        </Link>
        <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black tracking-tight">Official Receipt</h1>
            <div className="bg-green-500 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                <CheckCircle2 size={16} />
                VERIFIED
            </div>
        </div>
      </div>

      <div className="bg-background border-2 border-muted/50 rounded-[40px] overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-3 bg-primary" />

        <div className="p-10 space-y-10">
            {/* Header Info */}
            <div className="flex justify-between items-start border-b border-muted pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-white font-black text-xl">R</span>
                        </div>
                        <span className="font-black text-2xl tracking-tight text-foreground">RentPay</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Receipt Number</p>
                        <p className="font-mono font-bold text-sm">RP-{p.id.split('-')[0].toUpperCase()}</p>
                    </div>
                </div>
                <div className="text-right space-y-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date Issued</p>
                        <p className="font-bold text-sm">{new Date(p.paid_at).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</p>
                        <p className="font-black text-green-600 text-sm uppercase">SUCCESSFUL</p>
                    </div>
                </div>
            </div>

            {/* Parties */}
            <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Paid By (Tenant)</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <User size={20} className="text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-black">{p.payer.full_name}</p>
                            <p className="text-xs text-muted-foreground">{p.payer.email}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 md:text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Received By (Landlord)</p>
                    <div className="flex items-center gap-3 md:flex-row-reverse">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User size={20} className="text-primary" />
                        </div>
                        <div>
                            <p className="font-black">{p.tenancies.landlord.full_name}</p>
                            <p className="text-xs text-muted-foreground">{p.tenancies.landlord.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Property Details */}
            <div className="bg-muted/30 rounded-[32px] p-8 space-y-6">
                <div className="flex items-center gap-2">
                    <Building2 className="text-primary" size={20} />
                    <h3 className="font-black text-lg">Property & Unit</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Address</p>
                        <p className="font-bold">{p.tenancies.properties.name}</p>
                        <p className="text-xs text-muted-foreground">{p.tenancies.properties.address_text}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Unit</p>
                        <p className="font-bold text-lg">{p.tenancies.units.label}</p>
                    </div>
                </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-6">
                 <div className="flex items-center gap-2">
                    <CreditCard className="text-primary" size={20} />
                    <h3 className="font-black text-lg">Payment Summary</h3>
                </div>
                <div className="border-2 border-muted rounded-[32px] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b-2 border-muted">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Method</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-muted">
                            <tr>
                                <td className="px-6 py-6">
                                    <p className="font-bold">Rent Payment</p>
                                    <p className="text-xs text-muted-foreground">
                                        Period: {new Date(p.invoices.period_from).toLocaleDateString()} - {new Date(p.invoices.period_to).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold capitalize">{p.method || 'Online'}</p>
                                        <span className="text-[8px] font-black bg-muted px-2 py-0.5 rounded-full uppercase">{p.provider}</span>
                                    </div>
                                    <p className="text-[10px] font-mono text-muted-foreground uppercase mt-1">Ref: {p.provider_reference}</p>
                                </td>
                                <td className="px-6 py-6 text-right font-black text-xl text-primary">
                                    {p.currency} {p.amount.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot className="bg-primary/5">
                            <tr>
                                <td colSpan={2} className="px-6 py-6 font-black text-right uppercase tracking-widest text-xs">Total Amount Paid</td>
                                <td className="px-6 py-6 text-right font-black text-2xl text-primary">{p.currency} {p.amount.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Digital Signature */}
            <div className="pt-10 border-t-2 border-dashed border-muted flex flex-col md:flex-row justify-between items-end gap-10">
                <div className="space-y-6 w-full md:w-auto">
                    {document ? (
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Digitally Signed By Tenant</p>
                            <div className="space-y-1">
                                <p className="font-signature text-3xl text-primary">{(document.signature_data as any).initials}</p>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <Fingerprint size={12} />
                                    <span>Auth Ref: {(document.signature_data as any).fingerprint_ref || document.id.split('-')[0]}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">Signed on {new Date(document.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ) : (
                        <SignatureForm paymentId={p.id} tenantName={p.payer.full_name} />
                    )}
                </div>

                <div className="text-center md:text-right space-y-2 opacity-50">
                    <div className="w-32 h-32 bg-muted rounded-2xl mx-auto md:ml-auto flex items-center justify-center border-2 border-muted-foreground/10">
                         <Hash size={48} className="text-muted-foreground opacity-20" />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest">Scan to verify authenticity</p>
                </div>
            </div>
        </div>
      </div>

      <div className="flex justify-center">
         <button className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <DownloadIcon size={18} /> Download as Official PDF
         </button>
      </div>
    </div>
  )
}

function DownloadIcon({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
        </svg>
    )
}
