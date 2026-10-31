'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { AppHeader, EmptyState, ItemCard, Spinner } from '@/components/ui';
import { PageHead, RequireAuth } from '@/components/RequireAuth';
import { useApp } from '@/components/AppContext';

export default function SavedPage() {
  return (
    <RequireAuth>
      <SavedInner />
    </RequireAuth>
  );
}

function SavedInner() {
  const { savedIds, toggleSave } = useApp();
  const [saved, setSaved] = useState<api.SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setSaved(await api.listSavedItems());
      setLoading(false);
    })();
  }, [savedIds]);

  return (
    <div className="discover-page">
      <AppHeader />
      <main className="shell page">
        <PageHead kicker="Your shortlist" title="Saved items" text="Things you've saved for later from around your neighbourhood." />
        {loading ? (
          <Spinner />
        ) : saved.length ? (
          <div className="item-grid">
            {saved.map((s) => (s.item ? <ItemCard key={s.id} item={s.item} saved onSave={() => void toggleSave(s.item_id)} /> : null))}
          </div>
        ) : (
          <EmptyState
            icon="heart"
            title="Nothing saved yet"
            text="Tap the heart on any listing to keep it here for later."
            action={
              <Link href="/discover" className="btn btn--primary">
                Discover items
              </Link>
            }
          />
        )}
      </main>
    </div>
  );
}
