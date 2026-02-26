import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { FOOTER_LINKS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-white border-t border-primary/10 pt-8 sm:pt-12 md:pt-16 pb-24 sm:pb-12 md:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="size-5 sm:size-6 bg-primary rounded flex items-center justify-center text-white flex-shrink-0">
                <MaterialIcon name="shopping_bag" className="text-sm sm:text-lg" />
              </div>
              <h2 className="text-sm sm:text-lg font-extrabold text-primary uppercase">FlexiCommerce</h2>
            </div>
            <p className="text-primary/60 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
              Redefining the digital shopping landscape with scalable, enterprise-grade technology and premium user experiences.
            </p>
            <div className="flex gap-4">
              <a className="text-primary/40 hover:text-primary transition-colors text-base sm:text-xl" href="#">
                <MaterialIcon name="public" />
              </a>
              <a className="text-primary/40 hover:text-primary transition-colors text-base sm:text-xl" href="#">
                <MaterialIcon name="forum" />
              </a>
              <a className="text-primary/40 hover:text-primary transition-colors text-base sm:text-xl" href="#">
                <MaterialIcon name="alternate_email" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-extrabold text-primary mb-3 sm:mb-6 text-xs sm:text-sm uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2 sm:space-y-4 text-xs sm:text-sm text-primary/60">
              {FOOTER_LINKS.shop.map((item) => (
                <li key={item}>
                  <Link href="/products" className="hover:text-primary transition-colors line-clamp-2">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-extrabold text-primary mb-3 sm:mb-6 text-xs sm:text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 sm:space-y-4 text-xs sm:text-sm text-primary/60">
              {FOOTER_LINKS.company.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors line-clamp-2">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-extrabold text-primary mb-3 sm:mb-6 text-xs sm:text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-2 sm:space-y-4 text-xs sm:text-sm text-primary/60">
              {FOOTER_LINKS.support.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors line-clamp-2">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-primary/5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-[10px] sm:text-xs text-primary/40">© 2024 FlexiCommerce Inc. All rights reserved.</p>
          <div className="flex gap-4 sm:gap-6 text-[8px] sm:text-[10px] font-bold text-primary/40 uppercase tracking-widest">
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
            <a className="hover:text-primary transition-colors" href="#">Cookies</a>
            <a className="hidden sm:inline hover:text-primary transition-colors" href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
