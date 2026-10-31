'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState, type ReactNode } from 'react';
import * as api from '@borrowcircle/shared';
import { initials } from '@borrowcircle/shared';
import { Icon } from '@/components/Icon';
import { useApp } from '@/components/AppContext';
import { itemImageUrl } from '@/lib/backend';

// ---------------------------------------------------------------------------
// Primitives ported from the original design (App.tsx / index.css)
// ---------------------------------------------------------------------------

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className={`logo ${inverse ? 'logo--inverse' : ''}`} aria-label="BorrowCircle home">
      <span className="logo__mark"><span /><span /></span>
      <span>BorrowCircle</span>
    </Link>
  );
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'light' | 'ghost';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`btn btn--${variant} ${className}`}>
      {children}
    </button>
  );
}

export function SearchBox({ compact = false, onSearch, initialQuery = '' }: { compact?: boolean; onSearch: (query: string) => void; initialQuery?: string }) {
  const [value, setValue] = useState(initialQuery);
  function submit(e: FormEvent) {
    e.preventDefault();
    onSearch(value);
  }
  return (
    <form className={`searchbox ${compact ? 'searchbox--compact' : ''}`} onSubmit={submit}>
      <div className="searchbox__field">
        <Icon name="search" />
        <div>
          {!compact && <span>What do you need?</span>}
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search cameras, tools, books..." aria-label="Search items" />
        </div>
      </div>
      {!compact && (
        <div className="searchbox__location">
          <Icon name="location" />
          <div>
            <span>Your area</span>
            <strong>RK Puram, Delhi</strong>
          </div>
        </div>
      )}
      <Button type="submit">
        <Icon name="search" size={18} />
        <span>Search</span>
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Item card — used on landing, discover, saved, dashboard
// ---------------------------------------------------------------------------

export function ItemCard({ item, saved, onSave }: { item: api.Item; saved: boolean; onSave: () => void }) {
  const image = itemImageUrl(item.image_urls?.[0] ?? item.images?.[0]?.storage_path);
  return (
    <article className="item-card">
      <Link href={`/items/${item.id}`} className="item-card__image" aria-label={`View ${item.title}`}>
        {image && <img src={image} alt={item.title} />}
        <span className={`availability ${item.status !== 'ACTIVE' ? 'availability--busy' : ''}`}>
          {item.status === 'ACTIVE' ? 'Available now' : 'Currently out'}
        </span>
      </Link>
      <button className={`save-btn ${saved ? 'save-btn--active' : ''}`} onClick={onSave} aria-label={saved ? 'Remove from saved' : 'Save item'}>
        <Icon name="heart" size={18} filled={saved} />
      </button>
      <Link href={`/items/${item.id}`} className="item-card__body">
        <span className="item-card__category">
          {item.category?.name} · {item.location_label ?? 'Nearby'}
        </span>
        <strong>{item.title}</strong>
        <span className="item-card__condition">{item.condition} condition</span>
        <span className="item-card__footer">
          <strong>
            {item.borrowing_fee === 0 ? 'Free' : `₹${Math.round(item.borrowing_fee / 100)}`}
            <small>/day</small>
          </strong>
          <span>
            <Icon name="star" size={14} filled /> {item.owner?.rating_avg ? item.owner.rating_avg.toFixed(1) : 'New'}
          </span>
        </span>
      </Link>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Headers & footer
// ---------------------------------------------------------------------------

export function LandingHeader() {
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="shell header__inner">
        <Logo />
        <nav className="nav" aria-label="Primary navigation">
          <Link href="/discover">Discover</Link>
          <a href="/#how">How it works</a>
          <a href="/#categories">Categories</a>
          <a href="/#community">About</a>
        </nav>
        <div className="header__actions">
          {user ? (
            <Link href="/dashboard" className="login-btn">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="login-btn">
              Log in
            </Link>
          )}
          <Link href="/discover" className="btn btn--primary">
            Get started <Icon name="arrow" size={17} />
          </Link>
        </div>
        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <Icon name={open ? 'x' : 'menu'} />
        </button>
      </div>
      {open && (
        <div className="mobile-menu">
          <Link href="/discover" onClick={() => setOpen(false)}>Discover</Link>
          <a href="/#how" onClick={() => setOpen(false)}>How it works</a>
          <a href="/#categories" onClick={() => setOpen(false)}>Categories</a>
          {user ? (
            <Link href="/dashboard" onClick={() => setOpen(false)} className="btn btn--primary">Go to dashboard</Link>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="btn btn--primary">Explore nearby</Link>
          )}
        </div>
      )}
    </header>
  );
}

export function AppHeader() {
  const { user, profile, unreadCount, demo, signOut } = useApp();
  const router = useRouter();
  return (
    <header className="app-header">
      <div className="shell header__inner">
        <Logo />
        <nav className="app-nav">
          <Link href="/discover">Discover</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/requests">Requests</Link>
          <Link href="/items/new">List an item</Link>
        </nav>
        <div className="header__actions">
          {demo && <Link href="/settings" className="badge badge--active">Demo mode</Link>}
          <Link href="/notifications" className="icon-button" aria-label="Notifications" style={{ position: 'relative' }}>
            <Icon name="bell" size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16, borderRadius: 99,
                  background: '#c94d4d', color: 'white', fontSize: 9, fontWeight: 700, display: 'grid', placeItems: 'center', padding: '0 4px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </Link>
          <Link href={user ? `/profile/${user.id}` : '/login'} className="profile-chip">
            <span className="avatar-circle" style={{ width: 35, height: 35, fontSize: 10 }}>
              {initials(profile?.full_name ?? 'BC')}
            </span>
            <strong>{profile?.full_name?.split(' ')[0] ?? 'Account'}</strong>
          </Link>
          {user && (
            <button
              className="login-btn"
              onClick={async () => {
                await signOut();
                router.push('/');
              }}
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__grid">
        <div className="footer__brand">
          <Logo inverse />
          <p>A community that shares instead of buys. Find what you need, right around the corner.</p>
          <small>Illustrative product concept · BorrowCircle © 2025</small>
        </div>
        <div>
          <strong>Explore</strong>
          <Link href="/discover">Discover</Link>
          <a href="/#how">How it works</a>
          <a href="/#categories">Categories</a>
        </div>
        <div>
          <strong>Community</strong>
          <a href="/#community">About us</a>
          <a href="/#community">Trust &amp; safety</a>
          <a href="/#community">Help centre</a>
        </div>
        <div>
          <strong>Legal</strong>
          <a href="/#community">Privacy</a>
          <a href="/#community">Terms</a>
          <a href="/#community">Community rules</a>
        </div>
      </div>
    </footer>
  );
}

export function EmptyState({ icon = 'search', title, text, action }: { icon?: Parameters<typeof Icon>[0]['name']; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <span><Icon name={icon} size={28} /></span>
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <p style={{ color: 'var(--muted)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>{label}…</p>;
}
