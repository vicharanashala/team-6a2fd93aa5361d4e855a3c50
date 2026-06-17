'use client';

import { useState } from 'react';

interface FAQCardProps {
  question: string;
  answer: string;
  category?: string;
  defaultExpanded?: boolean;
}

export default function FAQCard({ question, answer, category, defaultExpanded = false }: FAQCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`glass-card faq-card ${expanded ? 'expanded' : ''}`}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded(!expanded);
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
          {category && (
            <span className="badge badge-review faq-card-category">
              {category}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
