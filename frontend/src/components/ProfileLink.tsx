import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutUser } from '../store/slices/auth/authSlice'

export default function ProfileLink() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, user, status, error } = useAppSelector((state) => state.auth)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  if (isAuthenticated && user) {
    const initials = user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || user.email[0]?.toUpperCase() || '?'

    const handleLogout = async () => {
      const result = await dispatch(logoutUser())
      if (logoutUser.fulfilled.match(result)) {
        setIsOpen(false)
        navigate('/', { replace: true })
      }
    }

    return (
      <div ref={menuRef} className="relative">
        <button
          id="profile-menu-button"
          type="button"
          aria-label={`Account menu for ${user.name}`}
          aria-expanded={isOpen}
          aria-controls="profile-menu"
          title={user.name}
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#cfe0d4] bg-[#eaf3eb] text-sm font-bold text-[#2f7a4f] shadow-sm transition hover:bg-[#dceedd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f7a4f]"
        >
          {initials}
        </button>
        {isOpen && (
          <div id="profile-menu" className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-[#dfe7e2] bg-white p-3 shadow-lg">
            <div className="border-b border-[#edf2ee] px-2 pb-3">
              <p className="truncate text-sm font-bold text-[#1f3a2b]">{user.name}</p>
              <p className="mt-1 truncate text-xs text-[#687671]">{user.email}</p>
            </div>
            {error && <p role="alert" className="px-2 pt-2 text-xs text-red-600">{error}</p>}
            <button
              type="button"
              role="menuitem"
              disabled={status === 'loading'}
              onClick={() => void handleLogout()}
              className="mt-2 w-full rounded-lg px-2 py-2 text-left text-sm font-semibold text-[#8a332b] transition hover:bg-[#fff3f1] disabled:opacity-60"
            >
              {status === 'loading' ? 'Signing out...' : 'Log out'}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      to="/account"
      aria-label="Open account"
      title="Account"
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe9e1] bg-white text-[#1f3a2b] shadow-sm transition hover:bg-[#f5faf6]"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.5 20c.8-3.25 3.05-5 6.5-5s5.7 1.75 6.5 5" />
      </svg>
    </Link>
  )
}
