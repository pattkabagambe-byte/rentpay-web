import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import {
  ShieldAlert,
  Hammer,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarDays,
  MessageSquare,
} from 'lucide-react'
import { MaintenanceForm } from '@/features/maintenance/components/maintenance-form'
import { PageHeader, SectionHeading } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import { copy } from '@/lib/copy'
import { cn } from '@/lib/utils'

// Map maintenance status to a visual config
function getStatusConfig(status: string): { icon: React.ElementType; color: string; bg: string } {
  switch (status) {
    case 'resolved':
    case 'closed':
      return { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' }
    case 'in_review':
    case 'scheduled':
      return { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' }
    case 'submitted':
      return { icon: AlertTriangle, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/40' }
    default:
      return { icon: Wrench, color: 'text-muted-foreground', bg: 'bg-muted/30' }
  }
}

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

  const activeIssues = issues?.filter(i => i.status !== 'resolved' && i.status !== 'closed') ?? []
  const resolvedIssues = issues?.filter(i => i.status === 'resolved' || i.status === 'closed') ?? []

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="House Status"
        description="Track maintenance issues and report problems with your unit."
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Issues List */}
        <div className="lg:col-span-2 space-y-8">

          {/* Active Issues */}
          <section className="space-y-5" aria-labelledby="active-issues-heading">
            <SectionHeading count={activeIssues.length}>
              Active Issues
            </SectionHeading>

            <div className="grid gap-3 md:gap-4">
              {activeIssues.length > 0 ? (
                activeIssues.map((issue) => {
                  const { icon: StatusIcon, color, bg } = getStatusConfig(issue.status)
                  return (
                    <div
                      key={issue.id}
                      className={cn(
                        'group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-px transition-all duration-200',
                        'border-l-4',
                        issue.status === 'submitted' ? 'border-l-cyan-400 dark:border-l-cyan-600' :
                        issue.status === 'in_review' || issue.status === 'scheduled' ? 'border-l-amber-400 dark:border-l-amber-600' :
                        'border-l-muted'
                      )}
                    >
                      <div className="p-5 space-y-4">
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bg)}>
                              <StatusIcon size={18} className={color} />
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-black bg-secondary/10 text-secondary px-2 py-0.5 rounded uppercase tracking-tight">
                                  {issue.category}
                                </span>
                                <time
                                  dateTime={issue.created_at}
                                  className="text-xs font-bold text-muted-foreground flex items-center gap-1"
                                >
                                  <CalendarDays size={11} />
                                  {formatDate(issue.created_at)}
                                </time>
                              </div>
                              <p className="font-black text-sm md:text-base leading-snug">{issue.description}</p>
                            </div>
                          </div>
                          <StatusBadge status={issue.status} type="maintenance" />
                        </div>

                        {/* Photos */}
                        {issue.photo_urls?.length > 0 && (
                          <div className="flex gap-2 flex-wrap pl-13" role="list" aria-label="Issue photos">
                            {issue.photo_urls.map((url: string, i: number) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-16 h-16 rounded-xl overflow-hidden border-2 border-muted hover:border-primary/30 transition-colors block"
                                role="listitem"
                                aria-label={`View issue photo ${i + 1}`}
                              >
                                <img src={url} alt={`Issue photo ${i + 1}`} className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Landlord note */}
                        {issue.landlord_note && (
                          <div className="bg-muted/30 p-4 rounded-2xl space-y-1.5 border border-muted ml-13">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare size={12} className="text-muted-foreground" />
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Landlord&apos;s Note</p>
                            </div>
                            <p className="text-sm font-medium">{issue.landlord_note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <EmptyState
                  icon={Hammer}
                  title={copy.maintenance.noIssues}
                  description={copy.maintenance.noIssuesDesc}
                  variant="inline"
                  color="primary"
                />
              )}
            </div>
          </section>

          {/* Resolved Issues */}
          {resolvedIssues.length > 0 && (
            <section className="space-y-5" aria-labelledby="resolved-issues-heading">
              <SectionHeading count={resolvedIssues.length}>
                Resolved
              </SectionHeading>

              <div className="grid gap-3">
                {resolvedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden border-l-4 border-l-emerald-400 dark:border-l-emerald-600 opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-black text-sm truncate">{issue.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{issue.category}</span>
                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                            <time dateTime={issue.created_at} className="text-[10px] font-bold text-muted-foreground">
                              {formatDate(issue.created_at)}
                            </time>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={issue.status} type="maintenance" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <MaintenanceForm tenancy={tenancy} />

          <Card className="bg-accent text-white border-accent shadow-xl shadow-accent/20 space-y-4">
            <ShieldAlert size={32} className="opacity-80" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="text-lg font-black">Emergency Support</h2>
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
