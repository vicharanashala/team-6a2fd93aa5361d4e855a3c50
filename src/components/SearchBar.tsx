'use client';

import { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export default function SearchBar({ onSearch, placeholder = 'Search FAQs...', loading = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, onSearch]);

  return (
    <div className="search-wrapper" id="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="input input-search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        id="search-input"
        autoComplete="off"
      />
      {loading && <div className="search-spinner" />}
    </div>
  );
}
