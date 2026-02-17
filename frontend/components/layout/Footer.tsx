import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { FOOTER_LINKS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-white border-t border-primary/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="size-6 bg-primary rounded flex items-center justify-center text-white">
                <MaterialIcon name="shopping_bag" className="text-lg" />
              </div>
              <h2 className="text-lg font-extrabold text-primary uppercase">FlexiCommerce</h2>
            </div>
            <p className="text-primary/60 text-sm leading-relaxed mb-6">
              Redefining the digital shopping landscape with scalable, enterprise-grade technology and premium user experiences.
            </p>
            <div className="flex gap-4">
              <a className="text-primary/40 hover:text-primary transition-colors" href="#">
                <MaterialIcon name="public" />
              </a>
              <a className="text-primary/40 hover:text-primary transition-colors" href="#">
                <MaterialIcon name="forum" />
              </a>
              <a className="text-primary/40 hover:text-primary transition-colors" href="#">
                <MaterialIcon name="alternate_email" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-extrabold text-primary mb-6 text-sm uppercase tracking-wider">Shop</h3>
            <ul className="space-y-4 text-sm text-primary/60">
              {FOOTER_LINKS.shop.map((item) => (
                <li key={item}>
                  <Link href="/products" className="hover:text-primary">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-extrabold text-primary mb-6 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-4 text-sm text-primary/60">
              {FOOTER_LINKS.company.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-extrabold text-primary mb-6 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-4 text-sm text-primary/60">
              {FOOTER_LINKS.support.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary/40">© 2024 FlexiCommerce Inc. All rights reserved.</p>
          <div className="flex gap-6 text-[10px] font-bold text-primary/40 uppercase tracking-widest">
            <a className="hover:text-primary" href="#">Privacy</a>
            <a className="hover:text-primary" href="#">Terms</a>
            <a className="hover:text-primary" href="#">Cookies</a>
            <a className="hover:text-primary" href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
