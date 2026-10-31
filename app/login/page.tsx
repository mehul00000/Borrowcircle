'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as api from '@borrowcircle/shared';
import { fieldErrors, signInSchema } from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { AuthFooter, AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/ui';
import { activeBackend, clerkPublishableKey } from '@/lib/backend';

export default function LoginPage() {
  return clerkPublishableKey ? <ClerkLogin /> : <DemoLogin />;
}

function ClerkLogin() {
  const router = useRouter();
  const { refresh, showToast } = useApp();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      if (!signIn) return;
      const result = await signIn.create({ identifier: email.trim(), password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        showToast('Welcome back');
        refresh();
        router.push('/dashboard');
      } else {
        setError('Additional verification is required. Complete it and try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h1>Welcome back</h1>
      <p className="form-sub">Sign in to borrow and share with your neighbourhood.</p>
      {error && <div className="alert alert--error">{error}</div>}
      <form onSubmit={submit} noValidate>
        <div className={`field ${errors.email ? 'field--error' : ''}`}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </div>
        <div className={`field ${errors.password ? 'field--error' : ''}`}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {errors.password && <span className="field__error">{errors.password}</span>}
        </div>
        <div className="form-row">
          <span />
          <a className="link" href="/forgot-password">Forgot password?</a>
        </div>
        <Button type="submit" disabled={busy || !isLoaded}>
          <span style={{ width: '100%' }}>{busy ? 'Signing in…' : 'Log in'}</span>
        </Button>
      </form>
      <div className="form-row" style={{ justifyContent: 'center', gap: 12, margin: '18px 0' }}>
        <span style={{ height: 1, flex: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 10, color: 'var(--faint)', fontWeight: 700 }}>OR</span>
        <span style={{ height: 1, flex: 1, background: 'var(--border)' }} />
      </div>
      <button
        type="button"
        className="btn btn--secondary"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={async () => {
          setError('');
          try {
            if (!signIn) return;
            await signIn.authenticateWithRedirect({
              strategy: 'oauth_google',
              redirectUrl: '/sso-callback',
              redirectUrlComplete: '/dashboard',
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign-in failed.');
          }
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2 3.7-5 3.7-8.7z" />
          <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5l-3.9 3C3.3 21.3 7.3 24 12 24z" />
          <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-3.9-3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l3.9-3z" />
          <path fill="#EA4335" d="M12 4.7c2.3 0 3.8 1 4.7 1.8l3.4-3.3C18 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l3.9 3c.9-2.9 3.6-4.9 6.8-4.9z" />
        </svg>
        Continue with Google
      </button>
      <AuthFooter text="New to BorrowCircle?" linkText="Create an account" href="/signup" />
      <p className="form-footer" style={{ fontSize: 11 }}>
        Sign-in is handled securely by Clerk.
      </p>
    </AuthShell>
  );
}

function DemoLogin() {
  const router = useRouter();
  const { showToast, refresh } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await api.signIn(email, password);
      showToast('Welcome back');
      refresh();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h1>Welcome back</h1>
      <p className="form-sub">Sign in to borrow and share with your neighbourhood.</p>
      {error && <div className="alert alert--error">{error}</div>}
      <form onSubmit={submit} noValidate>
        <div className={`field ${errors.email ? 'field--error' : ''}`}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </div>
        <div className={`field ${errors.password ? 'field--error' : ''}`}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {errors.password && <span className="field__error">{errors.password}</span>}
        </div>
        <div className="form-row">
          <span />
          <a className="link" href="/forgot-password">Forgot password?</a>
        </div>
        <Button type="submit" disabled={busy}>
          <span style={{ width: '100%' }}>{busy ? 'Signing in…' : 'Log in'}</span>
        </Button>
      </form>
      <AuthFooter text="New to BorrowCircle?" linkText="Create an account" href="/signup" />
      <p className="form-footer" style={{ fontSize: 11 }}>
        {activeBackend() === 'demo' ? 'Demo mode — sign in with alex@example.com, maya@example.com, rohan@example.com or neha@example.com (any password with 4+ characters).' : 'Demo logins (seeded Supabase auth): maya@borrowcircle.test · demo1234'}
      </p>
    </AuthShell>
  );
}
