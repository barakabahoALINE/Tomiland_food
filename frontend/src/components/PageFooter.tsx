import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const exploreLinks = [
  ['Shop Fresh Food', '/products'],
  ['Smart Basket', '/basket'],
  ['Local Markets', '/markets'],
  ['Supermarkets', '/supermarkets'],
]

const customerCareLinks = [
  ['Help Center', '/how-it-works'],
  ['How it Works', '/how-it-works'],
  ['Delivery & Pickup', '/how-it-works'],
  ['Returns & Refunds', '/how-it-works'],
  ['Contact Us', '/how-it-works'],
]

const companyLinks = [
  ['About Us', '/how-it-works'],
  ['Careers', '/how-it-works'],
  ['Become a Partner', '/how-it-works'],
  ['Terms & Conditions', '/how-it-works'],
  ['Privacy Policy', '/how-it-works'],
]

const socials = [
  { label: 'Facebook', icon: '𝔽', href: '#facebook' },
  { label: 'Instagram', icon: '◎', href: '#instagram' },
  { label: 'X', icon: '𝕏', href: '#twitter' },
  { label: 'YouTube', icon: '▶', href: '#youtube' },
]

export default function PageFooter() {
  return (
    <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,.6)', marginTop: '0' }}>

      {/* Top wave-like border */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(47,122,79,.5) 30%, rgba(47,122,79,.5) 70%, transparent)',
      }} />

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '64px 40px 48px',
        display: 'grid',
        gridTemplateColumns: '1.4fr repeat(3, 1fr) 1.1fr',
        gap: '40px',
      }}
      className="footer-grid"
      >
        {/* Brand column */}
        <div>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px', textDecoration: 'none' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
              border: '2px solid rgba(47,122,79,.5)',
            }}>
              <img src={logo} alt="Tomiland Foods" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1rem', color: 'var(--green-200)', letterSpacing: '-.02em' }}>
              Tomiland Foods
            </span>
          </Link>
          <p style={{ fontSize: '.85rem', lineHeight: 1.8, maxWidth: '200px', marginBottom: '24px' }}>
            Good Food. Local Choices. Delivered fresh to your door in Kigali.
          </p>

          {/* Social links */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {socials.map(({ label, icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.1)',
                  color: 'rgba(255,255,255,.7)',
                  fontSize: '.85rem',
                  textDecoration: 'none',
                  transition: 'all .2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'var(--green-500)'
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--green-500)'
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'white'
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,.06)'
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,.1)'
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,.7)'
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        <FooterLinkGroup title="Explore" links={exploreLinks} />
        <FooterLinkGroup title="Customer Care" links={customerCareLinks} />
        <FooterLinkGroup title="Company" links={companyLinks} />

        {/* App download */}
        <div>
          <p style={{ fontWeight: 800, fontSize: '.85rem', color: 'white', marginBottom: '8px' }}>Download the App</p>
          <p style={{ fontSize: '.8rem', lineHeight: 1.7, maxWidth: '180px', marginBottom: '20px' }}>
            Get the full Tomiland experience on the go.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['🍎 App Store', '▶ Google Play'].map(store => (
              <a
                key={store}
                href="#"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(255,255,255,.12)',
                  color: 'white',
                  fontSize: '.82rem', fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all .2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'var(--green-500)'
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--green-500)'
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,.07)'
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,.12)'
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
                }}
              >
                {store}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,.06)',
        padding: '20px 40px',
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.3)' }}>
          © 2025 Tomiland Foods. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
            <a key={link} href="#" style={{
              fontSize: '.78rem', color: 'rgba(255,255,255,.3)',
              textDecoration: 'none', transition: 'color .2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green-200)'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,.3)'}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

function FooterLinkGroup({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p style={{ fontWeight: 800, fontSize: '.85rem', color: 'white', marginBottom: '18px', letterSpacing: '.02em' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {links.map(([label, path]) => (
          <Link
            key={label}
            to={path}
            style={{
              fontSize: '.83rem',
              color: 'rgba(255,255,255,.45)',
              textDecoration: 'none',
              transition: 'all .2s',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green-200)'
              ;(e.currentTarget as HTMLAnchorElement).style.paddingLeft = '4px'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,.45)'
              ;(e.currentTarget as HTMLAnchorElement).style.paddingLeft = '0'
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
