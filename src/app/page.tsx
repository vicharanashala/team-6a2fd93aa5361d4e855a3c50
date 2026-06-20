'use client';

import { useState, useCallback, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import FAQCard from '@/components/FAQCard';
import { ALL_CATEGORIES } from '@/lib/categorizer';
import type { QueryCategory } from '@/lib/categorizer';

// ─── Schema-aligned interfaces ────────────────────────────────────────────────

interface RaisedQuery {
  query_id: string;
  category: QueryCategory;
  title: string;
  description: string;
  posted_at: string;
  status: 'Open' | 'Resolved';
  collection_type: 'Raised Query';
  ticketId: string;
  proposedAnswer?: string | null;
}

interface FaqItem {
  query_id: string;
  category: QueryCategory;
  title: string;
  description: string;
  posted_at: string;
  status: 'Resolved';
  collection_type: 'Permanent FAQ';
  _id: string;
  updatedAt?: string | Date;
}

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<QueryCategory, { icon: string; color: string; bg: string }> = {
  'Academics':                  { icon: '🎓', color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
  'Hostel & Mess':              { icon: '🏠', color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  'Internships & Placements':   { icon: '💼', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  'Admin & Finance':            { icon: '🏛️', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  'Clubs & Events':             { icon: '🎉', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
};

const STATUS_BADGE: Record<'Open' | 'Resolved', { label: string; color: string; bg: string }> = {
  'Resolved': { label: 'Resolved', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  'Open':     { label: 'Open',     color: '#93c5fd', bg: 'rgba(59,130,246,0.12)'  },
};

// ─── Demo data (shown when database is offline) ─────────────────────────────

const DEMO_RAISED_QUERIES: RaisedQuery[] = [
  {
    query_id: 'TKT-DEMO-001',
    ticketId: 'TKT-DEMO-001',
    category: 'Academics',
    title: 'How is the branch change CPI cutoff calculated for 2nd year?',
    description: 'I want to know the exact CPI cutoff required for switching from CSE to EE at the end of first year. Does it include the practical grades too?',
    posted_at: '18-06-2026 | 09:45 pm',
    status: 'Open',
    collection_type: 'Raised Query',
  },
  {
    query_id: 'TKT-DEMO-002',
    ticketId: 'TKT-DEMO-002',
    category: 'Hostel & Mess',
    title: 'How do I apply for mess rebate during summer vacations?',
    description: 'I will be going home for 3 weeks during summer. What is the process to apply for mess rebate and what documents are needed?',
    posted_at: '19-06-2026 | 09:12 am',
    status: 'Resolved',
    collection_type: 'Raised Query',
    proposedAnswer: 'Submit the Mess Rebate Form at the hostel office at least 3 days before departure. Attach a copy of your travel ticket. Rebate is granted for absences of 5+ continuous days.',
  },
  {
    query_id: 'TKT-DEMO-003',
    ticketId: 'TKT-DEMO-003',
    category: 'Internships & Placements',
    title: 'What is the minimum CPI required to sit for CDPC placement drives?',
    description: 'I have a CPI of 6.8 and have one backlog from last semester. Am I eligible to register for the upcoming placement season?',
    posted_at: '19-06-2026 | 11:30 am',
    status: 'Open',
    collection_type: 'Raised Query',
  },
  {
    query_id: 'TKT-DEMO-004',
    ticketId: 'TKT-DEMO-004',
    category: 'Admin & Finance',
    title: 'How do I get a bonafide certificate for bank account opening?',
    description: 'I need a bonafide certificate urgently for opening a bank account. What is the process and how many days does it take?',
    posted_at: '20-06-2026 | 07:55 am',
    status: 'Open',
    collection_type: 'Raised Query',
  },
  {
    query_id: 'TKT-DEMO-005',
    ticketId: 'TKT-DEMO-005',
    category: 'Clubs & Events',
    title: 'When does Zeitgeist 2026 registration open?',
    description: 'I want to participate in the cultural events at Zeitgeist. When will the registration portal go live and which events are available for outstation participants?',
    posted_at: '20-06-2026 | 08:02 am',
    status: 'Open',
    collection_type: 'Raised Query',
  },
];

const DEMO_FAQS: FaqItem[] = [
  // ── Academics ───────────────────────────────────────────────────────────────
  {
    query_id: 'faq-ac-1', _id: 'faq-ac-1',
    category: 'Academics',
    title: 'How is SPI/CPI calculated at IIT Ropar?',
    description: 'SPI (Semester Performance Index) is the weighted average of grade points for all courses in a semester, weighted by credits. CPI (Cumulative Performance Index) is the weighted average of all SPIs from all completed semesters. Grade points: A+ = 10, A = 9, B = 8, C = 7, D = 6, F = 0.',
    posted_at: '01-06-2026 | 10:00 am',
    status: 'Resolved',
    collection_type: 'Permanent FAQ',
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    query_id: 'faq-ac-2', _id: 'faq-ac-2',
    category: 'Academics',
    title: 'What is the attendance policy for courses?',
    description: 'Students must maintain a minimum of 75% attendance in each course. Students below 75% may be debarred from appearing in the end-semester examination for that course. Medical leave with a valid certificate from the institute medical centre is partially exempted.',
    posted_at: '05-06-2026 | 02:30 pm',
    status: 'Resolved',
    collection_type: 'Permanent FAQ',
    updatedAt: '2026-06-05T14:30:00Z',
  },
  {
    query_id: 'faq-ac-3', _id: 'faq-ac-3',
    category: 'Academics',
    title: 'How to register for an elective course?',
    description: 'Elective registration is done through the ERP portal during the registration window (usually 2 weeks before semester start). Go to ERP → Academics → Course Registration → Electives. Seat allocation is on a first-come-first-served basis. Contact your faculty advisor if you face issues.',
    posted_at: '10-06-2026 | 09:15 am',
    status: 'Resolved',
    collection_type: 'Permanent FAQ',
    updatedAt: '2026-06-10T09:15:00Z',
  },
  // ── Hostel & Mess ────────────────────────────────────────────────────────────
  {
    query_id: 'faq-hm-1', _id: 'faq-hm-1',
    category: 'Hostel & Mess',
    title: 'What is the room allocation process for new students?',
    description: 'Room allocation for new students is done centrally by the Institute before joining. Boys are allotted rooms in Satluj, Beas, or Chenab hostels and girls in the Girls\' Hostel. Students can apply for room change after the first month by submitting a request to the Hostel Warden.',
    posted_at: '02-06-2026 | 11:00 am',
    status: 'Resolved',
    collection_type: 'Permanent FAQ',
    updatedAt: '2026-06-02T11:00:00Z',
  },
  {
    query_id: 'faq-hm-2', _id: 'faq-hm-2',
    category: 'Hostel & Mess',
    title: 'How do I connect to campus WiFi (LDAP)?',
    description: 'Go to Settings → WiFi → Select "IITRopar" → Enter your LDAP username (your roll number) and password. First-time users must register at ldap.iitrpr.ac.in using their institute email. Contact the IT helpdesk at it-helpdesk@iitrpr.ac.in for connectivity issues.',
    posted_at: '07-06-2026 | 04:45 pm',
    status: 'Resolved',
    collection_type: 'Permanent FAQ',
    updatedAt: '2026-06-07T16:45:00Z',
  },
  {
    query_id: 'faq-hm-3', _id: 'faq-hm-3',
    category: 'Hostel & Mess',
    title: 'What are the mess timings and menu schedule?',
    description: 'Breakfast: 7:30–9:00 AM | Lunch: 12:00–2:00 PM | Snacks: 5:00–6:00 PM | Dinner: 7:30–9:30 PM. The mess menu rotates weekly and is posted on the hostel notice board every Sunday. Special meals are served on institute holidays.',
    posted_at: '12-06-2026 | 08:00 am',
    status: 'Resolved',
    collection_type: 'Permanent FAQ',
    updatedAt: '2026-06-12T08:00:00Z',
  },
  // ── Internships & Placements ─────────────────────────────────────────────────
  {
    query_id: 'faq-ip-1', _id: 'faq-ip-1',
    category: 'Internships & Placements',
    title: 'What is the general CPI requirement for campus placements?',
    description: 'Most companies require a minimum CPI of 6.5–7.0 with no active backlogs. Some companies (especially PSUs and core sector) may require CPI ≥ 7.5. The CDPC portal will show company-specific eligibility when drives are announced. Students on academic probation are not eligible.',
    posted_at: '03-06-2026 | 01:20 pm',
    status: 'Resolved',
    collection_type: 'Permanent FAQ',
    updatedAt: '2026-06-03T13:20:00Z',
  },
  {
    query_id: 'faq-ip-2', _id: 'faq-ip-2',
    category: 'Internships & Placements',
    title: 'How do I register on the CDPC placement portal?',
    description: 'Go to cdpc.iitrpr.ac.in and log in using your institute credentials. Complete your profile (academic details, resume, projects) before the registration deadline. Upload your resume in PDF format only. Contact the CDPC office (Room 101, Admin Block) for any portal issues.',
    posted_at: '08-06-2026 | 10:00 am',
    status: 'Resolved',
    collection_type: 'Permanent FAQ',
    updatedAt: '2026-06-08T10:00:00Z',
  },
  // ── Admin & Finance ──────────────────────────────────────────────────────────
  {
    query_id: 'faq-af-1', _id: 'faq-af-1',
    category: 'Admin & Finance',
    title: 'How do I apply for a bonafide / NOC certificate?',
    description: 'Submit a written application to the Academic Section (Admin Block, Ground Floor) stating the purpose. Bonafide certificates are issued within 2–3 working days. For urgent cases, mention \'URGENT\' and attach a supporting document. Digital certificates can be downloaded from the ERP portal under Student Services.',
    posted_at: '04-06-2026 | 03:00 pm',
    status: 'Resolved',
    collection_type: 'Permanent FAQ',
    updatedAt: '2026-06-04T15:00:00Z',
  },
  {
    query_id: 'faq-af-2', _id: 'faq-af-2',
    category: 'Admin & Finance',
    title: 'What is the deadline for semester fee payment?',
    description: 'Semester fees must be paid within 2 weeks of the semester start date (as notified on the official institute website). A late fee of ₹100/day is charged beyond the deadline. Scholarship holders (MCM, SC/ST) should confirm with the Academic Section if their scholarship covers the fee before the deadline.',
    posted_at: '09-06-2026 | 05:30 pm',
    status: 'Resolved',
    collection_type: 'Permanent FAQ',
    updatedAt: '2026-06-09T17:30:00Z',
  },
  // ── Clubs & Events ───────────────────────────────────────────────────────────
  {
    query_id: 'faq-ce-1', _id: 'faq-ce-1',
    category: 'Clubs & Events',
    title: 'How do I join a technical or cultural club at IIT Ropar?',
    description: 'Club recruitments happen at the start of each academic year (August–September). Keep an eye on the SAC (Student Activity Centre) notice board and official club social media pages for announcement of auditions/interviews. Most clubs are open to all years. Freshers\' week in August has dedicated stalls for each club.',
    posted_at: '06-06-2026 | 12:00 pm',
    status: 'Resolved',
    collection_type: 'Permanent FAQ',
    updatedAt: '2026-06-06T12:00:00Z',
  },
  {
    query_id: 'faq-ce-2', _id: 'faq-ce-2',
    category: 'Clubs & Events',
    title: 'When is Zeitgeist (cultural fest) held every year?',
    description: 'Zeitgeist, the annual cultural festival of IIT Ropar, is typically held in October–November. It features competitions in dance, music, drama, fine arts, literary events, and celebrity performances. Registrations open approximately 4–6 weeks before the event via the official Zeitgeist portal.',
    posted_at: '15-06-2026 | 06:00 pm',
    status: 'Resolved',
    collection_type: 'Permanent FAQ',
    updatedAt: '2026-06-15T18:00:00Z',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [raisedQueries, setRaisedQueries] = useState<RaisedQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion open state — one section open at a time
  const [openCategory, setOpenCategory] = useState<QueryCategory | null>(null);

  // ── Fetch FAQs ──────────────────────────────────────────────────────────────
  const fetchFaqs = useCallback(async (q: string) => {
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const url = q.trim()
        ? `/api/faqs?q=${encodeURIComponent(q.trim())}`
        : '/api/faqs';
      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();
      // Fall back to demo FAQs when DB is offline
      setFaqs(data.faqs && data.faqs.length > 0 ? data.faqs : DEMO_FAQS);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch FAQs:', error);
      }
      setFaqs(DEMO_FAQS);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  // ── Fetch recent raised queries ──────────────────────────────────────────────
  const fetchRaisedQueries = useCallback(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch('/api/queries', { signal: controller.signal });
      const data = await res.json();
      // Fall back to demo queries when DB is offline
      const live = data.queries || [];
      setRaisedQueries(live.length > 0 ? live.slice(0, 10) : DEMO_RAISED_QUERIES);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch raised queries:', error);
      }
      setRaisedQueries(DEMO_RAISED_QUERIES);
    } finally {
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    fetchFaqs('');
    fetchRaisedQueries();
  }, [fetchFaqs, fetchRaisedQueries]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    fetchFaqs(q);
  }, [fetchFaqs]);

  // ── Group FAQs by category ──────────────────────────────────────────────────
  const faqsByCategory = ALL_CATEGORIES.reduce<Record<QueryCategory, FaqItem[]>>(
    (acc, cat) => {
      acc[cat] = faqs.filter((f) => f.category === cat);
      return acc;
    },
    {} as Record<QueryCategory, FaqItem[]>
  );

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="content-wrapper">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
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

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — Raised Queries Feed (hidden during search)               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {!searchQuery.trim() && (
        <section style={{ marginBottom: 'var(--space-2xl)', animation: 'slideUp 0.5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1.15rem', margin: 0 }}>📋 Raised Queries</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              — Freshly submitted by the student community
            </span>
          </div>

          {raisedQueries.length === 0 ? (
            <div className="glass-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>📭</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No queries raised yet — be the first to ask!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {raisedQueries.map((q) => {
                const cat = CATEGORY_META[q.category] ?? CATEGORY_META['Admin & Finance'];
                const badge = STATUS_BADGE[q.status];
                return (
                  <div
                    key={q.query_id}
                    className="glass-card"
                    style={{
                      padding: 'var(--space-md) var(--space-lg)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 'var(--space-md)',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Left — category pill + title + description preview */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: cat.bg,
                          color: cat.color,
                          letterSpacing: '0.02em',
                        }}>
                          {cat.icon} {q.category}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: badge.bg,
                          color: badge.color,
                        }}>
                          {badge.label}
                        </span>
                      </div>

                      <p style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '4px', lineHeight: 1.4 }}>
                        {q.title}
                      </p>
                      {q.description && q.description !== q.title && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {q.description.length > 120
                            ? `${q.description.slice(0, 120)}…`
                            : q.description}
                        </p>
                      )}
                      {/* Resolved answer preview */}
                      {q.status === 'Resolved' && q.proposedAnswer && (
                        <p style={{
                          marginTop: '6px',
                          fontSize: '0.8rem',
                          color: '#10b981',
                          lineHeight: 1.5,
                          fontStyle: 'italic',
                        }}>
                          ✅ {q.proposedAnswer.length > 100
                            ? `${q.proposedAnswer.slice(0, 100)}…`
                            : q.proposedAnswer}
                        </p>
                      )}
                    </div>

                    {/* Right — ticket ID + timestamp */}
                    <div style={{
                      textAlign: 'right',
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.7,
                      flexShrink: 0,
                    }}>
                      <div style={{ fontFamily: 'monospace', opacity: 0.6 }}>{q.ticketId}</div>
                      <div>
                        <span style={{ opacity: 0.55 }}>Posted on: </span>
                        <span style={{ fontWeight: 600 }}>{q.posted_at}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.07)', margin: 'var(--space-xl) 0' }} />
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — Categorized FAQ Knowledge Base (Accordion)               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ animation: 'slideUp 0.6s ease' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
            {searchQuery ? '🔍 Search Results' : '📚 FAQ Knowledge Base'}
          </h2>
          {!searchQuery && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              — Resolved questions, grouped by category
            </span>
          )}
        </div>

        {initialLoad ? (
          /* Loading skeletons */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card" style={{ padding: '20px 24px' }}>
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" style={{ width: '60%' }} />
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          /* ── Search mode: flat list ──────────────────────────────────────── */
          faqs.length > 0 ? (
            <div className="faq-grid">
              {faqs.map((faq) => (
                <FAQCard
                  key={faq.query_id}
                  id={faq._id}
                  question={faq.title}
                  answer={faq.description}
                  category={faq.category}
                  updatedAt={faq.updatedAt}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No Results Found</h3>
              <p>No FAQs match &quot;{searchQuery}&quot;. Try a different search term.</p>
            </div>
          )
        ) : (
          /* ── Browse mode: accordion by category ─────────────────────────── */
          ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const items = faqsByCategory[cat] ?? [];
            const isOpen = openCategory === cat;

            return (
              <div
                key={cat}
                className="glass-card"
                style={{
                  marginBottom: 'var(--space-sm)',
                  overflow: 'hidden',
                  padding: 0,
                  border: isOpen
                    ? `1px solid ${meta.color}44`
                    : '1px solid var(--border-subtle)',
                  transition: 'border-color 0.2s ease',
                }}
              >
                {/* Accordion header */}
                <button
                  onClick={() => setOpenCategory(isOpen ? null : cat)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-md) var(--space-lg)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: 'var(--space-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '34px',
                      height: '34px',
                      borderRadius: 'var(--radius-md)',
                      background: meta.bg,
                      flexShrink: 0,
                    }}>
                      {meta.icon}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {cat}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {items.length > 0
                          ? `${items.length} resolved FAQ${items.length !== 1 ? 's' : ''}`
                          : 'No FAQs yet in this category'}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    color: meta.color,
                    fontSize: '0.8rem',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0,
                  }}>
                    ▼
                  </span>
                </button>

                {/* Accordion body */}
                {isOpen && (
                  <div style={{
                    borderTop: `1px solid rgba(255,255,255,0.07)`,
                    padding: 'var(--space-md) var(--space-lg) var(--space-lg)',
                    animation: 'slideUp 0.25s ease',
                  }}>
                    {items.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {items.map((faq) => (
                          <FAQCard
                            key={faq.query_id}
                            id={faq._id}
                            question={faq.title}
                            answer={faq.description}
                            category={faq.category}
                            updatedAt={faq.updatedAt}
                          />
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        padding: 'var(--space-lg)',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.88rem',
                      }}>
                        📭 No FAQs in this category yet. Check back later!
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

    </div>
  );
}
