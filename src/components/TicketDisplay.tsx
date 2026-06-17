'use client';

import { useState } from 'react';

interface TicketDisplayProps {
  ticketId: string;
}

export default function TicketDisplay({ ticketId }: TicketDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = ticketId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="ticket-display" id="ticket-display">
      <div className="success-icon">🎫</div>
      <div className="ticket-label">Your Ticket ID</div>
      <div className="ticket-id">
        <span>{ticketId}</span>
        <button
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy ticket ID"
          id="copy-ticket-btn"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Save this ticket ID to track your query status
      </p>
    </div>
  );
}
