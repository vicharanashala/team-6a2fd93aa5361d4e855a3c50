'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="admin-login glass-card glass-card-accent" id="admin-login-form">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--accent-amber), #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-md)',
            fontSize: '1.5rem',
          }}>
            🔒
          </div>
          <h1>Admin Access</h1>
          <p>Enter the admin password to manage FAQs</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div className="error-alert">{error}</div>}
          <div className="input-group mb-lg">
            <label className="input-label" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              className="input"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading || !password}
            id="admin-login-btn"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
