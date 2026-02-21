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
    <div className="space-y-16 pb-20 md:pb-0">
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
            <div className="relative z-20 h-full flex flex-col justify-center px-8 lg:px-16 max-w-2xl text-white">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block w-fit">
                {slide.tag}
              </span>
              <h2 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">{slide.title}</h2>
              <p className="text-lg text-white/80 mb-8">{slide.description}</p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/products"
                  className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
                >
                  Shop Now
                </Link>
                <Link
                  href="/products"
                  className="px-8 py-3 border-2 border-white/40 text-white font-bold rounded-lg hover:bg-white/10 transition-all"
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
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 size-10 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        >
          <MaterialIcon name="arrow_back" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 size-10 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        >
          <MaterialIcon name="arrow_forward" />
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
        <div className="absolute top-4 right-4 z-30 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold">
          {currentSlide + 1} / {HERO_SLIDES.length}
        </div>
      </section>

      {/* Browse Categories */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-primary">Browse Categories</h2>
            <p className="text-primary/60 text-sm mt-1">Find what you&apos;re looking for</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline"
          >
            View All <MaterialIcon name="arrow_forward" className="text-base" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${cat.name.toLowerCase().replace(/ /g, '')}`}
              className="group relative h-48 rounded-xl overflow-hidden bg-primary/5"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-extrabold text-lg leading-tight">{cat.name}</p>
                <p className="text-xs text-white/80">{cat.items} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-primary">Trending Now</h2>
            <p className="text-primary/60 text-sm mt-1">Best selling products this week</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline"
          >
            View All <MaterialIcon name="arrow_forward" className="text-base" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Platform Features */}
      <section className="bg-primary rounded-2xl p-8 md:p-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-2">Why FlexiCommerce?</h2>
          <p className="text-white/60 text-sm mb-10">Trusted by millions of shoppers worldwide</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: 'local_shipping', title: 'Fast Delivery', desc: '2-5 business days' },
              { icon: 'security', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
              { icon: 'assignment_return', title: 'Easy Returns', desc: '30-day return policy' },
              { icon: 'headset_mic', title: '24/7 Support', desc: 'Always here for you' },
            ].map((f) => (
              <div key={f.title}>
                <div className="size-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MaterialIcon name={f.icon} className="text-white text-xl" />
                </div>
                <p className="font-bold text-white text-sm">{f.title}</p>
                <p className="text-white/60 text-xs mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-extrabold text-primary mb-2">Get 20% Off Your First Order</h2>
        <p className="text-primary/60 mb-8">
          Subscribe to our newsletter for exclusive deals and new arrivals
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
          />
          <button className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm">
            Subscribe Now
          </button>
        </div>
        <p className="text-xs text-primary/40 mt-4">We respect your privacy. Unsubscribe at any time.</p>
      </section>
    </div>
  );
}
