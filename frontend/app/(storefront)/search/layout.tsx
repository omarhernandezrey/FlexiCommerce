import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Búsqueda — FlexiCommerce',
  description: 'Busca productos, marcas y categorías en FlexiCommerce.',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
