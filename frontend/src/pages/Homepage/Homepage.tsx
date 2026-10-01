import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import heroImage from '../../assets/Heroimage.png'
import { getHomepageData, type HomepageData } from './mockApi'
import Header from '../../components/Header/Header'

/* ─── Scroll-reveal hook ─────────────────────────────────────────────────── */
function useReveal(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [active])
  return ref
}

/* ─── Category emoji map ─────────────────────────────────────────────────── */
const categoryEmoji: Record<string, string> = {
  'Fresh Produce': '🥬',
  'Meat & Fish': '🥩',
  'Dairy & Eggs': '🥛',
  'Grains & Cereals': '🌾',
  'Cooking Essentials': '🫙',
  'Bread & Bakery': '🍞',
  'Drinks': '🧃',
}

const tickerItems = [
  '🌿 Fresh from local farms',
  '⚡ Fast delivery across Kigali',
  '🛒 Smart Basket saves you time',
  '⭐ Trusted by thousands of families',
  '🔒 100% secure payments',
  '🚚 Same-day delivery available',
]

/* ─── Animated number ────────────────────────────────────────────────────── */
function AnimNumber({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      let start = 0
      const step = to / 60
      const tick = () => {
        start += step
        if (start >= to) { setVal(to); return }
        setVal(Math.floor(start))
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      obs.unobserve(el)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

export default function Homepage() {
  const navigate = useNavigate()
  const [data, setData] = useState<HomepageData | null>(null)

  const contentReady = Boolean(data)
  const heroRef    = useReveal(contentReady)
  const statsRef   = useReveal(contentReady)
  const catsRef    = useReveal(contentReady)
  const smartRef   = useReveal(contentReady)
  const picksRef   = useReveal(contentReady)
  const marketsRef = useReveal(contentReady)
  const perksRef   = useReveal(contentReady)
  const ctaRef     = useReveal(contentReady)

  useEffect(() => {
    void getHomepageData().then(setData)
  }, [])

  /* ── Loading skeleton ─────────────────────────────────────────────────── */
  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            border: '3px solid var(--green-100)',
            borderTopColor: 'var(--green-500)',
          }} className="spin-slow" />
          <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '.95rem' }}>Loading fresh picks…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', overflowX: 'hidden' }}>
      <Header />

      {/* ── Ticker bar ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--green-500)',
        color: 'white',
        fontSize: '.8rem',
        fontWeight: 600,
        letterSpacing: '.04em',
        padding: '10px 0',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}>
        <div className="ticker-track" style={{ display: 'inline-flex', gap: '64px' }}>
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {t}
              <span style={{ opacity: .4 }}>•</span>
            </span>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <div ref={heroRef} className="reveal" style={{
          borderRadius: '36px',
          background: 'linear-gradient(135deg, #f0faf4 0%, #f7f3ec 60%, #e8f5ed 100%)',
          border: '1px solid var(--green-200)',
          padding: '48px 40px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: '48px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* decorative blobs */}
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,122,79,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,122,79,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '600px', position: 'relative' }}>
            {/* Badge */}
            <div className="tag" style={{ marginBottom: '24px' }}>
              <span>✦</span> Fresh. Local. Delivered.
            </div>

            <h1 style={{
              fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-.04em',
              color: 'var(--ink)',
              marginBottom: '20px',
            }}>
              Fresh food from<br />
              <span className="gradient-text">local vendors,</span><br />
              all in one place.
            </h1>

            <p style={{ fontSize: '1.1rem', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '480px', marginBottom: '32px' }}>
              Shop fresh fruits, vegetables, meat, dairy and more from trusted local markets and supermarkets. We bring it to your door.
            </p>

            {/* Search bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'white',
              borderRadius: '999px',
              border: '1.5px solid var(--cream-dark)',
              padding: '8px 8px 8px 20px',
              maxWidth: '460px',
              boxShadow: '0 4px 24px rgba(15,31,24,.08)',
              marginBottom: '28px',
              transition: 'border-color .2s, box-shadow .2s',
            }}
            onFocus={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--green-500)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(47,122,79,.15)'
            }}
            onBlur={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--cream-dark)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(15,31,24,.08)'
            }}
            >
              <span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>🔍</span>
              <input
                aria-label="Search products"
                placeholder="Search for products, markets…"
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  fontSize: '.95rem', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => navigate('/products')}
                className="btn-shine"
                style={{
                  background: 'var(--green-500)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '10px 20px',
                  fontSize: '.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background .2s, transform .2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--green-600)'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--green-500)'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                }}
              >
                Search
              </button>
            </div>

            {/* Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['✓ Fresh & Local', '✓ Great Prices', '✓ Fast Delivery'].map(p => (
                <div key={p} style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  background: 'white',
                  border: '1px solid var(--green-200)',
                  fontSize: '.82rem',
                  fontWeight: 600,
                  color: 'var(--ink-light)',
                  boxShadow: '0 2px 8px rgba(15,31,24,.05)',
                }}>
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Hero image + floating basket card */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '560px',
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-float)',
              border: '1px solid var(--green-100)',
            }}>
              <img src={heroImage} alt="Fresh groceries" style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }} />
            </div>

            {/* Floating Smart Basket card */}
            <div className="glass float" style={{
              position: 'absolute',
              right: '0',
              top: '24px',
              width: '240px',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: 'var(--shadow-float)',
              border: '1px solid rgba(255,255,255,.7)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>🛒 Smart Basket</span>
                <span style={{
                  background: 'var(--green-500)', color: 'white',
                  fontSize: '.75rem', fontWeight: 800,
                  padding: '2px 8px', borderRadius: '999px',
                }}>{data.basketSummary.items}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {data.basketItems.slice(0, 3).map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{item.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '.75rem' }}>{item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--green-600)' }}>{item.price}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(0,0,0,.06)', paddingTop: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)' }}>
                  <span>Total</span>
                  <span>{data.basketSummary.total}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/basket')}
                className="btn-shine btn-pulse"
                style={{
                  width: '100%',
                  background: 'var(--green-500)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '10px',
                  fontSize: '.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                View Basket →
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS ───────────────────────────────────────────────────────── */}
        <div ref={statsRef} className="reveal stagger" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          margin: '48px 0',
        }}>
          {[
            { val: 12000, suffix: '+', label: 'Happy Customers' },
            { val: 200, suffix: '+', label: 'Local Vendors' },
            { val: 5000, suffix: '+', label: 'Products Available' },
            { val: 30, suffix: 'min', label: 'Avg Delivery Time' },
          ].map(({ val, suffix, label }) => (
            <div key={label} style={{
              background: 'white',
              borderRadius: '20px',
              padding: '28px 24px',
              border: '1px solid var(--cream-dark)',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center',
              transition: 'transform .3s var(--ease-spring), box-shadow .3s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-hover)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)'
            }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Syne', sans-serif", color: 'var(--green-500)' }}>
                <AnimNumber to={val} suffix={suffix} />
              </div>
              <div style={{ fontSize: '.82rem', color: 'var(--muted)', fontWeight: 600, marginTop: '6px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── CATEGORIES ──────────────────────────────────────────────────── */}
        <section>
          <div ref={catsRef} className="reveal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div>
                <p style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green-500)', marginBottom: '6px' }}>What do you need?</p>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: "'Syne', sans-serif", fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.03em' }}>Shop by Category</h2>
              </div>
              <button onClick={() => navigate('/products')} style={{
                background: 'none', border: 'none', color: 'var(--green-500)',
                fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '4px',
                transition: 'gap .2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.gap = '8px'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.gap = '4px'}
              >
                View all <span>→</span>
              </button>
            </div>

            <div className="stagger" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '16px',
            }}>
              {data.categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => navigate('/products')}
                  className="card-hover reveal-scale visible"
                  style={{
                    background: 'white',
                    borderRadius: '24px',
                    border: '1px solid var(--cream-dark)',
                    padding: '24px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div style={{
                    width: '64px', height: '64px',
                    borderRadius: '50%',
                    background: 'var(--green-50)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem',
                    border: '2px solid var(--green-100)',
                    transition: 'transform .3s var(--ease-spring)',
                  }}>
                    {categoryEmoji[cat.name] ?? '🛒'}
                  </div>
                  <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink-light)', textAlign: 'center', lineHeight: 1.3 }}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── SMART BASKET FEATURE ────────────────────────────────────────── */}
        <section style={{ marginTop: '80px' }}>
          <div ref={smartRef} className="reveal" style={{
            borderRadius: '36px',
            background: 'linear-gradient(135deg, #1b5733 0%, #2f7a4f 60%, #38a169 100%)',
            padding: '56px 48px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '40px',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '-80px', right: '200px', width: '300px', height: '300px',
              borderRadius: '50%', border: '1px solid rgba(255,255,255,.1)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-60px', right: '100px', width: '200px', height: '200px',
              borderRadius: '50%', border: '1px solid rgba(255,255,255,.08)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 14px', borderRadius: '999px',
                background: 'rgba(255,255,255,.15)',
                border: '1px solid rgba(255,255,255,.25)',
                fontSize: '.78rem', fontWeight: 700, color: 'rgba(255,255,255,.9)',
                letterSpacing: '.06em', textTransform: 'uppercase',
                marginBottom: '20px',
              }}>
                ✦ Shop Smarter
              </div>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-.04em',
                lineHeight: 1.1,
                marginBottom: '16px',
              }}>
                Smart Basket<br />saves you time.
              </h2>
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '380px', marginBottom: '32px' }}>
                Build your basket easily. We find the best options from local vendors so you save time, money and shop smarter.
              </p>
              <div style={{ display: 'flex', gap: '28px', marginBottom: '36px' }}>
                {['Choose products', 'We find best prices', 'Delivered to you'].map((step, i) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'rgba(255,255,255,.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.8rem', fontWeight: 800, color: 'white',
                      border: '1px solid rgba(255,255,255,.3)',
                      flexShrink: 0,
                    }}>{i + 1}</div>
                    <span style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>{step}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/products')}
                className="btn-shine"
                style={{
                  background: 'white',
                  color: 'var(--green-600)',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '14px 32px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 12px 32px rgba(0,0,0,.2)',
                  transition: 'transform .3s var(--ease-spring), box-shadow .3s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06) translateY(-2px)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 20px 48px rgba(0,0,0,.28)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1) translateY(0)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(0,0,0,.2)'
                }}
              >
                Build My Basket →
              </button>
            </div>

            {/* Basket preview card */}
            <div className="glass float" style={{
              borderRadius: '24px',
              padding: '24px',
              minWidth: '220px',
              background: 'rgba(255,255,255,.92)',
              border: '1px solid rgba(255,255,255,.8)',
              boxShadow: '0 24px 64px rgba(0,0,0,.2)',
            }}>
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)', marginBottom: '14px' }}>🧺 My Basket</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.basketItems.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    background: 'var(--green-50)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                  }}>
                    <div>
                      <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink)' }}>{item.name}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{item.quantity}</div>
                    </div>
                    <div style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--green-600)' }}>{item.price}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--green-100)', marginTop: '14px', paddingTop: '12px',
                display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)' }}>
                <span>Total</span><span style={{ color: 'var(--green-600)' }}>{data.basketSummary.total}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── TOP PICKS ───────────────────────────────────────────────────── */}
        <section style={{ marginTop: '80px' }}>
          <div ref={picksRef} className="reveal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div>
                <p style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green-500)', marginBottom: '6px' }}>Handpicked today</p>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: "'Syne', sans-serif", fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.03em' }}>Top Picks from Local Vendors</h2>
              </div>
              <button onClick={() => navigate('/products')} style={{
                background: 'none', border: 'none', color: 'var(--green-500)',
                fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                View all →
              </button>
            </div>

            <div className="stagger" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px',
            }}>
              {data.topPicks.map(product => (
                <article
                  key={product.id}
                  onClick={() => navigate('/products')}
                  className="card-hover"
                  style={{
                    background: 'white',
                    borderRadius: '28px',
                    border: '1px solid var(--cream-dark)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '100%', height: '180px', objectFit: 'cover', display: 'block',
                        transition: 'transform .5s var(--ease-out)',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.08)'}
                      onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
                    />
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'var(--green-500)', color: 'white',
                      fontSize: '.7rem', fontWeight: 700,
                      padding: '3px 10px', borderRadius: '999px',
                      letterSpacing: '.05em', textTransform: 'uppercase',
                    }}>{product.freshness}</div>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)', marginBottom: '4px' }}>{product.name}</h3>
                    <p style={{ fontSize: '.8rem', color: 'var(--green-600)', fontWeight: 700, marginBottom: '4px' }}>{product.price}</p>
                    <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '14px' }}>{product.vendor}</p>
                    <button
                      onClick={e => e.stopPropagation()}
                      className="btn-shine"
                      style={{
                        width: '100%',
                        background: 'var(--green-500)',
                        color: 'white', border: 'none',
                        borderRadius: '999px',
                        padding: '9px',
                        fontSize: '.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background .2s, transform .2s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--green-600)'
                        ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--green-500)'
                        ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                      }}
                    >
                      + Add to Basket
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── MARKETS ─────────────────────────────────────────────────────── */}
        <section style={{ marginTop: '80px' }}>
          <div ref={marketsRef} className="reveal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div>
                <p style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green-500)', marginBottom: '6px' }}>Near you</p>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: "'Syne', sans-serif", fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.03em' }}>Local Markets & Supermarkets</h2>
              </div>
              <button onClick={() => navigate('/markets')} style={{
                background: 'none', border: 'none', color: 'var(--green-500)',
                fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', fontFamily: 'inherit',
              }}>View all →</button>
            </div>

            <div className="stagger" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px',
            }}>
              {data.markets.map(market => (
                <article
                  key={market.id}
                  onClick={() => navigate('/products')}
                  className="card-hover"
                  style={{
                    background: 'white',
                    borderRadius: '28px',
                    border: '1px solid var(--cream-dark)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img src={market.image} alt={market.name}
                      style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block', transition: 'transform .5s var(--ease-out)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)'}
                      onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
                    />
                    {/* Rating badge */}
                    <div style={{
                      position: 'absolute', bottom: '12px', left: '12px',
                      background: 'rgba(255,255,255,.92)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '999px',
                      padding: '4px 12px',
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '.8rem', fontWeight: 800, color: 'var(--ink)',
                      boxShadow: '0 4px 12px rgba(0,0,0,.12)',
                    }}>
                      ⭐ {market.rating.toFixed(1)}
                    </div>
                  </div>
                  <div style={{ padding: '18px' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)', marginBottom: '6px' }}>{market.name}</h3>
                    <p style={{ fontSize: '.82rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📍 {market.location}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── PERKS ───────────────────────────────────────────────────────── */}
        <section style={{ marginTop: '80px' }}>
          <div ref={perksRef} className="reveal stagger" style={{
            background: 'white',
            borderRadius: '36px',
            border: '1px solid var(--cream-dark)',
            padding: '48px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            boxShadow: 'var(--shadow-card)',
          }}>
            {data.benefits.map(b => (
              <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'var(--green-50)',
                  border: '1px solid var(--green-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>
                  {b.icon}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)', marginBottom: '6px' }}>{b.title}</h3>
                  <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.7 }}>{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────────────────────────── */}
        <section style={{ marginTop: '80px' }}>
          <div ref={ctaRef} className="reveal" style={{
            borderRadius: '36px',
            background: 'var(--ink)',
            padding: '64px 56px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              width: '600px', height: '600px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(47,122,79,.3) 0%, transparent 70%)',
              pointerEvents: 'none' }} />
            <p style={{ fontSize: '.8rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
              color: 'var(--green-200)', marginBottom: '16px', position: 'relative' }}>
              Start shopping today
            </p>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, color: 'white',
              letterSpacing: '-.04em',
              lineHeight: 1.1,
              marginBottom: '20px',
              position: 'relative',
            }}>
              Trusted by thousands<br />of families in Kigali.
            </h2>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '1rem', marginBottom: '40px', position: 'relative' }}>
              Join the community of smart shoppers getting fresh food delivered daily.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', position: 'relative' }}>
              <button
                onClick={() => navigate('/account')}
                className="btn-shine btn-pulse"
                style={{
                  background: 'var(--green-500)', color: 'white',
                  border: 'none', borderRadius: '999px',
                  padding: '16px 40px', fontSize: '1rem', fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 12px 40px rgba(47,122,79,.4)',
                  transition: 'transform .3s var(--ease-spring)',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06) translateY(-2px)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1) translateY(0)'}
              >
                Get Started — It's Free
              </button>
              <button
                onClick={() => navigate('/products')}
                className="btn-shine"
                style={{
                  background: 'transparent', color: 'white',
                  border: '1.5px solid rgba(255,255,255,.3)', borderRadius: '999px',
                  padding: '16px 40px', fontSize: '1rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all .2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.7)'
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.08)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.3)'
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                Browse Products
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', marginTop: '40px', position: 'relative' }}>
              {['🔒 Secure Payments', '💬 Easy Returns', '✅ 100% Satisfaction', '🚚 Fast Delivery'].map(t => (
                <span key={t} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.12)',
                  fontSize: '.82rem', color: 'rgba(255,255,255,.65)', fontWeight: 600,
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
