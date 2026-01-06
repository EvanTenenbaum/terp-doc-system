'use client';

import { Guide } from '@/lib/types';
import styles from './GuideViewer.module.css';

interface GuideViewerProps {
  guide: Guide;
  onClose: () => void;
}

/**
 * GuideViewer displays a guide's steps and screenshots.
 * 
 * STRICT RULE: This component ONLY renders retrieved guide content.
 * No free-form explanations or AI-generated content is added.
 */
export function GuideViewer({ guide, onClose }: GuideViewerProps) {
  const { metadata, steps } = guide;

  return (
    <div className={styles.viewer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.category}>{metadata.category}</span>
          <h2 className={styles.title}>{metadata.title}</h2>
          <p className={styles.description}>{metadata.description}</p>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
      </header>

      <div className={styles.steps}>
        {steps.map((step) => (
          <div key={step.order} className={styles.step}>
            <div className={styles.stepNumber}>{step.order}</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
              {step.screenshot && (
                <div className={styles.screenshot}>
                  <img
                    src={`/screenshots/${step.screenshot}`}
                    alt={`Step ${step.order}: ${step.title}`}
                    className={styles.screenshotImage}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        <div className={styles.meta}>
          <span>Version {metadata.version}</span>
          <span>Updated {new Date(metadata.updatedAt).toLocaleDateString()}</span>
        </div>
        {metadata.tags.length > 0 && (
          <div className={styles.tags}>
            {metadata.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}
