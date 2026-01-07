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
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

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
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults(guides);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);

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

  // Render no guides found message
  const renderNoResults = () => {
    if (!hasSearched) return null;

    // Find similar guides for suggestions
    const suggestions = guides.slice(0, 3);

    return (
      <div className={styles.noResults}>
        <h3>No verified guide exists yet</h3>
        <p>
          We couldn&apos;t find a guide matching &quot;{searchQuery}&quot;.
        </p>
        {suggestions.length > 0 && (
          <>
            <p>You might find these guides helpful:</p>
            <ul className={styles.suggestions}>
              {suggestions.map((guide) => (
                <li key={guide.id}>
                  <button
                    onClick={() => handleSelectGuide(guide.id)}
                    className={styles.suggestionLink}
                  >
                    {guide.title}
                  </button>
                  <span className={styles.suggestionCategory}>
                    ({guide.category})
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>TERP Companion</h1>
        <p>Ask &quot;How do I ____?&quot; to find step-by-step guides</p>
      </header>

      <section className={styles.search}>
        <SearchBar onSearch={handleSearch} />
      </section>

      {selectedGuide ? (
        <section className={styles.viewer}>
          <GuideViewer guide={selectedGuide} onClose={handleCloseGuide} />
        </section>
      ) : searchResults.length > 0 ? (
        <section className={styles.results}>
          <GuideList guides={searchResults} onSelect={handleSelectGuide} />
        </section>
      ) : (
        <section className={styles.results}>{renderNoResults()}</section>
      )}

      <footer className={styles.footer}>
        <p>
          <strong>STRICT RULE:</strong> This UI only displays retrieved guide
          content. If no guide matches your question, we cannot invent
          instructions - only verified guides are shown.
        </p>
      </footer>
    </main>
  );
}
