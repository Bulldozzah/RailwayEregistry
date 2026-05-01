import { Link, useParams } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useRegulations, useRegulation } from "@/hooks/use-regulations";
import { Calendar, MessageSquare, ThumbsUp, ArrowRight, FileText, Users, Loader2 } from "lucide-react";

export const NoticesHome = () => {
  const { data: regulationsData, isLoading } = useRegulations({ per_page: 25, published: 1 });
  const regulations = regulationsData?.data ?? [];

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Notice & Comment"
        title="Public consultation on proposed regulations"
        description="Review and submit feedback on regulations before they become law. Your voice matters."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Notice & Comment" }]}
      />
      <section className="container-page py-12">
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: FileText, label: "Open Consultations", value: String(regulationsData?.total ?? 0) },
            { icon: MessageSquare, label: "Total Comments", value: regulations.reduce((s, r) => s + (r.comment_count ?? 0), 0).toLocaleString() },
            { icon: Users, label: "Regulations", value: String(regulationsData?.total ?? 0) },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-sand-200 rounded-2xl p-6 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-copper-50 text-copper-600 flex items-center justify-center">
                <s.icon size={20} />
              </div>
              <div>
                <div className="text-2xl font-serif font-medium">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="font-serif text-2xl font-medium mb-6">Open for comment</h2>
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-copper-600" size={32} /></div>
        ) : (
          <div className="space-y-4">
            {regulations.map((r) => {
              const closing = r.closing_date ? new Date(r.closing_date) : null;
              const daysLeft = closing ? Math.max(0, Math.ceil((closing.getTime() - Date.now()) / 86400000)) : 0;
              return (
                <article key={r.id} className="bg-white border border-sand-200 p-6 md:p-8 rounded-2xl hover:border-copper-500/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{r.agency_name}</div>
                      <h3 className="font-serif text-xl font-medium mb-2">
                        <Link to={`/notices/regulation/${r.id}`} className="hover:text-primary transition-colors">{r.title}</Link>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">{r.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5"><Calendar size={12} /> Closes {r.closing_date || 'TBD'}</span>
                        <span className="inline-flex items-center gap-1.5"><MessageSquare size={12} /> {r.comment_count ?? 0} comments</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
                      <span className="inline-flex items-center bg-copper-50 text-copper-600 text-xs font-medium px-3 py-1.5 rounded-full">
                        {daysLeft} days left
                      </span>
                      <Link to={`/notices/regulation/${r.id}`} className="text-sm font-semibold inline-flex items-center gap-1 hover:text-primary">
                        Read & Comment <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PublicLayout>
  );
};

export const RegulationDetail = () => {
  const { id } = useParams();
  const { data: regResponse, isLoading } = useRegulation(id);
  const reg = regResponse?.data;

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container-page py-32 flex justify-center"><Loader2 className="animate-spin text-copper-600" size={32} /></div>
      </PublicLayout>
    );
  }

  if (!reg) {
    return (
      <PublicLayout>
        <div className="container-page py-32 text-center">
          <h1 className="font-serif text-3xl font-medium mb-3">Regulation not found</h1>
          <Link to="/notices" className="text-copper-600 hover:underline">Back to consultations</Link>
        </div>
      </PublicLayout>
    );
  }

  const closing = reg.closing_date ? new Date(reg.closing_date) : null;
  const daysLeft = closing ? Math.max(0, Math.ceil((closing.getTime() - Date.now()) / 86400000)) : 0;
  const comments = reg.comments ?? [];

  return (
    <PublicLayout>
      <PageHeader
        eyebrow={reg.agency_name || 'Agency'}
        title={reg.title}
        description={reg.description || ''}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Notice & Comment", to: "/notices" },
          { label: reg.title },
        ]}
      />
      <section className="container-page py-12 grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-10">
          <div>
            <h2 className="font-serif text-2xl font-medium mb-4">Background</h2>
            <p className="text-muted-foreground leading-relaxed">{reg.description}</p>
            {reg.expected_outcome && (
              <div className="mt-4">
                <h3 className="font-medium text-sm mb-1">Expected Outcome</h3>
                <p className="text-muted-foreground text-sm">{reg.expected_outcome}</p>
              </div>
            )}
          </div>

          {reg.attachments && reg.attachments.length > 0 && (
            <div>
              <h2 className="font-serif text-2xl font-medium mb-4">Documents</h2>
              <div className="space-y-2">
                {reg.attachments.map((att) => (
                  <a key={att.id} href={att.filepath || '#'} className="flex items-center justify-between bg-white border border-sand-200 rounded-xl p-4 hover:border-copper-500/40 transition-colors">
                    <span className="text-sm font-medium">{att.name || 'Document'}</span>
                    <span className="text-xs text-muted-foreground">PDF</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-serif text-2xl font-medium mb-6">Submit your comment</h2>
            <form className="bg-white border border-sand-200 rounded-2xl p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input className="border border-sand-200 rounded-lg px-4 py-2.5 text-sm" placeholder="Full name" />
                <input className="border border-sand-200 rounded-lg px-4 py-2.5 text-sm" placeholder="Email address" />
              </div>
              <textarea rows={5} placeholder="Share your thoughts on this regulation…" className="w-full border border-sand-200 rounded-lg px-4 py-2.5 text-sm" />
              <button type="button" className="bg-gradient-to-b from-copper-500 to-copper-600 text-white rounded-xl px-6 py-2.5 font-medium hover:from-copper-600 transition-colors">
                Submit comment
              </button>
            </form>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-medium mb-6">Public comments ({comments.length})</h2>
            <div className="space-y-4">
              {comments.map((c) => (
                <article key={c.id} className="bg-white border border-sand-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-copper-50 text-copper-600 flex items-center justify-center text-xs font-semibold">
                        {c.is_admin ? 'A' : 'C'}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{c.is_admin ? 'Admin' : `Citizen #${c.user}`}</div>
                        <div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-copper-600">
                      <ThumbsUp size={12} /> {c.upvote_count ?? 0}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed">{c.comment}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white border border-sand-200 rounded-2xl p-6 lg:sticky lg:top-24">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Status</div>
            <div className="text-lg font-serif font-medium mb-4">{reg.published ? 'Open' : 'Closed'}</div>
            <div className="space-y-3 text-sm border-t border-sand-200 pt-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Closing date</span><span className="font-medium">{reg.closing_date || 'TBD'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Days remaining</span><span className="font-medium">{daysLeft}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Comments</span><span className="font-medium">{comments.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Agency</span><span className="font-medium text-right">{reg.agency_name || 'N/A'}</span></div>
            </div>
          </div>
        </aside>
      </section>
    </PublicLayout>
  );
};

export default NoticesHome;
