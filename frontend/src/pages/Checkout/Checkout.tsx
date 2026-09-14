import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { getCheckoutData, type CheckoutData } from '../../data/mockApi'

export default function CheckoutPage() {
  const [data, setData] = useState<CheckoutData | null>(null)
  const location = useLocation()

  useEffect(() => {
    const loadCheckout = async () => {
      const checkoutData = await getCheckoutData()
      setData(checkoutData)
    }

    void loadCheckout()
  }, [])

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f1ea] text-[#1f3a2b]">
        <div className="rounded-full border border-[#dfeae3] bg-white px-6 py-3 text-sm font-medium shadow-sm">
          Preparing checkout...
        </div>
      </div>
    )
  }

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

      <main className="mx-auto max-w-[1200px] px-6 py-8 lg:px-8">
        <div className="mb-8 text-[#1e2a22]">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2f7a4f]">Checkout</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#1e2a22]">Complete your order</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <div className="rounded-[30px] border border-[#e5e9e4] bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-black tracking-[-0.04em] text-[#1e2a22]">Delivery address</h2>

              <div className="mt-5 rounded-[24px] bg-[#f8faf8] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-[#1d2f27]">{data.address.name}</p>
                    <p className="mt-1 text-sm text-[#5a6762]">{data.address.phone}</p>
                  </div>
                  <button className="text-sm font-semibold text-[#2f7a4f]">Edit</button>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#4d5d53]">{data.address.street}</p>
                <p className="text-sm leading-6 text-[#4d5d53]">{data.address.city}</p>
                <p className="mt-3 text-sm leading-6 text-[#4d5d53]">Note: {data.address.note}</p>
              </div>
            </div>

            <div className="rounded-[30px] border border-[#e5e9e4] bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-black tracking-[-0.04em] text-[#1e2a22]">Delivery option</h2>

              <div className="mt-5 space-y-3">
                {data.deliveryOptions.map((option) => (
                  <label key={option.id} className="flex cursor-pointer items-center justify-between rounded-[22px] border border-[#e5e9e4] bg-[#f9faf8] p-4">
                    <div>
                      <p className="text-base font-semibold text-[#1d2f27]">{option.label}</p>
                      <p className="mt-1 text-sm text-[#5a6762]">{option.eta}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#1d2f27]">{option.price}</span>
                      <input type="radio" name="delivery" defaultChecked={option.id === 'standard'} className="h-4 w-4 accent-[#2f7a4f]" />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-[#e5e9e4] bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-black tracking-[-0.04em] text-[#1e2a22]">Payment method</h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {data.paymentMethods.map((method) => (
                  <button key={method} className="rounded-[20px] border border-[#dfe7e2] bg-[#f9faf8] px-4 py-3 text-sm font-semibold text-[#23372f] shadow-sm">
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-[30px] border border-[#dfe7e2] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-[#1e2a22]">Order summary</h2>

            <div className="mt-5 space-y-3 text-sm text-[#4d5d53]">
              <div className="flex items-center justify-between">
                <span>Products</span>
                <span>7,500 RWF</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span>2,000 RWF</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service fee</span>
                <span>300 RWF</span>
              </div>
            </div>

            <div className="mt-5 border-t border-[#edf2ee] pt-4">
              <div className="flex items-center justify-between text-lg font-black text-[#1e2a22]">
                <span>Total</span>
                <span>9,800 RWF</span>
              </div>
            </div>

            <button className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#2f7a4f] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(47,122,79,0.2)] hover:bg-[#266e45]">
              Place order
            </button>
          </aside>
        </div>
      </main>
    </div>
  )
}
