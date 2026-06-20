'use client';

import { useState } from 'react';

interface FAQCardProps {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  updatedAt?: string | Date;
  defaultExpanded?: boolean;
}

export default function FAQCard({
  question,
  answer,
  category,
  updatedAt,
  defaultExpanded = false,
}: FAQCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className={`glass-card faq-card ${expanded ? 'expanded' : ''}`}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      <div className="faq-card-header">
        <h3 className="faq-card-question">{question}</h3>
        <div className="faq-card-toggle">▼</div>
      </div>

      {expanded && (
        <div className="faq-card-answer">
          <p>{answer}</p>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'var(--space-md)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            {category ? (
              <span className="badge badge-review faq-card-category" style={{ margin: 0 }}>
                {category}
              </span>
            ) : (
              <div />
            )}
            {updatedAt && (
              <span className="faq-card-date" style={{ opacity: 0.8 }}>
                Last updated: {new Date(updatedAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
