import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProfileSidebar } from '@/components/layout/ProfileSidebar';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="hidden md:block">
              <ProfileSidebar />
            </div>
            {/* Main content */}
            <div className="md:col-span-3">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
