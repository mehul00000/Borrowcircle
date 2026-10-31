'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as api from '@borrowcircle/shared';
import { AuthFooter, AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/ui';
import { clerkPublishableKey } from '@/lib/backend';

export default function ForgotPasswordPage() {
  return clerkPublishableKey ? <ClerkForgotPassword /> : <DemoForgotPassword />;
}

function ClerkForgotPassword() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (!signIn) return;
      await signIn.create({ identifier: email.trim(), strategy: 'reset_password_email_code' });
      setStage('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the password reset.');
    } finally {
      setBusy(false);
    }
  }

  async function complete(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (!signIn) return;
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password: newPassword,
      });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.push('/dashboard');
      } else {
        setError('The reset is not complete yet. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset the password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h1>Reset your password</h1>
      <p className="form-sub">{stage === 'email' ? 'We’ll email you a 6-digit code to choose a new password.' : `Enter the code we emailed to ${email} and your new password.`}</p>
      {error && <div className="alert alert--error">{error}</div>}
      {stage === 'email' ? (
        <form onSubmit={start} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <Button type="submit" disabled={busy || !isLoaded}>
            <span style={{ width: '100%' }}>{busy ? 'Sending…' : 'Send reset code'}</span>
          </Button>
        </form>
      ) : (
        <form onSubmit={complete} noValidate>
          <div className="field">
            <label htmlFor="code">Verification code</label>
            <input id="code" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" autoComplete="one-time-code" />
          </div>
          <div className="field">
            <label htmlFor="newPassword">New password</label>
            <input id="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters with a number" />
          </div>
          <Button type="submit" disabled={busy || !isLoaded}>
            <span style={{ width: '100%' }}>{busy ? 'Resetting…' : 'Reset password'}</span>
          </Button>
        </form>
      )}
      <AuthFooter text="Remembered it?" linkText="Back to log in" href="/login" />
    </AuthShell>
  );
}

function DemoForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    try {
      await api.sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reset email.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <h1>Reset your password</h1>
      <p className="form-sub">We’ll email you a secure link to choose a new password.</p>
      {sent ? (
        <div className="alert alert--success">
          If an account exists for {email}, a reset link is on its way. Check your inbox (and spam folder).
        </div>
      ) : (
        <>
          {error && <div className="alert alert--error">{error}</div>}
          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <Button type="submit" disabled={busy}>
              <span style={{ width: '100%' }}>{busy ? 'Sending…' : 'Send reset link'}</span>
            </Button>
          </form>
        </>
      )}
      <AuthFooter text="Remembered it?" linkText="Back to log in" href="/login" />
    </AuthShell>
  );
}
