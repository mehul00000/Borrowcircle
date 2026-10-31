'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { borrowingTermsSchema, CONDITIONS, itemDetailsSchema, WIZARD_STEPS } from '@borrowcircle/shared';
import { Icon } from '@/components/Icon';
import { useApp } from '@/components/AppContext';
import { AppHeader, Button } from '@/components/ui';
import { RequireAuth } from '@/components/RequireAuth';

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export default function NewItemPage() {
  return (
    <RequireAuth>
      <Wizard />
    </RequireAuth>
  );
}

function Wizard() {
  const router = useRouter();
  const { showToast } = useApp();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [details, setDetails] = useState({ title: '', description: '', category_id: '', condition: 'Good' });
  const [terms, setTerms] = useState({ borrowing_fee: '50', security_deposit: '200', minimum_days: '1', maximum_days: '14', borrowing_rules: '' });
  const [availability, setAvailability] = useState({ from: plusDays(0), until: plusDays(90) });
  const [location, setLocation] = useState({ label: 'RK Puram, Delhi', latitude: 28.5673, longitude: 77.1855 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const stepIdx = (name: string) => WIZARD_STEPS.indexOf(name as (typeof WIZARD_STEPS)[number]);

  function validateStep(current: number): boolean {
    setErrors({});
    if (current === stepIdx('Details')) {
      const parsed = itemDetailsSchema.safeParse(details);
      if (!parsed.success) {
        setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
        return false;
      }
    }
    if (current === stepIdx('Borrowing Terms')) {
      const parsed = borrowingTermsSchema.safeParse(terms);
      if (!parsed.success) {
        setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
        return false;
      }
    }
    if (current === stepIdx('Photos') && files.length === 0) {
      setErrors({ photos: 'Add at least one photo so neighbours can see the item.' });
      return false;
    }
    if (current === stepIdx('Availability') && availability.until <= availability.from) {
      setErrors({ availability: 'The available-until date must be after the from date.' });
      return false;
    }
    return true;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  }

  async function publish(status: 'DRAFT' | 'ACTIVE') {
    for (let i = 0; i < WIZARD_STEPS.length - 1; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    setBusy(true);
    try {
      await api.createItem(
        {
          title: details.title,
          description: details.description,
          category_id: details.category_id,
          condition: details.condition as api.Item['condition'],
          borrowing_fee: Number(terms.borrowing_fee),
          security_deposit: Number(terms.security_deposit),
          minimum_days: Number(terms.minimum_days),
          maximum_days: terms.maximum_days ? Number(terms.maximum_days) : null,
          borrowing_rules: terms.borrowing_rules,
          location_label: location.label,
          approximate_latitude: location.latitude,
          approximate_longitude: location.longitude,
          available_from: availability.from,
          available_until: availability.until,
          status,
        },
        files.map((f) => ({ blob: f, fileName: f.name })),
      );
      showToast(status === 'ACTIVE' ? 'Listing published' : 'Draft saved');
      router.push('/dashboard');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not publish the listing');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="discover-page">
      <AppHeader />
      <main className="shell page">
        <div className="wizard">
          <span className="wizard__step-tag">
            Step {step + 1} of {WIZARD_STEPS.length}
          </span>
          <div className="wizard__progress">
            {WIZARD_STEPS.map((s, i) => (
              <span key={s} className={i <= step ? 'done' : ''} />
            ))}
          </div>
          <h1>{WIZARD_STEPS[step]}</h1>

          {step === stepIdx('Photos') && (
            <>
              <label className="upload-zone">
                <Icon name="camera" size={30} />
                <strong>Click to add photos</strong>
                <span>Clear, well-lit photos build trust. Up to 6 images (JPEG, PNG or WebP).</span>
                <input type="file" accept="image/*" multiple hidden onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 6))} />
              </label>
              {errors.photos && <p className="field__error" style={{ marginTop: 8 }}>{errors.photos}</p>}
              {files.length > 0 && (
                <div className="upload-previews">
                  {files.map((f, i) => (
                    <div key={i}>
                      <img src={URL.createObjectURL(f)} alt={f.name} />
                      <button onClick={() => setFiles(files.filter((_, x) => x !== i))} aria-label="Remove photo">
                        <Icon name="x" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === stepIdx('Details') && (
            <>
              <div className={`field ${errors.title ? 'field--error' : ''}`}>
                <label>Title</label>
                <input value={details.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} placeholder="e.g. Sony Camera Tripod" />
                {errors.title && <span className="field__error">{errors.title}</span>}
              </div>
              <div className={`field ${errors.description ? 'field--error' : ''}`}>
                <label>Description</label>
                <textarea rows={5} value={details.description} onChange={(e) => setDetails({ ...details, description: e.target.value })} placeholder="What is it, what condition is it in, and what's included?" />
                {errors.description && <span className="field__error">{errors.description}</span>}
              </div>
              <div className="field">
                <label>Category</label>
                <select value={details.category_id} onChange={(e) => setDetails({ ...details, category_id: e.target.value })}>
                  <option value="">Choose a category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <span className="field__error">{errors.category_id}</span>}
              </div>
              <div className="field">
                <label>Condition</label>
                <div className="chip-select">
                  {CONDITIONS.map((c) => (
                    <button key={c} type="button" className={details.condition === c ? 'active' : ''} onClick={() => setDetails({ ...details, condition: c })}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === stepIdx('Borrowing Terms') && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className={`field ${errors.borrowing_fee ? 'field--error' : ''}`}>
                  <label>Borrowing fee (₹/day, 0 for free)</label>
                  <input type="number" min={0} value={terms.borrowing_fee} onChange={(e) => setTerms({ ...terms, borrowing_fee: e.target.value })} />
                  {errors.borrowing_fee && <span className="field__error">{errors.borrowing_fee}</span>}
                </div>
                <div className={`field ${errors.security_deposit ? 'field--error' : ''}`}>
                  <label>Security deposit (₹, refundable)</label>
                  <input type="number" min={0} value={terms.security_deposit} onChange={(e) => setTerms({ ...terms, security_deposit: e.target.value })} />
                  {errors.security_deposit && <span className="field__error">{errors.security_deposit}</span>}
                </div>
                <div className="field">
                  <label>Minimum days</label>
                  <input type="number" min={1} value={terms.minimum_days} onChange={(e) => setTerms({ ...terms, minimum_days: e.target.value })} />
                </div>
                <div className="field">
                  <label>Maximum days</label>
                  <input type="number" min={1} value={terms.maximum_days} onChange={(e) => setTerms({ ...terms, maximum_days: e.target.value })} />
                  {errors.maximum_days && <span className="field__error">{errors.maximum_days}</span>}
                </div>
              </div>
              <div className="field">
                <label>Borrowing rules (optional)</label>
                <textarea rows={3} value={terms.borrowing_rules} onChange={(e) => setTerms({ ...terms, borrowing_rules: e.target.value })} placeholder="e.g. Please return cleaned. No commercial use." />
              </div>
            </>
          )}

          {step === stepIdx('Availability') && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="field">
                  <label>Available from</label>
                  <input type="date" min={today()} value={availability.from} onChange={(e) => setAvailability({ ...availability, from: e.target.value })} />
                </div>
                <div className="field">
                  <label>Available until</label>
                  <input type="date" min={availability.from} value={availability.until} onChange={(e) => setAvailability({ ...availability, until: e.target.value })} />
                </div>
              </div>
              {errors.availability && <p className="field__error">{errors.availability}</p>}
              <p style={{ color: 'var(--muted)', fontSize: 12 }}>
                Borrowers can only request dates inside this window, and overlapping confirmed reservations are blocked automatically.
              </p>
            </>
          )}

          {step === stepIdx('Location') && (
            <>
              <div className="field">
                <label>Approximate location label</label>
                <input value={location.label} onChange={(e) => setLocation({ ...location, label: e.target.value })} placeholder="e.g. RK Puram, Delhi" />
              </div>
              <div className="alert alert--info">
                Your exact address is never shown. Only your approximate area is public — the precise handover spot is shared with a borrower only
                after you accept their request.
              </div>
            </>
          )}

          {step === stepIdx('Preview') && (
            <div className="panel">
              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 18 }}>
                <div className="gallery__main" style={{ aspectRatio: '4/3' }}>
                  {files[0] && <img src={URL.createObjectURL(files[0])} alt="" />}
                </div>
                <div>
                  <span className="kicker">{categories.find((c) => c.id === details.category_id)?.name}</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', margin: '8px 0' }}>{details.title}</h2>
                  <p style={{ color: 'var(--muted)', fontSize: 13, whiteSpace: 'pre-wrap' }}>{details.description}</p>
                  <p style={{ fontSize: 13, marginTop: 10 }}>
                    <strong>₹{terms.borrowing_fee}/day</strong> · deposit ₹{terms.security_deposit} · {terms.minimum_days}–{terms.maximum_days} days ·{' '}
                    {details.condition} · {location.label}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="wizard__nav">
            <Button variant="secondary" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>
              Back
            </Button>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" onClick={() => void publish('DRAFT')} disabled={busy}>
                Save draft
              </Button>
              {step < WIZARD_STEPS.length - 1 ? (
                <Button onClick={next}>Continue <Icon name="arrow" size={16} /></Button>
              ) : (
                <Button onClick={() => void publish('ACTIVE')} disabled={busy}>
                  {busy ? 'Publishing…' : 'Publish listing'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
