'use client';

import { useState, useCallback } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(query);
    },
    [query, onSearch]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      // Debounced search on type
      if (value.length === 0 || value.length >= 2) {
        onSearch(value);
      }
    },
    [onSearch]
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.input}
        placeholder="Ask a question or search for a guide..."
        value={query}
        onChange={handleChange}
        aria-label="Search guides"
      />
      <button type="submit" className={styles.button}>
        Search
      </button>
    </form>
  );
}
