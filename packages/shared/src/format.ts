import type { BorrowingStatus } from './types';
import { STATUS_LABELS, TIMELINE_STAGES } from './constants';

/** Format money stored in minor units (paise) for display: 5000 -> ₹50. */
export function formatMoney(minorUnits: number, currency = 'INR'): string {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : `${currency} `;
  if (minorUnits === 0) return 'Free';
  const rupees = minorUnits / 100;
  const value = Number.isInteger(rupees) ? rupees.toLocaleString('en-IN') : rupees.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  return `${symbol}${value}`;
}

export function feeLabel(minorUnits: number, currency = 'INR'): string {
  return minorUnits === 0 ? 'Free' : `${formatMoney(minorUnits, currency)}/day`;
}

export function formatDate(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function dayCount(startISO: string, endISO: string): number {
  const start = new Date(`${startISO.slice(0, 10)}T00:00:00`).getTime();
  const end = new Date(`${endISO.slice(0, 10)}T00:00:00`).getTime();
  return Math.max(1, Math.round((end - start) / 86400000));
}

export function distanceLabel(km?: number | null): string {
  if (km == null) return 'Nearby';
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

export function ratingLabel(avg?: number | null, count?: number | null): string {
  if (!avg || !count) return 'New member';
  return `★ ${avg.toFixed(1)} · ${count} review${count === 1 ? '' : 's'}`;
}

export function stars(rating: number): string {
  return '★★★★★'.slice(0, Math.round(rating)).padEnd(5, '☆');
}

export function statusLabel(status: BorrowingStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export interface StageView {
  key: string;
  label: string;
  done: boolean;
  current: boolean;
}

/**
 * Timeline view for a borrow request. `current` marks the active stage; all
 * earlier stages are done. For terminal bad states (DECLINED etc.) the
 * timeline shows the happy path with nothing current.
 */
export function timelineFor(status: BorrowingStatus): StageView[] {
  return TIMELINE_STAGES.map((stage, i) => {
    const next = TIMELINE_STAGES[i + 1];
    const reached = stage.statuses.includes(status);
    const nextReached = next ? next.statuses.includes(status) : false;
    return { key: stage.key, label: stage.label, done: reached, current: reached && !nextReached };
  });
}

/** Whether a request status is a live (non-terminal) state. */
export function isLiveStatus(status: BorrowingStatus): boolean {
  return !['COMPLETED', 'DECLINED', 'CANCELLED', 'EXPIRED'].includes(status);
}

/** Approximate distance between two lat/lng points, in km (Haversine). */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
