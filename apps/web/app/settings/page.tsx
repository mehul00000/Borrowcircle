'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { fieldErrors, profileUpdateSchema } from '@borrowcircle/shared';
import { useApp } from '@/components/AppContext';
import { AppHeader, Button, Spinner } from '@/components/ui';
import { PageHead, RequireAuth } from '@/components/RequireAuth';

const SECTIONS = ['Account', 'Profile', 'Security', 'Notifications', 'Privacy'] as const;
type Section = (typeof SECTIONS)[number];

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsInner />
    </RequireAuth>
  );
}

function SettingsInner() {
  const { profile, user, showToast, refresh } = useApp();
  const router = useRouter();
  const [section, setSection] = useState<Section>('Profile');
  const [form, setForm] = useState({ full_name: '', username: '', bio: '', city: '', locality: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [prefs, setPrefs] = useState({ email_updates: true, push_requests: true, push_reminders: true, share_locality: true });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        username: profile.username ?? '',
        bio: profile.bio ?? '',
        city: profile.city ?? '',
        locality: profile.locality ?? '',
        phone: profile.phone ?? '',
      });
    }
  }, [profile]);

  async function saveProfile() {
    const parsed = profileUpdateSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await api.updateMyProfile(parsed.data as Partial<api.Profile>);
      showToast('Profile updated');
      refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update profile');
    } finally {
      setBusy(false);
    }
  }

  if (!profile) return <><AppHeader /><main className="shell page"><Spinner /></main></>;

  return (
    <div className="discover-page">
      <AppHeader />
      <main className="shell page">
        <PageHead kicker="Your account" title="Settings" />
        <div className="settings-grid">
          <nav className="settings-nav">
            {SECTIONS.map((s) => (
              <button key={s} className={section === s ? 'active' : ''} onClick={() => setSection(s)}>
                {s}
              </button>
            ))}
          </nav>
          <div>
            {section === 'Profile' && (
              <div className="panel">
                <h3>Profile details</h3>
                <div className={`field ${errors.full_name ? 'field--error' : ''}`}>
                  <label>Full name</label>
                  <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                  {errors.full_name && <span className="field__error">{errors.full_name}</span>}
                </div>
                <div className={`field ${errors.username ? 'field--error' : ''}`}>
                  <label>Username</label>
                  <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="neighbourly_handle" />
                  {errors.username && <span className="field__error">{errors.username}</span>}
                </div>
                <div className={`field ${errors.bio ? 'field--error' : ''}`}>
                  <label>Bio</label>
                  <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell your neighbours a little about yourself." />
                  {errors.bio && <span className="field__error">{errors.bio}</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label>City</label>
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Locality</label>
                    <input value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="e.g. RK Puram" />
                  </div>
                </div>
                <div className="field">
                  <label>Phone (private)</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Only shared for accepted handovers" />
                </div>
                <Button onClick={() => void saveProfile()} disabled={busy}>
                  {busy ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            )}

            {section === 'Account' && (
              <div className="panel">
                <h3>Account</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Signed in as <strong style={{ color: 'var(--ink)' }}>{user?.email ?? profile.email}</strong>
                  {profile.is_verified && <> · Verified member</>}
                </p>
                <p style={{ color: 'var(--muted)', fontSize: 12 }}>
                  Exact location, phone number and condition evidence are never public. Neighbours see your name, locality and rating only.
                </p>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await api.signOut();
                    router.push('/');
                  }}
                >
                  Log out
                </Button>
              </div>
            )}

            {section === 'Security' && (
              <div className="panel">
                <h3>Change password</h3>
                <div className="field">
                  <label>New password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters with a number" />
                </div>
                <Button
                  onClick={async () => {
                    try {
                      await api.updatePassword(newPassword);
                      setNewPassword('');
                      showToast('Password updated');
                    } catch (err) {
                      showToast(err instanceof Error ? err.message : 'Could not update password');
                    }
                  }}
                >
                  Update password
                </Button>
              </div>
            )}

            {section === 'Notifications' && (
              <div className="panel">
                <h3>Notification preferences</h3>
                {(
                  [
                    ['email_updates', 'Email updates', 'Occasional summaries of your BorrowCircle activity.'],
                    ['push_requests', 'Request alerts', 'Notify me as soon as someone requests my items.'],
                    ['push_reminders', 'Reminders', 'Handover reminders and return reminders.'],
                  ] as const
                ).map(([key, label, text]) => (
                  <label key={key} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={prefs[key]}
                      onChange={(e) => {
                        setPrefs({ ...prefs, [key]: e.target.checked });
                        showToast('Preference saved (stored on this device)');
                      }}
                    />
                    <span>
                      <strong style={{ display: 'block', color: 'var(--ink)' }}>{label}</strong>
                      {text}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {section === 'Privacy' && (
              <div className="panel">
                <h3>Privacy</h3>
                <label className="checkbox-row">
                  <input type="checkbox" checked={prefs.share_locality} onChange={(e) => setPrefs({ ...prefs, share_locality: e.target.checked })} />
                  <span>Show my locality (e.g. “RK Puram”) on my profile and listings.</span>
                </label>
                <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.7 }}>
                  BorrowCircle never publishes exact addresses or coordinates. Handover locations are shared only between the two participants of an
                  accepted transaction.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
