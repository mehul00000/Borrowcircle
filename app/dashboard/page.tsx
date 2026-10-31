'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { Icon } from '@/components/Icon';
import { AppHeader, EmptyState, ItemCard, Spinner } from '@/components/ui';
import { PageHead, RequireAuth } from '@/components/RequireAuth';
import { useApp } from '@/components/AppContext';
import { RequestCard } from '@/components/RequestCard';

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}

function DashboardInner() {
  const { user, profile, savedIds, toggleSave } = useApp();
  const [myItems, setMyItems] = useState<api.Item[]>([]);
  const [requests, setRequests] = useState<api.BorrowRequest[]>([]);
  const [saved, setSaved] = useState<api.SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [items, reqs, savedItems] = await Promise.all([
          api.getMyItems(),
          api.listMyRequests({ role: 'all' }),
          api.listSavedItems(),
        ]);
        setMyItems(items);
        setRequests(reqs);
        setSaved(savedItems);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <><AppHeader /><main className="shell page"><Spinner /></main></>;

  const pending = requests.filter((r) => r.status === 'PENDING');
  const active = requests.filter((r) => api.isLiveStatus(r.status) && r.status !== 'PENDING');
  const upcomingReturns = requests.filter((r) => r.status === 'ACTIVE' || r.status === 'OVERDUE');

  return (
    <div className="discover-page">
      <AppHeader />
      <main className="shell page">
        <PageHead
          kicker="Your neighbourhood"
          title={`Good to see you, ${profile?.full_name?.split(' ')[0] ?? 'neighbour'}.`}
          text="Here's what's happening in your BorrowCircle."
          action={
            <Link href="/items/new" className="btn btn--primary">
              List an item <Icon name="arrow" size={17} />
            </Link>
          }
        />

        <div className="stat-grid">
          <div className="stat-card"><span><Icon name="package" /></span><strong>{myItems.length}</strong><small>Active listings</small></div>
          <div className="stat-card"><span><Icon name="calendar" /></span><strong>{pending.length}</strong><small>Pending requests</small></div>
          <div className="stat-card"><span><Icon name="clock" /></span><strong>{active.length}</strong><small>Active borrowings</small></div>
          <div className="stat-card"><span><Icon name="bell" /></span><strong>{upcomingReturns.length}</strong><small>Upcoming returns</small></div>
        </div>

        <div className="dash-grid">
          <div>
            <div className="panel">
              <h3>Recent requests</h3>
              {requests.length ? (
                requests.slice(0, 5).map((r) => <RequestCard key={r.id} request={r} currentUserId={user!.id} />)
              ) : (
                <EmptyState icon="calendar" title="No requests yet" text="Requests you send and receive will appear here." action={<Link href="/discover" className="btn btn--primary">Discover items</Link>} />
              )}
              {requests.length > 5 && (
                <Link href="/requests" className="text-link">View all requests <Icon name="arrow" size={15} /></Link>
              )}
            </div>

            <div className="panel" style={{ marginTop: 18 }}>
              <h3>Your listings</h3>
              {myItems.length ? (
                <>
                  {myItems.slice(0, 4).map((item) => (
                    <div key={item.id} className="request-card" style={{ gridTemplateColumns: '72px 1fr auto' }}>
                      <img className="request-card__img" src={item.image_urls?.[0] ?? ''} alt="" />
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.category?.name}</p>
                      </div>
                      <span className={`badge badge--${item.status.toLowerCase()}`}>{item.status.toLowerCase()}</span>
                    </div>
                  ))}
                  <Link href="/dashboard/listings" className="text-link">Manage all listings <Icon name="arrow" size={15} /></Link>
                </>
              ) : (
                <EmptyState icon="package" title="Nothing listed yet" text="Share an item sitting unused and earn goodwill in your circle." action={<Link href="/items/new" className="btn btn--primary">List an item</Link>} />
              )}
            </div>
          </div>

          <div>
            <div className="panel">
              <h3>Quick actions</h3>
              <div className="quick-actions" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Link href="/items/new"><Icon name="package" />List an item</Link>
                <Link href="/discover"><Icon name="search" />Discover items</Link>
                <Link href="/requests"><Icon name="calendar" />View requests</Link>
                <Link href="/saved"><Icon name="heart" />Saved items</Link>
              </div>
            </div>

            <div className="panel" style={{ marginTop: 18 }}>
              <h3>Saved for later</h3>
              {saved.length ? (
                <div className="item-grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
                  {saved.slice(0, 3).map((s) =>
                    s.item ? <ItemCard key={s.id} item={s.item} saved={savedIds.includes(s.item_id)} onSave={() => void toggleSave(s.item_id)} /> : null,
                  )}
                </div>
              ) : (
                <EmptyState icon="heart" title="No saved items" text="Tap the heart on any listing to keep it here for later." />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
