import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import Link from 'next/link'
import {
    FileText,
    FileSignature,
    Upload,
    ArrowRight,
    ShieldCheck,
    Gavel,
    Download,
    Trash2,
    ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocumentUploader } from '@/features/documents/components/document-uploader'

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

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Documents"
        description="Secure storage for tenancy agreements, IDs, and property records."
      />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
            {/* Essential Documents */}
            <div className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Essential Records</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link
                        href="/tenant/documents/agreement"
                        className="group bg-background border-2 border-primary/20 rounded-[32px] p-8 flex items-center justify-between hover:bg-primary/5 transition-all shadow-sm"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Gavel size={28} />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="font-black group-hover:text-primary transition-colors">Tenancy Agreement</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Legally Binding Contract</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/tenant/statement"
                        className="group bg-background border-2 border-accent/20 rounded-[32px] p-8 flex items-center justify-between hover:bg-accent/5 transition-all shadow-sm"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                <FileText size={28} />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="font-black group-hover:text-accent transition-colors">Account Statement</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Payment History</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* My Identification */}
            <div className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Identity Documents</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {profile?.id_front_url && (
                        <a href={profile.id_front_url} target="_blank" className="bg-background border-2 border-muted/50 rounded-[32px] p-6 flex items-center gap-4 hover:border-primary/30 transition-all">
                             <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                <ImageIcon size={24} />
                             </div>
                             <div>
                                 <p className="font-black text-sm">National ID Front</p>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase">VERIFIED</p>
                             </div>
                        </a>
                    )}
                    {profile?.id_back_url && (
                        <a href={profile.id_back_url} target="_blank" className="bg-background border-2 border-muted/50 rounded-[32px] p-6 flex items-center gap-4 hover:border-primary/30 transition-all">
                             <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                <ImageIcon size={24} />
                             </div>
                             <div>
                                 <p className="font-black text-sm">National ID Back</p>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase">VERIFIED</p>
                             </div>
                        </a>
                    )}
                </div>
            </div>

            {/* General Uploads */}
            <div className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Other Documents</h3>
                <div className="grid gap-4">
                    {documents && documents.length > 0 ? (
                        documents.map((doc) => (
                            <div key={doc.id} className="bg-background border-2 border-muted/50 rounded-[32px] p-6 flex items-center justify-between shadow-sm group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black truncate max-w-[200px]">{doc.title}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase">{doc.type}</span>
                                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                            <span className="text-[10px] font-black text-muted-foreground uppercase">{new Date(doc.created_at).toLocaleDateString()}</span>
                                            {doc.file_size && (
                                                <>
                                                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase">{(doc.file_size / 1024).toFixed(0)} KB</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {doc.file_url && (
                                        <a href={doc.file_url} target="_blank" className="p-3 bg-primary/10 rounded-xl text-primary hover:bg-primary/20 transition-colors">
                                            <Download size={18} />
                                        </a>
                                    )}
                                    <form action={async () => {
                                        'use server'
                                        const { createClient } = await import('@/supabase/server')
                                        const supabase = createClient()
                                        await supabase.from('documents').delete().eq('id', doc.id)
                                    }}>
                                        <button className="p-3 bg-muted rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-background border-4 border-dashed border-muted/50 rounded-[40px] p-20 text-center">
                            <FileText size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
                            <p className="text-muted-foreground font-medium italic">Your document history is empty.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Sidebar Uploader */}
        <div className="space-y-8">
            <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-6 shadow-sm">
                <h4 className="text-xl font-black">Upload New</h4>
                <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                    Upload utility bills, paper agreements, or other important tenancy records to keep them safe.
                </p>
                <DocumentUploader
                    tenancyId={tenancy?.id}
                    bucket="tenancy-documents"
                    type="tenant_upload"
                />
            </div>

            <div className="bg-primary text-white rounded-[40px] p-8 shadow-xl shadow-primary/20 space-y-6">
                <ShieldCheck size={40} className="opacity-80" />
                <div className="space-y-2">
                    <h4 className="text-xl font-black">Secure Encryption</h4>
                    <p className="text-xs font-bold opacity-80 leading-relaxed">
                        All documents uploaded to RentPay are encrypted at rest and only accessible to you and your authorized property managers.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
