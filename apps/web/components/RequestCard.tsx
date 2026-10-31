'use client';

import Link from 'next/link';
import type * as api from '@borrowcircle/shared';
import { formatDate, formatMoney, initials, statusLabel } from '@borrowcircle/shared';
import { itemImageUrl } from '@/lib/backend';

export function RequestCard({ request, currentUserId }: { request: api.BorrowRequest; currentUserId: string }) {
  const isLender = request.lender_id === currentUserId;
  const other = isLender ? request.borrower : request.lender;
  const image = request.item ? itemImageUrl(request.item.image_urls?.[0] ?? request.item.images?.[0]?.storage_path) : '';
  return (
    <Link href={`/borrowings/${request.id}`} className="request-card">
      {image ? <img className="request-card__img" src={image} alt="" /> : <div className="request-card__img" />}
      <div>
        <h4>{request.item?.title ?? 'Listing removed'}</h4>
        <p>
          {isLender ? `From ${other?.full_name ?? 'a neighbour'}` : `To ${other?.full_name ?? 'the owner'}`} ·{' '}
          {formatMoney(request.borrowing_fee)} {request.security_deposit > 0 ? `+ deposit ${formatMoney(request.security_deposit)}` : ''}
        </p>
        <span className="request-card__dates">
          {formatDate(request.start_date)} → {formatDate(request.end_date)}
        </span>
      </div>
      <div className="request-card__right">
        <span className={`badge badge--${request.status.toLowerCase()}`}>{statusLabel(request.status)}</span>
        <span style={{ fontSize: 10, color: 'var(--faint)' }}>
          {isLender ? 'Received' : 'Sent'} · {initials(other?.full_name ?? '')}
        </span>
      </div>
    </Link>
  );
}
