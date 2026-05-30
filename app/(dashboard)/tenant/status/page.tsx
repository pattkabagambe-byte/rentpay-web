import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import {
  ShieldAlert,
  Hammer,
} from 'lucide-react'
import { MaintenanceForm } from '@/features/maintenance/components/maintenance-form'
import { PageHeader } from '@/components/ui/page-header'
import { SectionHeading } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import { copy } from '@/lib/copy'

export default async function HouseStatusPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select('*')
    .eq('tenant_id', user?.id)
    .eq('status', 'active')
    .single()

  if (!tenancy) {
    redirect('/tenant/join-unit')
  }

  const { data: issues } = await supabase
    .from('maintenance_issues')
    .select('*')
    .eq('tenancy_id', tenancy.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="House Status"
        description="Track maintenance issues and report problems with your unit."
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionHeading count={issues?.length || 0}>Recent Requests</SectionHeading>

          <div className="grid gap-4 md:gap-6">
            {issues && issues.length > 0 ? (
              issues.map((issue) => (
                <Card key={issue.id} className="hover:border-primary/20 transition-all">
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black text-secondary bg-secondary/10 px-2 py-0.5 rounded uppercase tracking-tighter">
                            {issue.category}
                          </span>
                          <time dateTime={issue.created_at} className="text-xs font-bold text-muted-foreground">
                            {formatDate(issue.created_at)}
                          </time>
                        </div>
                        <p className="font-black text-base md:text-lg">{issue.description}</p>
                      </div>
                      <StatusBadge status={issue.status} type="maintenance" />
                    </div>

                    {issue.photo_urls?.length > 0 && (
                      <div className="flex gap-2 flex-wrap" role="list" aria-label="Issue photos">
                        {issue.photo_urls.map((url: string, i: number) => (
                          <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-muted" role="listitem">
                            <img src={url} alt={`Issue photo ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {issue.landlord_note && (
                      <div className="bg-muted/30 p-4 md:p-5 rounded-2xl space-y-2 border border-muted">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Landlord&apos;s Note</p>
                        <p className="text-sm font-medium">{issue.landlord_note}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={Hammer}
                title={copy.maintenance.noIssues}
                description={copy.maintenance.noIssuesDesc}
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <MaintenanceForm tenancy={tenancy} />

          <Card className="bg-accent text-white border-accent shadow-xl shadow-accent/20 space-y-4">
            <ShieldAlert size={36} className="opacity-80" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="text-lg md:text-xl font-black">Emergency Support</h2>
              <p className="text-xs font-bold opacity-80 leading-relaxed">
                {copy.maintenance.urgent}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
