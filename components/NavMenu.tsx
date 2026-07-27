'use client';

import { useState } from 'react';
import Link from 'next/link';

const LINKS = [
  { href: '/', label: 'mesa' },
  { href: '/analises', label: 'research' },
  { href: '/metodo', label: 'tese' },
  { href: '/sessoes', label: 'sessões' },
  { href: '/sobre', label: 'desk' },
];

export default function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="nav-desktop">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </nav>

      <button
        className="nav-toggle"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && (
        <nav className="nav-mobile">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setIsOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
