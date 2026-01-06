'use client';

import { GuideMetadata } from '@/lib/types';
import styles from './GuideList.module.css';

interface GuideListProps {
  guides: GuideMetadata[];
  onSelect: (id: string) => void;
}

export function GuideList({ guides, onSelect }: GuideListProps) {
  if (guides.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No guides found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {guides.map((guide) => (
        <button
          key={guide.id}
          className={styles.card}
          onClick={() => onSelect(guide.id)}
        >
          <div className={styles.category}>{guide.category}</div>
          <h3 className={styles.title}>{guide.title}</h3>
          <p className={styles.description}>{guide.description}</p>
          {guide.tags.length > 0 && (
            <div className={styles.tags}>
              {guide.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
