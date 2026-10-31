'use client';

import { useEffect, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { AppHeader, EmptyState, Spinner } from '@/components/ui';
import { PageHead, RequireAuth } from '@/components/RequireAuth';
import { RequestCard } from '@/components/RequestCard';
import { useApp } from '@/components/AppContext';

type Tab = 'received' | 'sent' | 'history';

export default function RequestsPage() {
  return (
    <RequireAuth>
      <RequestsInner />
    </RequireAuth>
  );
}

function RequestsInner() {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>('received');
  const [requests, setRequests] = useState<api.BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void (async () => {
      try {
        if (tab === 'history') {
          const all = await api.listMyRequests({ role: 'all' });
          setRequests(all.filter((r) => !api.isLiveStatus(r.status)));
        } else {
          setRequests(await api.listMyRequests({ role: tab === 'received' ? 'lender' : 'borrower' }));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [tab, user]);

  return (
    <div className="discover-page">
      <AppHeader />
      <main className="shell page">
        <PageHead kicker="Activity" title="Borrowing requests" text="Manage what you've requested and what neighbours have requested from you." />
        <div className="tabs">
          {(
            [
              ['received', 'Received'],
              ['sent', 'Sent'],
              ['history', 'History'],
            ] as const
          ).map(([key, label]) => (
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>
        {loading ? (
          <Spinner />
        ) : requests.length ? (
          requests.map((r) => <RequestCard key={r.id} request={r} currentUserId={user!.id} />)
        ) : (
          <EmptyState
            icon="calendar"
            title={tab === 'received' ? 'No requests received' : tab === 'sent' ? 'No requests sent' : 'No past transactions'}
            text={
              tab === 'received'
                ? 'When someone requests one of your listings it will show up here.'
                : tab === 'sent'
                  ? 'Find something useful nearby and send your first request.'
                  : 'Completed, declined and cancelled transactions will appear here.'
            }
          />
        )}
      </main>
    </div>
  );
}
