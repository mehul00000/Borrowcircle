'use client';

import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as api from '@borrowcircle/shared';
import { fieldErrors, signUpSchema } from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { AuthFooter, AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/ui';
import { clerkPublishableKey } from '@/lib/backend';

export default function SignUpPage() {
  return clerkPublishableKey ? <ClerkGoogleChoice /> : <DemoSignUp />;
}

function ClerkGoogleChoice() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  return showEmailForm ? <ClerkSignUp /> : <ClerkGoogleSignUp onEmail={() => setShowEmailForm(true)} />;
}

function ClerkGoogleSignUp({ onEmail }: { onEmail: () => void }) {
  const { isLoaded, signUp } = useSignUp();
  const [error, setError] = useState('');
  return (
    <AuthShell>
      <h1>Create your account</h1>
      <p className="form-sub">Borrow what you need. Share what you own.</p>
      {error && <div className="alert alert--error">{error}</div>}
      <button
        type="button"
        className="btn btn--secondary"
        style={{ width: '100%', justifyContent: 'center' }}
        disabled={!isLoaded}
        onClick={async () => {
          setError('');
          try {
            if (!signUp) return;
            await signUp.authenticateWithRedirect({
              strategy: 'oauth_google',
              redirectUrl: '/sso-callback',
              redirectUrlComplete: '/dashboard',
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign-up failed.');
          }
        }}
      >
        Continue with Google
      </button>
      <p className="form-footer">
        or{' '}
        <button
          type="button"
          className="link"
          style={{ background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' }}
          onClick={onEmail}
        >
          sign up with email instead
        </button>
      </p>
      <AuthFooter text="Already have an account?" linkText="Log in" href="/login" />
    </AuthShell>
  );
}

function ClerkSignUp() {
  const router = useRouter();
  const { refresh, showToast } = useApp();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      if (!signUp) return;
      await signUp.create({
        emailAddress: form.email.trim(),
        password: form.password,
        firstName: form.fullName.split(' ')[0] || undefined,
        lastName: form.fullName.split(' ').slice(1).join(' ') || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerifying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account.');
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (!signUp) return;
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        // Supabase third-party auth has no profile trigger — create it now.
        await api.createMyProfile({ full_name: form.fullName, email: form.email.trim() });
        showToast('Welcome to BorrowCircle');
        refresh();
        router.push('/dashboard');
      } else {
        setError('Verification is not complete yet. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify the code.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h1>{verifying ? 'Verify your email' : 'Create your account'}</h1>
      <p className="form-sub">{verifying ? `Enter the 6-digit code we emailed to ${form.email}.` : 'Borrow what you need. Share what you own.'}</p>
      {error && <div className="alert alert--error">{error}</div>}
      {verifying ? (
        <form onSubmit={verify} noValidate>
          <div className="field">
            <label htmlFor="code">Verification code</label>
            <input id="code" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" autoComplete="one-time-code" />
          </div>
          <Button type="submit" disabled={busy || !isLoaded}>
            <span style={{ width: '100%' }}>{busy ? 'Verifying…' : 'Verify and continue'}</span>
          </Button>
        </form>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className={`field ${errors.fullName ? 'field--error' : ''}`}>
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" value={form.fullName} onChange={set('fullName')} placeholder="Alex Sharma" autoComplete="name" />
            {errors.fullName && <span className="field__error">{errors.fullName}</span>}
          </div>
          <div className={`field ${errors.email ? 'field--error' : ''}`}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            {errors.email && <span className="field__error">{errors.email}</span>}
          </div>
          <div className={`field ${errors.password ? 'field--error' : ''}`}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} placeholder="At least 8 characters with a number" />
            {errors.password && <span className="field__error">{errors.password}</span>}
          </div>
          <div className={`field ${errors.confirmPassword ? 'field--error' : ''}`}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password" />
            {errors.confirmPassword && <span className="field__error">{errors.confirmPassword}</span>}
          </div>
          <Button type="submit" disabled={busy || !isLoaded}>
            <span style={{ width: '100%' }}>{busy ? 'Creating account…' : 'Create account'}</span>
          </Button>
          <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 14, lineHeight: 1.6 }}>
            By creating an account you agree to our community rules: treat borrowed items with care, return them on time, and be kind to your neighbours.
          </p>
        </form>
      )}
      <AuthFooter text="Already have an account?" linkText="Log in" href="/login" />
    </AuthShell>
  );
}

function GoogleSignUp({ onEmail }: { onEmail: () => void }) {
  const { isLoaded, signUp } = useSignUp();
  const [error, setError] = useState('');
  return (
    <AuthShell>
      <h1>Create your account</h1>
      <p className="form-sub">Borrow what you need. Share what you own.</p>
      {error && <div className="alert alert--error">{error}</div>}
      <button
        type="button"
        className="btn btn--secondary"
        style={{ width: '100%', justifyContent: 'center' }}
        disabled={!isLoaded}
        onClick={async () => {
          setError('');
          try {
            await signUp?.authenticateWithRedirect({
              strategy: 'oauth_google',
              redirectUrl: '/sso-callback',
              redirectUrlComplete: '/dashboard',
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign-up failed.');
          }
        }}
      >
        Continue with Google
      </button>
      <button type="button" className="link" style={{ background: 'none', border: 0, padding: 0, font: 'inherit' }} onClick={onEmail}>
        Sign up with email instead
      </button>
      <AuthFooter text="Already have an account?" linkText="Log in" href="/login" />
    </AuthShell>
  );
}

function DemoSignUp() {
  const router = useRouter();
  const { showToast, refresh } = useApp();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const result = await api.signUp(parsed.data);
      refresh();
      if (result.needsEmailConfirmation) {
        setNotice('Account created. Check your inbox to verify your email, then log in.');
      } else {
        showToast('Welcome to BorrowCircle');
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h1>Create your account</h1>
      <p className="form-sub">Borrow what you need. Share what you own.</p>
      {error && <div className="alert alert--error">{error}</div>}
      {notice && <div className="alert alert--success">{notice}</div>}
      <form onSubmit={submit} noValidate>
        <div className={`field ${errors.fullName ? 'field--error' : ''}`}>
          <label htmlFor="fullName">Full name</label>
          <input id="fullName" value={form.fullName} onChange={set('fullName')} placeholder="Alex Sharma" autoComplete="name" />
          {errors.fullName && <span className="field__error">{errors.fullName}</span>}
        </div>
        <div className={`field ${errors.email ? 'field--error' : ''}`}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </div>
        <div className={`field ${errors.password ? 'field--error' : ''}`}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} placeholder="At least 8 characters with a number" />
          {errors.password && <span className="field__error">{errors.password}</span>}
        </div>
        <div className={`field ${errors.confirmPassword ? 'field--error' : ''}`}>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password" />
          {errors.confirmPassword && <span className="field__error">{errors.confirmPassword}</span>}
        </div>
        <Button type="submit" disabled={busy}>
          <span style={{ width: '100%' }}>{busy ? 'Creating account…' : 'Create account'}</span>
        </Button>
        <p style={{ fontSize: 11, color: 'var(--faint)', marginTop: 14, lineHeight: 1.6 }}>
          By creating an account you agree to our community rules: treat borrowed items with care, return them on time, and be kind to your neighbours.
        </p>
      </form>
      <AuthFooter text="Already have an account?" linkText="Log in" href="/login" />
    </AuthShell>
  );
}
