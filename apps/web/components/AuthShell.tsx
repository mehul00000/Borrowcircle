'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/components/ui';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="form-page">
      <div className="form-panel">
        <div className="form-card">
          <Logo />
          {children}
        </div>
      </div>
      <div className="form-visual">
        <img src="https://images.unsplash.com/photo-1687360441027-27e70655b27e?auto=format&fit=crop&w=1200&q=85" alt="Neighbours sharing in their community" />
        <div className="form-visual__content">
          <span className="kicker kicker--light">Better together</span>
          <h2>Why buy when you can borrow?</h2>
          <p>
            Join a community that shares instead of buys. Verified profiles, clear agreements and condition records keep every exchange safe.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AuthFooter({ text, linkText, href }: { text: string; linkText: string; href: string }) {
  return (
    <p className="form-footer">
      {text} <Link href={href}>{linkText}</Link>
    </p>
  );
}
