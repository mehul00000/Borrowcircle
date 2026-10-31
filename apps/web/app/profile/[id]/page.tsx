'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { formatDate, initials, ratingLabel } from '@borrowcircle/shared';
import { Icon } from '@/components/Icon';
import { AppHeader, EmptyState, Spinner } from '@/components/ui';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<api.PublicProfile | null>(null);
  const [reviews, setReviews] = useState<api.Review[]>([]);
  const [listings, setListings] = useState<api.Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const p = await api.getPublicProfile(id);
        setProfile(p);
        if (p) {
          const [r, items] = await Promise.all([api.listReviewsForUser(id), api.listItems({ limit: 60 })]);
          setReviews(r);
          setListings(items.filter((i) => i.owner_id === id));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <><AppHeader /><main className="shell page"><Spinner /></main></>;
  if (!profile) {
    return (
      <div className="discover-page">
        <AppHeader />
        <main className="shell page">
          <EmptyState icon="user" title="Profile not found" text="This member may have deactivated their account." />
        </main>
      </div>
    );
  }

  return (
    <div className="discover-page">
      <AppHeader />
      <main className="shell page">
        <div className="profile-hero">
          <span className="avatar-circle">
            {initials(profile.full_name)}
          </span>
          <div>
            <h1>
              {profile.full_name} {profile.is_verified && <Icon name="check" size={20} />}
            </h1>
            <p>
              {ratingLabel(profile.rating_avg, profile.rating_count)} · {profile.locality ? `${profile.locality}, ` : ''}
              {profile.city} · Member since {profile.created_at ? formatDate(profile.created_at) : 'recently'}
            </p>
            {profile.bio && <p style={{ marginTop: 8, maxWidth: 520 }}>{profile.bio}</p>}
          </div>
        </div>

        <div className="dash-grid">
          <div className="panel">
            <h3>Listings by {profile.full_name.split(' ')[0]}</h3>
            {listings.length ? (
              <div className="item-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {listings.map((item) => (
                  <Link key={item.id} href={`/items/${item.id}`} className="request-card" style={{ gridTemplateColumns: '64px 1fr' }}>
                    {item.image_urls?.[0] && <img className="request-card__img" style={{ width: 64, height: 64 }} src={item.image_urls[0]} alt="" />}
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.condition} condition</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon="package" title="No active listings" text="This member hasn't listed anything yet." />
            )}
          </div>
          <div className="panel">
            <h3>Reviews ({reviews.length})</h3>
            {reviews.length ? (
              reviews.map((r) => (
                <div key={r.id} className="notif-item">
                  <span><Icon name="star" size={16} /></span>
                  <div>
                    <strong>
                      {r.rating}/5 · {r.reviewer?.full_name}
                    </strong>
                    <p>{r.comment ?? 'No comment added.'}</p>
                    <time>{formatDate(r.created_at)}</time>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: 12 }}>No reviews yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
