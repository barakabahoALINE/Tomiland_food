import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import heroImage from '../../assets/Heroimage.png'
import { getHomepageData, type HomepageData } from './mockApi'

const navPills = ['Fresh & Local', 'Great Prices', 'Fast Delivery']

export default function Homepage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [data, setData] = useState<HomepageData | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const homepageData = await getHomepageData()
      setData(homepageData)
    }

    void loadData()
  }, [])

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef] text-[#1f3a2b]">
        <div className="rounded-full border border-[#dfeae3] bg-white px-6 py-3 text-sm font-medium shadow-sm">
          Loading fresh picks...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#1e2a22]">
      <header className="border-b border-[#e7e1d9] bg-[#f8f4ef]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-[56px] w-[220px] items-center justify-center rounded-full bg-white px-4 shadow-sm ring-1 ring-[#e2e8df]">
              <img src={logo} alt="Tomiland Foods logo" className="h-30 w-30 rounded-full object-cover" />
            </div>
          </div>

          <nav className="hidden items-center gap-10 text-sm font-medium text-[#23372f] lg:flex">
            {data.navItems.map((item) => {
              const routeMap: Record<string, string> = {
                'Shop Fresh Food': '/products',
                'Smart Basket': '/basket',
                Markets: '/markets',
                Supermarkets: '/supermarkets',
                'How it Works': '/how-it-works',
              }

              const isActive = location.pathname === (routeMap[item] ?? '/products')

              return (
                <button
                  key={item}
                  onClick={() => navigate(routeMap[item] ?? '/products')}
                  className={`transition bg-transparent border-none cursor-pointer ${isActive ? 'text-[#2f7a4f] font-semibold' : 'hover:text-[#2f7a4f]'}`}
                >
                  {item}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button className="rounded-full border border-[#dfe9e1] bg-white px-3 py-2 text-sm font-medium text-[#1f3a2b] shadow-sm hover:bg-[#f5faf6]">
              Kigali, Rwanda
            </button>
            <button
              onClick={() => navigate('/basket')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe9e1] bg-white text-xl shadow-sm hover:bg-[#f5faf6] cursor-pointer"
            >
              🛒
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-6 pb-16 pt-8 lg:px-8">
        <section className="rounded-[32px] bg-[#f7f4ef] px-4 pb-4 pt-5 lg:px-8 lg:pb-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[640px] flex-1">
              <div className="mb-5 inline-flex items-center rounded-full border border-[#dfeae3] bg-[#edf6ee] px-4 py-2 text-sm font-medium text-[#2f7a4f]">
                Fresh. Local. Delivered.
              </div>

              <h1 className="max-w-[560px] text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#1e2a22] xl:text-[5rem]">
                Fresh food from local vendors,
                <span className="block text-[#1c7b4f]">all in one place.</span>
              </h1>

              <p className="mt-5 max-w-[530px] text-lg leading-8 text-[#4d5d53]">
                Shop a wide variety of fresh fruits, vegetables, meat, dairy and more from trusted local markets and supermarkets. We bring it to your door.
              </p>

              <div className="mt-7 flex max-w-[480px] items-center gap-3 rounded-full border border-[#dfe7e2] bg-white px-4 py-3 shadow-sm ring-1 ring-[#edf3ee]">
                <span className="text-xl text-[#5b6c63]">⌕</span>
                <input
                  aria-label="Search products"
                  value="Search for products, markets..."
                  readOnly
                  className="w-full border-none bg-transparent text-base text-[#3e4d46] outline-none"
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {navPills.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-full border border-[#dfe8e2] bg-white px-3 py-2 shadow-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#edf6ee] text-[#1f7a4d] text-xs">✓</span>
                    <span className="text-sm font-medium text-[#23372f]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex w-full max-w-[620px] items-center justify-center">
              <div className="relative w-full overflow-hidden rounded-[28px] bg-[#edf4ee] p-4 shadow-[0_28px_80px_rgba(24,48,34,0.12)]">
                <img src={heroImage} alt="Fresh grocery basket" className="h-[440px] w-full rounded-[26px] object-cover" />
              </div>

              <div className="absolute right-2 top-10 w-[260px] rounded-[24px] border border-[#dfe7e2] bg-white p-4 shadow-[0_18px_35px_rgba(20,40,29,0.12)] sm:right-5">
                <div className="flex items-center justify-between gap-3 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-[#2c7b4d]">🛒</span>
                    <span className="text-lg font-bold text-[#1f3a2b]">Your Smart Basket</span>
                  </div>
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#2f7a4f] px-1 text-xs font-bold text-white">
                    {data.basketSummary.items}
                  </span>
                </div>

                <div className="mb-4 border-b border-[#edf2ee] pb-3">
                  <div className="space-y-3">
                    {data.basketItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-sm text-[#4a5d52]">
                        <div>
                          <div className="font-semibold text-[#1d2f27]">{item.name}</div>
                          <div className="text-[#687671]">{item.quantity}</div>
                        </div>
                        <div className="font-semibold text-[#1d2f27]">{item.price}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-[#4a5d52]">
                  <div className="flex items-center justify-between">
                    <span>Products</span>
                    <span>{data.basketSummary.subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delivery</span>
                    <span>{data.basketSummary.delivery}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#edf2ee] pt-3 text-base font-bold text-[#1e2a22]">
                    <span>Total</span>
                    <span>{data.basketSummary.total}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/basket')}
                  className="mt-5 w-full rounded-full bg-[#2f7a4f] px-4 py-3 text-base font-semibold text-white shadow-[0_10px_22px_rgba(47,122,79,0.3)] transition hover:bg-[#266e45] cursor-pointer"
                >
                  View Basket
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-[2.2rem] font-black tracking-[-0.05em] text-[#1e2a22]">Shop by Category</h2>
            <button
              onClick={() => navigate('/products')}
              className="text-base font-semibold text-[#2f7a4f] hover:text-[#226a42] bg-transparent border-none cursor-pointer"
            >
              View all categories →
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-7">
            {data.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate('/products')}
                className="rounded-[26px] border border-[#e4e8e1] bg-[#f9faf8] p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer text-left bg-inherit border-inherit"
              >
                <div className="flex justify-center">
                  <img src={category.image} alt={category.name} className="h-20 w-20 rounded-full object-cover shadow-sm" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#1f2d28]">{category.name}</h3>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-[32px] border border-[#dfe7e2] bg-[#eaf3eb] p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#2d7c4a]">Shop smarter</span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.5fr_1fr] lg:items-center">
            <div>
              <h2 className="max-w-[260px] text-[2.2rem] font-black tracking-[-0.05em] text-[#1e2a22]">Smart Basket</h2>
              <p className="mt-4 max-w-[250px] text-base leading-7 text-[#4d5d53]">
                Build your basket easily. We find the best options from local vendors so you can save time, money and shop smarter.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="mt-6 inline-flex rounded-full bg-[#2f7a4f] px-5 py-3 text-base font-semibold text-white shadow-[0_12px_25px_rgba(47,122,79,0.24)] hover:bg-[#266e45] cursor-pointer"
              >
                Build My Basket →
              </button>
            </div>

            <div className="relative flex justify-center">
              <div className="relative w-[290px] overflow-hidden rounded-[30px] border border-[#dfe2dd] bg-white p-3 shadow-[0_18px_35px_rgba(21,36,28,0.15)]">
                <div className="rounded-[24px] border border-[#edf0ee] bg-[#f8fbf9] p-3">
                  <div className="mb-3 flex items-center justify-between text-sm font-semibold text-[#23372f]">
                    <span>My Smart Basket</span>
                    <span className="text-[#2f7a4f]">(12)</span>
                  </div>
                  <div className="space-y-3">
                    {data.basketItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl bg-white px-2 py-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-lg bg-[#edf5ee]" />
                          <div>
                            <p className="text-sm font-semibold text-[#203327]">{item.name}</p>
                            <p className="text-xs text-[#64746d]">{item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#1d2f27]">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { label: 'Choose what you need', icon: '⌕' },
                { label: 'We find the best options for you', icon: '▣' },
                { label: 'We deliver to your door', icon: '🚚' },
              ].map((step) => (
                <div key={step.label} className="flex flex-col items-center gap-3 rounded-[24px] border border-[#dfe7e2] bg-white p-4 text-center shadow-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf5ee] text-3xl text-[#2f7a4f]">{step.icon}</div>
                  <p className="text-sm font-medium leading-6 text-[#23372f]">{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-[2.2rem] font-black tracking-[-0.05em] text-[#1e2a22]">Top Picks from Local Vendors</h2>
            <button
              onClick={() => navigate('/products')}
              className="text-base font-semibold text-[#2f7a4f] hover:text-[#226a42] bg-transparent border-none cursor-pointer"
            >
              View all →
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {data.topPicks.map((product) => (
              <article
                key={product.id}
                onClick={() => navigate('/products')}
                className="rounded-[28px] border border-[#e5e9e4] bg-white p-3 shadow-sm cursor-pointer transition hover:shadow-md hover:border-[#2f7a4f]"
              >
                <div className="overflow-hidden rounded-[22px] bg-[#f2f6f3]">
                  <img src={product.image} alt={product.name} className="h-44 w-full object-cover" />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-[#1d2f27]">{product.name}</h3>
                    <span className="rounded-full bg-[#edf5ee] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2f7a4f]">
                      {product.freshness}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#5a6762]">{product.price}</p>
                  <p className="mt-1 text-sm text-[#66756e]">{product.vendor}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2f7a4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#266e45]"
                  >
                    + Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-[2.2rem] font-black tracking-[-0.05em] text-[#1e2a22]">Shop from Local Markets & Supermarkets</h2>
            <button
              onClick={() => navigate('/products')}
              className="text-base font-semibold text-[#2f7a4f] hover:text-[#226a42] bg-transparent border-none cursor-pointer"
            >
              View all →
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {data.markets.map((market) => (
              <article
                key={market.id}
                onClick={() => navigate('/products')}
                className="overflow-hidden rounded-[28px] border border-[#e5e9e4] bg-white shadow-sm cursor-pointer transition hover:shadow-md hover:border-[#2f7a4f]"
              >
                <img src={market.image} alt={market.name} className="h-52 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-[#1d2f27]">{market.name}</h3>
                    <span className="flex items-center gap-1 text-sm font-semibold text-[#2f7a4f]">★ {market.rating.toFixed(1)}</span>
                  </div>
                  <p className="mt-2 text-sm text-[#577163]">{market.location}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[28px] border border-[#dfe7e2] bg-[#f9faf8] p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.benefits.map((benefit) => (
              <div key={benefit.id} className="flex items-start gap-4 rounded-[22px] border border-[#e5e9e4] bg-white p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf5ee] text-xl text-[#2f7a4f]">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1e2a22]">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4d5d53]">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 pb-10 text-center">
          <h3 className="text-[2.2rem] font-black tracking-[-0.05em] text-[#1e2a22]">Trusted by thousands of families</h3>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-[#495b53]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe7e2] bg-white px-4 py-2 shadow-sm">
              <span>🔒</span> Secure Payments
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe7e2] bg-white px-4 py-2 shadow-sm">
              <span>💬</span> Easy Returns
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe7e2] bg-white px-4 py-2 shadow-sm">
              <span>✅</span> 100% Satisfaction
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
