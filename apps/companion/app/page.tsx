'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { GuideList } from '@/components/GuideList';
import { GuideViewer } from '@/components/GuideViewer';
import { Guide, GuideMetadata } from '@/lib/types';
import styles from './page.module.css';

export default function Home() {
  const [guides, setGuides] = useState<GuideMetadata[]>([]);
  const [searchResults, setSearchResults] = useState<GuideMetadata[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load guides on mount
  useEffect(() => {
    async function loadGuides() {
      try {
        const response = await fetch('/api/guides');
        if (!response.ok) throw new Error('Failed to load guides');
        const data = await response.json();
        setGuides(data);
        setSearchResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load guides');
      } finally {
        setLoading(false);
      }
    }
    loadGuides();
  }, []);

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(guides);
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.slice(0, 3)); // Top 3 matches
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
  };

  // Handle guide selection
  const handleSelectGuide = async (id: string) => {
    try {
      const response = await fetch(`/api/guides/${id}`);
      if (!response.ok) throw new Error('Failed to load guide');
      const guide = await response.json();
      setSelectedGuide(guide);
    } catch (err) {
      console.error('Error loading guide:', err);
    }
  };

  // Close guide viewer
  const handleCloseGuide = () => {
    setSelectedGuide(null);
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Loading guides...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>TERP Companion</h1>
        <p>Search and view documentation guides</p>
      </header>

      <section className={styles.search}>
        <SearchBar onSearch={handleSearch} />
      </section>

      {selectedGuide ? (
        <section className={styles.viewer}>
          <GuideViewer guide={selectedGuide} onClose={handleCloseGuide} />
        </section>
      ) : (
        <section className={styles.results}>
          <GuideList
            guides={searchResults}
            onSelect={handleSelectGuide}
          />
        </section>
      )}

      <footer className={styles.footer}>
        <p>
          <strong>Note:</strong> This UI only displays retrieved guide content.
          No free-form explanations are provided.
        </p>
      </footer>
    </main>
  );
}
