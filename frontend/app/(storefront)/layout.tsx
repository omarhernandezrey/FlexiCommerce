import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { BackToTop } from '@/components/ui/BackToTop';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container-main pt-6 pb-24 sm:py-8 md:py-12">{children}</main>
      <Footer />
      <MobileBottomNav />
      <BackToTop />
    </div>
  );
}
