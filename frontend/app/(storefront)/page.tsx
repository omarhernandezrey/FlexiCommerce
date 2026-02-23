'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProductCard } from '@/components/products/ProductCard';
import { MOCK_PRODUCTS, IMAGES, CATEGORIES } from '@/lib/constants';

const HERO_SLIDES = [
  {
    title: 'Elevate Your Everyday Style',
    description: 'Experience the perfect blend of performance and aesthetics with our curated premium arrivals.',
    tag: 'Summer Collection 2024',
  },
  {
    title: 'Premium Quality Guaranteed',
    description: 'Discover our latest collection with exclusive designs and premium materials.',
    tag: 'New Arrivals',
  },
  {
    title: 'Limited Edition Exclusive',
    description: 'Grab your favorite items before they sell out. Limited stock available now.',
    tag: 'Flash Sale',
  },
];

export default function StorefrontHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const goToSlide = (idx: number) => { setCurrentSlide(idx); setAutoPlay(false); };
  const prevSlide = () => { setCurrentSlide((p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length); setAutoPlay(false); };
  const nextSlide = () => { setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length); setAutoPlay(false); };

  return (
    <div className="section-wrapper">
      {/* Hero Slider */}
      <section
        className="relative rounded-2xl overflow-hidden h-80 sm:h-96 md:h-[520px] group"
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent z-10" />
            <img src={IMAGES.hero} alt={slide.title} className="w-full h-full object-cover" />
            <div className="relative z-20 h-full flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16 max-w-3xl text-white">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4 inline-block w-fit">
                {slide.tag}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-4 sm:mb-6">{slide.title}</h2>
              <p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-8">{slide.description}</p>
              <div className="flex gap-3 sm:gap-4 flex-wrap">
                <Link
                  href="/products"
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg text-sm sm:text-base"
                >
                  Shop Now
                </Link>
                <Link
                  href="/products"
                  className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-white/40 text-white font-bold rounded-lg hover:bg-white/10 transition-all text-sm sm:text-base"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 size-9 sm:size-10 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        >
          <MaterialIcon name="arrow_back" className="text-lg sm:text-xl" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 size-9 sm:size-10 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        >
          <MaterialIcon name="arrow_forward" className="text-lg sm:text-xl" />
        </button>

        {/* Slide Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-white w-8 h-2' : 'bg-white/50 hover:bg-white/70 w-2 h-2'
              }`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-30 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold">
          {currentSlide + 1} / {HERO_SLIDES.length}
        </div>
      </section>

      {/* Browse Categories */}
      <section className="spacing-section">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">Browse Categories</h2>
            <p className="text-primary/60 text-xs sm:text-sm mt-1">Find what you&apos;re looking for</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-primary font-semibold text-xs sm:text-sm hover:underline"
          >
            View All <MaterialIcon name="arrow_forward" className="text-base" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-gap-standard">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${cat.name.toLowerCase().replace(/ /g, '')}`}
              className="group relative h-32 sm:h-40 md:h-48 rounded-lg sm:rounded-xl overflow-hidden bg-primary/5"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white">
                <p className="font-extrabold text-xs sm:text-sm md:text-lg leading-tight">{cat.name}</p>
                <p className="text-[10px] sm:text-xs text-white/80">{cat.items} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="spacing-section">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">Trending Now</h2>
            <p className="text-primary/60 text-xs sm:text-sm mt-1">Best selling products this week</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-primary font-semibold text-xs sm:text-sm hover:underline"
          >
            View All <MaterialIcon name="arrow_forward" className="text-base" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-gap-standard">
          {MOCK_PRODUCTS.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Engineered for Scale - Platform Features */}
      <section className="bg-primary text-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12 translate-x-1/2"></div>
        <div className="relative z-10 grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          <div>
            <span className="text-white/60 font-bold tracking-widest uppercase text-xs">Enterprise Ready</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mt-3 sm:mt-4 leading-tight">
              Engineered for Scale,<br />Built for Success
            </h2>
            <p className="text-white/70 mt-4 sm:mt-6 text-sm sm:text-base md:text-lg leading-relaxed">
              FlexiCommerce isn&apos;t just a shop; it&apos;s a multi-tenant powerhouse designed for global brands
              requiring high performance, security, and infinite scalability.
            </p>
            <div className="mt-8 sm:mt-10 grid sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: 'hub', title: 'Multi-Tenant', desc: 'Manage hundreds of stores from a single unified hub.' },
                { icon: 'speed', title: 'Ultra Fast', desc: '99.9% Uptime with sub-second page load speeds.' },
                { icon: 'security', title: 'Encrypted', desc: 'PCI-DSS Level 1 compliant secure transactions.' },
                { icon: 'cloud_sync', title: 'Live Sync', desc: 'Real-time inventory and logistics tracking.' },
              ].map((f) => (
                <div key={f.title} className="flex gap-3 sm:gap-4">
                  <div className="size-11 sm:size-12 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MaterialIcon name={f.icon} className="text-white text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-sm sm:text-base">{f.title}</h4>
                    <p className="text-xs sm:text-sm text-white/50">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block relative">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80"
              alt="Analytics Dashboard"
              className="rounded-lg sm:rounded-xl shadow-2xl rotate-3 w-full object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-xl text-primary max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-extrabold uppercase text-primary/40">Global Traffic</span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold">4.2M+</p>
              <p className="text-xs text-primary/60 font-medium italic">Active Daily Transactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-primary mb-2">Join the Elite Commerce Club</h2>
        <p className="text-primary/60 mb-6 sm:mb-8 text-sm sm:text-base">
          Get 20% off your first order and unlock exclusive deals, early access to new arrivals, and members-only perks
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-4 py-2.5 sm:py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
          />
          <button className="px-6 py-2.5 sm:py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm">
            Subscribe Now
          </button>
        </div>
        <p className="text-xs text-primary/40 mt-4">We respect your privacy. Unsubscribe at any time.</p>
      </section>
    </div>
  );
}
