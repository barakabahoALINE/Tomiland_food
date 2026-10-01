import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addItem } from '../../store/slices/cart/cartSlice'
import type { ProductsData, Product } from '../../data/mockApi'
import { getProducts, saveCart } from '../../data/shopApi'
import Header from '../../components/Header/Header'

type FilterState = {
  category: string
  market: string
  searchQuery: string
  availability: string
  priceMax: number
  sortBy: 'popular' | 'low-to-high' | 'high-to-low' | 'rating'
}

const CATEGORY_NAMES: Record<string, string> = {
  'all': 'All Fresh Items',
  'fresh-produce': 'Fresh Produce & Greens',
  'meat-fish': 'Fresh Meat & Fish',
  'dairy-eggs': 'Dairy, Milk & Eggs',
  'grains-cereals': 'Grains, Rice & Cereals',
  'cooking-essentials': 'Cooking Oils & Spices',
  'bread-bakery': 'Artisanal Bakery & Breads',
  'drinks': 'Juices & Fresh Drinks',
}

export default function ProductsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { accessToken } = useAppSelector((state) => state.auth)
  const cartItems = useAppSelector((state) => state.cart.items)

  const [data, setData] = useState<ProductsData | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    category: new URLSearchParams(location.search).get('category') ?? 'all',
    market: new URLSearchParams(location.search).get('market') ?? '',
    searchQuery: '',
    availability: '',
    priceMax: 25000,
    sortBy: 'popular',
  })

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedPackaging, setSelectedPackaging] = useState<{ [key: string]: string }>({})
  const [quantity, setQuantity] = useState<{ [key: string]: number }>({})
  const [addedToast, setAddedToast] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getProducts()
        setData(productsData)
        const packagingMap: { [key: string]: string } = {}
        const quantityMap: { [key: string]: number } = {}
        productsData.featured.forEach((product) => {
          if (product.packaging && product.packaging.length > 0) {
            packagingMap[product.id] = product.packaging[0]
          }
          quantityMap[product.id] = 1
        })
        setSelectedPackaging(packagingMap)
        setQuantity(quantityMap)
      } catch {
        setData({ featured: [], categories: [], summary: { totalProducts: 0, availableToday: 'Unavailable' } })
      }
    }
    void loadProducts()
  }, [])

  // Update category if URL query changes
  useEffect(() => {
    const cat = new URLSearchParams(location.search).get('category')
    if (cat) {
      setFilters((prev) => ({ ...prev, category: cat }))
    }
  }, [location.search])

  const handleAddToCart = (product: Product, pkg: string, qty: number) => {
    const item = {
      id: product.id,
      name: `${product.name}${product.kinyarwandaName ? ` (${product.kinyarwandaName})` : ''} - ${pkg}`,
      price: parseInt(product.price, 10) || 1000,
      quantity: qty,
      imageUrl: product.image,
      packaging: pkg,
    }
    dispatch(addItem(item))

    // Trigger toast notification
    setAddedToast(`Added ${qty}x ${product.name} to basket!`)
    setTimeout(() => setAddedToast(null), 2500)

    if (accessToken) {
      const existing = cartItems.find((entry) => entry.id === item.id && entry.packaging === pkg)
      const updated = existing
        ? cartItems.map((entry) => (entry === existing ? { ...entry, quantity: entry.quantity + qty } : entry))
        : [...cartItems, item]
      void saveCart(updated, accessToken).catch((error: unknown) =>
        console.error('Could not sync basket with backend:', error),
      )
    }
  }

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    if (!data) return []
    return data.featured
      .filter((product) => {
        const matchesCategory =
          filters.category === 'all' || product.category === filters.category
        const matchesMarket = !filters.market || product.market.toLowerCase().includes(filters.market.toLowerCase())
        const matchesSearch =
          !filters.searchQuery ||
          product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          (product.kinyarwandaName && product.kinyarwandaName.toLowerCase().includes(filters.searchQuery.toLowerCase()))
        const matchesAvailability =
          !filters.availability ||
          (filters.availability === 'available' && product.availability === 'available') ||
          (filters.availability === 'limited' && product.availability === 'limited')
        const price = Number.parseInt(product.price, 10) || 0
        const matchesPrice = price <= filters.priceMax

        return matchesCategory && matchesMarket && matchesSearch && matchesAvailability && matchesPrice
      })
      .sort((a, b) => {
        const priceA = Number.parseInt(a.price, 10) || 0
        const priceB = Number.parseInt(b.price, 10) || 0
        switch (filters.sortBy) {
          case 'low-to-high':
            return priceA - priceB
          case 'high-to-low':
            return priceB - priceA
          case 'rating':
            return (b.rating ?? 0) - (a.rating ?? 0)
          default:
            return 0
        }
      })
  }, [data, filters])

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f1ea]">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#2f7a4f] border-t-transparent" />
          <p className="font-syne font-bold text-[#2f7a4f]">Loading fresh Kigali market products…</p>
        </div>
      </div>
    )
  }

  const activeCategoryTitle =
    CATEGORY_NAMES[filters.category] ??
    data.categories.find((c) => c.id === filters.category)?.name ??
    'Fresh Kigali Marketplace'

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#1e2a22]">
      <Header />

      {/* Floating Toast Notice */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-[#1e2a22] px-5 py-3.5 text-sm font-bold text-white shadow-2xl animate-fade-up">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2f7a4f] text-xs">✓</span>
          <span>{addedToast}</span>
        </div>
      )}

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-[28px] border border-[#dfe7e2] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 w-full bg-[#edf6ee]">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-cover" />
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-sm font-bold shadow-md transition hover:bg-white"
              >
                ✕
              </button>
              {selectedProduct.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-[#2f7a4f] px-3 py-1 text-xs font-black text-white shadow-sm">
                  {selectedProduct.badge}
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-syne text-2xl font-black text-[#16231a]">{selectedProduct.name}</h2>
                  {selectedProduct.kinyarwandaName && (
                    <p className="text-sm font-semibold text-[#5a6762]">Kinyarwanda: {selectedProduct.kinyarwandaName}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-syne text-2xl font-black text-[#2f7a4f]">
                    {parseInt(selectedProduct.price, 10).toLocaleString()} RWF
                  </span>
                  <p className="text-xs text-[#5a6762]">{selectedProduct.priceUnit ?? '/ unit'}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full bg-[#edf6ee] px-3 py-1 font-bold text-[#2f7a4f]">
                  📍 {selectedProduct.market}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-700">
                  ★ {selectedProduct.rating?.toFixed(1) ?? '4.8'} (Verified)
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700">
                  🌿 {selectedProduct.freshness ?? 'Farm Fresh'}
                </span>
              </div>

              {/* Packaging selection */}
              {selectedProduct.packaging && selectedProduct.packaging.length > 0 && (
                <div className="mt-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5a6762]">
                    Select Packaging Size
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedProduct.packaging.map((pkg) => {
                      const isChosen = (selectedPackaging[selectedProduct.id] || selectedProduct.packaging?.[0]) === pkg
                      return (
                        <button
                          key={pkg}
                          type="button"
                          onClick={() => setSelectedPackaging({ ...selectedPackaging, [selectedProduct.id]: pkg })}
                          className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                            isChosen
                              ? 'border-[#2f7a4f] bg-[#edf6ee] text-[#2f7a4f]'
                              : 'border-[#dfe7e2] bg-white text-[#1e2a22] hover:border-[#2f7a4f]'
                          }`}
                        >
                          {pkg}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Add to Basket footer */}
              <div className="mt-8 flex items-center gap-4 border-t border-[#dfe7e2] pt-6">
                <div className="flex items-center rounded-2xl border border-[#dfe7e2] bg-[#fafafa] p-1">
                  <button
                    onClick={() =>
                      setQuantity({
                        ...quantity,
                        [selectedProduct.id]: Math.max(1, (quantity[selectedProduct.id] || 1) - 1),
                      })
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-base font-bold shadow-sm transition hover:bg-[#edf6ee]"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-syne font-bold text-[#16231a]">
                    {quantity[selectedProduct.id] || 1}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity({
                        ...quantity,
                        [selectedProduct.id]: (quantity[selectedProduct.id] || 1) + 1,
                      })
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-base font-bold shadow-sm transition hover:bg-[#edf6ee]"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const pkg =
                      selectedPackaging[selectedProduct.id] || (selectedProduct.packaging?.[0] || '1 unit')
                    handleAddToCart(selectedProduct, pkg, quantity[selectedProduct.id] || 1)
                    setShowModal(false)
                  }}
                  className="flex-1 rounded-2xl bg-[#2f7a4f] py-3.5 text-center font-syne text-sm font-bold text-white shadow-lg shadow-[#2f7a4f]/25 transition hover:bg-[#256340] active:scale-[0.99]"
                >
                  Add to Basket →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <section className="border-b border-[#dfe7e2] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#2f7a4f]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2f7a4f]">
                  Kigali Fresh Market
                </span>
                <span className="text-xs font-semibold text-[#5a6762]">• Direct from local vendors</span>
              </div>
              <h1 className="mt-2 font-syne text-3xl font-black tracking-tight text-[#16231a] sm:text-4xl">
                {activeCategoryTitle}
              </h1>
              <p className="mt-1 text-sm text-[#5a6762]">
                Showing {filteredProducts.length} certified items ready for same-day delivery across Kigali.
              </p>
            </div>

            {/* Quick Search Bar */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search tomatoes, fish, rice…"
                value={filters.searchQuery}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full rounded-full border border-[#dfe7e2] bg-[#f8faf8] py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-[#2f7a4f] focus:bg-white focus:ring-2 focus:ring-[#2f7a4f]/20"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#5a6762]">🔍</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr_300px]">
          {/* Left Filters Sidebar */}
          <aside className="space-y-6">
            {/* Categories */}
            <div className="rounded-[24px] border border-[#dfe7e2] bg-white p-5 shadow-sm">
              <h3 className="font-syne text-sm font-black uppercase tracking-wider text-[#16231a]">Categories</h3>

              <div className="mt-3 space-y-1">
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                    filters.category === 'all'
                      ? 'bg-[#2f7a4f] text-white shadow-sm'
                      : 'text-[#5a6762] hover:bg-[#edf6ee] hover:text-[#2f7a4f]'
                  }`}
                >
                  <span>🛒 All Categories</span>
                  <span className="text-[10px] opacity-80">{data.featured.length}</span>
                </button>

                {data.categories.map((cat) => {
                  const isSelected = filters.category === cat.id
                  const count = data.featured.filter((p) => p.category === cat.id).length
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, category: cat.id }))}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                        isSelected
                          ? 'bg-[#2f7a4f] text-white shadow-sm'
                          : 'text-[#5a6762] hover:bg-[#edf6ee] hover:text-[#2f7a4f]'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] opacity-80">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Markets Filter */}
            <div className="rounded-[24px] border border-[#dfe7e2] bg-white p-5 shadow-sm">
              <h3 className="font-syne text-sm font-black uppercase tracking-wider text-[#16231a]">Market Vendors</h3>
              <div className="mt-3 space-y-2 text-xs font-semibold text-[#5a6762]">
                {['', 'Kimironko Market', 'Nyabugogo Market', 'Simba Supermarket', 'Quality Supermarket'].map(
                  (m) => (
                    <label
                      key={m || 'all'}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg p-1 transition hover:text-[#2f7a4f]"
                    >
                      <input
                        type="radio"
                        name="marketFilter"
                        checked={filters.market === m}
                        onChange={() => setFilters((prev) => ({ ...prev, market: m }))}
                        className="accent-[#2f7a4f]"
                      />
                      <span>{m || 'All Kigali Markets'}</span>
                    </label>
                  ),
                )}
              </div>
            </div>

            {/* Price Max Slider */}
            <div className="rounded-[24px] border border-[#dfe7e2] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-syne text-sm font-black uppercase tracking-wider text-[#16231a]">Max Price</h3>
                <span className="text-xs font-bold text-[#2f7a4f]">{filters.priceMax.toLocaleString()} RWF</span>
              </div>
              <input
                type="range"
                min={1000}
                max={30000}
                step={500}
                value={filters.priceMax}
                onChange={(e) => setFilters((prev) => ({ ...prev, priceMax: Number(e.target.value) }))}
                className="mt-3 w-full accent-[#2f7a4f]"
              />
              <div className="mt-1 flex justify-between text-[10px] font-bold text-[#8a9e93]">
                <span>1,000 RWF</span>
                <span>30,000 RWF</span>
              </div>
            </div>
          </aside>

          {/* Center Products Grid */}
          <div>
            {/* Sorting & Filter summary bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dfe7e2] bg-white p-4 shadow-sm">
              <span className="text-xs font-bold text-[#5a6762]">
                Showing <strong className="text-[#16231a]">{filteredProducts.length}</strong> fresh items
              </span>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-[#5a6762]">Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                  className="rounded-xl border border-[#dfe7e2] bg-[#fafafa] px-3 py-1.5 font-bold text-[#1e2a22] outline-none transition focus:border-[#2f7a4f]"
                >
                  <option value="popular">🔥 Most Popular</option>
                  <option value="rating">⭐ Highest Rated</option>
                  <option value="low-to-high">💵 Price: Low to High</option>
                  <option value="high-to-low">💎 Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[28px] border border-[#dfe7e2] bg-white p-12 text-center shadow-sm">
                <span className="text-4xl">🥬</span>
                <h3 className="mt-3 font-syne text-xl font-black text-[#16231a]">No products found</h3>
                <p className="mt-1 text-sm text-[#5a6762]">Try adjusting your search query, price filter, or category.</p>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      category: 'all',
                      market: '',
                      searchQuery: '',
                      availability: '',
                      priceMax: 25000,
                      sortBy: 'popular',
                    })
                  }
                  className="mt-5 rounded-full bg-[#2f7a4f] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#256340]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Product Cards Grid */
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const qty = quantity[product.id] || 1
                  const chosenPkg = selectedPackaging[product.id] || (product.packaging?.[0] || '1 unit')

                  return (
                    <article
                      key={product.id}
                      className="group flex flex-col overflow-hidden rounded-[24px] border border-[#dfe7e2] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#2f7a4f]/50 hover:shadow-xl hover:shadow-[#2f7a4f]/10"
                    >
                      {/* Image container */}
                      <div
                        className="relative h-48 w-full cursor-pointer overflow-hidden bg-[#edf6ee]"
                        onClick={() => {
                          setSelectedProduct(product)
                          setShowModal(true)
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {product.badge && (
                          <span className="absolute left-3 top-3 rounded-full bg-[#2f7a4f] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                            {product.badge}
                          </span>
                        )}
                        <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-[#16231a] shadow-sm backdrop-blur-sm">
                          📍 {product.market}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-5">
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowModal(true)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2f7a4f]">
                              {product.freshness ?? 'Fresh'}
                            </span>
                            <span className="text-[11px] font-bold text-amber-600">
                              ★ {product.rating?.toFixed(1) ?? '4.8'}
                            </span>
                          </div>

                          <h3 className="mt-1.5 font-syne text-base font-black leading-snug text-[#16231a] group-hover:text-[#2f7a4f] transition-colors">
                            {product.name}
                          </h3>

                          {product.kinyarwandaName && (
                            <p className="text-xs font-medium text-[#718578]">{product.kinyarwandaName}</p>
                          )}
                        </div>

                        {/* Price & Packaging */}
                        <div className="mt-4 flex items-baseline justify-between border-t border-[#f0f4f1] pt-3">
                          <div>
                            <span className="font-syne text-lg font-black text-[#16231a]">
                              {parseInt(product.price, 10).toLocaleString()} RWF
                            </span>
                            <span className="ml-1 text-[11px] font-semibold text-[#718578]">
                              {product.priceUnit ?? ''}
                            </span>
                          </div>
                        </div>

                        {/* Quick Add Controller */}
                        <div className="mt-4 flex items-center gap-2">
                          <div className="flex items-center rounded-xl border border-[#dfe7e2] bg-[#f8faf8] p-1">
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity({
                                  ...quantity,
                                  [product.id]: Math.max(1, (quantity[product.id] || 1) - 1),
                                })
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#16231a] shadow-xs transition hover:bg-[#edf6ee]"
                            >
                              −
                            </button>
                            <span className="w-7 text-center font-syne text-xs font-bold text-[#16231a]">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity({
                                  ...quantity,
                                  [product.id]: (quantity[product.id] || 1) + 1,
                                })
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#16231a] shadow-xs transition hover:bg-[#edf6ee]"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(product, chosenPkg, qty)}
                            className="flex-1 rounded-xl bg-[#2f7a4f] py-2.5 text-center font-syne text-xs font-bold text-white shadow-md shadow-[#2f7a4f]/20 transition hover:bg-[#256340] active:scale-95"
                          >
                            Add to Basket
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar - Live Smart Basket & Delivery */}
          <aside className="space-y-6">
            {/* Live Basket Quick View */}
            <div className="rounded-[28px] border border-[#dfe7e2] bg-white p-6 shadow-md shadow-black/5">
              <div className="flex items-center justify-between">
                <h3 className="font-syne text-base font-black text-[#16231a]">Smart Basket</h3>
                <span className="rounded-full bg-[#2f7a4f] px-2.5 py-0.5 font-syne text-xs font-bold text-white">
                  {cartItemCount}
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div className="my-6 rounded-2xl bg-[#fafafa] p-6 text-center text-xs text-[#5a6762]">
                  <p className="font-bold text-[#16231a]">Your basket is empty</p>
                  <p className="mt-1">Add items from the store to see live checkout calculations.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1 text-xs">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl bg-[#f8faf8] p-2.5"
                      >
                        <div className="max-w-[150px] truncate">
                          <p className="font-bold text-[#16231a] truncate">{item.name}</p>
                          <p className="text-[10px] text-[#718578]">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-syne font-bold text-[#2f7a4f]">
                          {(item.price * item.quantity).toLocaleString()} RWF
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#dfe7e2] pt-4">
                    <div className="flex justify-between text-xs text-[#5a6762]">
                      <span>Subtotal</span>
                      <span className="font-bold text-[#16231a]">{cartTotal.toLocaleString()} RWF</span>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-[#5a6762]">
                      <span>Est. Kigali Delivery</span>
                      <span className="font-bold text-emerald-600">2,000 RWF</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/checkout')}
                    className="mt-2 w-full rounded-2xl bg-[#2f7a4f] py-3 text-center font-syne text-xs font-bold text-white shadow-lg shadow-[#2f7a4f]/25 transition hover:bg-[#256340] active:scale-[0.99]"
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Guarantee Card */}
            <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-br from-[#edf6ee] to-[#dcf0e0] p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h4 className="font-syne text-sm font-black text-[#16231a]">Guaranteed Kigali Delivery</h4>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#41544a]">
                Orders placed before 4:00 PM are delivered same-day directly to your doorstep in Nyarugenge, Gasabo, or Kicukiro.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-[#2f7a4f]">
                <span>✓ Verified fresh</span>
                <span>•</span>
                <span>✓ Cold-chain packed</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
