import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

type IconName =
  | 'arrow'
  | 'book'
  | 'calendar'
  | 'camera'
  | 'check'
  | 'chevron'
  | 'heart'
  | 'home'
  | 'location'
  | 'menu'
  | 'package'
  | 'search'
  | 'shield'
  | 'spark'
  | 'star'
  | 'tool'
  | 'user'
  | 'x';

function Icon({ name, size = 20, filled = false }: { name: IconName; size?: number; filled?: boolean }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
    calendar: <><path d="M8 2v4M16 2v4M3 10h18" /><rect x="3" y="4" width="18" height="18" rx="3" /></>,
    camera: <><path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z" /><circle cx="12" cy="13" r="3.5" /></>,
    check: <><path d="m6 12 4 4 8-9" /><circle cx="12" cy="12" r="10" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    heart: <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.4 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-6h6v6" /></>,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    package: <><path d="m3 7 9 5 9-5-9-5-9 5Z" /><path d="m3 7 9 5v10l-9-5V7ZM21 7l-9 5v10l9-5V7Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    spark: <><path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3Z" /><path d="m5 15-.8 2.2L2 18l2.2.8L5 21l.8-2.2L8 18l-2.2-.8L5 15Z" /></>,
    star: <path d="m12 2 3 6 6.5.9-4.7 4.6 1.1 6.5-5.9-3.1L6.1 20l1.1-6.5-4.7-4.6L9 8l3-6Z" />,
    tool: <><path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L20 16.4a2.3 2.3 0 0 1-3.3 3.3L9 12" /><path d="m5 14-3 3 5 5 3-3" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    x: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const images = {
  tripod: 'https://images.unsplash.com/photo-1792228170620-601f5f8c3248?auto=format&fit=crop&w=900&q=85',
  camera: 'https://images.unsplash.com/photo-1666594113287-a7c4b050f58e?auto=format&fit=crop&w=900&q=85',
  controller: 'https://images.unsplash.com/photo-1666594113162-36ff41b879df?auto=format&fit=crop&w=900&q=85',
  suitcase: 'https://images.unsplash.com/photo-1595475349262-88ba1e1eecaf?auto=format&fit=crop&w=900&q=85',
  tent: 'https://images.unsplash.com/photo-1663958211279-38c0f1d6f02c?auto=format&fit=crop&w=900&q=85',
  projector: 'https://images.unsplash.com/photo-1711549052851-8db1b4cca67f?auto=format&fit=crop&w=900&q=85',
  community: 'https://images.unsplash.com/photo-1709879057923-9f846b583154?auto=format&fit=crop&w=1400&q=85',
  friends: 'https://images.unsplash.com/photo-1687360441027-27e70655b27e?auto=format&fit=crop&w=1200&q=85',
};

const listings = [
  { id: 1, title: 'Sony Camera Tripod', category: 'Photography', distance: '1.2 km', price: '₹50', rating: '4.9', condition: 'Good', image: images.tripod, available: true },
  { id: 2, title: 'Cordless Drill Machine', category: 'Tools', distance: '2.1 km', price: '₹80', rating: '4.8', condition: 'Like new', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85', available: true },
  { id: 3, title: 'Camping Tent for Four', category: 'Travel', distance: '3.4 km', price: '₹120', rating: '4.7', condition: 'Good', image: images.tent, available: true },
  { id: 4, title: 'Portable HD Projector', category: 'Electronics', distance: '1.8 km', price: '₹150', rating: '5.0', condition: 'Like new', image: images.projector, available: true },
  { id: 5, title: 'DualSense Controller', category: 'Gaming', distance: '1.5 km', price: '₹70', rating: '4.9', condition: 'Like new', image: images.controller, available: false },
  { id: 6, title: 'Cabin Travel Suitcase', category: 'Travel', distance: '2.5 km', price: '₹60', rating: '4.6', condition: 'Good', image: images.suitcase, available: true },
];

const categories = [
  { name: 'Photography', icon: 'camera' as IconName, count: '86 items' },
  { name: 'Tools', icon: 'tool' as IconName, count: '124 items' },
  { name: 'Electronics', icon: 'spark' as IconName, count: '98 items' },
  { name: 'Books', icon: 'book' as IconName, count: '210 items' },
  { name: 'Travel', icon: 'package' as IconName, count: '74 items' },
  { name: 'Sports', icon: 'star' as IconName, count: '112 items' },
];

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <button className={`logo ${inverse ? 'logo--inverse' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="BorrowCircle home">
      <span className="logo__mark"><span /><span /></span>
      <span>BorrowCircle</span>
    </button>
  );
}

function Button({ children, variant = 'primary', className = '', onClick, type = 'button' }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'light' | 'ghost'; className?: string; onClick?: () => void; type?: 'button' | 'submit' }) {
  return <button type={type} onClick={onClick} className={`btn btn--${variant} ${className}`}>{children}</button>;
}

function Header({ goDiscover }: { goDiscover: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="shell header__inner">
        <Logo />
        <nav className="nav" aria-label="Primary navigation">
          <button onClick={goDiscover}>Discover</button>
          <a href="#how">How it works</a>
          <a href="#categories">Categories</a>
          <a href="#community">About</a>
        </nav>
        <div className="header__actions">
          <button className="login-btn">Log in</button>
          <Button onClick={goDiscover}>Get started <Icon name="arrow" size={17} /></Button>
        </div>
        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu"><Icon name={open ? 'x' : 'menu'} /></button>
      </div>
      {open && <div className="mobile-menu">
        <button onClick={() => { goDiscover(); setOpen(false); }}>Discover</button>
        <a href="#how" onClick={() => setOpen(false)}>How it works</a>
        <a href="#categories" onClick={() => setOpen(false)}>Categories</a>
        <Button onClick={goDiscover}>Explore nearby</Button>
      </div>}
    </header>
  );
}

function SearchBox({ compact = false, onSearch }: { compact?: boolean; onSearch: (query: string) => void }) {
  const [value, setValue] = useState('');
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
      {!compact && <div className="searchbox__location"><Icon name="location" /><div><span>Your area</span><strong>RK Puram, Delhi</strong></div></div>}
      <Button type="submit"><Icon name="search" size={18} /><span>Search</span></Button>
    </form>
  );
}

function ItemCard({ item, onOpen, saved, onSave }: { item: typeof listings[number]; onOpen: () => void; saved: boolean; onSave: () => void }) {
  return (
    <article className="item-card">
      <button className="item-card__image" onClick={onOpen} aria-label={`View ${item.title}`}>
        <img src={item.image} alt={item.title} />
        <span className={`availability ${!item.available ? 'availability--busy' : ''}`}>{item.available ? 'Available now' : 'Available Monday'}</span>
      </button>
      <button className={`save-btn ${saved ? 'save-btn--active' : ''}`} onClick={onSave} aria-label={saved ? 'Remove from saved' : 'Save item'}><Icon name="heart" size={18} filled={saved} /></button>
      <button className="item-card__body" onClick={onOpen}>
        <span className="item-card__category">{item.category} · {item.distance} away</span>
        <strong>{item.title}</strong>
        <span className="item-card__condition">{item.condition} condition</span>
        <span className="item-card__footer"><strong>{item.price}<small>/day</small></strong><span><Icon name="star" size={14} filled /> {item.rating}</span></span>
      </button>
    </article>
  );
}

function Landing({ goDiscover, openItem, saved, toggleSave }: { goDiscover: (query?: string) => void; openItem: (id: number) => void; saved: number[]; toggleSave: (id: number) => void }) {
  return (
    <>
      <Header goDiscover={() => goDiscover()} />
      <main>
        <section className="hero">
          <div className="shell hero__grid">
            <div className="hero__content">
              <div className="eyebrow"><span><Icon name="spark" size={14} /></span> The smarter way to share</div>
              <h1>Why buy when<br />you can <em>borrow?</em></h1>
              <p>Discover useful things around you. Borrow from your neighbours, share what you own, and make more out of less.</p>
              <div className="hero__actions">
                <Button onClick={() => goDiscover()}>Explore nearby <Icon name="arrow" size={18} /></Button>
                <Button variant="secondary">Start sharing</Button>
              </div>
              <div className="hero__trust">
                <div className="avatars"><span>AM</span><span>RK</span><span>NS</span></div>
                <div><div className="stars">★★★★★</div><strong>Trusted by your neighbourhood</strong></div>
              </div>
            </div>
            <div className="hero__visual" aria-label="Borrowable items near you">
              <div className="hero-card hero-card--main"><img src={images.camera} alt="Camera available to borrow" /></div>
              <div className="hero-card hero-card--side"><img src={images.suitcase} alt="Travel suitcase available to borrow" /></div>
              <div className="hero-note hero-note--top"><span className="hero-note__icon"><Icon name="check" size={18} /></span><span><small>Just listed nearby</small><strong>Camera equipment</strong></span></div>
              <div className="hero-note hero-note--bottom"><span className="avatar-photo">M</span><span><strong>Shared by Maya</strong><small><span className="stars">★★★★★</span> 4.9 lender</small></span></div>
              <div className="orbit orbit--one" /><div className="orbit orbit--two" />
            </div>
            <div className="hero__search"><SearchBox onSearch={goDiscover} /></div>
          </div>
        </section>

        <section className="proof">
          <div className="shell proof__grid">
            {[['location', 'Hyperlocal by design', 'Find useful things close to home'], ['shield', 'Verified profiles', 'A community built on trust'], ['calendar', 'Clear borrowing terms', 'Know the dates and details upfront'], ['heart', 'Sharing made human', 'Connect with real neighbours']].map(([icon, title, text]) =>
              <div className="proof__item" key={title}><span><Icon name={icon as IconName} /></span><div><strong>{title}</strong><small>{text}</small></div></div>
            )}
          </div>
        </section>

        <section className="section categories-section" id="categories">
          <div className="shell">
            <div className="section-heading">
              <div><span className="kicker">Explore categories</span><h2>Everything you need,<br />closer than you think.</h2></div>
              <button className="text-link" onClick={() => goDiscover()}>View all categories <Icon name="arrow" size={17} /></button>
            </div>
            <div className="category-grid">
              {categories.map((category, i) => <button key={category.name} className={`category-card category-card--${i + 1}`} onClick={() => goDiscover(category.name)}>
                <span className="category-card__icon"><Icon name={category.icon} size={24} /></span>
                <span><strong>{category.name}</strong><small>{category.count}</small></span>
                <Icon name="chevron" size={17} />
              </button>)}
            </div>
          </div>
        </section>

        <section className="section how" id="how">
          <div className="shell">
            <div className="how__header"><span className="kicker">Simple by nature</span><h2>Borrowing made beautifully easy.</h2><p>From a quick search to a friendly handover, every step is designed around clarity and trust.</p></div>
            <div className="steps">
              {[['search', '01', 'Discover', 'Find useful items available from trusted people in your neighbourhood.'], ['calendar', '02', 'Request', 'Pick your dates, review clear terms and send a request to the owner.'], ['package', '03', 'Borrow & return', 'Meet nearby, enjoy what you need, and return it when you’re done.']].map(([icon, no, title, text], i) =>
                <div className="step" key={title}><div className="step__top"><span className="step__icon"><Icon name={icon as IconName} size={25} /></span><span className="step__number">{no}</span></div><h3>{title}</h3><p>{text}</p>{i < 2 && <span className="step__line"><Icon name="arrow" size={18} /></span>}</div>
              )}
            </div>
          </div>
        </section>

        <section className="section nearby">
          <div className="shell">
            <div className="section-heading">
              <div><span className="kicker">Around your neighbourhood</span><h2>Popular near you</h2><p>Good finds from people in your community.</p></div>
              <button className="text-link" onClick={() => goDiscover()}>Browse all items <Icon name="arrow" size={17} /></button>
            </div>
            <div className="item-grid">{listings.slice(0, 4).map(item => <ItemCard key={item.id} item={item} onOpen={() => openItem(item.id)} saved={saved.includes(item.id)} onSave={() => toggleSave(item.id)} />)}</div>
            <p className="sample-note">Sample listings shown for design demonstration.</p>
          </div>
        </section>

        <section className="section community" id="community">
          <div className="shell community__card">
            <div className="community__image"><img src={images.community} alt="Neighbours spending time together" /><span className="community__quote">“It feels good knowing our things are useful, even when we’re not using them.”</span></div>
            <div className="community__content"><span className="kicker kicker--light">Better together</span><h2>More sharing.<br />Less unnecessary buying.</h2><p>BorrowCircle helps useful things move through the neighbourhood instead of sitting unused. Every exchange saves money, reduces waste, and makes the community a little closer.</p><div className="community__metrics"><div><strong>Local</strong><span>Connections</span></div><div><strong>Useful</strong><span>Everyday items</span></div><div><strong>Human</strong><span>Shared trust</span></div></div><Button variant="light" onClick={() => goDiscover()}>Join your circle <Icon name="arrow" size={18} /></Button></div>
          </div>
        </section>

        <section className="section safety">
          <div className="shell safety__grid">
            <div className="safety__content"><span className="kicker">Trust comes first</span><h2>Share with confidence,<br />every step of the way.</h2><p>Thoughtful safeguards keep every borrowing experience clear, respectful and easy to follow.</p>
              <div className="safety__list">{[['shield', 'Verified profiles', 'Know who you’re sharing with before you meet.'], ['calendar', 'Clear agreements', 'Dates, fees and expectations are visible upfront.'], ['camera', 'Condition records', 'Simple photo records protect both sides.'], ['star', 'Community ratings', 'Build trust through thoughtful, honest feedback.']].map(([icon, title, text]) => <div key={title}><span><Icon name={icon as IconName} size={20} /></span><div><strong>{title}</strong><small>{text}</small></div></div>)}</div>
            </div>
            <div className="safety__visual"><img src={images.friends} alt="Friends connecting in their neighbourhood" /><div className="safety-card"><span><Icon name="shield" /></span><div><small>BorrowCircle protected</small><strong>Your trust matters here.</strong></div></div></div>
          </div>
        </section>

        <section className="cta"><div className="shell cta__inner"><div><span className="kicker kicker--light">Share what you have</span><h2>That thing sitting unused?<br />Someone nearby needs it.</h2></div><Button variant="light">List an item <Icon name="arrow" size={18} /></Button></div></section>
      </main>
      <Footer />
    </>
  );
}

function Footer() {
  return <footer className="footer"><div className="shell footer__grid"><div className="footer__brand"><Logo inverse /><p>A community that shares instead of buys. Find what you need, right around the corner.</p><small>Illustrative product concept · BorrowCircle © 2025</small></div><div><strong>Explore</strong><a href="#categories">Discover</a><a href="#how">How it works</a><a href="#community">Categories</a></div><div><strong>Community</strong><a href="#community">About us</a><a href="#community">Trust & safety</a><a href="#community">Help centre</a></div><div><strong>Legal</strong><a href="#community">Privacy</a><a href="#community">Terms</a><a href="#community">Community rules</a></div></div></footer>;
}

function Discover({ initialQuery, goHome, openItem, saved, toggleSave }: { initialQuery: string; goHome: () => void; openItem: (id: number) => void; saved: number[]; toggleSave: (id: number) => void }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialQuery || 'All');
  const [sort, setSort] = useState('Recommended');
  const results = useMemo(() => listings.filter(item => {
    const q = query.toLowerCase();
    return (category === 'All' || item.category === category) && (!q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }), [query, category]);
  return (
    <div className="discover-page">
      <header className="header"><div className="shell header__inner"><Logo /><button className="back-home" onClick={goHome}>Home</button><div className="header__actions"><button className="icon-button"><Icon name="heart" /></button><button className="profile-chip"><span>AS</span><strong>Alex</strong></button></div></div></header>
      <main className="shell discover">
        <div className="discover__title"><div><span className="kicker">Discover nearby</span><h1>Find something useful.</h1><p>Borrow from verified people around RK Puram, Delhi.</p></div><button className="location-pill"><Icon name="location" size={17} /> RK Puram <Icon name="chevron" size={15} /></button></div>
        <SearchBox compact onSearch={(value) => setQuery(value)} />
        <div className="filter-row">
          <div className="chips">{['All', ...categories.map(c => c.name)].map(c => <button key={c} className={category === c ? 'chip chip--active' : 'chip'} onClick={() => { setCategory(c); setQuery(c === 'All' ? '' : c); }}>{c}</button>)}</div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort items"><option>Recommended</option><option>Nearest first</option><option>Lowest price</option></select>
        </div>
        <div className="results-bar"><strong>{results.length} useful things nearby</strong><span>Exact locations are only shared after a request is accepted.</span></div>
        {results.length ? <div className="item-grid item-grid--discover">{results.map(item => <ItemCard key={item.id} item={item} onOpen={() => openItem(item.id)} saved={saved.includes(item.id)} onSave={() => toggleSave(item.id)} />)}</div> :
          <div className="empty"><span><Icon name="search" size={28} /></span><h2>No items found nearby</h2><p>Try changing your search or choosing another category.</p><Button onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters</Button></div>}
      </main>
      <nav className="bottom-nav"><button onClick={goHome}><Icon name="home" /><span>Home</span></button><button className="active"><Icon name="search" /><span>Discover</span></button><button><Icon name="calendar" /><span>Activity</span></button><button><Icon name="heart" /><span>Saved</span></button><button><Icon name="user" /><span>Profile</span></button></nav>
    </div>
  );
}

function ItemSheet({ item, onClose, saved, onSave, notify }: { item: typeof listings[number]; onClose: () => void; saved: boolean; onSave: () => void; notify: () => void }) {
  useEffect(() => {
    const close = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="item-sheet" onMouseDown={(e) => e.stopPropagation()} aria-modal="true" role="dialog">
    <button className="sheet-close" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
    <div className="sheet-image"><img src={item.image} alt={item.title} /><span className="availability">Available now</span></div>
    <div className="sheet-content"><span className="kicker">{item.category} · {item.distance} away</span><h2>{item.title}</h2><div className="sheet-meta"><span><Icon name="star" size={15} filled /> {item.rating} · 28 reviews</span><span>{item.condition} condition</span></div>
      <p>A well-cared-for item, ready to help with your next project. Includes all standard accessories and a quick handover guide.</p>
      <div className="lender"><span>MK</span><div><small>Shared by</small><strong>Maya Kapoor <Icon name="check" size={15} /></strong></div><span>Verified lender</span></div>
      <div className="date-grid"><label>Start date<input type="date" /></label><label>Return date<input type="date" /></label></div>
      <div className="estimate"><span><small>Estimated borrowing fee</small><strong>3 days × {item.price}</strong></span><strong>{item.price === '₹150' ? '₹450' : item.price === '₹120' ? '₹360' : '₹150'}</strong></div>
      <div className="sheet-actions"><Button onClick={notify}>Request to borrow <Icon name="arrow" size={18} /></Button><Button variant="secondary" onClick={onSave}><Icon name="heart" size={18} filled={saved} /> {saved ? 'Saved' : 'Save item'}</Button></div>
    </div>
  </section></div>;
}

export default function App() {
  const [page, setPage] = useState<'home' | 'discover'>('home');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState<number[]>([]);
  const [toast, setToast] = useState('');
  function goDiscover(q = '') { setQuery(q); setPage('discover'); window.scrollTo(0, 0); }
  function toggleSave(id: number) {
    setSaved(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
    setToast(saved.includes(id) ? 'Removed from saved items' : 'Saved for later');
  }
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timer);
  }, [toast]);
  const item = listings.find(x => x.id === selected);
  return <>
    {page === 'home' ? <Landing goDiscover={goDiscover} openItem={setSelected} saved={saved} toggleSave={toggleSave} /> : <Discover initialQuery={query} goHome={() => { setPage('home'); window.scrollTo(0, 0); }} openItem={setSelected} saved={saved} toggleSave={toggleSave} />}
    {item && <ItemSheet item={item} onClose={() => setSelected(null)} saved={saved.includes(item.id)} onSave={() => toggleSave(item.id)} notify={() => { setSelected(null); setToast('Request flow started — dates saved'); }} />}
    {toast && <div className="toast"><Icon name="check" size={19} />{toast}</div>}
  </>;
}
