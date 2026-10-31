'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { Icon } from '@/components/Icon';
import { useApp } from '@/components/AppContext';
import { Button, Footer, ItemCard, LandingHeader, SearchBox } from '@/components/ui';

const images = {
  camera: 'https://images.unsplash.com/photo-1666594113287-a7c4b050f58e?auto=format&fit=crop&w=900&q=85',
  suitcase: 'https://images.unsplash.com/photo-1595475349262-88ba1e1eecaf?auto=format&fit=crop&w=900&q=85',
  community: 'https://images.unsplash.com/photo-1709879057923-9f846b583154?auto=format&fit=crop&w=1400&q=85',
  friends: 'https://images.unsplash.com/photo-1687360441027-27e70655b27e?auto=format&fit=crop&w=1200&q=85',
};

const categories = api.CATEGORY_SHORTCUTS;

export default function LandingPage() {
  const { savedIds, toggleSave, demo } = useApp();
  const [listings, setListings] = useState<api.Item[]>([]);

  useEffect(() => {
    void api.listItems({ limit: 4 }).then(setListings).catch(() => setListings([]));
  }, []);

  return (
    <>
      {demo && <div className="demo-banner">Demo mode — connect Supabase credentials in .env.local for live data. Changes below are stored locally.</div>}
      <LandingHeader />
      <main>
        <section className="hero">
          <div className="shell hero__grid">
            <div className="hero__content">
              <div className="eyebrow">
                <span><Icon name="spark" size={14} /></span> The smarter way to share
              </div>
              <h1>
                Why buy when
                <br />
                you can <em>borrow?</em>
              </h1>
              <p>Discover useful things around you. Borrow from your neighbours, share what you own, and make more out of less.</p>
              <div className="hero__actions">
                <Link href="/discover" className="btn btn--primary">
                  Explore nearby <Icon name="arrow" size={18} />
                </Link>
                <Link href="/items/new" className="btn btn--secondary">
                  Start sharing
                </Link>
              </div>
              <div className="hero__trust">
                <div className="avatars"><span>AM</span><span>RK</span><span>NS</span></div>
                <div>
                  <div className="stars">★★★★★</div>
                  <strong>Trusted by your neighbourhood</strong>
                </div>
              </div>
            </div>
            <div className="hero__visual" aria-label="Borrowable items near you">
              <div className="orbit orbit--one" />
              <div className="orbit orbit--two" />
              <div className="hero-card hero-card--main"><img src={images.camera} alt="Camera available to borrow" /></div>
              <div className="hero-card hero-card--side"><img src={images.suitcase} alt="Travel suitcase available to borrow" /></div>
              <div className="hero-note hero-note--top">
                <span className="hero-note__icon"><Icon name="check" size={18} /></span>
                <span><small>Just listed nearby</small><strong>Camera equipment</strong></span>
              </div>
              <div className="hero-note hero-note--bottom">
                <span className="avatar-photo">M</span>
                <span><strong>Shared by Maya</strong><small><span className="stars">★★★★★</span> 4.9 lender</small></span>
              </div>
            </div>
            <div className="hero__search">
              <SearchBox onSearch={(q) => (window.location.href = `/discover?q=${encodeURIComponent(q)}`)} />
            </div>
          </div>
        </section>

        <section className="proof">
          <div className="shell proof__grid">
            {([
              ['location', 'Hyperlocal by design', 'Find useful things close to home'],
              ['shield', 'Verified profiles', 'A community built on trust'],
              ['calendar', 'Clear borrowing terms', 'Know the dates and details upfront'],
              ['heart', 'Sharing made human', 'Connect with real neighbours'],
            ] as const).map(([icon, title, text]) => (
              <div className="proof__item" key={title}>
                <span><Icon name={icon} /></span>
                <div><strong>{title}</strong><small>{text}</small></div>
              </div>
            ))}
          </div>
        </section>

        <section className="section categories-section" id="categories">
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="kicker">Explore categories</span>
                <h2>Everything you need,<br />closer than you think.</h2>
              </div>
              <Link href="/discover" className="text-link">View all categories <Icon name="arrow" size={17} /></Link>
            </div>
            <div className="category-grid">
              {categories.map((category, i) => (
                <Link key={category.slug} href={`/discover?category=${category.slug}`} className={`category-card category-card--${i + 1}`}>
                  <span className="category-card__icon"><CategoryIcon slug={category.slug} /></span>
                  <span><strong>{category.name}</strong><small>{category.count}</small></span>
                  <Icon name="chevron" size={17} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section how" id="how">
          <div className="shell">
            <div className="how__header">
              <span className="kicker">Simple by nature</span>
              <h2>Borrowing made beautifully easy.</h2>
              <p>From a quick search to a friendly handover, every step is designed around clarity and trust.</p>
            </div>
            <div className="steps">
              {([
                ['search', '01', 'Discover', 'Find useful items available from trusted people in your neighbourhood.'],
                ['calendar', '02', 'Request', 'Pick your dates, review clear terms and send a request to the owner.'],
                ['package', '03', 'Borrow & return', 'Meet nearby, enjoy what you need, and return it when you’re done.'],
              ] as const).map(([icon, no, title, text], i) => (
                <div className="step" key={title}>
                  <div className="step__top">
                    <span className="step__icon"><Icon name={icon} size={25} /></span>
                    <span className="step__number">{no}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  {i < 2 && <span className="step__line"><Icon name="arrow" size={18} /></span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section nearby">
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="kicker">Around your neighbourhood</span>
                <h2>Popular near you</h2>
                <p>Good finds from people in your community.</p>
              </div>
              <Link href="/discover" className="text-link">Browse all items <Icon name="arrow" size={17} /></Link>
            </div>
            <div className="item-grid">
              {listings.map((item) => (
                <ItemCard key={item.id} item={item} saved={savedIds.includes(item.id)} onSave={() => void toggleSave(item.id)} />
              ))}
            </div>
            <p className="sample-note">Sample listings shown for design demonstration.</p>
          </div>
        </section>

        <section className="section community" id="community">
          <div className="shell community__card">
            <div className="community__image">
              <img src={images.community} alt="Neighbours spending time together" />
              <span className="community__quote">“It feels good knowing our things are useful, even when we’re not using them.”</span>
            </div>
            <div className="community__content">
              <span className="kicker kicker--light">Better together</span>
              <h2>More sharing.<br />Less unnecessary buying.</h2>
              <p>
                BorrowCircle helps useful things move through the neighbourhood instead of sitting unused. Every exchange saves money, reduces
                waste, and makes the community a little closer.
              </p>
              <div className="community__metrics">
                <div><strong>Local</strong><span>Connections</span></div>
                <div><strong>Useful</strong><span>Everyday items</span></div>
                <div><strong>Human</strong><span>Shared trust</span></div>
              </div>
              <Link href="/discover" className="btn btn--light">Join your circle <Icon name="arrow" size={18} /></Link>
            </div>
          </div>
        </section>

        <section className="section safety">
          <div className="shell safety__grid">
            <div className="safety__content">
              <span className="kicker">Trust comes first</span>
              <h2>Share with confidence,<br />every step of the way.</h2>
              <p>Thoughtful safeguards keep every borrowing experience clear, respectful and easy to follow.</p>
              <div className="safety__list">
                {([
                  ['shield', 'Verified profiles', 'Know who you’re sharing with before you meet.'],
                  ['calendar', 'Clear agreements', 'Dates, fees and expectations are visible upfront.'],
                  ['camera', 'Condition records', 'Simple photo records protect both sides.'],
                  ['star', 'Community ratings', 'Build trust through thoughtful, honest feedback.'],
                ] as const).map(([icon, title, text]) => (
                  <div key={title}>
                    <span><Icon name={icon} size={20} /></span>
                    <div><strong>{title}</strong><small>{text}</small></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="safety__visual">
              <img src={images.friends} alt="Friends connecting in their neighbourhood" />
              <div className="safety-card">
                <span><Icon name="shield" /></span>
                <div><small>BorrowCircle protected</small><strong>Your trust matters here.</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="shell cta__inner">
            <div>
              <span className="kicker kicker--light">Share what you have</span>
              <h2>That thing sitting unused?<br />Someone nearby needs it.</h2>
            </div>
            <Link href="/items/new" className="btn btn--light">List an item <Icon name="arrow" size={18} /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function CategoryIcon({ slug }: { slug: string }) {
  const map: Record<string, Parameters<typeof Icon>[0]['name']> = {
    photography: 'camera',
    'tools-and-hardware': 'tool',
    electronics: 'spark',
    'books-and-study-material': 'book',
    'sports-and-fitness': 'star',
    'travel-and-luggage': 'package',
  };
  return <Icon name={map[slug] ?? 'package'} size={24} />;
}
