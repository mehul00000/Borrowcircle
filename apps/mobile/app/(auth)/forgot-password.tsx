import { useSignIn } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import * as api from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { AuthLink, AuthShell, Alert } from '@/components/AuthShell';
import { Button, Field } from '@/components/ui';
import { colors, font } from '@/theme';
import { clerkPublishableKey } from '@/lib/backend';

export default function ForgotPassword() {
  return clerkPublishableKey ? <ClerkForgotPassword /> : <DemoForgotPassword />;
}

function ClerkForgotPassword() {
  const { showToast } = useApp();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function start() {
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

  async function complete() {
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
        showToast('Password updated');
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
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={{ fontFamily: font.display, fontSize: 30, color: colors.deep, marginTop: 28, letterSpacing: -1 }}>Reset password</Text>
      <Text style={{ color: colors.muted, fontSize: 13, marginTop: 8, marginBottom: 26 }}>
        {stage === 'email' ? 'We’ll email you a 6-digit code to choose a new password.' : `Enter the code we emailed to ${email} and your new password.`}
      </Text>
      {error ? <Alert kind="error" text={error} /> : null}
      {stage === 'email' ? (
        <>
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Button onPress={() => void start()} disabled={busy || !isLoaded}>
            {busy ? 'Sending…' : 'Send reset code'}
          </Button>
        </>
      ) : (
        <>
          <Field label="Verification code" value={code} onChangeText={setCode} placeholder="123456" keyboardType="numeric" />
          <Field label="New password" value={newPassword} onChangeText={setNewPassword} placeholder="At least 8 characters with a number" secure />
          <Button onPress={() => void complete()} disabled={busy || !isLoaded}>
            {busy ? 'Resetting…' : 'Reset password'}
          </Button>
        </>
      )}
      <AuthLink text="Remembered it?" linkText="Back to log in" href="/login" />
    </AuthShell>
  );
}

function DemoForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
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
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={{ fontFamily: font.display, fontSize: 30, color: colors.deep, marginTop: 28, letterSpacing: -1 }}>Reset password</Text>
      <Text style={{ color: colors.muted, fontSize: 13, marginTop: 8, marginBottom: 26 }}>We’ll email you a secure link to choose a new password.</Text>
      {sent ? (
        <Alert kind="success" text={`If an account exists for ${email}, a reset link is on its way.`} />
      ) : (
        <>
          {error ? <Alert kind="error" text={error} /> : null}
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Button onPress={() => void submit()} disabled={busy}>
            {busy ? 'Sending…' : 'Send reset link'}
          </Button>
        </>
      )}
      <AuthLink text="Remembered it?" linkText="Back to log in" href="/login" />
    </AuthShell>
  );
}
