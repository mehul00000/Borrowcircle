import { useSignIn } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import * as api from '@borrowcircle/shared';
import { fieldErrors, signInSchema } from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { Alert, AuthLink, AuthShell } from '@/components/AuthShell';
import { GoogleButton } from '@/components/GoogleButton';
import { Button, Field } from '@/components/ui';
import { colors, font } from '@/theme';
import { activeBackend, clerkPublishableKey } from '@/lib/backend';

export default function Login() {
  return clerkPublishableKey ? <ClerkLogin /> : <DemoLogin />;
}

function ClerkLogin() {
  const { showToast, refresh } = useApp();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
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
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        showToast('Welcome back');
        refresh();
      } else {
        const v = result.firstFactorVerification;
        setError(
          `Sign-in needs one more step (${result.status}).` +
          (v?.error?.message ? ` ${v.error.message}` : '') +
          (v?.error?.code === 'form_identifier_not_found' ? ' No Clerk account exists for this email.' : ''),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={{ fontFamily: font.display, fontSize: 30, color: colors.deep, marginTop: 28, letterSpacing: -1 }}>Welcome back</Text>
      <Text style={{ color: colors.muted, fontSize: 13, marginTop: 8, marginBottom: 26 }}>Sign in to borrow and share with your neighbourhood.</Text>
      {error ? <Alert kind="error" text={error} /> : null}
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secure error={errors.password} />
      <Button onPress={() => void submit()} disabled={busy || !isLoaded}>
        {busy ? 'Signing in…' : 'Log in'}
      </Button>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 6 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Text style={{ color: colors.faint, fontSize: 10, fontFamily: font.bodySemi }}>OR</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>
      <GoogleButton mode="sign-in" />
      <AuthLink text="New to BorrowCircle?" linkText="Create an account" href="/signup" />
      <AuthLink text="Forgotten it?" linkText="Reset your password" href="/forgot-password" />
      <Text style={{ color: colors.faint, fontSize: 11, textAlign: 'center', marginTop: 18 }}>
        Sign-in is handled securely by Clerk.
      </Text>
    </AuthShell>
  );
}

function DemoLogin() {
  const { showToast, refresh } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={{ fontFamily: font.display, fontSize: 30, color: colors.deep, marginTop: 28, letterSpacing: -1 }}>Welcome back</Text>
      <Text style={{ color: colors.muted, fontSize: 13, marginTop: 8, marginBottom: 26 }}>Sign in to borrow and share with your neighbourhood.</Text>
      {error ? <Alert kind="error" text={error} /> : null}
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secure error={errors.password} />
      <Button onPress={() => void submit()} disabled={busy}>
        {busy ? 'Signing in…' : 'Log in'}
      </Button>
      <AuthLink text="New to BorrowCircle?" linkText="Create an account" href="/signup" />
      <AuthLink text="Forgotten it?" linkText="Reset your password" href="/forgot-password" />
      {activeBackend() === 'demo' ? (
        <View style={{ backgroundColor: colors.blueBg, borderRadius: 12, padding: 12, marginTop: 18 }}>
          <Text style={{ color: '#2C5F96', fontSize: 11, lineHeight: 17, textAlign: 'center' }}>
            Demo mode — no backend connected. Sign in with alex@example.com, maya@example.com, rohan@example.com or neha@example.com (any password with 4+ characters), or create a new account.
          </Text>
        </View>
      ) : (
        <Text style={{ color: colors.faint, fontSize: 11, textAlign: 'center', marginTop: 18 }}>
          Seeded demo logins: maya@borrowcircle.test · demo1234
        </Text>
      )}
    </AuthShell>
  );
}
