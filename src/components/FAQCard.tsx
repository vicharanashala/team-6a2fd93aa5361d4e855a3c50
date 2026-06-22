'use client';

import { useState } from 'react';

interface FAQCardProps {
  question: string;
  answer: string;
  category?: string;
  createdAt?: string;
  defaultExpanded?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Clean up FAQ question text: remove § symbols, strip leading numbering, capitalize first letter
function cleanQuestion(text: string): string {
  let cleaned = text
    .replace(/§/g, '')
    .replace(/^\s*\d+(\.\d+)*\.?\s*/g, '')
    .trim();
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

// Clean up FAQ answer text: remove § symbols, capitalize first letter
function cleanAnswer(text: string): string {
  let cleaned = text.replace(/§/g, '').trim();
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

export default function FAQCard({ question, answer, category, createdAt, defaultExpanded = false }: FAQCardProps) {
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
        <h3 className="faq-card-question">{cleanQuestion(question)}</h3>
        <div className="faq-card-toggle">▼</div>
      </div>

      {expanded && (
        <div className="faq-card-answer">
          <p>{cleanAnswer(answer)}</p>
          <div className="faq-card-footer">
            {category && (
              <span className="badge badge-review faq-card-category">
                {category}
              </span>
            )}
            {createdAt && (
              <span className="faq-card-timestamp">
                📅 {formatDate(createdAt)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
