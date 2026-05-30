import { createClient } from '@/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { ComingSoonButton } from '@/components/ui/coming-soon-button'
import Link from 'next/link'
import {
    FileText,
    User,
    Calendar,
} from 'lucide-react'

export default async function LandlordTenancyStatementPage({ params }: { params: { tenancyId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select(`
      *,
      properties(*),
      units(*),
      tenant:tenant_id(*)
    `)
    .eq('id', params.tenancyId)
    .eq('landlord_id', user?.id)
    .single()

  if (!tenancy) {
    notFound()
  }

  const { data: payments } = await supabase
    .from('payments')
    .select('*, invoices(*)')
    .eq('tenancy_id', params.tenancyId)
    .eq('status', 'completed')
    .order('paid_at', { ascending: false })

  const { data: docs } = await supabase
    .from('documents')
    .select('*')
    .eq('tenancy_id', params.tenancyId)
    .order('created_at', { ascending: false })

  const t = tenancy as any
  const totalReceived = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  return (
    <div className="space-y-10">
      <PageHeader
        title="Tenancy statement"
        description={`Payment history for ${t.tenant.full_name} at ${t.units.label}`}
        backHref={`/landlord/properties/${t.property_id}/units/${t.unit_id}`}
        backLabel="Back to unit"
        action={<ComingSoonButton label="Download PDF" variant="primary" icon={<FileText size={18} />} />}
      />

      <div className="grid md:grid-cols-3 gap-8">
          {/* Tenant Card */}
          <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Tenant Information</h3>
              <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg">
                      <User size={32} className="text-primary" />
                  </div>
                  <div>
                      <p className="text-xl font-black">{t.tenant.full_name}</p>
                      <p className="text-xs font-bold text-muted-foreground">{t.tenant.email}</p>
                  </div>
              </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-primary text-white rounded-[40px] p-8 shadow-xl shadow-primary/20 flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total Revenue Collected</p>
              <h3 className="text-4xl font-black tracking-tighter">UGX {totalReceived.toLocaleString()}</h3>
          </div>

          {/* Property Info */}
          <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-4">
               <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Rental Info</h3>
               <div className="space-y-2">
                    <p className="font-bold text-lg">{t.properties.name}</p>
                    <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-muted-foreground">Monthly Rent:</span>
                        <span className="text-primary">{t.units.currency} {t.units.rent_amount.toLocaleString()}</span>
                    </div>
               </div>
          </div>
      </div>

      <div className="bg-background border-2 border-muted/50 rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-muted">
            <h3 className="text-xl font-black">Tenancy Documents</h3>
        </div>
        <div className="p-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {docs && docs.length > 0 ? (
                docs.map((doc) => (
                    <div key={doc.id} className="bg-muted/20 border-2 border-muted rounded-3xl p-6 flex flex-col justify-between gap-4 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-sm truncate">{doc.title}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{doc.type} • {new Date(doc.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {doc.file_url && (
                                <a href={doc.file_url} target="_blank" className="flex-1 bg-background border-2 border-muted py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-primary/5 hover:border-primary/20 transition-all">
                                    View File
                                </a>
                            )}
                            <Link href={`/landlord/tenancies/${t.id}/agreement`} className="flex-1 bg-background border-2 border-muted py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-primary/5 hover:border-primary/20 transition-all">
                                Open Portal
                            </Link>
                        </div>
                    </div>
                ))
             ) : (
                <div className="col-span-full py-10 text-center text-muted-foreground italic text-sm">No documents uploaded for this tenancy.</div>
             )}
        </div>
      </div>

      <div className="bg-background border-2 border-muted/50 rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-muted">
            <h3 className="text-xl font-black">Received Payments</h3>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <th className="px-8 py-4">Date</th>
                        <th className="px-8 py-4">Rent Period</th>
                        <th className="px-8 py-4">Payment Method</th>
                        <th className="px-8 py-4 text-right">Amount Received</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                    {payments && payments.length > 0 ? (
                        payments.map((p: any) => (
                            <tr key={p.id} className="hover:bg-muted/5 transition-colors">
                                <td className="px-8 py-6 font-bold text-sm">
                                    {new Date(p.paid_at).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-sm font-bold">
                                        {new Date(p.invoices.period_from).toLocaleDateString()} - {new Date(p.invoices.period_to).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm capitalize">{p.method || 'Online'}</p>
                                        <span className="text-[10px] font-black bg-muted px-2 py-0.5 rounded-full uppercase tracking-tighter">{p.provider}</span>
                                    </div>
                                    <p className="text-[10px] font-mono text-muted-foreground uppercase mt-1">{p.provider_reference}</p>
                                </td>
                                <td className="px-8 py-6 text-right font-black text-primary">
                                    {p.currency} {p.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-8 py-20 text-center">
                                <div className="space-y-4">
                                    <FileText size={48} className="mx-auto text-muted-foreground opacity-20" />
                                    <p className="text-muted-foreground font-medium italic">No payments received yet for this tenancy.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}
