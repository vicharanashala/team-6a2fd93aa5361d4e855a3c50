'use client';

import { useState, useCallback, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import FAQCard from '@/components/FAQCard';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  views?: number;
  updatedAt?: string | Date;
}

interface TrendingQuery {
  _id: string;
  ticketId: string;
  question: string;
  proposedAnswer?: string;
  status: 'active' | 'in-review' | 'resolved';
  approvals: string[];
  username: string;
  createdAt: string;
  engagementScore?: number;
}

// Demo trending shown when database is offline
const DEMO_TRENDING: TrendingQuery[] = [
  {
    _id: 'demo-1',
    ticketId: 'TKT-001',
    question: 'How do I connect to the campus WiFi (LDAP)?',
    proposedAnswer: 'Go to Settings > WiFi > Select "IITRopar" > Enter your LDAP username and password. First-time users register at ldap.iitrpr.ac.in.',
    status: 'resolved',
    approvals: ['a', 'b', 'c'],
    username: 'student_demo',
    createdAt: new Date().toISOString(),
    engagementScore: 3,
  },
  {
    _id: 'demo-2',
    ticketId: 'TKT-002',
    question: 'What are the library timings during exam week?',
    proposedAnswer: 'The main library is open 24/7 during exam weeks. Normal timings are 9:00 AM – 10:00 PM on weekdays.',
    status: 'resolved',
    approvals: ['a', 'b'],
    username: 'student_demo',
    createdAt: new Date().toISOString(),
    engagementScore: 2,
  },
  {
    _id: 'demo-3',
    ticketId: 'TKT-003',
    question: 'How do I apply for a semester fee extension?',
    proposedAnswer: undefined,
    status: 'active',
    approvals: [],
    username: 'student_demo',
    createdAt: new Date().toISOString(),
    engagementScore: 0,
  },
];

const STATUS_CONFIG = {
  resolved:  { label: 'Resolved',   color: 'var(--accent-green, #10b981)',  bg: 'rgba(16,185,129,0.12)' },
  'in-review': { label: 'Under Review', color: 'var(--accent-amber-light, #fbbf24)', bg: 'rgba(245,158,11,0.12)' },
  active:    { label: 'Open',        color: 'var(--accent-blue-light, #93c5fd)',  bg: 'rgba(59,130,246,0.12)' },
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Home() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [trendingQueries, setTrendingQueries] = useState<TrendingQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFaqs = useCallback(async (query: string) => {
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const url = query.trim()
        ? `/api/faqs?q=${encodeURIComponent(query.trim())}`
        : '/api/faqs';
      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();
      setFaqs(data.faqs || []);
    } catch (error) {
      // Ignore intentional abort (timeout); log any real errors
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch FAQs:', error);
      }
      setFaqs([]);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch('/api/trending', { signal: controller.signal });
      const data = await res.json();
      if (data.trending && data.trending.length > 0) {
        setTrendingQueries(data.trending);
      } else {
        setTrendingQueries(DEMO_TRENDING);
      }
    } catch (error) {
      // Ignore intentional abort (timeout); fall back to demo data
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch trending:', error);
      }
      setTrendingQueries(DEMO_TRENDING);
    } finally {
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    fetchFaqs('');
    fetchTrending();
  }, [fetchFaqs, fetchTrending]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    fetchFaqs(query);
  }, [fetchFaqs]);

  return (
    <div className="content-wrapper">
      {/* Hero Section */}
      <div className="hero">
        <h1>
          Your Questions,{' '}
          <span className="highlight">Answered</span>
        </h1>
        <p>
          Browse frequently asked questions or search for answers.
          Powered by the IIT Ropar community.
        </p>
        <div className="hero-search">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for answers..."
            loading={loading}
          />
        </div>
      </div>

      {/* Trending Queries Section */}
      {!searchQuery.trim() && trendingQueries.length > 0 && (
        <div style={{ marginBottom: 'var(--space-xl)', animation: 'slideUp 0.5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>🔥 Trending Questions</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              — Most raised by the student community
            </span>
          </div>

          <div className="faq-grid">
            {trendingQueries.map((q, idx) => {
              const cfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.active;
              const engagement = q.approvals?.length || 0;
              return (
                <div key={q._id} className="glass-card" style={{ padding: 'var(--space-lg)', position: 'relative' }}>

                  {/* Rank badge */}
                  <div style={{
                    position: 'absolute', top: '14px', right: '14px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 10px',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}>
                    #{idx + 1} Trending
                  </div>

                  {/* Question */}
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--space-sm)', paddingRight: '80px', lineHeight: 1.5 }}>
                    {q.question}
                  </p>

                  {/* Answer preview */}
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.6 }}>
                    {q.proposedAnswer
                      ? `${q.proposedAnswer.slice(0, 120)}${q.proposedAnswer.length > 120 ? '...' : ''}`
                      : 'Awaiting community response — be the first to answer.'}
                  </p>

                  {/* Footer row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>

                    {/* Left: status (only if admin answered) + engagement */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {q.status === 'resolved' && q.proposedAnswer && (
                        <span style={{
                          fontSize: '0.78rem', fontWeight: 600,
                          color: cfg.color,
                          background: cfg.bg,
                          borderRadius: 'var(--radius-full)',
                          padding: '3px 10px',
                        }}>
                          ✅ Resolved
                        </span>
                      )}
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        👥 {engagement > 0
                          ? `${engagement} student${engagement !== 1 ? 's' : ''} engaged`
                          : 'No responses yet — community input needed'}
                      </span>
                    </div>

                    {/* Right: ticket + full date & time */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.6 }}>
                      <div>
                        <span style={{ opacity: 0.7 }}>{q.ticketId}</span>
                        <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                        <span>{timeAgo(q.createdAt)}</span>
                      </div>
                      <div style={{ opacity: 0.55, fontSize: '0.72rem' }}>
                        🕐 {new Date(q.createdAt).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', hour12: true,
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reply buttons */}
                  <div style={{
                    display: 'flex', gap: '10px', marginTop: 'var(--space-md)',
                    paddingTop: 'var(--space-sm)',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <a
                      href={`/query?ticket=${q.ticketId}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        flex: 1, textAlign: 'center', textDecoration: 'none',
                        fontSize: '0.78rem', fontWeight: 600,
                        padding: '7px 0',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(59,130,246,0.12)',
                        color: '#93c5fd',
                        border: '1px solid rgba(59,130,246,0.2)',
                        transition: 'background 0.2s',
                      }}
                    >
                      🎓 Reply as Student
                    </a>
                    <a
                      href="/admin/dashboard"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        flex: 1, textAlign: 'center', textDecoration: 'none',
                        fontSize: '0.78rem', fontWeight: 600,
                        padding: '7px 0',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(245,158,11,0.1)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245,158,11,0.2)',
                        transition: 'background 0.2s',
                      }}
                    >
                      🔐 Reply as Admin
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.07)', margin: 'var(--space-xl) 0' }} />
        </div>
      )}

      {/* FAQ Grid */}
      {initialLoad ? (
        <div className="faq-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card" style={{ padding: '24px' }}>
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" style={{ width: '90%' }} />
              <div className="skeleton skeleton-text" style={{ width: '70%' }} />
            </div>
          ))}
        </div>
      ) : faqs.length > 0 ? (
        <div className="faq-grid">
          {faqs.map((faq) => (
            <FAQCard
              key={faq._id}
              id={faq._id}
              question={faq.question}
              answer={faq.answer}
              category={faq.category}
              updatedAt={faq.updatedAt}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            {searchQuery ? '🔍' : '📭'}
          </div>
          <h3>{searchQuery ? 'No Results Found' : 'No FAQs Yet'}</h3>
          <p>
            {searchQuery
              ? `No FAQs match "${searchQuery}". Try a different search term.`
              : 'FAQs will appear here once the admin adds them.'}
          </p>
        </div>
      )}
    </div>
  );
}

