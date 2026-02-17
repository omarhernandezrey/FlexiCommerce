import Link from 'next/link';
import { MaterialIcon } from './MaterialIcon';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-primary/60">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <MaterialIcon name="chevron_right" className="text-xs" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-primary font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
