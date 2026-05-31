import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  CheckCircle2,
  User,
  Building2,
  CreditCard,
  Hash,
  Fingerprint,
  Download,
  Smartphone,
  MapPin,
  CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SignatureForm } from '@/features/documents/components/signature-form'
import { formatDate, formatDateTime } from '@/lib/format'
import { MoneyDisplay } from '@/components/ui/money-display'

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
    .contains('signature_data', { payment_id: payment.id })
    .maybeSingle()

  const p = payment as any

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Back nav */}
      <div className="flex flex-col gap-4">
        <Link
          href="/tenant/statement"
          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Back to Statement
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Official Receipt</h1>
          <div className="self-start flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm shadow-emerald-500/20">
            <CheckCircle2 size={15} />
            VERIFIED
          </div>
        </div>
      </div>

      {/* Receipt Document */}
      <div className="bg-background border-2 border-muted/50 rounded-[40px] overflow-hidden shadow-sm print:border print:shadow-none">
        {/* Green top bar */}
        <div className="h-2 w-full bg-emerald-500" />

        <div className="p-8 md:p-10 space-y-8">

          {/* Branding + meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-muted">
            {/* RentPay logo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-white font-black text-xl leading-none">R</span>
                </div>
                <span className="font-black text-2xl tracking-tight">RentPay</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Receipt Number</p>
                <p className="font-mono font-bold text-sm">RP-{p.id.split('-')[0].toUpperCase()}</p>
              </div>
            </div>

            {/* Date + status */}
            <div className="text-left sm:text-right space-y-4">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date Issued</p>
                <p className="font-bold text-sm">{formatDate(p.paid_at)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Payment Status</p>
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <p className="font-black text-sm text-emerald-600 dark:text-emerald-400 uppercase">Successful</p>
                </div>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid sm:grid-cols-2 gap-8">
            {/* Tenant */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Paid By (Tenant)</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User size={18} className="text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-black truncate">{p.payer?.full_name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.payer?.email}</p>
                </div>
              </div>
            </div>

            {/* Landlord */}
            <div className="space-y-3 sm:text-right">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Received By (Landlord)</p>
              <div className="flex items-center gap-3 sm:flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User size={18} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-black truncate">{p.tenancies?.landlord?.full_name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.tenancies?.landlord?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Property */}
          <div className="bg-muted/20 rounded-[28px] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-primary" />
              <h3 className="font-black text-sm">Property &amp; Unit</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Property</p>
                <p className="font-black">{p.tenancies?.properties?.name ?? '—'}</p>
                {p.tenancies?.properties?.address_text && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <MapPin size={11} className="shrink-0" />
                    {p.tenancies.properties.address_text}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Unit</p>
                <p className="font-black text-lg">{p.tenancies?.units?.label ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary Table */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-primary" />
              <h3 className="font-black text-sm">Payment Summary</h3>
            </div>
            <div className="border-2 border-muted rounded-[28px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-muted/40 border-b-2 border-muted">
                  <tr>
                    <th className="px-5 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</th>
                    <th className="px-5 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Method</th>
                    <th className="px-5 md:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-muted">
                  <tr>
                    <td className="px-5 md:px-6 py-5">
                      <p className="font-bold text-sm">Monthly Rent</p>
                      {p.invoices?.period_from && p.invoices?.period_to && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <CalendarDays size={11} />
                          {formatDate(p.invoices.period_from)} — {formatDate(p.invoices.period_to)}
                        </p>
                      )}
                    </td>
                    <td className="px-5 md:px-6 py-5 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Smartphone size={14} className="text-muted-foreground shrink-0" />
                        <span className="font-bold text-sm capitalize">{p.method || 'Mobile Money'}</span>
                        {p.provider && (
                          <span className="text-[9px] font-black bg-muted px-2 py-0.5 rounded-full uppercase">{p.provider}</span>
                        )}
                      </div>
                      {p.provider_reference && (
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Ref: {p.provider_reference}</p>
                      )}
                    </td>
                    <td className="px-5 md:px-6 py-5 text-right">
                      <MoneyDisplay amount={Number(p.amount)} currency={p.currency} size="lg" emphasis="primary" />
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-primary/5 border-t-2 border-muted">
                  <tr>
                    <td colSpan={2} className="px-5 md:px-6 py-5 font-black text-right text-[10px] uppercase tracking-widest">
                      Total Amount Paid
                    </td>
                    <td className="px-5 md:px-6 py-5 text-right">
                      <MoneyDisplay amount={Number(p.amount)} currency={p.currency} size="xl" emphasis="primary" />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile method row */}
            <div className="sm:hidden flex items-center gap-2 px-1">
              <Smartphone size={14} className="text-muted-foreground shrink-0" />
              <span className="font-bold text-sm capitalize">{p.method || 'Mobile Money'}</span>
              {p.provider && (
                <span className="text-[9px] font-black bg-muted px-2 py-0.5 rounded-full uppercase">{p.provider}</span>
              )}
              {p.provider_reference && (
                <span className="text-[10px] font-mono text-muted-foreground ml-auto">Ref: {p.provider_reference}</span>
              )}
            </div>
          </div>

          {/* Signature + QR row */}
          <div className="pt-8 border-t-2 border-dashed border-muted flex flex-col sm:flex-row justify-between items-end gap-8">
            {/* Signature */}
            <div className="space-y-4 w-full sm:w-auto">
              {document ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Digitally Signed By Tenant</p>
                  <div className="space-y-1">
                    <p className="font-signature text-3xl text-primary leading-none">
                      {(document.signature_data as any).initials}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Fingerprint size={11} />
                      <span>Auth Ref: {(document.signature_data as any).fingerprint_ref || document.id.split('-')[0]}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                      Signed on {formatDateTime(document.created_at)}
                    </p>
                  </div>
                </div>
              ) : (
                <SignatureForm paymentId={p.id} tenantName={p.payer?.full_name} />
              )}
            </div>

            {/* QR placeholder */}
            <div className="text-center space-y-2 opacity-40 shrink-0">
              <div className="w-24 h-24 bg-muted rounded-2xl mx-auto flex items-center justify-center border-2 border-muted-foreground/10">
                <Hash size={36} className="text-muted-foreground/30" />
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest">Scan to verify</p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-muted text-center space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground">
              This is an official digital receipt issued by RentPay Uganda.
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              Receipt ID: {p.id} &bull; Issued: {formatDateTime(p.paid_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Download action */}
      <div className="flex justify-center">
        <button className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors px-6 py-3 rounded-2xl hover:bg-primary/5">
          <Download size={18} />
          Download as Official PDF
        </button>
      </div>
    </div>
  )
}
