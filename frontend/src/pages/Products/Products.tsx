import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { addItem } from '../../store/slices/cart/cartSlice'
import { getProductsData, type ProductsData, type Product } from '../../data/mockApi'
import Header from '../../components/Header/Header'

type FilterState = {
  category: string
  market: string
  availability: string
  priceRange: [number, number]
  sortBy: 'popular' | 'low-to-high' | 'high-to-low' | 'newest'
}

export default function ProductsPage() {
  const location = useLocation()
  const [data, setData] = useState<ProductsData | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    category: 'fresh-produce',
    market: new URLSearchParams(location.search).get('market') ?? '',
    availability: '',
    priceRange: [0, 10000],
    sortBy: 'popular',
  })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedPackaging, setSelectedPackaging] = useState<{ [key: string]: string }>({})
  const [quantity, setQuantity] = useState<{ [key: string]: number }>({})
  const dispatch = useAppDispatch()

  useEffect(() => {
    const loadProducts = async () => {
      const productsData = await getProductsData()
      setData(productsData)
      // Initialize packaging and quantity
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
    }
    void loadProducts()
  }, [])

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f1ea] text-[#1f3a2b]">
        <div className="rounded-full border border-[#dfeae3] bg-white px-6 py-3 text-sm font-medium shadow-sm">
          Loading...
        </div>
      </div>
    )
  }

  // Filter products based on selected filters
  const filteredProducts = data.featured
    .filter((product) => {
      const matchesCategory = product.category === filters.category
      const matchesMarket = !filters.market || product.market === filters.market
      const matchesAvailability = !filters.availability ||
        (filters.availability === 'Available today' && product.availability === 'available') ||
        (filters.availability === 'Low stock' && product.availability === 'limited') ||
        (filters.availability === 'Out of stock' && product.availability === 'out_of_stock')
      const price = Number.parseInt(product.price, 10) || 0
      const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1]

      return matchesCategory && matchesMarket && matchesAvailability && matchesPrice
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'low-to-high':
          return Number.parseInt(a.price, 10) - Number.parseInt(b.price, 10)
        case 'high-to-low':
          return Number.parseInt(b.price, 10) - Number.parseInt(a.price, 10)
        case 'newest':
          return 0
        default:
          return 0
      }
    })

  const currentCategory = data.categories.find((c) => c.id === filters.category)
  const subcategories = Array.from(new Set(data.featured.filter((p) => p.category === filters.category).map((p) => p.subcategory)))

  const handleAddToCart = (product: Product, pkg: string, qty: number) => {
    dispatch(addItem({
      id: `${product.id}-${pkg}`,
      name: `${product.name}${product.kinyarwandaName ? ` / ${product.kinyarwandaName}` : ''} (${pkg})`,
      price: parseInt(product.price),
      quantity: qty,
      imageUrl: product.image,
    }))
  }

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#1e2a22]">
      <Header />

      {showModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-2xl rounded-[28px] bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="sticky top-0 right-0 float-right m-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            >
              ✕
            </button>

            <div className="p-6">
              {/* Product Image */}
              <div className="mb-6 rounded-[20px] overflow-hidden bg-[#f5faf6] h-64 w-full">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-cover" />
              </div>

              {/* Product Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1d2f27]">
                      {selectedProduct.name}
                      {selectedProduct.kinyarwandaName && <span className="text-sm font-normal text-[#5a6762]"> / {selectedProduct.kinyarwandaName}</span>}
                    </h2>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2f7a4f]">
                        {selectedProduct.freshness}
                      </span>
                      {selectedProduct.badge === 'FARM FRESH' && <span className="text-xs text-[#2f7a4f]">• Local</span>}
                    </div>
                  </div>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5faf6] hover:bg-[#ebf7ef]">
                    ♡
                  </button>
                </div>
              </div>

              {/* Rating & Availability */}
              <div className="mb-6 flex items-center gap-6 pb-6 border-b border-[#dfe7e2]">
                <div>
                  <p className="text-xs text-[#5a6762]">Rating</p>
                  <p className="text-lg font-bold text-[#1e2a22]">★ {selectedProduct.rating.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5a6762]">Market</p>
                  <p className="text-lg font-bold text-[#1e2a22]">{selectedProduct.market}</p>
                </div>
                {selectedProduct.availability && (
                  <div className="flex-1">
                    <p className="text-xs text-[#5a6762]">Availability</p>
                    <p className="inline-block mt-1 rounded-full bg-[#ebf7ef] px-3 py-1 text-xs font-medium text-[#2f7a4f]">
                      {selectedProduct.availability === 'available' && 'Available today'}
                      {selectedProduct.availability === 'limited' && 'Limited availability'}
                      {selectedProduct.availability === 'out_of_stock' && 'Out of stock'}
                    </p>
                  </div>
                )}
              </div>

              {/* Product Details */}
              {selectedProduct.details && Object.keys(selectedProduct.details).length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-bold text-[#1e2a22]">Details</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedProduct.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm text-[#5a6762]">
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-[#dfe7e2] pt-4" />
                </div>
              )}

              {/* Options/Variants */}
              {selectedProduct.options && selectedProduct.options.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-bold text-[#1e2a22]">Options</h3>
                  <div className="space-y-4">
                    {selectedProduct.options.map((option, idx) => (
                      <div key={idx}>
                        <label className="mb-2 block text-sm font-medium text-[#1e2a22]">{option.label}</label>
                        <div className="flex flex-wrap gap-2">
                          {option.options.map((opt) => (
                            <button
                              key={opt}
                              className="rounded-lg border border-[#dfe7e2] bg-white px-4 py-2 text-sm font-medium text-[#1e2a22] hover:border-[#2f7a4f] hover:bg-[#ebf7ef] hover:text-[#2f7a4f]"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-[#dfe7e2]" />
                </div>
              )}

              {/* Packaging Selection */}
              {selectedProduct.packaging && selectedProduct.packaging.length > 0 && (
                <div className="mb-6 pt-4">
                  <h3 className="mb-4 text-sm font-bold text-[#1e2a22]">Select Packaging</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedProduct.packaging.map((pkg) => (
                      <button
                        key={pkg}
                        onClick={() => setSelectedPackaging({ ...selectedPackaging, [selectedProduct.id]: pkg })}
                        className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                          selectedPackaging[selectedProduct.id] === pkg
                            ? 'border-[#2f7a4f] bg-[#ebf7ef] text-[#2f7a4f]'
                            : 'border-[#dfe7e2] bg-white text-[#1e2a22] hover:border-[#2f7a4f]'
                        }`}
                      >
                        {pkg}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Section */}
              <div className="mb-6 rounded-lg border border-[#dfe7e2] bg-[#f9faf8] p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-[#5a6762]">Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#1e2a22]">{selectedProduct.price}</span>
                    {selectedProduct.priceUnit && <span className="text-sm text-[#5a6762]">{selectedProduct.priceUnit}</span>}
                  </div>
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border border-[#dfe7e2] p-4">
                  <span className="text-sm font-medium text-[#1e2a22]">Quantity:</span>
                  <div className="flex items-center gap-3 ml-auto">
                    <button
                      onClick={() => setQuantity({ ...quantity, [selectedProduct.id]: Math.max(1, (quantity[selectedProduct.id] || 1) - 1) })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dfe7e2] hover:bg-[#f5faf6]"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-lg font-bold">{quantity[selectedProduct.id] || 1}</span>
                    <button
                      onClick={() => setQuantity({ ...quantity, [selectedProduct.id]: (quantity[selectedProduct.id] || 1) + 1 })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dfe7e2] hover:bg-[#f5faf6]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const pkg = selectedPackaging[selectedProduct.id] || (selectedProduct.packaging?.[0] || '1 unit')
                    handleAddToCart(selectedProduct, pkg, quantity[selectedProduct.id] || 1)
                    setShowModal(false)
                  }}
                  className="w-full rounded-lg bg-[#2f7a4f] px-6 py-4 text-lg font-bold text-white shadow-sm hover:bg-[#266e45] transition"
                >
                  Add to Basket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1280px] px-6 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr_280px]">
          {/* Left Sidebar - Categories & Filters */}
          <aside className="space-y-5">
            {/* All Categories */}
            <div className="rounded-[18px] border border-[#dfe7e2] bg-white p-3.5 shadow-sm">
              <button className="mb-3 flex w-full items-center justify-center rounded-full bg-[#2f7a4f] px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-[#266e45]">
                All Categories
              </button>

              <div className="space-y-1">
                {data.categories.map((category) => {
                  const isSelected = filters.category === category.id

                  return (
                    <button
                      key={category.id}
                      onClick={() => setFilters({ ...filters, category: category.id })}
                      className={`flex w-full items-center gap-2 rounded-xl p-2 text-left transition ${
                        isSelected
                          ? 'bg-[#edf6ee] text-[#2f7a4f] ring-1 ring-[#c9dfce]'
                          : 'text-[#52645a] hover:bg-[#f5faf6] hover:text-[#2f7a4f]'
                      }`}
                    >
                      <img
                        src={category.image}
                        alt=""
                        className="h-7 w-7 shrink-0 rounded-lg object-cover"
                      />
                      <span className="flex-1 text-[10px] font-semibold leading-4">
                        {category.name}
                      </span>
                      {isSelected && <span className="ml-auto text-xs font-black text-[#2f7a4f]">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Market/Supermarket Filter */}
            <div className="rounded-[24px] border border-[#dfe6e0] bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-[#1e2a22]">Market / Supermarket</h3>
              <div className="space-y-2">
                {['Kimironko Market', 'Nyabugogo Market', 'Simba Supermarket', 'Quality Supermarket'].map((market) => (
                  <label key={market} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-[#dfe9e1] accent-[#2f7a4f]"
                      checked={filters.market === market}
                      onChange={(e) => setFilters({ ...filters, market: e.target.checked ? market : '' })}
                    />
                    <span className="text-sm text-[#5a6762]">{market}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="rounded-[24px] border border-[#dfe6e0] bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-[#1e2a22]">Availability</h3>
              <div className="space-y-2">
                {['Available today', 'Low stock', 'Out of stock'].map((status) => (
                  <label key={status} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-[#dfe9e1] accent-[#2f7a4f]"
                      onChange={(e) => setFilters({ ...filters, availability: e.target.checked ? status : '' })}
                    />
                    <span className="text-sm text-[#5a6762]">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="rounded-[24px] border border-[#dfe6e0] bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-[#1e2a22]">Price Range</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-[#dfe9e1] accent-[#2f7a4f]"
                  />
                  <span className="text-sm text-[#5a6762]">Under 2,000 RWF</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-[#dfe9e1] accent-[#2f7a4f]"
                  />
                  <span className="text-sm text-[#5a6762]">2,000 - 5,000 RWF</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-[#dfe9e1] accent-[#2f7a4f]"
                  />
                  <span className="text-sm text-[#5a6762]">Above 5,000 RWF</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="space-y-5">
            {/* Category Header */}
            <section className="rounded-[26px] border border-[#dfe6e0] bg-white p-5 shadow-sm">
              <div className="mb-3">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2f7a4f]">Fresh picks</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#1e2a22]">{currentCategory?.name}</h1>
                <p className="mt-2 text-sm text-[#5a6762]">{filteredProducts.length} items available today</p>
              </div>

              {/* Subcategories */}
              {subcategories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-full border border-[#dfe7e2] bg-[#f9faf8] px-4 py-2 text-sm font-medium text-[#23372f] shadow-sm hover:border-[#2f7a4f] hover:bg-[#ebf7ef] hover:text-[#2f7a4f]">
                    All
                  </button>
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      className="rounded-full border border-[#dfe7e2] bg-[#f9faf8] px-4 py-2 text-sm font-medium text-[#23372f] shadow-sm hover:border-[#2f7a4f] hover:bg-[#ebf7ef] hover:text-[#2f7a4f]"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Sort & View Options */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-[#5a6762]">Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="rounded-full border border-[#dfe7e2] bg-white px-3 py-1.5 text-sm font-medium text-[#1e2a22] shadow-sm hover:border-[#2f7a4f]"
                >
                  <option value="popular">Popular</option>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#5a6762]">View:</span>
                <button className="rounded-lg border border-[#2f7a4f] bg-[#2f7a4f] px-3 py-2 text-sm text-white">
                  Grid
                </button>
                <button className="rounded-lg border border-[#dfe7e2] bg-white px-3 py-2 text-sm text-[#1e2a22] hover:border-[#2f7a4f]">
                  List
                </button>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-[18px] border border-[#e5e9e4] bg-white shadow-sm transition hover:shadow-md cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(product)
                    setShowModal(true)
                  }}
                >
                  {/* Product Image */}
                  <div className="relative h-32 w-full overflow-hidden bg-[#f5faf6]">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    {product.badge && (
                      <div className="absolute right-2 top-2 rounded-full bg-[#2f7a4f] px-2 py-0.5 text-[10px] font-bold text-white">
                        {product.badge}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow-sm transition hover:scale-110"
                    >
                      ♡
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col p-3">
                    <div className="mb-2">
                      <h3 className="text-[15px] font-bold leading-tight text-[#1d2f27]">
                        {product.name}
                        {product.kinyarwandaName && <span className="text-[11px] font-normal text-[#5a6762]"> / {product.kinyarwandaName}</span>}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2f7a4f]">
                          {product.freshness}
                        </span>
                        {product.badge === 'FARM FRESH' && <span className="text-[10px] text-[#2f7a4f]">• Local</span>}
                      </div>
                    </div>

                    {product.details && Object.keys(product.details).length > 0 && (
                      <div className="mb-2 space-y-0.5 text-[10px] text-[#5a6762]">
                        {Object.entries(product.details).map(([key, value]) => (
                          <div key={key}>{key}: <span className="font-medium">{value}</span></div>
                        ))}
                      </div>
                    )}

                    {product.packaging && product.packaging.length > 0 && (
                      <div className="mb-2 text-[10px] text-[#5a6762]">
                        Packaging: <span className="font-medium">{product.packaging[0]}</span>
                      </div>
                    )}

                    <div className="mb-2 text-[10px] text-[#5a6762]">
                      <span className="font-medium text-[#1e2a22]">{product.market}</span>
                      {product.rating && <span className="ml-2">★ {product.rating.toFixed(1)}</span>}
                    </div>

                    {product.availability && (
                      <div className="mb-2 inline-block rounded-full bg-[#ebf7ef] px-2 py-0.5 text-[10px] font-medium text-[#2f7a4f]">
                        {product.availability === 'available' && 'Available today'}
                        {product.availability === 'limited' && 'Limited availability'}
                        {product.availability === 'out_of_stock' && 'Out of stock'}
                      </div>
                    )}

                    <div
                      className="mb-3 mt-auto flex items-center justify-between rounded-lg border border-[#dfe7e2] p-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setQuantity({ ...quantity, [product.id]: Math.max(1, (quantity[product.id] || 1) - 1) })}
                        className="flex h-5 w-5 items-center justify-center rounded text-base hover:bg-[#f5faf6]"
                      >
                        −
                      </button>
                      <span className="text-xs font-semibold">{quantity[product.id] || 1}</span>
                      <button
                        onClick={() => setQuantity({ ...quantity, [product.id]: (quantity[product.id] || 1) + 1 })}
                        className="flex h-5 w-5 items-center justify-center rounded text-base hover:bg-[#f5faf6]"
                      >
                        +
                      </button>
                    </div>

                    <div
                      className="flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <span className="text-lg font-bold text-[#1e2a22]">{product.price}</span>
                        {product.priceUnit && <span className="text-[10px] text-[#5a6762]"> {product.priceUnit}</span>}
                      </div>
                      <button
                        onClick={() => {
                          const pkg = selectedPackaging[product.id] || (product.packaging?.[0] || '1 unit')
                          handleAddToCart(product, pkg, quantity[product.id] || 1)
                        }}
                        className="flex-1 rounded-lg bg-[#2f7a4f] px-2.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#266e45]"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Support & Info */}
          <aside className="space-y-6">
            <div className="rounded-[24px] border border-[#dfe6e0] bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-[#1e2a22]">Need help ordering?</h3>
              <p className="mb-4 text-sm text-[#5a6762]">Call us toll free</p>
              <div className="mb-4 rounded-lg bg-[#2f7a4f] px-3 py-2">
                <p className="text-lg font-bold text-white">0800 1234</p>
                <p className="text-xs text-[#ebf7ef]">Everyday: 7AM – 8PM</p>
              </div>
              <button className="w-full rounded-lg border border-[#2f7a4f] bg-white px-3 py-2 text-sm font-semibold text-[#2f7a4f] hover:bg-[#ebf7ef]">
                Chat on WhatsApp
              </button>
            </div>

            {/* Trust Section */}
            <div className="rounded-[24px] border border-[#dfe6e0] bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-[#1e2a22]">Fresh from trusted markets</h3>
              <p className="text-sm text-[#5a6762]">Quality you can trust, carefully selected and delivered to your doorstep.</p>
              <button className="mt-4 w-full rounded-lg bg-[#ebf7ef] px-3 py-2 text-sm font-semibold text-[#2f7a4f] hover:bg-[#dfeee5]">
                Learn more →
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
