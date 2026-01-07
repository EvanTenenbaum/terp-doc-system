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
 * If no guide matches, it displays a clear message.
 */
export function GuideViewer({ guide, onClose }: GuideViewerProps) {
  const { metadata, steps } = guide;

  // Build screenshot path - supports both legacy and new paths
  const getScreenshotPath = (screenshot: string) => {
    // If screenshot is just a filename, use the guide-specific images folder
    if (!screenshot.includes('/')) {
      return `/api/screenshots/${metadata.id}/${screenshot}`;
    }
    // Otherwise use as-is
    return screenshot;
  };

  return (
    <div className={styles.viewer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.category}>{metadata.category}</span>
          <h2 className={styles.title}>{metadata.title}</h2>
          <p className={styles.description}>{metadata.description}</p>
        </div>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close guide">
          &times;
        </button>
      </header>

      <div className={styles.steps}>
        {steps.length === 0 ? (
          <div className={styles.noSteps}>
            <p>This guide has no steps recorded yet.</p>
          </div>
        ) : (
          steps.map((step) => (
            <div key={step.order} className={styles.step}>
              <div className={styles.stepNumber}>{step.order}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
                {step.screenshot && (
                  <div className={styles.screenshot}>
                    <img
                      src={getScreenshotPath(step.screenshot)}
                      alt={`Step ${step.order}: ${step.title}`}
                      className={styles.screenshotImage}
                      onError={(e) => {
                        // Hide broken images
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.meta}>
          <span>Version {metadata.version}</span>
          <span>Last verified: {new Date(metadata.updatedAt).toLocaleDateString()}</span>
          <span>Module: {metadata.category}</span>
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

      <div className={styles.disclaimer}>
        <p>
          <strong>Note:</strong> This guide is auto-generated from verified TERP workflows.
          Content is based solely on the retrieved guide - no additional explanations are provided.
        </p>
      </div>
    </div>
  );
}
