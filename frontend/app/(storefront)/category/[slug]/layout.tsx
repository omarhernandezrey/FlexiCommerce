import type { Metadata } from 'next';

// Mapa estático de categorías conocidas (espeja el CATEGORY_META del page.tsx)
const CATEGORY_META: Record<string, { title: string; description: string }> = {
  electronics: {
    title: 'Electrónica',
    description:
      'Descubre lo último en electrónica de consumo — auriculares, laptops, smartphones y más.',
  },
  fashion: {
    title: 'Moda',
    description:
      'Explora ropa, accesorios y calzado premium de los mejores diseñadores del mundo.',
  },
  'home-decor': {
    title: 'Decoración del Hogar',
    description:
      'Transforma tu espacio con muebles, iluminación y accesorios de interior curados.',
  },
  'smart-gadgets': {
    title: 'Gadgets Inteligentes',
    description:
      'Los gadgets más inteligentes para hacer tu vida más fácil, conectada y divertida.',
  },
  sports: {
    title: 'Deportes y Aire Libre',
    description:
      'Equípate para tu próxima aventura con equipo deportivo premium y ropa activa.',
  },
  tech: {
    title: 'Tecnología',
    description:
      'Productos tecnológicos de vanguardia para trabajo, entretenimiento y todo lo demás.',
  },
  lifestyle: {
    title: 'Estilo de Vida',
    description:
      'Productos premium de estilo de vida diseñados para quienes aprecian la calidad y el estilo.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const meta = CATEGORY_META[slug];

  const title = meta
    ? meta.title
    : slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

  const description = meta
    ? meta.description
    : `Explora todos los productos de la categoría ${title} en FlexiCommerce.`;

  return {
    title: `${title} — FlexiCommerce`,
    description,
    openGraph: {
      title: `${title} — FlexiCommerce`,
      description,
      type: 'website',
    },
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
