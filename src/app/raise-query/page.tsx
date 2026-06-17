'use client';

import { useState } from 'react';
import TicketDisplay from '@/components/TicketDisplay';
import StatusTracker from '@/components/StatusTracker';

interface TrackedQuery {
  _id: string;
  ticketId: string;
  question: string;
  status: 'active' | 'in-review' | 'resolved';
  proposedAnswer?: string;
  approvals: string[];
  requiredApprovals: number;
  createdAt: string;
}

export default function RaiseQueryPage() {
  // Submit query state
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Track query state
  const [trackTicketId, setTrackTicketId] = useState('');
  const [tracking, setTracking] = useState(false);
  const [trackedQuery, setTrackedQuery] = useState<TrackedQuery | null>(null);
  const [trackError, setTrackError] = useState('');

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setSubmitting(true);
    setSubmitError('');
    setSubmittedTicketId(null);

    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmittedTicketId(data.ticketId);
        setQuestion('');
      } else {
        setSubmitError(data.error || 'Failed to submit query');
      }
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTicketId.trim()) return;

    setTracking(true);
    setTrackError('');
    setTrackedQuery(null);

    try {
      const res = await fetch(`/api/queries?ticketId=${encodeURIComponent(trackTicketId.trim())}`);
      const data = await res.json();

      if (res.ok) {
        setTrackedQuery(data.query);
      } else {
        setTrackError(data.error || 'Query not found');
      }
    } catch {
      setTrackError('Network error. Please try again.');
    } finally {
      setTracking(false);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>Raise a Query</h1>
        <p>Ask your question and get help from the IIT Ropar community</p>
      </div>

      <div className="query-sections">
        {/* Submit Query Section */}
        <div className="glass-card" style={{ animation: 'slideUp 0.5s ease' }} id="submit-query-section">
          <div className="section-title">
            <span className="section-title-icon">✍️</span>
            Submit a Query
          </div>

          {submittedTicketId ? (
            <div>
              <TicketDisplay ticketId={submittedTicketId} />
              <button
                className="btn btn-secondary w-full mt-lg"
                onClick={() => {
                  setSubmittedTicketId(null);
                }}
                id="submit-another-btn"
              >
                Submit Another Query
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitQuery}>
              {submitError && (
                <div className="error-alert">{submitError}</div>
              )}
              <div className="input-group mb-lg">
                <label className="input-label" htmlFor="query-input">
                  Your Question
                </label>
                <textarea
                  id="query-input"
                  className="input textarea"
                  placeholder="Describe your question in detail..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={submitting || !question.trim()}
                id="submit-query-btn"
              >
                {submitting ? 'Submitting...' : '🚀 Submit Query'}
              </button>
            </form>
          )}
        </div>

        {/* Track Query Section */}
        <div className="glass-card" style={{ animation: 'slideUp 0.5s ease 0.1s both' }} id="track-query-section">
          <div className="section-title">
            <span className="section-title-icon">🔎</span>
            Track Your Query
          </div>

          <form onSubmit={handleTrackQuery} className="mb-lg">
            {trackError && (
              <div className="error-alert">{trackError}</div>
            )}
            <div className="input-group mb-md">
              <label className="input-label" htmlFor="track-input">
                Ticket ID
              </label>
              <input
                id="track-input"
                className="input"
                type="text"
                placeholder="e.g. abc45-df43-88io-123a"
                value={trackTicketId}
                onChange={(e) => setTrackTicketId(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-secondary w-full"
              disabled={tracking || !trackTicketId.trim()}
              id="track-query-btn"
            >
              {tracking ? 'Tracking...' : '📍 Track Query'}
            </button>
          </form>

          {trackedQuery && (
            <div style={{ animation: 'slideUp 0.4s ease' }}>
              <div style={{ 
                padding: 'var(--space-md)', 
                background: 'var(--bg-glass)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: 'var(--space-lg)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Ticket: {trackedQuery.ticketId}
                </div>
                <div style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                  {trackedQuery.question}
                </div>
                <span className={`badge badge-${trackedQuery.status === 'in-review' ? 'review' : trackedQuery.status}`}>
                  <span className="badge-dot" />
                  {trackedQuery.status === 'in-review' ? 'In Review' : trackedQuery.status.charAt(0).toUpperCase() + trackedQuery.status.slice(1)}
                </span>
              </div>

              <div style={{ position: 'relative' }}>
                <StatusTracker
                  status={trackedQuery.status}
                  approvals={trackedQuery.approvals?.length || 0}
                  requiredApprovals={trackedQuery.requiredApprovals || 3}
                />
              </div>

              {trackedQuery.status === 'in-review' && (
                <div className="mt-lg">
                  <div className="approval-bar">
                    <div
                      className="approval-bar-fill"
                      style={{ width: `${((trackedQuery.approvals?.length || 0) / (trackedQuery.requiredApprovals || 3)) * 100}%` }}
                    />
                  </div>
                  <div className="approval-text">
                    {trackedQuery.approvals?.length || 0} / {trackedQuery.requiredApprovals || 3} peer approvals
                  </div>
                </div>
              )}

              {trackedQuery.status === 'resolved' && trackedQuery.proposedAnswer && (
                <div className="mt-lg" style={{
                  padding: 'var(--space-md)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-green-light)', fontWeight: 600, marginBottom: '4px' }}>
                    ✅ Resolved Answer
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {trackedQuery.proposedAnswer}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
