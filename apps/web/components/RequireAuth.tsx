'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useApp } from '@/components/AppContext';
import { AppHeader, Spinner } from '@/components/ui';

/** Redirects signed-out visitors to the login page, then renders children. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="discover-page">
        <AppHeader />
        <main className="shell page">
          <Spinner label="Checking your session" />
        </main>
      </div>
    );
  }
  return <>{children}</>;
}

export function PageHead({ kicker, title, text, action }: { kicker: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="page__head">
      <div>
        <span className="kicker">{kicker}</span>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function BackToDash() {
  return (
    <Link href="/dashboard" className="text-link">
      ← Back to dashboard
    </Link>
  );
}
