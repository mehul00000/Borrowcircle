import { useSignUp } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import * as api from '@borrowcircle/shared';
import { fieldErrors, signUpSchema } from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { Alert, AuthLink, AuthShell } from '@/components/AuthShell';
import { GoogleButton } from '@/components/GoogleButton';
import { Button, Field } from '@/components/ui';
import { colors, font } from '@/theme';
import { clerkPublishableKey } from '@/lib/backend';

export default function SignUp() {
  return clerkPublishableKey ? <ClerkSignUp /> : <DemoSignUp />;
}

function ClerkSignUp() {
  const { showToast, refresh } = useApp();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
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

  async function verify() {
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
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={{ fontFamily: font.display, fontSize: 30, color: colors.deep, marginTop: 28, letterSpacing: -1 }}>
        {verifying ? 'Verify your email' : 'Create your account'}
      </Text>
      <Text style={{ color: colors.muted, fontSize: 13, marginTop: 8, marginBottom: 26 }}>
        {verifying ? `Enter the 6-digit code we emailed to ${form.email}.` : 'Borrow what you need. Share what you own.'}
      </Text>
      {error ? <Alert kind="error" text={error} /> : null}
      {!verifying ? <GoogleButton mode="sign-up" /> : null}
      {verifying ? (
        <>
          <Field label="Verification code" value={code} onChangeText={setCode} placeholder="123456" keyboardType="numeric" />
          <Button onPress={() => void verify()} disabled={busy || !isLoaded}>
            {busy ? 'Verifying…' : 'Verify and continue'}
          </Button>
        </>
      ) : (
        <>
          <Field label="Full name" value={form.fullName} onChangeText={(t) => setForm({ ...form, fullName: t })} placeholder="Alex Sharma" error={errors.fullName} />
          <Field label="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <Field label="Password" value={form.password} onChangeText={(t) => setForm({ ...form, password: t })} placeholder="8+ characters with a number" secure error={errors.password} />
          <Field label="Confirm password" value={form.confirmPassword} onChangeText={(t) => setForm({ ...form, confirmPassword: t })} placeholder="Repeat your password" secure error={errors.confirmPassword} />
          <Button onPress={() => void submit()} disabled={busy || !isLoaded}>
            {busy ? 'Creating account…' : 'Create account'}
          </Button>
        </>
      )}
      <AuthLink text="Already have an account?" linkText="Log in" href="/login" />
    </AuthShell>
  );
}

function DemoSignUp() {
  const { showToast, refresh } = useApp();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={{ fontFamily: font.display, fontSize: 30, color: colors.deep, marginTop: 28, letterSpacing: -1 }}>Create your account</Text>
      <Text style={{ color: colors.muted, fontSize: 13, marginTop: 8, marginBottom: 26 }}>Borrow what you need. Share what you own.</Text>
      {error ? <Alert kind="error" text={error} /> : null}
      {notice ? <Alert kind="success" text={notice} /> : null}
      <Field label="Full name" value={form.fullName} onChangeText={(t) => setForm({ ...form, fullName: t })} placeholder="Alex Sharma" error={errors.fullName} />
      <Field label="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
      <Field label="Password" value={form.password} onChangeText={(t) => setForm({ ...form, password: t })} placeholder="8+ characters with a number" secure error={errors.password} />
      <Field label="Confirm password" value={form.confirmPassword} onChangeText={(t) => setForm({ ...form, confirmPassword: t })} placeholder="Repeat your password" secure error={errors.confirmPassword} />
      <Button onPress={() => void submit()} disabled={busy}>
        {busy ? 'Creating account…' : 'Create account'}
      </Button>
      <AuthLink text="Already have an account?" linkText="Log in" href="/login" />
    </AuthShell>
  );
}
