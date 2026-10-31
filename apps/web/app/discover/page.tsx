'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { Icon } from '@/components/Icon';
import { AppHeader, Button, EmptyState, ItemCard, SearchBox, Spinner } from '@/components/ui';
import { useApp } from '@/components/AppContext';

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'nearest', label: 'Nearest first' },
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'newest', label: 'Recently listed' },
] as const;

function DiscoverInner() {
  const params = useSearchParams();
  const { savedIds, toggleSave, demo } = useApp();
  const [query, setQuery] = useState('');
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [sort, setSort] = useState<(typeof SORTS)[number]['value']>('recommended');
  const [maxFee, setMaxFee] = useState<number | null>(null);
  const [items, setItems] = useState<api.Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = params.get('q');
    const c = params.get('category');
    if (q) setQuery(q);
    if (c) setCategorySlug(c);
  }, [params]);

  useEffect(() => {
    void api.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    void api
      .listItems({ query, categorySlug, sort, maxFee })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [query, categorySlug, sort, maxFee]);

  const activeCategory = useMemo(() => categories.find((c) => c.slug === categorySlug)?.name ?? null, [categories, categorySlug]);

  return (
    <div className="discover-page">
      <AppHeader />
      <main className="shell discover">
        <div className="discover__title">
          <div>
            <span className="kicker">Discover nearby</span>
            <h1>Find something useful.</h1>
            <p>Borrow from verified people around RK Puram, Delhi{demo ? ' (demo data)' : ''}.</p>
          </div>
          <button className="location-pill">
            <Icon name="location" size={17} /> RK Puram <Icon name="chevron" size={15} />
          </button>
        </div>

        <SearchBox compact initialQuery={query} onSearch={(v) => setQuery(v)} />

        <div className="filter-row">
          <div className="chips">
            <button className={!categorySlug ? 'chip chip--active' : 'chip'} onClick={() => setCategorySlug(null)}>
              All
            </button>
            {categories.map((c) => (
              <button key={c.id} className={categorySlug === c.slug ? 'chip chip--active' : 'chip'} onClick={() => setCategorySlug(c.slug)}>
                {c.name}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort items">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-row" style={{ marginTop: -6 }}>
          <div className="chips">
            {[null, 3000, 10000, 15000].map((fee) => (
              <button key={String(fee)} className={maxFee === fee ? 'chip chip--active' : 'chip'} onClick={() => setMaxFee(fee)}>
                {fee == null ? 'Any price' : `Up to ₹${fee / 100}/day`}
              </button>
            ))}
          </div>
        </div>

        <div className="results-bar">
          <strong>{loading ? 'Searching…' : `${items.length} useful things nearby`}</strong>
          <span>Exact locations are only shared after a request is accepted.</span>
        </div>

        {loading ? (
          <Spinner label="Finding items nearby" />
        ) : items.length ? (
          <div className="item-grid item-grid--discover">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} saved={savedIds.includes(item.id)} onSave={() => void toggleSave(item.id)} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No items found nearby"
            text={activeCategory ? `Nothing under ${activeCategory} right now. Try another category or clear your filters.` : 'Try changing your search or choosing another category.'}
            action={
              <Button
                onClick={() => {
                  setQuery('');
                  setCategorySlug(null);
                  setMaxFee(null);
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
      </main>
      <nav className="bottom-nav">
        <Link href="/"><Icon name="home" /><span>Home</span></Link>
        <Link href="/discover" className="active"><Icon name="search" /><span>Discover</span></Link>
        <Link href="/requests"><Icon name="calendar" /><span>Activity</span></Link>
        <Link href="/saved"><Icon name="heart" /><span>Saved</span></Link>
        <Link href="/dashboard"><Icon name="user" /><span>Profile</span></Link>
      </nav>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <DiscoverInner />
    </Suspense>
  );
}
