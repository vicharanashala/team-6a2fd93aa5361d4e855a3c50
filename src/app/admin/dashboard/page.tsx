'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  createdAt: string;
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  // Add FAQ form
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState('');
  const [addError, setAddError] = useState('');

  // FAQ list
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Check auth
  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch('/api/admin/verify');
        if (res.ok) {
          setAuthenticated(true);
        } else {
          router.push('/admin');
        }
      } catch {
        router.push('/admin');
      } finally {
        setChecking(false);
      }
    };
    verify();
  }, [router]);

  // Fetch FAQs
  const fetchFaqs = useCallback(async () => {
    setLoadingFaqs(true);
    try {
      const res = await fetch('/api/faqs');
      const data = await res.json();
      setFaqs(data.faqs || []);
    } catch (err) {
      console.error('Failed to fetch FAQs:', err);
    } finally {
      setLoadingFaqs(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchFaqs();
    }
  }, [authenticated, fetchFaqs]);

  // Add FAQ
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setAdding(true);
    setAddError('');
    setAddMessage('');

    try {
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
          category: category.trim(),
        }),
      });

      if (res.ok) {
        setAddMessage('✅ FAQ added successfully!');
        setQuestion('');
        setAnswer('');
        setCategory('');
        fetchFaqs();
        setTimeout(() => setAddMessage(''), 3000);
      } else {
        const data = await res.json();
        setAddError(data.error || 'Failed to add FAQ');
      }
    } catch {
      setAddError('Network error. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  // Delete FAQ
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/faqs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget._id }),
      });

      if (res.ok) {
        setDeleteTarget(null);
        fetchFaqs();
      }
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (checking) {
    return (
      <div className="content-wrapper">
        <div className="flex justify-center items-center" style={{ minHeight: '50vh' }}>
          <div className="search-spinner" style={{ width: '32px', height: '32px' }} />
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage FAQs for the IIT Ropar community</p>
      </div>

      <div className="admin-dashboard">
        {/* Add FAQ Form */}
        <div className="glass-card glass-card-accent" style={{ animation: 'slideUp 0.5s ease' }} id="add-faq-section">
          <div className="section-title">
            <span className="section-title-icon">➕</span>
            Add New FAQ
          </div>

          <form onSubmit={handleAddFaq}>
            {addError && <div className="error-alert">{addError}</div>}
            {addMessage && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                color: 'var(--accent-green-light)',
                fontSize: '0.9rem',
                marginBottom: 'var(--space-md)',
              }}>
                {addMessage}
              </div>
            )}

            <div className="input-group mb-md">
              <label className="input-label" htmlFor="faq-question">
                Question
              </label>
              <textarea
                id="faq-question"
                className="input textarea"
                placeholder="Enter the FAQ question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="input-group mb-md">
              <label className="input-label" htmlFor="faq-answer">
                Answer
              </label>
              <textarea
                id="faq-answer"
                className="input textarea"
                placeholder="Enter the FAQ answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="input-group mb-lg">
              <label className="input-label" htmlFor="faq-category">
                Category (optional)
              </label>
              <input
                id="faq-category"
                className="input"
                type="text"
                placeholder="e.g. Academics, Hostel, Placement"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={adding || !question.trim() || !answer.trim()}
              id="add-faq-btn"
            >
              {adding ? 'Adding...' : '📝 Add FAQ'}
            </button>
          </form>
        </div>

        {/* FAQ List */}
        <div className="glass-card" style={{ animation: 'slideUp 0.5s ease 0.1s both' }} id="manage-faqs-section">
          <div className="section-title" style={{ justifyContent: 'space-between' }}>
            <div className="flex items-center gap-sm">
              <span className="section-title-icon">📋</span>
              Manage FAQs
            </div>
            <span className="badge badge-review">{faqs.length} total</span>
          </div>

          {loadingFaqs ? (
            <div className="admin-faq-list">
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ padding: 'var(--space-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                </div>
              ))}
            </div>
          ) : faqs.length > 0 ? (
            <div className="admin-faq-list">
              {faqs.map((faq) => (
                <div
                  key={faq._id}
                  className="admin-faq-item"
                  style={{
                    padding: 'var(--space-md)',
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="admin-faq-content">
                    <div className="admin-faq-question">{formatQuestion(faq.question)}</div>
                    <div className="admin-faq-answer">{formatAnswer(faq.answer)}</div>
                    {faq.category && (
                      <span className="badge badge-review" style={{ marginTop: '8px', display: 'inline-flex' }}>
                        {faq.category}
                      </span>
                    )}
                  </div>
                  <button
                    className="btn btn-danger btn-sm btn-icon"
                    onClick={() => setDeleteTarget(faq)}
                    title="Delete FAQ"
                    style={{ flexShrink: 0 }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No FAQs</h3>
              <p>Add your first FAQ using the form on the left.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete FAQ"
          message={`Are you sure you want to delete "${deleteTarget.question}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          confirmLabel={deleting ? 'Deleting...' : 'Delete'}
          variant="danger"
        />
      )}
    </div>
  );
}
