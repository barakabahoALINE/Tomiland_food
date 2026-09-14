import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import logo from '../../assets/logo.png'

const navItems = ['Shop Fresh Food', 'Smart Basket', 'Markets', 'Supermarkets', 'How it Works']

const routeMap: Record<string, string> = {
  'Shop Fresh Food': '/products',
  'Smart Basket': '/basket',
  'Markets': '/markets',
  'Supermarkets': '/supermarkets',
  'How it Works': '/how-it-works',
}

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const cartItems = useAppSelector((state) => state.cart.items)

  return (
    <header className="border-b border-[#e7e1d9] bg-[#f8f4ef]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-4 lg:px-6">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex h-12 w-40 items-center justify-center rounded-full bg-white px-4 shadow-sm ring-1 ring-[#e2e8df] hover:shadow-md transition cursor-pointer"
        >
          <img src={logo} alt="Tomiland Foods" className="h-10 w-10 rounded-full object-cover" />
        </button>

        {/* Navigation */}
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

        {/* Right Section - Location & Cart */}
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-[#dfe9e1] bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#1f3a2b] shadow-sm hover:bg-[#f5faf6] cursor-pointer">
            Kigali, Rwanda
          </button>
          <button
            onClick={() => navigate('/basket')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe9e1] bg-white text-xl shadow-sm hover:bg-[#f5faf6] hover:shadow-md transition cursor-pointer relative"
          >
            🛒
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e74c3c] text-xs font-bold text-white">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
