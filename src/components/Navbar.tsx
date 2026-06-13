'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = pathname.startsWith('/admin');

  const links = [
    { href: '/', label: 'Browse FAQs', icon: '📚' },
    { href: '/raise-query', label: 'Raise a Query', icon: '✋' },
    { href: '/solve-query', label: 'Solve a Query', icon: '💡' },
  ];

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <div className="navbar-brand-icon">R</div>
          <div className="navbar-brand-text">
            IIT Ropar <span>FAQ</span>
          </div>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          id="navbar-toggle-btn"
        >
          {isOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
              id={`nav-link-${link.href.replace('/', '') || 'home'}`}
            >
              <span className="nav-link-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
          {!isAdmin && (
            <Link
              href="/admin"
              className="nav-link nav-link-admin"
              onClick={() => setIsOpen(false)}
              id="nav-link-admin"
            >
              🔒 Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
