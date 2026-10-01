import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import logo from '../../assets/logo.png'
import ProfileLink from '../ProfileLink'

const navItems = [
  { label: 'Shop Fresh', route: '/products' },
  { label: 'Smart Basket', route: '/basket' },
  { label: 'Markets', route: '/markets' },
  { label: 'Supermarkets', route: '/supermarkets' },
  { label: 'How it Works', route: '/how-it-works' },
]

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const cartItems = useAppSelector((state) => state.cart.items)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'all .4s cubic-bezier(.22,1,.36,1)',
        background: scrolled
          ? 'rgba(247,243,236,.88)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(18px) saturate(1.8)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(1.8)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(222,214,200,.6)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 32px rgba(15,31,24,.07)' : 'none',
      }}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-6 py-4 lg:px-8">

        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          aria-label="Tomiland Foods home"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'transform .3s var(--ease-spring)' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <img
            src={logo}
            alt="Tomiland Foods"
            className="h-14 w-[110px] object-contain object-left sm:h-20 sm:w-32"
            style={{ translate: '-18px 0' }}
          />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(({ label, route }) => {
            const isActive = location.pathname === route
            return (
              <button
                key={label}
                onClick={() => navigate(route)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '.875rem',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--green-600)' : 'var(--ink-light)',
                  backgroundColor: isActive ? 'var(--green-100)' : 'transparent',
                  transition: 'all .2s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--green-50)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--green-600)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-light)'
                  }
                }}
              >
                {label}
              </button>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Location pill */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '999px',
              border: '1px solid var(--cream-dark)',
              background: 'white',
              fontSize: '.8rem',
              fontWeight: '600',
              color: 'var(--ink)',
              cursor: 'pointer',
              transition: 'all .2s',
              fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(15,31,24,.06)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--green-500)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--green-600)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--cream-dark)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)'
            }}
          >
            <span style={{ fontSize: '1rem' }}>📍</span>
            <span className="hidden sm:inline">Kigali, Rwanda</span>
          </button>

          {/* Cart button */}
          <button
            onClick={() => navigate('/basket')}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid var(--cream-dark)',
              background: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all .3s var(--ease-spring)',
              boxShadow: '0 2px 8px rgba(15,31,24,.06)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(47,122,79,.2)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--green-500)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(15,31,24,.06)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--cream-dark)'
            }}
          >
            🛒
            {cartItems.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#e53e3e',
                  color: 'white',
                  fontSize: '.7rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  animation: 'pulse-green .6s var(--ease-spring)',
                }}
              >
                {cartItems.length}
              </span>
            )}
          </button>

          <ProfileLink />

          {/* Mobile hamburger */}
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(p => !p)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid var(--cream-dark)',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              cursor: 'pointer',
            }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block',
                width: '18px',
                height: '2px',
                background: 'var(--ink)',
                borderRadius: '2px',
                transition: 'all .3s',
                transform: mobileOpen
                  ? i === 0 ? 'translateY(7px) rotate(45deg)'
                  : i === 2 ? 'translateY(-7px) rotate(-45deg)'
                  : 'scaleX(0)'
                  : 'none',
              }} />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: mobileOpen ? '400px' : '0',
          transition: 'max-height .4s var(--ease-out)',
          background: 'rgba(247,243,236,.96)',
          backdropFilter: 'blur(16px)',
        }}
        className="lg:hidden"
      >
        <nav style={{ padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(({ label, route }) => (
            <button
              key={label}
              onClick={() => { navigate(route); setMobileOpen(false) }}
              style={{
                background: location.pathname === route ? 'var(--green-100)' : 'none',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '.95rem',
                fontWeight: '600',
                color: location.pathname === route ? 'var(--green-600)' : 'var(--ink-light)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all .2s',
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
