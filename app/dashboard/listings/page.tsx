'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { Icon } from '@/components/Icon';
import { AppHeader, Button, EmptyState, Spinner } from '@/components/ui';
import { PageHead, RequireAuth } from '@/components/RequireAuth';
import { useApp } from '@/components/AppContext';
import { itemImageUrl } from '@/lib/backend';

export default function MyListingsPage() {
  return (
    <RequireAuth>
      <ListingsInner />
    </RequireAuth>
  );
}

function ListingsInner() {
  const { showToast } = useApp();
  const [items, setItems] = useState<api.Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  useEffect(() => {
    void api.getMyItems().then(setItems).finally(() => setLoading(false));
  }, []);

  async function setStatus(item: api.Item, status: api.Item['status'], message: string) {
    setBusy(item.id);
    try {
      await api.updateItemStatus(item.id, status);
      setItems((list) => list.map((i) => (i.id === item.id ? { ...i, status } : i)));
      showToast(message);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update the listing');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="discover-page">
      <AppHeader />
      <main className="shell page">
        <PageHead
          kicker="Your listings"
          title="Manage listings"
          action={
            <Link href="/items/new" className="btn btn--primary">
              New listing <Icon name="arrow" size={17} />
            </Link>
          }
        />
        {loading ? (
          <Spinner />
        ) : items.length ? (
          items.map((item) => (
            <div key={item.id} className="request-card">
              <img className="request-card__img" src={itemImageUrl(item.image_urls?.[0] ?? item.images?.[0]?.storage_path)} alt="" />
              <div>
                <h4>{item.title}</h4>
                <p>
                  {item.category?.name} · {item.condition} · ₹{Math.round(item.borrowing_fee / 100)}/day
                </p>
              </div>
              <div className="request-card__right">
                <span className={`badge badge--${item.status.toLowerCase()}`}>{item.status.toLowerCase()}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/items/${item.id}`} className="text-link" style={{ padding: 0 }}>
                    View
                  </Link>
                  {item.status === 'ACTIVE' && (
                    <Button variant="secondary" disabled={busy === item.id} onClick={() => void setStatus(item, 'PAUSED', 'Listing paused')}>
                      Pause
                    </Button>
                  )}
                  {item.status === 'PAUSED' && (
                    <Button disabled={busy === item.id} onClick={() => void setStatus(item, 'ACTIVE', 'Listing reactivated')}>
                      Reactivate
                    </Button>
                  )}
                  {['ACTIVE', 'PAUSED', 'DRAFT'].includes(item.status) && (
                    <Button variant="ghost" disabled={busy === item.id} onClick={() => void setStatus(item, 'REMOVED', 'Listing removed')}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon="package"
            title="No listings yet"
            text="Share something useful with your neighbours."
            action={
              <Link href="/items/new" className="btn btn--primary">
                List an item
              </Link>
            }
          />
        )}
      </main>
    </div>
  );
}
