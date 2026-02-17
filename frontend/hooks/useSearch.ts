'use client';

import { useState, useMemo, useEffect } from 'react';

export const useSearch = (items: any[], searchFields: string[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Debounce the search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const results = useMemo(() => {
    if (!debouncedTerm.trim()) {
      return items;
    }

    const term = debouncedTerm.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(term);
      })
    );
  }, [items, debouncedTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    results,
  };
};
