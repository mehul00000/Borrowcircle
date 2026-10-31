'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { formatRelativeTime } from '@borrowcircle/shared';
import { Icon } from '@/components/Icon';
import { AppHeader, Button, EmptyState, Spinner } from '@/components/ui';
import { PageHead, RequireAuth } from '@/components/RequireAuth';
import { useApp } from '@/components/AppContext';

const TYPE_ICONS: Partial<Record<api.NotificationType, Parameters<typeof Icon>[0]['name']>> = {
  BORROW_REQUEST_RECEIVED: 'calendar',
  BORROW_REQUEST_ACCEPTED: 'check',
  BORROW_REQUEST_DECLINED: 'x',
  AGREEMENT_REQUIRED: 'book',
  AGREEMENT_COMPLETED: 'check',
  HANDOVER_REMINDER: 'clock',
  BORROWING_STARTED: 'package',
  RETURN_REMINDER: 'clock',
  RETURN_INITIATED: 'package',
  RETURN_COMPLETED: 'check',
  BORROWING_OVERDUE: 'bell',
  DISPUTE_UPDATED: 'shield',
  NEW_REVIEW: 'star',
};

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsInner />
    </RequireAuth>
  );
}

function NotificationsInner() {
  const { refreshUnread } = useApp();
  const [notifications, setNotifications] = useState<api.AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setNotifications(await api.listNotifications());
      setLoading(false);
    })();
  }, []);

  async function markRead(n: api.AppNotification) {
    if (n.is_read) return;
    await api.markNotificationRead(n.id);
    setNotifications((list) => list.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    refreshUnread();
  }

  const groups: { label: string; items: api.AppNotification[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Earlier', items: [] },
  ];
  for (const n of notifications) {
    const days = (Date.now() - new Date(n.created_at).getTime()) / 86400000;
    if (days < 1) groups[0].items.push(n);
    else if (days < 2) groups[1].items.push(n);
    else groups[2].items.push(n);
  }

  return (
    <div className="discover-page">
      <AppHeader />
      <main className="shell page page--narrow">
        <PageHead
          kicker="Stay in the loop"
          title="Notifications"
          action={
            notifications.some((n) => !n.is_read) ? (
              <Button
                variant="secondary"
                onClick={async () => {
                  await api.markAllNotificationsRead();
                  setNotifications((list) => list.map((n) => ({ ...n, is_read: true })));
                  refreshUnread();
                }}
              >
                Mark all as read
              </Button>
            ) : undefined
          }
        />
        {loading ? (
          <Spinner />
        ) : notifications.length ? (
          groups
            .filter((g) => g.items.length)
            .map((group) => (
              <div key={group.label} style={{ marginBottom: 26 }}>
                <span className="kicker" style={{ display: 'block', marginBottom: 12 }}>
                  {group.label}
                </span>
                {group.items.map((n) => {
                  const href = n.reference_id ? `/borrowings/${n.reference_id}` : undefined;
                  const content = (
                    <>
                      <span><Icon name={TYPE_ICONS[n.type] ?? 'bell'} size={17} /></span>
                      <div style={{ flex: 1 }}>
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                        <time>{formatRelativeTime(n.created_at)}</time>
                      </div>
                      {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--forest)', marginTop: 6 }} />}
                    </>
                  );
                  return href ? (
                    <Link key={n.id} href={href} className={`notif-item ${n.is_read ? '' : 'unread'}`} onClick={() => void markRead(n)}>
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id} className={`notif-item ${n.is_read ? '' : 'unread'}`} onClick={() => void markRead(n)} style={{ cursor: 'pointer' }}>
                      {content}
                    </div>
                  );
                })}
              </div>
            ))
        ) : (
          <EmptyState icon="bell" title="No notifications yet" text="Updates about your requests, agreements and returns will appear here." />
        )}
      </main>
    </div>
  );
}
