'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { formatDate, formatDateTime, formatMoney, initials, statusLabel, timelineFor } from '@borrowcircle/shared';
import { Icon } from '@/components/Icon';
import { useApp } from '@/components/AppContext';
import { AppHeader, Button, Spinner } from '@/components/ui';
import { RequireAuth } from '@/components/RequireAuth';
import { itemImageUrl } from '@/lib/backend';

export default function BorrowingPage() {
  return (
    <RequireAuth>
      <BorrowingInner />
    </RequireAuth>
  );
}

function BorrowingInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, showToast, refresh } = useApp();
  const [request, setRequest] = useState<api.BorrowRequest | null>(null);
  const [agreement, setAgreement] = useState<api.Agreement | null>(null);
  const [reports, setReports] = useState<api.ConditionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [reportType, setReportType] = useState<'HANDOVER' | 'RETURN'>('HANDOVER');
  const [reportNotes, setReportNotes] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const load = useCallback(async () => {
    try {
      const r = await api.getBorrowRequest(id);
      setRequest(r);
      if (r) {
        const [a, rs] = await Promise.all([api.getAgreement(id), api.listConditionReports(id)]);
        setAgreement(a);
        setReports(rs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this transaction.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <><AppHeader /><main className="shell page"><Spinner /></main></>;
  if (!request || !user) {
    return (
      <div className="discover-page">
        <AppHeader />
        <main className="shell page">
          <div className="alert alert--error">{error || 'Transaction not found.'}</div>
          <Link href="/requests" className="btn btn--secondary">Back to requests</Link>
        </main>
      </div>
    );
  }

  const isLender = request.lender_id === user.id;
  const isBorrower = request.borrower_id === user.id;
  const other = isLender ? request.borrower : request.lender;
  const item = request.item;
  const stages = timelineFor(request.status);
  const handoverReport = reports.find((r) => r.report_type === 'HANDOVER');
  const returnReport = reports.find((r) => r.report_type === 'RETURN');
  const itemImage = item ? itemImageUrl(item.image_urls?.[0] ?? item.images?.[0]?.storage_path) : '';

  async function act(key: string, fn: () => Promise<unknown>, successMessage: string) {
    setBusy(key);
    setError('');
    try {
      await fn();
      showToast(successMessage);
      refresh();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy('');
    }
  }

  async function submitConditionReport() {
    setBusy('report');
    setError('');
    try {
      await api.createConditionReport({
        request_id: request!.id,
        report_type: reportType,
        notes: reportNotes,
        images: pendingFiles.map((f) => ({ blob: f, fileName: f.name })),
      });
      setReportNotes('');
      setPendingFiles([]);
      if (fileInput.current) fileInput.current.value = '';
      showToast('Condition report submitted');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the report.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="discover-page">
      <AppHeader />
      <main className="shell page">
        <Link href="/requests" className="text-link">← All requests</Link>
        <div className="page__head" style={{ marginTop: 10 }}>
          <div>
            <span className="kicker">{isLender ? 'Lending transaction' : 'Borrowing transaction'}</span>
            <h1>{item?.title ?? 'Transaction'}</h1>
            <p>
              {formatDate(request.start_date)} → {formatDate(request.end_date)} · {formatMoney(request.borrowing_fee)}
              {request.security_deposit > 0 ? ` · deposit ${formatMoney(request.security_deposit)}` : ''} · with{' '}
              {other?.full_name}
            </p>
          </div>
          <span className={`badge badge--${request.status.toLowerCase()}`} style={{ fontSize: 11, padding: '8px 14px' }}>
            {statusLabel(request.status)}
          </span>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="tx-grid">
          <div>
            <div className="panel">
              <h3>Progress</h3>
              <div className="timeline">
                {stages.map((stage) => (
                  <div key={stage.key} className={`timeline__stage ${stage.done ? 'done' : ''} ${stage.current ? 'current' : ''}`}>
                    <span className="timeline__dot">{stage.done && <Icon name="check" size={11} />}</span>
                    <strong>{stage.label}</strong>
                    {stage.current && <small>Current stage</small>}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel" style={{ marginTop: 18 }}>
              <h3>Condition records</h3>
              <p style={{ color: 'var(--muted)', fontSize: 12, margin: '0 0 12px' }}>
                Photos and notes recorded at handover and return. Only you and {other?.full_name} can see this evidence.
              </p>
              <div className="report-grid">
                <div className="report-card">
                  <small>Initial handover condition</small>
                  {handoverReport ? (
                    <>
                      <h5>Recorded {formatDateTime(handoverReport.created_at)}</h5>
                      <p>{handoverReport.notes ?? 'No notes added.'}</p>
                      <div className="report-photos">
                        {(handoverReport.images ?? []).map((img) => (
                          <img key={img.id} src={img.url ?? ''} alt="Handover condition" />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p>Not yet recorded.</p>
                  )}
                </div>
                <div className="report-card">
                  <small>Return condition</small>
                  {returnReport ? (
                    <>
                      <h5>Recorded {formatDateTime(returnReport.created_at)}</h5>
                      <p>{returnReport.notes ?? 'No notes added.'}</p>
                      <div className="report-photos">
                        {(returnReport.images ?? []).map((img) => (
                          <img key={img.id} src={img.url ?? ''} alt="Return condition" />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p>Not yet recorded.</p>
                  )}
                </div>
              </div>

              {(request.status === 'READY_FOR_HANDOVER' || request.status === 'RETURN_INITIATED' || request.status === 'ACTIVE' || request.status === 'OVERDUE') && (
                <div style={{ marginTop: 16 }}>
                  <div className="tabs" style={{ marginBottom: 12 }}>
                    {(['HANDOVER', 'RETURN'] as const).map((t) => (
                      <button key={t} className={reportType === t ? 'active' : ''} onClick={() => setReportType(t)}>
                        {t === 'HANDOVER' ? 'Handover report' : 'Return report'}
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="field"
                    rows={2}
                    style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, width: '100%', font: 'inherit' }}
                    placeholder="Describe the item's condition…"
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                  />
                  <input ref={fileInput} type="file" accept="image/*" multiple style={{ margin: '10px 0', fontSize: 12 }} onChange={(e) => setPendingFiles(Array.from(e.target.files ?? []))} />
                  {pendingFiles.length > 0 && <p style={{ fontSize: 11, color: 'var(--muted)' }}>{pendingFiles.length} photo(s) selected</p>}
                  <Button onClick={() => void submitConditionReport()} disabled={busy === 'report'}>
                    {busy === 'report' ? 'Submitting…' : 'Submit condition report'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="panel">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                {itemImage && <img className="request-card__img" src={itemImage} alt="" />}
                <div>
                  <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 14 }}>{item?.title}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--muted)' }}>
                    {item?.category?.name} · {item?.condition} condition
                  </p>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 2 }}>
                <div><strong style={{ color: 'var(--ink)' }}>Borrower:</strong> {request.borrower?.full_name}</div>
                <div><strong style={{ color: 'var(--ink)' }}>Lender:</strong> {request.lender?.full_name}</div>
                <div><strong style={{ color: 'var(--ink)' }}>Requested:</strong> {formatDateTime(request.created_at)}</div>
                <div><strong style={{ color: 'var(--ink)' }}>Fee:</strong> {formatMoney(request.borrowing_fee)}</div>
                <div><strong style={{ color: 'var(--ink)' }}>Deposit:</strong> {formatMoney(request.security_deposit)}</div>
              </div>
              {request.message && (
                <div className="alert alert--info" style={{ marginTop: 12, fontWeight: 400 }}>
                  “{request.message}”
                </div>
              )}
            </div>

            {agreement && (
              <div className="agreement" style={{ marginTop: 18 }}>
                <h4>Digital borrowing agreement</h4>
                <p className="agreement__meta">Version {agreement.version} · Immutable snapshot of the agreed terms</p>
                <div className="agreement__terms">
                  <div><small>Start date</small><strong>{formatDate(request.start_date)}</strong></div>
                  <div><small>Return date</small><strong>{formatDate(request.end_date)}</strong></div>
                  <div><small>Borrowing fee</small><strong>{formatMoney(request.borrowing_fee)}</strong></div>
                  <div><small>Security deposit</small><strong>{formatMoney(request.security_deposit)}</strong></div>
                </div>
                <ul>
                  {((agreement.agreement_content?.responsibilities as string[]) ?? []).map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>

                {request.status === 'AWAITING_ACKNOWLEDGEMENT' ? (
                  <>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={agreeChecked} onChange={(e) => setAgreeChecked(e.target.checked)} />
                      <span>I have read and agree to these borrowing terms.</span>
                    </label>
                    <Button disabled={!agreeChecked || busy === 'ack'} onClick={() => act('ack', () => api.acknowledgeAgreement(request.id), 'Agreement acknowledged')}>
                      {busy === 'ack' ? 'Recording…' : 'Acknowledge agreement'}
                    </Button>
                  </>
                ) : (
                  <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
                    <span className={`ack-state ${agreement.borrower_accepted_at ? 'done' : 'waiting'}`}>
                      <Icon name={agreement.borrower_accepted_at ? 'check' : 'clock'} size={14} />
                      Borrower {agreement.borrower_accepted_at ? `acknowledged ${formatDateTime(agreement.borrower_accepted_at)}` : 'has not acknowledged yet'}
                    </span>
                    <span className={`ack-state ${agreement.lender_accepted_at ? 'done' : 'waiting'}`}>
                      <Icon name={agreement.lender_accepted_at ? 'check' : 'clock'} size={14} />
                      Lender {agreement.lender_accepted_at ? `acknowledged ${formatDateTime(agreement.lender_accepted_at)}` : 'has not acknowledged yet'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="action-bar">
              {renderActions()}
            </div>

            {request.status === 'COMPLETED' && !reviewed && (
              <Button className="btn--secondary" onClick={() => setShowReview(true)}>
                <Icon name="star" size={16} /> Leave a review for {other?.full_name?.split(' ')[0]}
              </Button>
            )}
            {showReview && (
              <div className="panel" style={{ marginTop: 14 }}>
                <h3>Review {other?.full_name}</h3>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)} style={{ border: 0, background: 'none', cursor: 'pointer', color: n <= rating ? '#d99a32' : 'var(--border)' }}>
                      <Icon name="star" size={26} filled={n <= rating} />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  className="field"
                  style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, width: '100%', font: 'inherit' }}
                  placeholder="How was the experience? (optional)"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <Button
                  onClick={async () => {
                    await act('review', () => api.createReview({ request_id: request!.id, reviewee_id: other!.id, rating, comment: reviewText }), 'Review submitted');
                    setReviewed(true);
                    setShowReview(false);
                  }}
                  disabled={busy === 'review'}
                >
                  {busy === 'review' ? 'Submitting…' : 'Submit review'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );

  function renderActions() {
    if (!request || !user) return null;
    const status = request.status;
    const buttons: React.ReactNode[] = [];

    if (status === 'PENDING' && isLender) {
      buttons.push(
        <Button key="accept" disabled={busy === 'accept'} onClick={() => act('accept', () => api.acceptBorrowRequest(request.id), 'Request accepted')}>
          {busy === 'accept' ? 'Accepting…' : 'Accept request'}
        </Button>,
        <Button key="decline" variant="secondary" disabled={busy === 'decline'} onClick={() => act('decline', () => api.declineBorrowRequest(request.id), 'Request declined')}>
          Decline
        </Button>,
      );
    }
    if (status === 'PENDING' && isBorrower) {
      buttons.push(
        <Button key="cancel" variant="secondary" disabled={busy === 'cancel'} onClick={() => act('cancel', () => api.cancelBorrowRequest(request.id), 'Request cancelled')}>
          Cancel request
        </Button>,
      );
    }
    if (status === 'READY_FOR_HANDOVER' && isBorrower && handoverReport) {
      buttons.push(
        <Button key="receipt" disabled={busy === 'receipt'} onClick={() => act('receipt', () => api.confirmItemReceipt(request.id), 'Receipt confirmed — borrowing is active')}>
          {busy === 'receipt' ? 'Confirming…' : 'Confirm receipt'}
        </Button>,
      );
    }
    if (['ACTIVE', 'OVERDUE'].includes(status) && isBorrower) {
      buttons.push(
        <Button key="return" disabled={busy === 'return'} onClick={() => act('return', () => api.initiateReturn(request.id), 'Return initiated')}>
          Initiate return
        </Button>,
      );
    }
    if (['RETURN_INITIATED', 'OVERDUE'].includes(status) && isLender) {
      buttons.push(
        <Button key="confirmReturn" disabled={busy === 'confirmReturn'} onClick={() => act('confirmReturn', () => api.confirmItemReturn(request.id), 'Return confirmed — transaction completed')}>
          {busy === 'confirmReturn' ? 'Confirming…' : 'Confirm return'}
        </Button>,
      );
    }
    if (['READY_FOR_HANDOVER', 'ACTIVE', 'RETURN_INITIATED', 'OVERDUE', 'AWAITING_ACKNOWLEDGEMENT'].includes(status)) {
      buttons.push(
        <Button key="cancelTx" variant="secondary" disabled={busy === 'cancelTx'} onClick={() => act('cancelTx', () => api.cancelBorrowRequest(request.id), 'Transaction cancelled')}>
          Cancel transaction
        </Button>,
      );
    }
    if (['ACTIVE', 'RETURN_INITIATED', 'OVERDUE', 'READY_FOR_HANDOVER'].includes(status)) {
      buttons.push(
        <Button key="dispute" variant="ghost" disabled={busy === 'dispute'} onClick={() => act('dispute', () => api.reportIssue(request.id, 'Condition disagreement'), 'Dispute opened — an admin will review')}>
          Report an issue
        </Button>,
      );
    }
    if (!buttons.length) {
      return <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
        {status === 'AWAITING_ACKNOWLEDGEMENT'
          ? 'Waiting for both parties to acknowledge the agreement.'
          : status === 'READY_FOR_HANDOVER'
            ? isLender
              ? 'Record the handover condition, then the borrower confirms receipt.'
              : 'Waiting for the lender to record the handover condition.'
            : status === 'COMPLETED'
              ? 'This transaction is complete. Thank you for sharing!'
              : 'No actions available in this state.'}
      </p>;
    }
    return <>{buttons}</>;
  }
}
