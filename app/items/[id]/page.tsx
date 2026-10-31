'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { borrowRequestSchema, dayCount, feeLabel, fieldErrors, formatMoney, initials } from '@borrowcircle/shared';
import { Icon } from '@/components/Icon';
import { useApp } from '@/components/AppContext';
import { AppHeader, Button, EmptyState, Spinner } from '@/components/ui';
import { avatarUrl, itemImageUrl } from '@/lib/backend';

function addDays(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, savedIds, toggleSave, showToast } = useApp();
  const [item, setItem] = useState<api.Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [startDate, setStartDate] = useState(addDays(1));
  const [endDate, setEndDate] = useState(addDays(4));
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState(api.DISPUTE_REASONS[0]);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api.getItem(id);
        setItem(data);
        if (!data) setError('This listing does not exist or is no longer available.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load this listing.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const days = useMemo(() => {
    try {
      return dayCount(startDate, endDate);
    } catch {
      return 0;
    }
  }, [startDate, endDate]);

  const total = item ? item.borrowing_fee * Math.max(days, 1) : 0;

  if (loading) return <div className="discover-page"><AppHeader /><main className="shell page"><Spinner /></main></div>;
  if (!item) {
    return (
      <div className="discover-page">
        <AppHeader />
        <main className="shell page">
          <EmptyState icon="package" title="Listing unavailable" text={error} action={<Link href="/discover" className="btn btn--primary">Back to discover</Link>} />
        </main>
      </div>
    );
  }

  const imageList = (item.image_urls?.length ? item.image_urls : (item.images ?? []).map((i) => i.storage_path)).map(itemImageUrl);
  const gallery = imageList.length ? imageList : [''];
  const saved = savedIds.includes(item.id);
  const isOwner = user?.id === item.owner_id;

  async function submitRequest() {
    if (!user) {
      showToast('Sign in to send a borrowing request');
      router.push('/login');
      return;
    }
    const parsed = borrowRequestSchema.safeParse({ start_date: startDate, end_date: endDate, message });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const request = await api.createBorrowRequest({ item_id: item!.id, start_date: startDate, end_date: endDate, message });
      showToast('Request sent to the owner');
      router.push(`/borrowings/${request.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="discover-page">
      <AppHeader />
      <main className="shell page">
        <div className="item-page">
          <div className="gallery">
            <div className="gallery__main">
              {gallery[activeImage] && <img src={gallery[activeImage]} alt={item.title} />}
              <span className="availability">{item.status === 'ACTIVE' ? 'Available now' : 'Currently out'}</span>
            </div>
            {gallery.length > 1 && (
              <div className="gallery__thumbs">
                {gallery.map((src, i) => (
                  <button key={i} className={i === activeImage ? 'active' : ''} onClick={() => setActiveImage(i)} aria-label={`Photo ${i + 1}`}>
                    {src && <img src={src} alt="" />}
                  </button>
                ))}
              </div>
            )}
            <div className="panel" style={{ marginTop: 18 }}>
              <h3>About this item</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>{item.description}</p>
            </div>
            <div className="panel" style={{ marginTop: 14 }}>
              <h3>Borrowing rules</h3>
              <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.7, margin: 0 }}>
                Minimum duration {item.minimum_days} day{item.minimum_days > 1 ? 's' : ''}
                {item.maximum_days ? ` · Maximum duration ${item.maximum_days} days` : ''}. Handle the item with care, return it on time and record its
                condition at handover and return. Exact handover locations are shared only after a request is accepted.
              </p>
            </div>
          </div>

          <div>
            <div className="book-panel">
              <span className="kicker">{item.category?.name} · {item.location_label}</span>
              <h2>{item.title}</h2>
              <div className="sheet-meta">
                <span><Icon name="star" size={15} filled /> {item.owner?.rating_avg ? item.owner.rating_avg.toFixed(1) : 'New'} · {item.owner?.rating_count ?? 0} reviews</span>
                <span>{item.condition} condition</span>
              </div>

              <div className="lender" style={{ marginTop: 20 }}>
                <span>{initials(item.owner?.full_name ?? 'BC')}</span>
                <div>
                  <small>Shared by</small>
                  <strong>
                    {item.owner?.full_name} {item.owner?.is_verified && <Icon name="check" size={15} />}
                  </strong>
                </div>
                <Link href={`/profile/${item.owner_id}`} className="link" style={{ fontSize: 11 }}>
                  View profile
                </Link>
              </div>

              {isOwner ? (
                <div className="alert alert--info" style={{ marginTop: 20 }}>
                  This is your listing. Manage it from your <Link href="/dashboard">dashboard</Link>.
                </div>
              ) : (
                <>
                  <div className="date-grid" style={{ marginTop: 20 }}>
                    <label>
                      Start date
                      <input type="date" value={startDate} min={addDays(0)} onChange={(e) => setStartDate(e.target.value)} />
                    </label>
                    <label>
                      Return date
                      <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
                    </label>
                  </div>
                  {errors.start_date && <p className="field__error">{errors.start_date}</p>}
                  {errors.end_date && <p className="field__error">{errors.end_date}</p>}

                  <label className="field" style={{ marginTop: 14 }}>
                    <label>Message to the owner (optional)</label>
                    <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Introduce yourself and explain what you need." />
                  </label>

                  <div className="estimate">
                    <span>
                      <small>Estimated borrowing fee</small>
                      <strong>
                        {Math.max(days, 1)} day{Math.max(days, 1) > 1 ? 's' : ''} × {feeLabel(item.borrowing_fee)}
                      </strong>
                    </span>
                    <strong>{formatMoney(total)}</strong>
                  </div>
                  {item.security_deposit > 0 && (
                    <p style={{ color: 'var(--muted)', fontSize: 11, margin: '0 0 6px' }}>
                      A refundable deposit of {formatMoney(item.security_deposit)} applies.
                    </p>
                  )}
                  {error && <div className="alert alert--error">{error}</div>}

                  <div className="sheet-actions" style={{ gridTemplateColumns: '1fr' }}>
                    <Button onClick={() => void submitRequest()} disabled={submitting}>
                      {submitting ? 'Sending request…' : <>Request to borrow <Icon name="arrow" size={18} /></>}
                    </Button>
                    <Button variant="secondary" onClick={() => void toggleSave(item.id)}>
                      <Icon name="heart" size={18} filled={saved} /> {saved ? 'Saved' : 'Save item'}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {!isOwner && (
              <div className="panel" style={{ marginTop: 14 }}>
                <h3>Something wrong with this listing?</h3>
                {showReport ? (
                  <>
                    <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} style={{ width: '100%', marginBottom: 10 }}>
                      {api.DISPUTE_REASONS.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                    <Button
                      onClick={async () => {
                        await api.createReport({ reason: reportReason, reported_item_id: item.id, description: `Reported listing: ${item.title}` });
                        setShowReport(false);
                        showToast('Report submitted — thank you');
                      }}
                    >
                      Submit report
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" onClick={() => setShowReport(true)}>
                    <Icon name="shield" size={16} /> Report listing
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
