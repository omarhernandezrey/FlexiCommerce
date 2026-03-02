import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const json = await res.json();
      const product = json.data ?? json;
      const description = (product.description || '').slice(0, 160);
      const images: { url: string }[] = product.images?.[0]
        ? [{ url: product.images[0] }]
        : product.image
        ? [{ url: product.image }]
        : [];
      return {
        title: `${product.name} — FlexiCommerce`,
        description,
        openGraph: {
          title: product.name,
          description,
          images,
          type: 'website',
        },
      };
    }
  } catch {
    // Silencioso: fallback a titulo generico
  }
  return { title: 'Producto — FlexiCommerce' };
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
