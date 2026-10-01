import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import logo from '../../assets/logo.png'
import ProfileLink from '../ProfileLink'

const navItems = ['Shop Fresh Food', 'Smart Basket', 'Checkout', 'Markets', 'Supermarkets', 'How it Works']

const routeMap: Record<string, string> = {
  'Shop Fresh Food': '/products',
  'Smart Basket': '/basket',
  'Markets': '/markets',
  'Supermarkets': '/supermarkets',
  Checkout: '/checkout',
  'How it Works': '/how-it-works',
}

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const cartItems = useAppSelector((state) => state.cart.items)

  return (
    <header className="border-b border-[#e7e1d9] bg-[#f8f4ef]">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-6 py-4 lg:px-8">
        <button
          onClick={() => navigate('/')}
          aria-label="Tomiland Foods home"
          className="flex shrink-0 items-center justify-center bg-transparent p-0 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f7a4f]"
        >
          <img src={logo} alt="Tomiland Foods" className="h-15 w-[120px] -translate-x-[22px] object-contain object-left sm:h-24 sm:w-36 sm:-translate-x-[27px]" />
        </button>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#23372f] lg:flex">
          {navItems.map((item) => {
            const route = routeMap[item] ?? '/products'
            const isActive = location.pathname === route

            return (
              <button
                key={item}
                onClick={() => navigate(route)}
                className={`transition bg-transparent border-none cursor-pointer ${
                  isActive ? 'text-[#2f7a4f] font-semibold' : 'hover:text-[#2f7a4f]'
                }`}
              >
                {item}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-[#dfe9e1] bg-white px-3 py-2 text-xs font-medium text-[#1f3a2b] shadow-sm hover:bg-[#f5faf6] sm:text-sm">
            Kigali, Rwanda
          </button>
          <button
            onClick={() => navigate('/basket')}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe9e1] bg-white text-xl shadow-sm transition hover:bg-[#f5faf6] hover:shadow-md"
          >
            🛒
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e74c3c] text-xs font-bold text-white">
                {cartItems.length}
              </span>
            )}
          </button>
          <ProfileLink />
        </div>
      </div>
    </header>
  )
}
