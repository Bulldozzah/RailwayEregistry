import { ManageTable, statusBadge } from "@/components/admin/ManageTable";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Activity, Calendar, FileText, MessageSquare, TrendingUp, Loader2, Plus, Search, Eye, Pencil, Filter, Download, MoreVertical, EyeOff, X, Check, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAgencies } from "@/hooks/use-agencies";
import { useLocations } from "@/hooks/use-locations";
import { useIndustries } from "@/hooks/use-industries";
import { useBusinessTypes } from "@/hooks/use-businesstypes";
import { useActivities } from "@/hooks/use-activities";
import { useRegulations } from "@/hooks/use-regulations";
import { useNewsList, useFAQs } from "@/hooks/use-content";
import { useDashboardStats } from "@/hooks/use-stats";
import { useToast } from "@/hooks/use-toast";
import type { ApiResponse } from "@/types/database";

const LICENSE_STATUS: Record<number, string> = {
  1: "Published",
  2: "Draft",
  3: "Pending Assessment",
  4: "Unpublished",
  5: "Needs Corrections",
};

const LICENSE_STATUS_BADGE: Record<string, string> = {
  Published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Draft: "bg-amber-50 text-amber-700 border-amber-200",
  "Pending Assessment": "bg-sky-50 text-sky-700 border-sky-200",
  Unpublished: "bg-stone-100 text-stone-700 border-stone-200",
  "Needs Corrections": "bg-red-50 text-red-700 border-red-200",
};

const licenseStatusBadge = (status: number) => {
  const label = LICENSE_STATUS[status] || `Status ${status}`;
  const cls = LICENSE_STATUS_BADGE[label] || "bg-stone-100 text-stone-700 border-stone-200";
  return <span className={`text-xs px-2 py-1 rounded-full border font-medium ${cls}`}>{label}</span>;
};

export const ManageLicenses = () => {
  const [activeStage, setActiveStage] = useState<string>("all");
  const [q, setQ] = useState("");

  const { data: dashData, isLoading } = useQuery({
    queryKey: ["license-admin-dashboard", activeStage],
    queryFn: () =>
      api.get<ApiResponse<any>>("/license-admin/dashboard", {
        stage_id: activeStage,
        user_id: 1,
      }),
  });

  const dashboard = dashData?.data;
  const tabs: any[] = dashboard?.tabs || [];
  const licenses: any[] = dashboard?.licenses || [];
  const totalCount: number = dashboard?.total_count || 0;
  const selectedTab = dashboard?.selected_tab;

  const filtered = licenses.filter((l: any) =>
    !q || Object.values(l).some((v) => String(v ?? "").toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight">Business Licences</h1>
          <p className="text-muted-foreground mt-1">Manage all licences across workflow stages and issuing authorities.</p>
        </div>
        <Link
          to="/login-admin/managelicenses/new"
          className="inline-flex items-center gap-2 bg-gradient-to-b from-copper-500 to-copper-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:from-copper-600 transition-colors"
        >
          <Plus size={16} /> Add new licence
        </Link>
      </div>

      {/* Workflow stage tabs */}
      <div className="flex items-center gap-1 border-b border-sand-200 mb-6 overflow-x-auto">
        {/* My Licenses tab */}
        <button
          onClick={() => setActiveStage("all")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
            activeStage === "all"
              ? "border-copper-500 text-copper-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Licenses
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeStage === "all" ? "bg-copper-50 text-copper-600" : "bg-sand-100 text-muted-foreground"
          }`}>{totalCount}</span>
        </button>

        {/* Dynamic workflow tabs */}
        {tabs.map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveStage(String(tab.id))}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
              activeStage === String(tab.id)
                ? "border-copper-500 text-copper-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.title}
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeStage === String(tab.id) ? "bg-copper-50 text-copper-600" : "bg-sand-100 text-muted-foreground"
            }`}>{tab.license_count ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-sand-200">
          <div className="flex items-center gap-2 flex-1 bg-sand-100 rounded-full px-4 h-10 max-w-md">
            <Search size={14} className="text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search licences…"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          {selectedTab && (
            <span className="text-xs px-3 py-1.5 rounded-full bg-sand-100 text-muted-foreground border border-sand-200">
              Stage: <span className="font-medium text-foreground">{selectedTab.title}</span> · Type: {selectedTab.type}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-copper-500" />
            <span className="ml-3 text-sm text-muted-foreground">Loading licences…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-sand-100/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium w-10">
                    <input type="checkbox" className="rounded border-sand-200" />
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Issuing Authority</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-right py-3 px-4 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      {q ? "No licences match your search." : "No licences in this stage."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((lic: any) => {
                    const status = Number(lic.status);
                    return (
                      <tr key={lic.id} className="border-t border-sand-100 hover:bg-sand-100/40">
                        <td className="py-3 px-4">
                          <input type="checkbox" className="rounded border-sand-200" />
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/login-admin/managelicenses/${lic.id}/show`}
                            className="font-medium text-copper-600 hover:underline"
                          >
                            {lic.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">#{lic.id}</div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{lic.agency_name || "—"}</td>
                        <td className="py-3 px-4">{licenseStatusBadge(status)}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {lic.created ? new Date(lic.created).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {/* View: Published, Pending, Unpublished */}
                            {(status === 1 || status === 3 || status === 4) && (
                              <Link
                                to={`/login-admin/managelicenses/${lic.id}/show`}
                                className="p-1.5 rounded-md hover:bg-sand-200 text-muted-foreground"
                                title="View"
                              >
                                <Eye size={14} />
                              </Link>
                            )}
                            {/* Edit: Draft */}
                            {status === 2 && (
                              <Link
                                to={`/login-admin/managelicenses/${lic.id}/show`}
                                className="p-1.5 rounded-md hover:bg-sand-200 text-muted-foreground"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </Link>
                            )}
                            {/* View rejection: Corrections */}
                            {status === 5 && (
                              <Link
                                to={`/login-admin/managelicenses/${lic.id}/show`}
                                className="p-1.5 rounded-md hover:bg-red-100 text-red-600"
                                title="View Rejection"
                              >
                                <Eye size={14} />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between p-4 border-t border-sand-200 text-sm text-muted-foreground">
          <span>Showing {filtered.length} of {licenses.length} licences</span>
        </div>
      </div>
    </AdminLayout>
  );
};

export const ManageAgencies = () => {
  const [activeView, setActiveView] = useState<string>("active");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["agencies-dashboard", activeView],
    queryFn: () =>
      api.get<ApiResponse<any>>("/agencies/dashboard", { view: activeView }),
  });

  const counts = data?.data?.counts ?? {};
  const items = data?.data?.items ?? [];

  const toggleSelect = (id: number) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((r: any) => r.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    if (!confirm(`Are you sure you want to delete ${ids.length} issuing authority(ies)?`)) return;

    try {
      await api.post<ApiResponse<any>>("/agencies/batch", { ids });
      toast({ title: "Deleted", description: `${ids.length} issuing authority(ies) deleted successfully.` });
      setSelected(new Set());
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete", variant: "destructive" });
    }
  };

  const handleDeleteSingle = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete<ApiResponse<any>>(`/agencies/${id}`);
      toast({ title: "Deleted", description: `"${name}" has been deleted.` });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete", variant: "destructive" });
    }
  };

  const tabs = [
    { key: "active", label: "Active", count: counts.active ?? 0 },
    { key: "deleted", label: "Deleted", count: counts.deleted ?? 0 },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight">Issuing Authorities</h1>
            <p className="text-muted-foreground mt-1">Government bodies and local authorities that issue licences.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login-admin/manageagencies/new"
              className="inline-flex items-center gap-2 bg-gradient-to-b from-copper-500 to-copper-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:from-copper-600 transition-colors"
            >
              <Plus size={16} /> Add Issuing Authority
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-sand-100 rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveView(tab.key); setSelected(new Set()); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeView === tab.key
                  ? "bg-white text-copper-600 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-sand-200/50"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeView === tab.key ? "bg-copper-100 text-copper-700" : "bg-sand-200 text-sand-700"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Batch actions */}
        {activeView === "active" && selected.size > 0 && (
          <div className="bg-sand-50 border border-sand-200 rounded-xl p-3 mb-4 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            <button
              type="button"
              onClick={handleBatchDelete}
              className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-copper-500" />
              <span className="ml-3 text-muted-foreground">Loading issuing authorities…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No issuing authorities found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sand-50 border-b border-sand-200">
                  {activeView === "active" && (
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={items.length > 0 && selected.size === items.length}
                        onChange={toggleAll}
                        className="rounded border-sand-300"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-14">#</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Address</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-20">Offices</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row: any) => (
                  <tr key={row.id} className="border-b border-sand-100 hover:bg-sand-50/50 transition-colors">
                    {activeView === "active" && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={() => toggleSelect(row.id)}
                          className="rounded border-sand-300"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-muted-foreground">{row.id}</td>
                    <td className="px-4 py-3 font-medium">{row.title || row.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.address || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/login-admin/manageagencies/${row.id}/offices`}
                        className="inline-flex items-center gap-1 text-sm text-copper-600 hover:underline"
                      >
                        {row.office_count ?? 0}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/login-admin/manageagencies/${row.id}/edit`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sand-100 text-copper-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        {activeView === "active" && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSingle(row.id, row.title || row.name)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export const ManageLocations = () => {
  const [showDeleted, setShowDeleted] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [batchAction, setBatchAction] = useState("");
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["locations", showDeleted ? "deleted" : "active"],
    queryFn: () =>
      showDeleted
        ? api.get<ApiResponse<any[]>>("/locations/deleted/list")
        : api.get<ApiResponse<any>>("/locations?per_page=100"),
  });

  const rows = showDeleted
    ? (data?.data ?? [])
    : (data?.data?.data ?? data?.data ?? []);

  const toggleSelect = (id: number) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r: any) => r.id)));
    }
  };

  const handleBatch = async () => {
    if (!batchAction || selected.size === 0) return;
    const ids = Array.from(selected);
    const actionLabel = batchAction === "unpublish" ? "unpublish" : "publish";
    if (!confirm(`Are you sure you want to ${actionLabel} the selected jurisdictions?`)) return;

    try {
      await api.post<ApiResponse<any>>("/locations/batch", { ids, action: batchAction });
      toast({ title: `Jurisdictions ${actionLabel}ed`, description: `${ids.length} item(s) ${actionLabel}ed successfully.` });
      setSelected(new Set());
      setBatchAction("");
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || `Failed to ${actionLabel} jurisdictions`, variant: "destructive" });
    }
  };

  const handleUnpublishSingle = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to unpublish "${name}"?`)) return;
    try {
      await api.delete<ApiResponse<any>>(`/locations/${id}`);
      toast({ title: "Unpublished", description: `"${name}" has been unpublished.` });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to unpublish", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight">Jurisdictions</h1>
            <p className="text-muted-foreground mt-1">Provinces, districts and other jurisdictions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setShowDeleted(!showDeleted); setSelected(new Set()); }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                showDeleted
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
              }`}
            >
              {showDeleted ? "Published Jurisdictions" : "Unpublished Jurisdictions"}
            </button>
            <Link
              to="/login-admin/managelocations/new"
              className="inline-flex items-center gap-2 bg-gradient-to-b from-copper-500 to-copper-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:from-copper-600 transition-colors"
            >
              <Plus size={16} /> Add jurisdiction
            </Link>
          </div>
        </div>

        {/* Batch actions bar */}
        {!showDeleted && selected.size > 0 && (
          <div className="bg-sand-50 border border-sand-200 rounded-xl p-3 mb-4 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            <select
              value={batchAction}
              onChange={(e) => setBatchAction(e.target.value)}
              className="h-9 px-3 rounded-lg border border-sand-200 bg-white text-sm"
            >
              <option value="">Select batch action…</option>
              <option value="unpublish">Unpublish</option>
            </select>
            <button
              type="button"
              onClick={handleBatch}
              disabled={!batchAction}
              className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Apply
            </button>
          </div>
        )}

        {showDeleted && selected.size > 0 && (
          <div className="bg-sand-50 border border-sand-200 rounded-xl p-3 mb-4 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            <select
              value={batchAction}
              onChange={(e) => setBatchAction(e.target.value)}
              className="h-9 px-3 rounded-lg border border-sand-200 bg-white text-sm"
            >
              <option value="">Select batch action…</option>
              <option value="publish">Publish</option>
            </select>
            <button
              type="button"
              onClick={handleBatch}
              disabled={!batchAction}
              className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              Apply
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-copper-500" />
              <span className="ml-3 text-muted-foreground">Loading jurisdictions…</span>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {showDeleted ? "No unpublished jurisdictions." : "No jurisdictions found."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sand-50 border-b border-sand-200">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selected.size === rows.length}
                      onChange={toggleAll}
                      className="rounded border-sand-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-14">#</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-24">Published</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any) => (
                  <tr key={row.id} className="border-b border-sand-100 hover:bg-sand-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="rounded border-sand-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.id}</td>
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.category_name || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {row.deleted === 0 || row.deleted === false ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                          <Check size={14} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                          <X size={14} />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/login-admin/managelocations/${row.id}/edit`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sand-100 text-copper-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        {!showDeleted && (
                          <button
                            type="button"
                            onClick={() => handleUnpublishSingle(row.id, row.name)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Unpublish"
                          >
                            <EyeOff size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
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
      { key: "agency", label: "Issuing Authority" },
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
  const [activeView, setActiveView] = useState<string>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [batchAction, setBatchAction] = useState("");
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["regulations-dashboard", activeView],
    queryFn: () =>
      api.get<ApiResponse<any>>("/regulations/dashboard", {
        view: activeView,
        user_id: 1,
      }),
  });

  const counts = data?.data?.counts ?? {};
  const items = data?.data?.items ?? [];

  const toggleSelect = (id: number) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((r: any) => r.id)));
    }
  };

  const handleBatch = async () => {
    if (!batchAction || selected.size === 0) return;
    const ids = Array.from(selected);
    const actionLabel = batchAction === "unpublish" ? "unpublish" : "publish";
    if (!confirm(`Are you sure you want to ${actionLabel} the selected consultations?`)) return;

    try {
      await api.post<ApiResponse<any>>("/regulations/batch", { ids, action: batchAction });
      toast({ title: `Consultations ${actionLabel}ed`, description: `${ids.length} item(s) ${actionLabel}ed successfully.` });
      setSelected(new Set());
      setBatchAction("");
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || `Failed to ${actionLabel} consultations`, variant: "destructive" });
    }
  };

  const handleUnpublishSingle = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to unpublish "${title}"?`)) return;
    try {
      await api.delete<ApiResponse<any>>(`/regulations/${id}`);
      toast({ title: "Unpublished", description: `"${title}" has been unpublished.` });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to unpublish", variant: "destructive" });
    }
  };

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "open", label: "Open", count: counts.open ?? 0 },
    { key: "complete", label: "Completed", count: counts.complete ?? 0 },
    { key: "internal", label: "Internal", count: counts.internal ?? 0 },
    { key: "closing", label: "Closing Soon", count: 0 },
    { key: "unpublished", label: "Unpublished", count: counts.unpublished ?? 0 },
  ];

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch { return d; }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight">Consultations</h1>
            <p className="text-muted-foreground mt-1">Manage public consultations and feedback on regulations.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login-admin/manageregulations/new"
              className="inline-flex items-center gap-2 bg-gradient-to-b from-copper-500 to-copper-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:from-copper-600 transition-colors"
            >
              <Plus size={16} /> Add Consultation
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-sand-100 rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveView(tab.key); setSelected(new Set()); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeView === tab.key
                  ? "bg-white text-copper-600 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-sand-200/50"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeView === tab.key ? "bg-copper-100 text-copper-700" : "bg-sand-200 text-sand-700"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Batch actions */}
        {selected.size > 0 && (
          <div className="bg-sand-50 border border-sand-200 rounded-xl p-3 mb-4 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            <select
              value={batchAction}
              onChange={(e) => setBatchAction(e.target.value)}
              className="h-9 px-3 rounded-lg border border-sand-200 bg-white text-sm"
            >
              <option value="">Select batch action…</option>
              {activeView === "unpublished" ? (
                <option value="publish">Publish</option>
              ) : (
                <option value="unpublish">Unpublish</option>
              )}
            </select>
            <button
              type="button"
              onClick={handleBatch}
              disabled={!batchAction}
              className={`h-9 px-4 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition-colors ${
                batchAction === "publish" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Apply
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-copper-500" />
              <span className="ml-3 text-muted-foreground">Loading consultations…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No consultations found for this view.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sand-50 border-b border-sand-200">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selected.size === items.length}
                      onChange={toggleAll}
                      className="rounded border-sand-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-14">#</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Issuing Authority</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Closing Date</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-20">Published</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-20">Comments</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row: any) => (
                  <tr key={row.id} className="border-b border-sand-100 hover:bg-sand-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="rounded border-sand-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.id}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{row.title}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.agency_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(row.closing_date)}</td>
                    <td className="px-4 py-3 text-center">
                      {row.published ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                          <Check size={14} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                          <X size={14} />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/regulations/${row.id}/comments`}
                        className="inline-flex items-center gap-1 text-sm text-copper-600 hover:underline"
                      >
                        {row.comment_count ?? 0} <MessageSquare size={12} />
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/login-admin/manageregulations/${row.id}/edit`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sand-100 text-copper-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        {activeView !== "unpublished" && (
                          <button
                            type="button"
                            onClick={() => handleUnpublishSingle(row.id, row.title)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Unpublish"
                          >
                            <EyeOff size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
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
      { key: "agency", label: "Issuing Authority" },
      { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
    ]}
    rows={[
      { name: "Joseph Mwale", email: "j.mwale@gov.zm", role: "Super Admin", agency: "—", status: "Active" },
      { name: "Chola Mulenga", email: "c.mulenga@zta.org.zm", role: "Issuing Authority Editor", agency: "ZTA", status: "Active" },
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
      { name: "Issuing Authority Editor", permissions: "LICENSE_MANAGE, NEWS_MANAGE", members: 28 },
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
      <p className="text-muted-foreground mt-1">Search across licences, issuing authorities, users, news and more.</p>
    </div>
    <div className="bg-white border border-sand-200 rounded-2xl p-6">
      <input placeholder="Type to search…" className="w-full text-lg outline-none border-b border-sand-200 pb-3" />
      <p className="text-sm text-muted-foreground mt-6">Start typing to see results across the registry.</p>
    </div>
  </AdminLayout>
);
