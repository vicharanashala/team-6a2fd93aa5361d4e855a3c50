'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import TicketDisplay from '@/components/TicketDisplay';
import StatusTracker from '@/components/StatusTracker';
import { ALL_CATEGORIES } from '@/lib/categorizer';
import type { QueryCategory } from '@/lib/categorizer';

// ─── Schema-aligned TrackedQuery (supplementary fields included) ──────────────

interface TrackedQuery {
  _id: string;
  ticketId: string;
  query_id: string;
  title: string;
  description: string;
  category: QueryCategory;
  status: 'Open' | 'Resolved';
  posted_at: string;
  proposedAnswer?: string | null;
  approvals: string[];
  requiredApprovals: number;
  // supplementary internal fields
  internalStatus?: 'active' | 'in-review' | 'resolved';
  createdAt?: string;
}

export default function RaiseQueryPage() {
  return (
    <AuthGuard>
      {(user) => <RaiseQueryContent user={user} />}
    </AuthGuard>
  );
}

function RaiseQueryContent({ user }: { user: { userId: string; username: string } }) {
  // ── Submit query form state ──────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QueryCategory | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');

  // ── Track query state ────────────────────────────────────────────────────────
  const [trackTicketId, setTrackTicketId] = useState('');
  const [tracking, setTracking] = useState(false);
  const [trackedQuery, setTrackedQuery] = useState<TrackedQuery | null>(null);
  const [trackError, setTrackError] = useState('');

  // ── User's own queries (auto-populated) ─────────────────────────────────────
  const [myQueries, setMyQueries] = useState<TrackedQuery[]>([]);
  const [loadingMyQueries, setLoadingMyQueries] = useState(true);

  const fetchMyQueries = useCallback(async () => {
    setLoadingMyQueries(true);
    try {
      const res = await fetch(`/api/queries?userId=${encodeURIComponent(user.userId)}`);
      const data = await res.json();
      if (res.ok) {
        setMyQueries(data.queries || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingMyQueries(false);
    }
  }, [user.userId]);

  useEffect(() => {
    fetchMyQueries();
  }, [fetchMyQueries]);

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setSubmitError('');
    setSubmittedTicketId(null);

    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category || undefined, // let server auto-categorize if blank
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmittedTicketId(data.ticketId);
        setTitle('');
        setDescription('');
        setCategory('');
        fetchMyQueries();
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

  // Derive internal status (needed by StatusTracker) from schema status
  function toInternalStatus(q: TrackedQuery): 'active' | 'in-review' | 'resolved' {
    if (q.internalStatus) return q.internalStatus;
    if (q.status === 'Resolved') return 'resolved';
    return 'active';
  }

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>Raise a Query</h1>
        <p>Ask your question and get help from the IIT Ropar community</p>
      </div>

      <div className="query-sections">
        {/* ── Submit Query Section ─────────────────────────────────────────── */}
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
                onClick={() => setSubmittedTicketId(null)}
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

              {/* Query Title */}
              <div className="input-group mb-md">
                <label className="input-label" htmlFor="query-title">
                  Query Title <span style={{ color: 'var(--accent-red, #f87171)' }}>*</span>
                </label>
                <input
                  id="query-title"
                  className="input"
                  type="text"
                  placeholder="e.g. How do I apply for a mess rebate?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Category Select */}
              <div className="input-group mb-md">
                <label className="input-label" htmlFor="query-category">
                  Category{' '}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>
                    (leave blank to auto-detect)
                  </span>
                </label>
                <select
                  id="query-category"
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as QueryCategory | '')}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">— Auto-detect category —</option>
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="input-group mb-lg">
                <label className="input-label" htmlFor="query-description">
                  Full Description <span style={{ color: 'var(--accent-red, #f87171)' }}>*</span>
                </label>
                <textarea
                  id="query-description"
                  className="input textarea"
                  placeholder="Describe your query in detail — include relevant context, dates, or references..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={submitting || !title.trim() || !description.trim()}
                id="submit-query-btn"
              >
                {submitting ? 'Submitting...' : '🚀 Submit Query'}
              </button>
            </form>
          )}
        </div>

        {/* ── Track Query Section ──────────────────────────────────────────── */}
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
              <QueryStatusCard query={trackedQuery} toInternalStatus={toInternalStatus} />
            </div>
          )}
        </div>
      </div>

      {/* ── My Queries Section ────────────────────────────────────────────────── */}
      <div className="glass-card mt-2xl" style={{ animation: 'slideUp 0.5s ease 0.2s both' }} id="my-queries-section">
        <div className="section-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span className="section-title-icon">📋</span>
            My Queries
          </div>
          <span className="badge badge-review">{myQueries.length} total</span>
        </div>

        {loadingMyQueries ? (
          <div>
            {[1, 2].map((i) => (
              <div key={i} style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" style={{ width: '60%' }} />
              </div>
            ))}
          </div>
        ) : myQueries.length > 0 ? (
          <div className="my-queries-list">
            {myQueries.map((q) => (
              <div
                key={q._id}
                className="my-query-item"
                onClick={() => {
                  setTrackTicketId(q.ticketId);
                  setTrackedQuery(q);
                }}
              >
                <div className="my-query-top">
                  <span className="my-query-ticket">{q.ticketId}</span>
                  <span className={`badge badge-${q.status === 'Resolved' ? 'resolved' : q.status === 'Open' ? 'active' : 'review'}`}>
                    <span className="badge-dot" />
                    {q.status}
                  </span>
                </div>
                <div className="my-query-question">{q.title || q.description}</div>
                <div className="my-query-date">{q.posted_at}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No queries yet</h3>
            <p>Your submitted queries will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── QueryStatusCard ──────────────────────────────────────────────────────────

function QueryStatusCard({
  query,
  toInternalStatus,
}: {
  query: TrackedQuery;
  toInternalStatus: (q: TrackedQuery) => 'active' | 'in-review' | 'resolved';
}) {
  const internalStatus = toInternalStatus(query);
  return (
    <div>
      <div style={{
        padding: 'var(--space-md)',
        background: 'var(--bg-glass)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        marginBottom: 'var(--space-lg)',
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          Ticket: {query.ticketId}
        </div>
        <div style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {query.title}
        </div>
        {query.category && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            🏷️ {query.category}
          </div>
        )}
        {query.posted_at && (
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            🕐 Posted on: {query.posted_at}
          </div>
        )}
        <span className={`badge badge-${internalStatus === 'in-review' ? 'review' : internalStatus}`}>
          <span className="badge-dot" />
          {query.status}
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <StatusTracker
          status={internalStatus}
          approvals={query.approvals?.length || 0}
          requiredApprovals={query.requiredApprovals || 3}
        />
      </div>

      {internalStatus === 'in-review' && (
        <div className="mt-lg">
          <div className="approval-bar">
            <div
              className="approval-bar-fill"
              style={{ width: `${((query.approvals?.length || 0) / (query.requiredApprovals || 3)) * 100}%` }}
            />
          </div>
          <div className="approval-text">
            {query.approvals?.length || 0} / {query.requiredApprovals || 3} peer approvals
          </div>
        </div>
      )}

      {internalStatus === 'resolved' && query.proposedAnswer && (
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
            {query.proposedAnswer}
          </div>
        </div>
      )}
    </div>
  );
}
