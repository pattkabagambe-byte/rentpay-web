import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import {
    FileText,
    Gavel,
    Download,
    Trash2,
    ImageIcon,
    ShieldCheck,
    ExternalLink,
    BadgeCheck,
    FileArchive,
    FileScan,
    Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocumentUploader } from '@/features/documents/components/document-uploader'
import { formatDate } from '@/lib/format'

// Map document types to icons + colours
function getDocTypeConfig(type: string): { icon: React.ElementType; color: string; bg: string } {
  switch (type?.toLowerCase()) {
    case 'tenancy_agreement':
    case 'agreement':
      return { icon: Gavel, color: 'text-primary', bg: 'bg-primary/10' }
    case 'id':
    case 'national_id':
      return { icon: BadgeCheck, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/40' }
    case 'receipt':
      return { icon: FileArchive, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' }
    case 'scan':
    case 'pdf':
      return { icon: FileScan, color: 'text-accent', bg: 'bg-accent/10' }
    default:
      return { icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted/30' }
  }
}

export default async function TenantDocumentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select('*, properties(name), units(label)')
    .eq('tenant_id', user?.id)
    .eq('status', 'active')
    .single()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id_front_url, id_back_url')
    .eq('id', user?.id)
    .single()

  const hasIdDocs = !!(profile?.id_front_url || profile?.id_back_url)

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Documents"
        description="Secure storage for tenancy agreements, IDs, and property records."
      />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">

          {/* Essential Documents */}
          <section className="space-y-5" aria-labelledby="essential-docs-heading">
            <h3 id="essential-docs-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Essential Records
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="/tenant/documents/agreement"
                className="group bg-background border-2 border-primary/20 rounded-[28px] p-6 flex items-center justify-between hover:bg-primary/5 hover:border-primary/40 hover:-translate-y-px transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Gavel size={24} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-black group-hover:text-primary transition-colors truncate">Tenancy Agreement</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Legally Binding Contract</p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-muted-foreground/40 group-hover:text-primary shrink-0 ml-2 transition-colors" />
              </Link>

              <Link
                href="/tenant/statement"
                className="group bg-background border-2 border-accent/20 rounded-[28px] p-6 flex items-center justify-between hover:bg-accent/5 hover:border-accent/40 hover:-translate-y-px transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-black group-hover:text-accent transition-colors truncate">Account Statement</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Payment History</p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-muted-foreground/40 group-hover:text-accent shrink-0 ml-2 transition-colors" />
              </Link>
            </div>
          </section>

          {/* Identity Documents */}
          {hasIdDocs && (
            <section className="space-y-5" aria-labelledby="id-docs-heading">
              <h3 id="id-docs-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Identity Documents
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {profile?.id_front_url && (
                  <a
                    href={profile.id_front_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-background border-2 border-muted/50 rounded-[28px] p-5 flex items-center gap-4 hover:border-cyan-300 dark:hover:border-cyan-700 hover:-translate-y-px transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                      <ImageIcon size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-sm truncate">National ID — Front</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <BadgeCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Verified</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-muted-foreground/40 group-hover:text-cyan-500 shrink-0 transition-colors" />
                  </a>
                )}
                {profile?.id_back_url && (
                  <a
                    href={profile.id_back_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-background border-2 border-muted/50 rounded-[28px] p-5 flex items-center gap-4 hover:border-cyan-300 dark:hover:border-cyan-700 hover:-translate-y-px transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                      <ImageIcon size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-sm truncate">National ID — Back</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <BadgeCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Verified</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-muted-foreground/40 group-hover:text-cyan-500 shrink-0 transition-colors" />
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Uploaded Documents */}
          <section className="space-y-5" aria-labelledby="other-docs-heading">
            <div className="flex items-center justify-between">
              <h3 id="other-docs-heading" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Other Documents
              </h3>
              {documents && documents.length > 0 && (
                <span className="text-[10px] font-black text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
                  {documents.length} file{documents.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="grid gap-3">
              {documents && documents.length > 0 ? (
                documents.map((doc) => {
                  const { icon: DocIcon, color, bg } = getDocTypeConfig(doc.type)
                  return (
                    <div
                      key={doc.id}
                      className="group bg-background border-2 border-muted/50 rounded-[24px] p-5 flex items-center justify-between hover:border-primary/20 hover:-translate-y-px transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', bg)}>
                          <DocIcon size={20} className={color} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-sm truncate max-w-[180px] sm:max-w-xs">{doc.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wide">{doc.type}</span>
                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                            <span className="text-[10px] font-bold text-muted-foreground">{formatDate(doc.created_at)}</span>
                            {doc.file_size && (
                              <>
                                <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                <span className="text-[10px] font-bold text-muted-foreground">{(doc.file_size / 1024).toFixed(0)} KB</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Download ${doc.title}`}
                            className="p-2.5 bg-primary/10 rounded-xl text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Download size={16} />
                          </a>
                        )}
                        <form action={async () => {
                          'use server'
                          const { createClient } = await import('@/supabase/server')
                          const supabase = createClient()
                          await supabase.from('documents').delete().eq('id', doc.id)
                        }}>
                          <button
                            type="submit"
                            aria-label={`Delete ${doc.title}`}
                            className="p-2.5 bg-muted rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="bg-background border-4 border-dashed border-muted/50 rounded-[32px] p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
                    <Upload size={28} className="text-muted-foreground/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-muted-foreground">No documents uploaded yet</p>
                    <p className="text-sm font-medium text-muted-foreground/70 max-w-xs mx-auto">
                      Upload utility bills, paper agreements, or other important tenancy records to keep them safe.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Uploader */}
          <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-5 shadow-sm">
            <div className="space-y-1">
              <h4 className="text-xl font-black">Upload New</h4>
              <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                Upload utility bills, paper agreements, or other important records.
              </p>
            </div>
            <DocumentUploader
              tenancyId={tenancy?.id}
              bucket="tenancy-documents"
              type="tenant_upload"
            />
          </div>

          {/* Encryption badge */}
          <div className="bg-primary text-white rounded-[40px] p-8 shadow-xl shadow-primary/20 space-y-4">
            <ShieldCheck size={36} className="opacity-80" />
            <div className="space-y-2">
              <h4 className="text-lg font-black">Encrypted Storage</h4>
              <p className="text-xs font-bold opacity-80 leading-relaxed">
                All documents are encrypted at rest. Only you and your authorized property managers can access them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
