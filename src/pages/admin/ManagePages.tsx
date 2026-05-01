import { ManageTable, statusBadge } from "@/components/admin/ManageTable";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Activity, Calendar, FileText, MessageSquare, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLicenses } from "@/hooks/use-licenses";
import { useAgencies } from "@/hooks/use-agencies";
import { useLocations } from "@/hooks/use-locations";
import { useIndustries } from "@/hooks/use-industries";
import { useBusinessTypes } from "@/hooks/use-businesstypes";
import { useActivities } from "@/hooks/use-activities";
import { useRegulations } from "@/hooks/use-regulations";
import { useNewsList, useFAQs } from "@/hooks/use-content";
import { useDashboardStats } from "@/hooks/use-stats";

export const ManageLicenses = () => {
  const { data, isLoading } = useLicenses({ per_page: 100 });
  const rows = (data?.data ?? []).map((l) => ({
    ...l,
    agency: l.agency_id,
    status: l.status || 'Draft',
    fee: l.application_fee || l.license_fee || 'N/A',
  }));
  return (
    <ManageTable
      title="Business Licences"
      description="Manage all licences across workflow stages and agencies."
      newLabel="Add new licence"
      newHref="/login-admin/managelicenses/new"
      tabs={[
        { label: "All Licences", count: data?.total ?? 0 },
      ]}
      columns={[
        { key: "name", label: "Name", render: (r) => (
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.id}</div>
          </div>
        )},
        { key: "agency", label: "Agency" },
        { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
        { key: "fee", label: "Fee" },
      ]}
      rows={rows}
    />
  );
};

export const ManageAgencies = () => {
  const { data } = useAgencies({ per_page: 100 });
  const rows = (data?.data ?? []).map((a) => ({ ...a, contact: a.email || a.telephone || '' }));
  return (
    <ManageTable
      title="Issuing Authorities"
      description="Government bodies and local authorities that issue licences."
      newLabel="Add new Issuing Authority"
      newHref="/login-admin/manageagencies/new"
      columns={[
        { key: "name", label: "Authority name", render: (r) => <span className="font-medium">{r.name}</span> },
        { key: "contact", label: "Contact" },
      ]}
      rows={rows}
    />
  );
};

export const ManageLocations = () => {
  const { data } = useLocations({ per_page: 100 });
  return (
    <ManageTable
      title="Locations"
      description="Provinces, districts and other jurisdictions."
      newLabel="Add location"
      columns={[
        { key: "name", label: "Location", render: (r) => <span className="font-medium">{r.name}</span> },
      ]}
      rows={data?.data ?? []}
    />
  );
};

export const ManageIndustries = () => {
  const { data } = useIndustries({ per_page: 100 });
  return (
    <ManageTable
      title="Industries"
      description="Industry classifications used to organise licences."
      newLabel="Add industry"
      columns={[
        { key: "name", label: "Industry", render: (r) => <span className="font-medium">{r.name}</span> },
        { key: "license_count", label: "Licences", render: (r) => <span className="tabular-nums">{r.license_count}</span> },
      ]}
      rows={data?.data ?? []}
    />
  );
};

export const ManageBusinessTypes = () => {
  const { data } = useBusinessTypes({ per_page: 100 });
  return (
    <ManageTable
      title="Business Types"
      description="Legal forms and structures businesses can register under."
      newLabel="Add new Business Type"
      newHref="/login-admin/managebusinesstypes/new"
      columns={[
        { key: "name", label: "Business Type", render: (r) => <span className="font-medium">{r.name}</span> },
        { key: "license_count", label: "Registered", render: (r) => <span className="tabular-nums">{r.license_count}</span> },
      ]}
      rows={data?.data ?? []}
    />
  );
};

export const ManageActivities = () => {
  const { data } = useActivities({ per_page: 100 });
  return (
    <ManageTable
      title="Business Activities"
      description="Economic activities businesses can be licensed to perform."
      newLabel="Add new Business Activity"
      newHref="/login-admin/manageactivities/new"
      columns={[
        { key: "name", label: "Activity", render: (r) => <span className="font-medium">{r.name}</span> },
        { key: "license_count", label: "Linked", render: (r) => <span className="tabular-nums">{r.license_count}</span> },
      ]}
      rows={data?.data ?? []}
    />
  );
};

export const ManageWorkflows = () => (
  <ManageTable
    title="Workflows"
    description="Configure approval stages for licence processing."
    newLabel="Add workflow"
    columns={[
      { key: "name", label: "Workflow" },
      { key: "stages", label: "Stages" },
      { key: "agency", label: "Agency" },
      { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
    ]}
    rows={[
      { name: "Standard Trading Licence", stages: "Draft → Review → Approved → Published", agency: "LCC", status: "Active" },
      { name: "Tourism Operator Approval", stages: "Draft → Inspection → Approved", agency: "ZTA", status: "Active" },
      { name: "Mining Right Pipeline", stages: "Draft → EIA → Tech Review → Minister → Published", agency: "MMMD", status: "Active" },
    ]}
  />
);

export const ManageRegulations = () => {
  const { data } = useRegulations({ per_page: 100 });
  const rows = (data?.data ?? []).map((r) => ({
    ...r,
    agency: r.agency_name || '',
    closingDate: r.closing_date || 'N/A',
    comments: r.comment_count ?? 0,
    status: r.published ? 'Published' : 'Draft',
  }));
  return (
    <ManageTable
      title="Regulations"
      description="Manage proposed regulations open for public comment."
      newLabel="New regulation"
      columns={[
        { key: "title", label: "Regulation", render: (r) => <span className="font-medium">{r.title}</span> },
        { key: "agency", label: "Agency" },
        { key: "closingDate", label: "Closing date" },
        { key: "comments", label: "Comments", render: (r) => <span className="tabular-nums">{r.comments}</span> },
        { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
      ]}
      rows={rows}
    />
  );
};

export const ManageComments = () => (
  <ManageTable
    title="Moderate Comments"
    description="Review, approve or reject public submissions on regulations."
    columns={[
      { key: "author", label: "Author" },
      { key: "regulation", label: "Regulation" },
      { key: "excerpt", label: "Excerpt" },
      { key: "submitted", label: "Submitted" },
      { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
    ]}
    rows={[
      { author: "Mwansa Banda", regulation: "E-Commerce 2026", excerpt: "I welcome the proposed framework but…", submitted: "3 days ago", status: "Pending" },
      { author: "Chola Mulenga", regulation: "Industrial Waste Tariff", excerpt: "The capital threshold seems too high…", submitted: "5 days ago", status: "Approved" },
      { author: "Anonymous", regulation: "Tourism Operator Capital", excerpt: "This seems unfair to small operators...", submitted: "1 week ago", status: "Pending" },
    ]}
  />
);

export const ManageNews = () => {
  const { data } = useNewsList({ per_page: 100 });
  const rows = (data?.data ?? []).map((n) => ({
    ...n,
    date: new Date(n.created).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: n.published ? 'Published' : 'Draft',
  }));
  return (
    <ManageTable
      title="News & Articles"
      description="Publish news, announcements and updates."
      newLabel="Add article"
      columns={[
        { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
        { key: "date", label: "Published" },
        { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
      ]}
      rows={rows}
    />
  );
};

export const ManagePages = () => (
  <ManageTable
    title="Pages"
    description="Static content pages for the public site."
    newLabel="Add page"
    columns={[
      { key: "title", label: "Page" },
      { key: "slug", label: "Slug" },
      { key: "updated", label: "Last updated" },
      { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
    ]}
    rows={[
      { title: "About eRegistry", slug: "about", updated: "12 Apr 2026", status: "Published" },
      { title: "Privacy Policy", slug: "privacy", updated: "01 Mar 2026", status: "Published" },
      { title: "Terms of Service", slug: "terms", updated: "01 Mar 2026", status: "Published" },
      { title: "Accessibility statement", slug: "accessibility", updated: "20 Feb 2026", status: "Draft" },
    ]}
  />
);

export const ManageFAQs = () => {
  const { data } = useFAQs();
  const rows = (data?.data ?? []).map((f) => ({ ...f, q: f.question, a: f.answer }));
  return (
    <ManageTable
      title="FAQs"
      description="Questions and answers shown in the help centre."
      newLabel="Add FAQ"
      columns={[
        { key: "q", label: "Question", render: (r) => <span className="font-medium">{r.q}</span> },
        { key: "a", label: "Answer", render: (r) => <span className="text-muted-foreground line-clamp-1">{r.a}</span> },
      ]}
      rows={rows}
    />
  );
};

export const ManageBanners = () => (
  <ManageTable
    title="Banners"
    description="Promotional banners displayed on the homepage."
    newLabel="Add banner"
    columns={[
      { key: "title", label: "Banner" },
      { key: "placement", label: "Placement" },
      { key: "starts", label: "Starts" },
      { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
    ]}
    rows={[
      { title: "Single-window registration launch", placement: "Homepage hero", starts: "12 Apr 2026", status: "Published" },
      { title: "SEZ fast-track campaign", placement: "Sidebar", starts: "02 Apr 2026", status: "Draft" },
    ]}
  />
);

export const ManagePolicy = () => (
  <ManageTable
    title="Policies"
    description="Manage policy and legal pages."
    newLabel="Add policy"
    columns={[
      { key: "title", label: "Policy" },
      { key: "version", label: "Version" },
      { key: "updated", label: "Last updated" },
      { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
    ]}
    rows={[
      { title: "Privacy Policy", version: "v3.1", updated: "01 Mar 2026", status: "Published" },
      { title: "Terms of Service", version: "v2.4", updated: "01 Mar 2026", status: "Published" },
      { title: "Cookie Policy", version: "v1.0", updated: "12 Jan 2026", status: "Published" },
    ]}
  />
);

export const ManageFeedback = () => (
  <ManageTable
    title="Feedback"
    description="Messages submitted through the contact form."
    columns={[
      { key: "name", label: "From" },
      { key: "email", label: "Email" },
      { key: "subject", label: "Subject" },
      { key: "received", label: "Received" },
      { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
    ]}
    rows={[
      { name: "Mwansa Banda", email: "mw@example.com", subject: "Issue submitting tour operator licence", received: "2 hrs ago", status: "Pending" },
      { name: "Chola Mulenga", email: "ch@example.com", subject: "Question about EIA timelines", received: "1 day ago", status: "Approved" },
      { name: "Joseph Phiri", email: "jp@example.com", subject: "Where do I find Form L-1?", received: "3 days ago", status: "Closed" },
    ]}
  />
);

export const ManageUsers = () => (
  <ManageTable
    title="Users"
    description="Manage portal accounts and permissions."
    newLabel="Add User"
    newHref="/login-admin/manageusers/new"
    columns={[
      { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "agency", label: "Agency" },
      { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
    ]}
    rows={[
      { name: "Joseph Mwale", email: "j.mwale@gov.zm", role: "Super Admin", agency: "—", status: "Active" },
      { name: "Chola Mulenga", email: "c.mulenga@zta.org.zm", role: "Agency Editor", agency: "ZTA", status: "Active" },
      { name: "Nalukui Imbwae", email: "n.imbwae@zema.org.zm", role: "Moderator", agency: "ZEMA", status: "Active" },
      { name: "Mwansa Banda", email: "m.banda@gov.zm", role: "Reviewer", agency: "LCC", status: "Pending" },
    ]}
  />
);

export const ManageGroups = () => (
  <ManageTable
    title="Roles & Permissions"
    description="Define groups and granular permissions."
    newLabel="Add role"
    columns={[
      { key: "name", label: "Role", render: (r) => <span className="font-medium">{r.name}</span> },
      { key: "permissions", label: "Permissions" },
      { key: "members", label: "Members", render: (r) => <span className="tabular-nums">{r.members}</span> },
    ]}
    rows={[
      { name: "Super Admin", permissions: "All", members: 4 },
      { name: "Agency Editor", permissions: "LICENSE_MANAGE, NEWS_MANAGE", members: 28 },
      { name: "Moderator", permissions: "MODERATE_COMMENTS", members: 12 },
      { name: "Reviewer", permissions: "LICENSE_REVIEW", members: 36 },
    ]}
  />
);

export const RegulationsDashboard = () => {
  const { data: statsData } = useDashboardStats();
  const stats = statsData?.data;
  const { data: regsData } = useRegulations({ per_page: 3, published: 1 });
  const recentRegs = regsData?.data ?? [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Notice & Comment</div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight">Regulations console</h1>
        <p className="text-muted-foreground mt-1">Track public consultations and comment moderation in one place.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FileText, label: "Active regulations", value: String(stats?.regulations ?? 0) },
          { icon: MessageSquare, label: "Pending comments", value: String(stats?.pending_comments ?? 0) },
          { icon: Calendar, label: "Open regulations", value: String(stats?.open_regulations ?? 0) },
          { icon: TrendingUp, label: "Total comments", value: String(stats?.comments ?? 0) },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-sand-200 rounded-2xl p-5">
            <div className="size-10 rounded-xl bg-copper-50 text-copper-600 flex items-center justify-center mb-4">
              <s.icon size={18} />
            </div>
            <div className="text-2xl font-serif font-medium">{s.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-sand-200 rounded-2xl p-6">
          <h2 className="font-serif text-xl font-medium mb-5">Closing soon</h2>
          <div className="space-y-3">
            {recentRegs.map((r) => {
              const closing = r.closing_date ? new Date(r.closing_date) : null;
              const daysLeft = closing ? Math.max(0, Math.ceil((closing.getTime() - Date.now()) / 86400000)) : 0;
              return (
                <div key={r.id} className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-sand-100 transition-colors">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground">{r.agency_name}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-copper-50 text-copper-600 shrink-0">{daysLeft}d</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white border border-sand-200 rounded-2xl p-6">
          <h2 className="font-serif text-xl font-medium mb-5">Recent activity</h2>
          <div className="space-y-4">
            {[
              { who: "C. Mulenga", what: "approved comment on E-Commerce 2026", when: "10 min ago" },
              { who: "J. Mwale", what: "extended closing date for Tariff revision", when: "2 hrs ago" },
              { who: "Auto-mod", what: "flagged 3 comments for review", when: "5 hrs ago" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <Activity size={14} className="text-copper-600 mt-1 shrink-0" />
                <div>
                  <div><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span></div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
      <Link to="/login-admin/manageregulations" className="bg-gradient-to-b from-copper-500 to-copper-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:from-copper-600 transition-colors">
        Manage regulations
      </Link>
      <Link to="/login-admin/managecomments" className="border border-sand-200 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-sand-100 transition-colors">
        Moderate comments
      </Link>
    </div>
  </AdminLayout>
  );
};

export const AdminSearch = () => (
  <AdminLayout>
    <div className="mb-8">
      <h1 className="font-serif text-3xl font-medium tracking-tight">Search</h1>
      <p className="text-muted-foreground mt-1">Search across licences, agencies, users, news and more.</p>
    </div>
    <div className="bg-white border border-sand-200 rounded-2xl p-6">
      <input placeholder="Type to search…" className="w-full text-lg outline-none border-b border-sand-200 pb-3" />
      <p className="text-sm text-muted-foreground mt-6">Start typing to see results across the registry.</p>
    </div>
  </AdminLayout>
);
