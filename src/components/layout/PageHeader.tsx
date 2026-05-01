import { Link } from "react-router-dom";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; to?: string }[];
}

export const PageHeader = ({ eyebrow, title, description, breadcrumbs }: PageHeaderProps) => (
  <section className="border-b border-sand-200 bg-sand-100/60">
    <div className="container-page py-12 md:py-16">
      {breadcrumbs && (
        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2 flex-wrap">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              {b.to ? (
                <Link to={b.to} className="hover:text-primary transition-colors">{b.label}</Link>
              ) : (
                <span>{b.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <span className="text-sand-200">/</span>}
            </span>
          ))}
        </nav>
      )}
      {eyebrow && (
        <div className="inline-block px-3 py-1 bg-copper-50 text-copper-600 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
          {eyebrow}
        </div>
      )}
      <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-balance mb-4">{title}</h1>
      {description && <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{description}</p>}
    </div>
  </section>
);
