import { Link, useParams } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArrowRight } from "lucide-react";
import { useLocations } from "@/hooks/use-locations";
import { useIndustries } from "@/hooks/use-industries";
import { useBusinessTypes } from "@/hooks/use-businesstypes";
import { useActivities } from "@/hooks/use-activities";
import { useAgencies } from "@/hooks/use-agencies";

interface ListPageProps {
  title: string;
  description: string;
  eyebrow: string;
  items: { id: string; name: string; count?: number; meta?: string }[];
  linkBase: string;
}

const ListPage = ({ title, description, eyebrow, items, linkBase }: ListPageProps) => (
  <PublicLayout>
    <PageHeader
      eyebrow={eyebrow}
      title={title}
      description={description}
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Browse" }, { label: title }]}
    />
    <section className="container-page py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <Link
            key={it.id}
            to={`${linkBase}/${it.id}`}
            className="group bg-white border border-sand-200 rounded-2xl p-6 hover:border-copper-500/40 hover:shadow-soft transition-all flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-serif text-lg font-medium group-hover:text-primary transition-colors">{it.name}</div>
              {it.meta && <div className="text-xs text-muted-foreground mt-1">{it.meta}</div>}
              {it.count !== undefined && (
                <div className="text-xs text-muted-foreground mt-1 tabular-nums">{it.count} licences</div>
              )}
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  </PublicLayout>
);

export const BrowseJurisdictions = () => {
  const { data } = useLocations({ per_page: 100, order_by: 'name', order_dir: 'ASC' });
  const items = (data?.data ?? []).map((l) => ({ id: String(l.id), name: l.name }));
  return (
    <ListPage
      eyebrow="By Location"
      title="Jurisdictions"
      description="Discover licences by province and district."
      items={items}
      linkBase="/browse/locations/license"
    />
  );
};

export const BrowseIndustries = () => {
  const { data } = useIndustries({ per_page: 100, order_by: 'name', order_dir: 'ASC', show_in_browse: 1 });
  const items = (data?.data ?? []).map((i) => ({ id: String(i.id), name: i.name, count: i.license_count }));
  return (
    <ListPage
      eyebrow="By Industry"
      title="Industries"
      description="Explore industries and the licences that govern them."
      items={items}
      linkBase="/browse/licenses"
    />
  );
};

export const BrowseBusinessTypes = () => {
  const { data } = useBusinessTypes({ per_page: 100, order_by: 'name', order_dir: 'ASC', show_in_browse: 1 });
  const items = (data?.data ?? []).map((b) => ({ id: String(b.id), name: b.name, count: b.license_count }));
  return (
    <ListPage
      eyebrow="By Business Type"
      title="Business Types"
      description="Filter by your business legal structure."
      items={items}
      linkBase="/browse/business-types/licenses"
    />
  );
};

export const BrowseActivities = () => {
  const { data } = useActivities({ per_page: 100, order_by: 'name', order_dir: 'ASC' });
  const items = (data?.data ?? []).map((a) => ({ id: String(a.id), name: a.name, count: a.license_count }));
  return (
    <ListPage
      eyebrow="By Activity"
      title="Business Activities"
      description="Economic activities that may require licensing."
      items={items}
      linkBase="/browse/licenses"
    />
  );
};

export const BrowseAgencies = () => {
  const { data } = useAgencies({ per_page: 100, order_by: 'name', order_dir: 'ASC' });
  const agenciesList = data?.data ?? [];
  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Issuing Bodies"
        title="Government Agencies"
        description="Government bodies that issue and manage business licences."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Agencies" }]}
      />
      <section className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agenciesList.map((a) => (
            <Link
              key={a.id}
              to={`/browse/licenses-agency/${a.slug}`}
              className="group bg-white border border-sand-200 rounded-2xl p-6 hover:border-copper-500/40 hover:shadow-soft transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-medium group-hover:text-primary transition-colors">{a.name}</h3>
                  <div className="text-xs text-muted-foreground mt-1.5">{a.email}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};
