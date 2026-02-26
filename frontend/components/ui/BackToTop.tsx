'use client';

import { useState, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50 size-11 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 hover:scale-110 transition-all flex items-center justify-center"
    >
      <MaterialIcon name="keyboard_arrow_up" className="text-2xl" />
    </button>
  );
}
