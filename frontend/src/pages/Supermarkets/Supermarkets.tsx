import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'

export default function SupermarketsPage() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#1e2a22]">
      <header className="border-b border-[#e7e1d9] bg-[#f8f4ef]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex h-[56px] w-[220px] items-center justify-center rounded-full bg-white px-4 shadow-sm ring-1 ring-[#e2e8df]">
              <img src={logo} alt="Tomiland Foods logo" className="h-30 w-30 rounded-full object-cover" />
            </Link>
          </div>

          <nav className="hidden items-center gap-10 text-sm font-medium text-[#23372f] lg:flex">
            <Link to="/products" className={`transition ${location.pathname === '/products' ? 'text-[#2f7a4f] font-semibold' : 'hover:text-[#2f7a4f]'}`}>Shop Fresh Food</Link>
            <Link to="/basket" className={`transition ${location.pathname === '/basket' ? 'text-[#2f7a4f] font-semibold' : 'hover:text-[#2f7a4f]'}`}>Smart Basket</Link>
            <Link to="/checkout" className={`transition ${location.pathname === '/checkout' ? 'text-[#2f7a4f] font-semibold' : 'hover:text-[#2f7a4f]'}`}>Checkout</Link>
            <Link to="/markets" className={`transition ${location.pathname === '/markets' ? 'text-[#2f7a4f] font-semibold' : 'hover:text-[#2f7a4f]'}`}>Markets</Link>
            <Link to="/supermarkets" className={`transition ${location.pathname === '/supermarkets' ? 'text-[#2f7a4f] font-semibold' : 'hover:text-[#2f7a4f]'}`}>Supermarkets</Link>
            <Link to="/how-it-works" className={`transition ${location.pathname === '/how-it-works' ? 'text-[#2f7a4f] font-semibold' : 'hover:text-[#2f7a4f]'}`}>How it Works</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button className="rounded-full border border-[#dfe9e1] bg-white px-3 py-2 text-sm font-medium text-[#1f3a2b] shadow-sm hover:bg-[#f5faf6]">
              Kigali, Rwanda
            </button>
            <Link to="/basket" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe9e1] bg-white text-xl shadow-sm hover:bg-[#f5faf6]">
              🛒
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-10 lg:px-8">
        <div className="rounded-[30px] border border-[#e5e9e4] bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2f7a4f]">Supermarkets</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#1e2a22]">Top supermarkets in your area</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#4d5d53]">
            Shop everyday essentials and premium groceries from trusted supermarkets with fast delivery.
          </p>
        </div>
      </main>
    </div>
  )
}
