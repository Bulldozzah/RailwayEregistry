import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, FileText, Building2, MapPin, Briefcase, MessageSquare, Calendar, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { EregistryHero } from "@/components/ui/eregistry-hero";
import { useIndustries } from "@/hooks/use-industries";
import { useRegulations } from "@/hooks/use-regulations";
import { useNewsList } from "@/hooks/use-content";

const sectorCodes: Record<string, string> = {
  "Agriculture & Farming": "Ag",
  "Mining & Extraction": "Mn",
  "Trade & Commerce": "Tr",
  "Tourism & Hospitality": "To",
  "Manufacturing": "Mf",
  "Logistics & Transport": "Lt",
  "Health & Pharmaceuticals": "Hp",
  "Financial Services": "Fs",
  "Energy & Utilities": "En",
  "Telecommunications": "Tc",
};

const Index = () => {
  const navigate = useNavigate();
  const { data: industriesData } = useIndustries({ per_page: 4, order_by: 'name', order_dir: 'ASC' });
  const { data: regulationsData } = useRegulations({ per_page: 2, order_by: 'id', order_dir: 'DESC' });
  const { data: newsData } = useNewsList({ per_page: 2, order_by: 'id', order_dir: 'DESC' });

  const sectors = (industriesData?.data ?? []).map((ind) => ({
    code: sectorCodes[ind.name] || ind.name.substring(0, 2),
    title: ind.name,
    desc: ind.description || `Licences related to ${ind.name}.`,
    count: ind.license_count ?? 0,
  }));

  const consultations = (regulationsData?.data ?? []).map((r) => {
    const closing = r.closing_date ? new Date(r.closing_date) : null;
    const daysLeft = closing ? Math.max(0, Math.ceil((closing.getTime() - Date.now()) / 86400000)) : 0;
    return {
      id: String(r.id),
      agency: r.agency_name || 'Government Agency',
      title: r.title,
      desc: r.description || '',
      days: daysLeft,
    };
  });

  const news = (newsData?.data ?? []).map((n) => ({
    id: n.id,
    tag: 'News',
    date: new Date(n.created).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    title: n.title,
    desc: n.article ? n.article.substring(0, 150) + '…' : '',
  }));
  return (
    <PublicLayout>
      <EregistryHero
        title={"Zambia Business Licensing Information Portal"}
        subtitle="Businesses operating in Zambia are typically required to obtain one or more licenses and permits, depending on the activities of their enterprise. This website enables you to obtain information on the licenses pertaining to your business. Use the search below to find the licenses you will require to start your business."
        primaryAction={{ label: "Find Licenses", onClick: () => navigate("/browse/licenses") }}
        secondaryAction={{ label: "Browse Sectors", onClick: () => navigate("/browse/listindustries") }}
        sectors={[
          { image: "/images/industries/agriculture.jpg", category: "AGRICULTURE", title: "Crop & livestock permits", onClick: () => navigate("/browse/licenses") },
          { image: "/images/industries/mining.jpg", category: "MINING", title: "Exploration & extraction", onClick: () => navigate("/browse/licenses") },
          { image: "/images/industries/trade.jpg", category: "TRADE", title: "Retail & trading certificates", onClick: () => navigate("/browse/licenses") },
          { image: "/images/industries/tourism.jpg", category: "TOURISM", title: "Lodge & tour operator licenses", onClick: () => navigate("/browse/licenses") },
          { image: "/images/industries/manufacturing.jpg", category: "MANUFACTURING", title: "Industrial compliance permits", onClick: () => navigate("/browse/licenses") },
          { image: "/images/industries/health.jpg", category: "HEALTH", title: "Clinical practice authorizations", onClick: () => navigate("/browse/licenses") },
          { image: "/images/industries/telecoms.jpg", category: "TELECOMS", title: "Telecommunications licenses", onClick: () => navigate("/browse/licenses") },
          { image: "/images/industries/pharma.jpg", category: "PHARMA", title: "Pharmaceutical registrations", onClick: () => navigate("/browse/licenses") },
          { image: "/images/industries/livestock.jpg", category: "LIVESTOCK", title: "Livestock & veterinary permits", onClick: () => navigate("/browse/licenses") },
          { image: "/images/industries/education.jpg", category: "EDUCATION", title: "Educational institution licenses", onClick: () => navigate("/browse/licenses") },
        ]}
      />

      {/* Quick links */}
      <section className="container-page pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: "/browse/licenses", icon: FileText, label: "All Licenses" },
            { to: "/browse/jurisdictions", icon: MapPin, label: "By Jurisdiction" },
            { to: "/browse/listactivities", icon: Briefcase, label: "By Activity" },
            { to: "/business-procedures", icon: Building2, label: "Startup Procedures" },
          ].map((q) => (
            <Link key={q.to} to={q.to} className="group bg-white border border-sand-200 rounded-2xl p-4 flex items-center justify-center gap-3 hover:border-copper-500/40 hover:shadow-soft transition-all">
              <div className="size-9 rounded-xl bg-copper-50 flex items-center justify-center text-copper-600 group-hover:bg-copper-500 group-hover:text-white transition-colors shrink-0">
                <q.icon size={16} />
              </div>
              <span className="font-medium text-sm">{q.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Sectors */}
      <section className="bg-sand-100 py-24 border-y border-sand-200">
        <div className="container-page">
          <div className="flex items-baseline justify-between mb-12 flex-wrap gap-4">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-medium tracking-tight">Browse by sector</h2>
              <p className="text-muted-foreground mt-2">Discover licenses applicable to your industry.</p>
            </div>
            <Link to="/browse/listindustries" className="text-sm font-semibold text-copper-600 hover:text-copper-900 transition-colors inline-flex items-center gap-1">
              View all industries <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sectors.map((s) => (
              <Link
                key={s.code}
                to="/browse/licenses"
                className="group bg-white p-8 rounded-2xl border border-sand-200 hover:border-copper-500/40 hover:shadow-card transition-all flex flex-col h-full"
              >
                <div className="size-12 rounded-xl bg-copper-50 flex items-center justify-center text-copper-600 font-serif text-xl mb-6 group-hover:bg-copper-500 group-hover:text-white transition-colors">
                  {s.code}
                </div>
                <h3 className="font-serif text-xl font-medium mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-8 flex-grow leading-relaxed">{s.desc}</p>
                <div className="flex items-center justify-between border-t border-sand-100 pt-4 mt-auto">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Licenses</span>
                  <span className="text-sm font-medium tabular-nums">{s.count}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Notice & Comment */}
      <section className="container-page py-24">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16">
          <div>
            <div className="inline-block px-3 py-1 bg-copper-50 text-copper-600 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
              Public Consultation
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-balance mb-6">
              Shape the rules that govern your industry.
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Review proposed regulatory changes before they become law. Your feedback ensures our business
              environment remains fair and practical.
            </p>
            <Link to="/notices" className="inline-flex items-center gap-2 text-copper-600 font-semibold hover:text-copper-900 transition-colors">
              View all open consultations <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {consultations.map((c) => (
              <article key={c.id} className="bg-white border border-sand-200 p-6 md:p-8 rounded-2xl hover:border-copper-500/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{c.agency}</div>
                  <h3 className="font-serif text-xl font-medium mb-2">
                    <Link to={`/notices/regulation/${c.id}`} className="hover:text-primary transition-colors">{c.title}</Link>
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.desc}</p>
                </div>
                <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
                  <span className="inline-flex items-center bg-sand-100 text-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                    <Calendar size={12} className="mr-1.5" />
                    Closes in {c.days} days
                  </span>
                  <Link to={`/notices/regulation/${c.id}`} className="text-sm font-semibold hover:text-primary transition-colors inline-flex items-center gap-1">
                    Read & Comment <MessageSquare size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="bg-earth-900 text-sand-50 py-24">
        <div className="container-page">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <h2 className="font-serif text-3xl md:text-4xl font-medium tracking-tight">Registry updates</h2>
            <Link to="/news/articles" className="text-sm font-semibold text-copper-500 hover:text-copper-100 transition-colors inline-flex items-center gap-1">
              All news <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {news.map((n) => (
              <Link key={n.id} to={`/news/article/${n.id}`} className="group flex flex-col">
                <div className="bg-earth-800 aspect-[2/1] w-full mb-6 overflow-hidden rounded-xl border border-white/5">
                  <div className="w-full h-full bg-gradient-to-br from-copper-600/30 via-earth-800 to-earth-900 group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-xs font-semibold tracking-wide uppercase text-copper-500">{n.tag}</span>
                  <span className="text-sm text-sand-100/60 tabular-nums">{n.date}</span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-medium mb-2 group-hover:text-copper-100 transition-colors">{n.title}</h3>
                <p className="text-sand-100/70 text-sm">{n.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
