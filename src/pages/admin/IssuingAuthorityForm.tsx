import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Upload, X } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useLocations } from "@/hooks/use-locations";
import { useToast } from "@/hooks/use-toast";

const mockUsers = [
  { id: "u-1", name: "Joseph Mwale", email: "j.mwale@gov.zm" },
  { id: "u-2", name: "Chola Mulenga", email: "c.mulenga@zta.org.zm" },
  { id: "u-3", name: "Nalukui Imbwae", email: "n.imbwae@zema.org.zm" },
  { id: "u-4", name: "Mwansa Banda", email: "m.banda@gov.zm" },
  { id: "u-5", name: "Kondwani Phiri", email: "k.phiri@rtsa.org.zm" },
];

interface Form {
  name: string; abbreviation: string; fax: string; address: string;
  telephone: string; email: string; website: string; workingHours: string;
  postalAddress: string; latitude: string; longitude: string;
  businessNo: string; location: string;
}

const empty: Form = {
  name: "", abbreviation: "", fax: "", address: "",
  telephone: "", email: "", website: "", workingHours: "",
  postalAddress: "", latitude: "", longitude: "",
  businessNo: "", location: "",
};

const IssuingAuthorityForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: locData } = useLocations({ per_page: 100, order_by: 'name', order_dir: 'ASC' });
  const locations = (locData?.data ?? []).map((l) => ({ id: String(l.id), name: l.name }));
  const [form, setForm] = useState<Form>(empty);
  const [mapScan, setMapScan] = useState<File | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  const setField = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleUser = (id: string) =>
    setSelectedUsers((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    const required: (keyof Form)[] = ["name", "address", "telephone", "email", "website", "workingHours", "postalAddress", "location"];
    required.forEach((k) => { if (!form[k].trim()) next[k] = "Required"; });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Invalid email";
    if (form.website && !/^https?:\/\/.+/i.test(form.website)) next.website = "Must start with http:// or https://";
    if (form.latitude && isNaN(Number(form.latitude))) next.latitude = "Must be a number";
    if (form.longitude && isNaN(Number(form.longitude))) next.longitude = "Must be a number";
    setErrors(next);
    if (Object.keys(next).length) return;

    toast({
      title: "Issuing Authority created",
      description: `${form.name.trim()} has been added.`,
    });
    navigate("/login-admin/manageagencies");
  };

  const inputCls = (field: keyof Form) =>
    `w-full h-11 px-3 rounded-md border bg-white outline-none text-sm transition-colors ${
      errors[field]
        ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
        : "border-sand-200 focus:border-copper-500 focus:ring-2 focus:ring-copper-500/20"
    }`;

  const Field = ({ label, required, field, type = "text", placeholder }: {
    label: string; required?: boolean; field: keyof Form; type?: string; placeholder?: string;
  }) => (
    <div>
      <label className="text-sm font-medium block mb-1.5">
        {label}{required && <span className="text-copper-600">*</span>}
      </label>
      <input
        type={type}
        value={form[field]}
        maxLength={255}
        onChange={(e) => setField(field, e.target.value)}
        placeholder={placeholder}
        className={inputCls(field)}
      />
      {errors[field] && <p className="text-xs text-destructive mt-1.5">{errors[field]}</p>}
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <Link
          to="/login-admin/manageagencies"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={14} /> Back to Issuing Authorities
        </Link>

        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Add New Issuing Authority
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight">
            Create a new Issuing Authority
          </h1>
          <p className="text-muted-foreground mt-1">
            Register a government body or local authority that issues business licences.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-sand-200 rounded-2xl p-6 md:p-8 space-y-8">
          {/* Authority Details */}
          <section>
            <h2 className="font-serif text-xl font-medium mb-1">Authority Details</h2>
            <p className="text-sm text-muted-foreground mb-6">Contact information and operational details.</p>

            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Name" required field="name" placeholder="e.g. Lusaka City Council" />
              <Field label="Abbreviation" field="abbreviation" placeholder="e.g. LCC" />

              <Field label="Telephone" required field="telephone" type="tel" placeholder="+260 211 000000" />
              <Field label="Fax" field="fax" placeholder="+260 211 000001" />

              <Field label="Email Address" required field="email" type="email" placeholder="info@authority.gov.zm" />
              <Field label="Website" required field="website" type="url" placeholder="https://www.authority.gov.zm" />

              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-1.5">
                  Address<span className="text-copper-600">*</span>
                </label>
                <textarea
                  value={form.address}
                  rows={2}
                  maxLength={500}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="Physical street address"
                  className={`w-full px-3 py-2 rounded-md border bg-white outline-none text-sm resize-y transition-colors ${
                    errors.address
                      ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-sand-200 focus:border-copper-500 focus:ring-2 focus:ring-copper-500/20"
                  }`}
                />
                {errors.address && <p className="text-xs text-destructive mt-1.5">{errors.address}</p>}
              </div>

              <Field label="Working Hours" required field="workingHours" placeholder="Mon–Fri 08:00–17:00" />
              <Field label="Postal Address" required field="postalAddress" placeholder="P.O. Box 50593, Lusaka" />

              <Field label="Latitude" field="latitude" placeholder="-15.4167" />
              <Field label="Longitude" field="longitude" placeholder="28.2833" />

              <Field label="Business No" field="businessNo" placeholder="Optional reference number" />

              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Location<span className="text-copper-600">*</span>
                </label>
                <select
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                  className={inputCls("location")}
                >
                  <option value="">Select location (e.g. Chadiza District)</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
                {errors.location && <p className="text-xs text-destructive mt-1.5">{errors.location}</p>}
              </div>

              {/* Map Scan upload */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-1.5">Map Scan</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 h-11 rounded-md border border-sand-200 bg-white hover:bg-sand-100 cursor-pointer text-sm font-medium transition-colors">
                    <Upload size={14} />
                    Choose File
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={(e) => setMapScan(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <span className="text-sm text-muted-foreground truncate">
                    {mapScan ? mapScan.name : "No file selected"}
                  </span>
                  {mapScan && (
                    <button
                      type="button"
                      onClick={() => setMapScan(null)}
                      className="p-1.5 rounded-md hover:bg-sand-100 text-muted-foreground"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Users */}
          <section className="border-t border-sand-200 pt-8">
            <h2 className="font-serif text-xl font-medium mb-1">Users</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Assign users responsible for managing this authority.
            </p>

            <div className="border border-sand-200 rounded-xl divide-y divide-sand-200 max-h-72 overflow-y-auto">
              {mockUsers.map((u) => {
                const checked = selectedUsers.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-sand-100 cursor-pointer text-sm"
                  >
                    <span
                      className={`size-4 rounded border flex items-center justify-center shrink-0 ${
                        checked
                          ? "bg-copper-500 border-copper-500 text-white"
                          : "border-sand-200 bg-white"
                      }`}
                    >
                      {checked && <Check size={12} />}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleUser(u.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{u.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            {selectedUsers.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedUsers.map((id) => {
                  const u = mockUsers.find((x) => x.id === id);
                  if (!u) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-copper-50 text-copper-700 border border-copper-500/20"
                    >
                      {u.name}
                      <button
                        type="button"
                        onClick={() => toggleUser(id)}
                        className="hover:text-copper-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </section>

          <div className="border-t border-sand-200 pt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Link
              to="/login-admin/manageagencies"
              className="inline-flex items-center justify-center border border-sand-200 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-sand-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-gradient-to-b from-copper-500 to-copper-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:from-copper-600 transition-colors"
            >
              Create Issuing Authority
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default IssuingAuthorityForm;
