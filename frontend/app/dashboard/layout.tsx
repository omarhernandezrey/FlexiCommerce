import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | FlexiCommerce',
  description: 'Admin dashboard for managing your FlexiCommerce store',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
