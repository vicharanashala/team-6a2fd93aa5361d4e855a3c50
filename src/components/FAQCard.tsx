'use client';

import { useState } from 'react';

interface FAQCardProps {
  question: string;
  answer: string;
  category?: string;
  createdAt?: string;
  defaultExpanded?: boolean;
}

const formatQuestion = (text: string) => {
  if (!text) return text;
  let cleaned = text.replace(/^\s*\d+(?:\.\d+)*[.\s]*/, '');
  cleaned = cleaned.replace(/§\s*([a-z]?)/g, (match, p1) => {
    return p1 ? p1.toUpperCase() : '';
  });
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
};

const formatAnswer = (text: string) => {
  if (!text) return text;
  let cleaned = text.replace(/§\s*([a-z]?)/g, (match, p1) => {
    return p1 ? p1.toUpperCase() : '';
  });
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
};

export default function FAQCard({ question, answer, category, defaultExpanded = false }: FAQCardProps) {
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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
        <h3 className="faq-card-question">{formatQuestion(question)}</h3>
        <div className="faq-card-toggle">▼</div>
      </div>

      {expanded && (
        <div className="faq-card-answer">
          <p>{formatAnswer(answer)}</p>
          {category && (
            <span className="badge badge-review faq-card-category">
              {category}
            </span>
          )}
          <p>{answer}</p>
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
