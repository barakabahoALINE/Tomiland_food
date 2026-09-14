import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'

type Market = {
  id: string
  name: string
  type: 'Local Market'
  area: string
  city: string
  image: string
  rating: number
  reviews: number
  distance: string
  isOpen: boolean
  closesAt: string
  itemsAvailable: number
  totalItems: number
  services: string[]
  estimatedBasket: string
  delivery: string
  pickup: string
  priceLevel: 'Budget Friendly' | 'Moderate' | 'Premium'
}

const placeholder = (label: string, width = 500, height = 340) =>
  `https://placehold.co/${width}x${height}/edf6ee/1c3f33?text=${encodeURIComponent(label)}`

const markets: Market[] = [
  {
    id: 'kimironko',
    name: 'Kimironko Market',
    type: 'Local Market',
    area: 'Kimironko',
    city: 'Kigali',
    image: placeholder('Kimironko Market'),
    rating: 4.6,
    reviews: 320,
    distance: '1.8 km away',
    isOpen: true,
    closesAt: '8:00 PM',
    itemsAvailable: 7,
    totalItems: 12,
    services: ['Delivery', 'Pick up later'],
    estimatedBasket: '22,800 RWF',
    delivery: 'Available',
    pickup: 'Available later',
    priceLevel: 'Moderate',
  },
  {
    id: 'nyabugogo',
    name: 'Nyabugogo Market',
    type: 'Local Market',
    area: 'Nyabugogo',
    city: 'Kigali',
    image: placeholder('Nyabugogo Market'),
    rating: 4.4,
    reviews: 286,
    distance: '4.5 km away',
    isOpen: true,
    closesAt: '6:30 PM',
    itemsAvailable: 5,
    totalItems: 12,
    services: ['Pick up later'],
    estimatedBasket: '21,700 RWF',
    delivery: 'Unavailable',
    pickup: 'Available later',
    priceLevel: 'Budget Friendly',
  },
  {
    id: 'gisozi',
    name: 'Gisozi Fresh Market',
    type: 'Local Market',
    area: 'Gisozi',
    city: 'Kigali',
    image: placeholder('Gisozi Market'),
    rating: 4.7,
    reviews: 418,
    distance: '2.9 km away',
    isOpen: false,
    closesAt: 'Closed',
    itemsAvailable: 4,
    totalItems: 12,
    services: ['Delivery', 'Pick up now'],
    estimatedBasket: '23,400 RWF',
    delivery: 'Available',
    pickup: 'Open now',
    priceLevel: 'Premium',
  },
  {
    id: 'remera',
    name: 'Remera Local Market',
    type: 'Local Market',
    area: 'Remera',
    city: 'Kigali',
    image: placeholder('Remera Market'),
    rating: 4.5,
    reviews: 332,
    distance: '3.1 km away',
    isOpen: true,
    closesAt: '7:30 PM',
    itemsAvailable: 8,
    totalItems: 12,
    services: ['Delivery', 'Pick up now', 'Pick up later'],
    estimatedBasket: '24,100 RWF',
    delivery: 'Available',
    pickup: 'Available',
    priceLevel: 'Moderate',
  },
]

export default function MarketsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<'All' | 'Local Market'>('All')
  const [selectedMarketId, setSelectedMarketId] = useState('kimironko')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [openNowOnly, setOpenNowOnly] = useState(false)
  const [maxDistance, setMaxDistance] = useState(10)
  const [selectedPrice, setSelectedPrice] = useState<string[]>([])
  const [minimumRating, setMinimumRating] = useState(0)
  const [sortBy, setSortBy] = useState<'Best match' | 'Rating' | 'Distance' | 'Price'>('Best match')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [expandedMarketId, setExpandedMarketId] = useState<string | null>(null)
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(['kimironko', 'nyabugogo'])
  const [assistanceRequested, setAssistanceRequested] = useState(false)

  const resetFilters = () => {
    setSelectedType('All')
    setSelectedServices([])
    setOpenNowOnly(false)
    setMaxDistance(10)
    setSelectedPrice([])
    setMinimumRating(0)
    setSearch('')
    setSortBy('Best match')
    setPage(1)
  }

  const selectMarket = (marketId: string) => {
    setSelectedMarketId(marketId)
    setRecentlyViewedIds((current) => [marketId, ...current.filter((id) => id !== marketId)].slice(0, 3))
  }

  const shopFromMarket = (market: Market) => {
    selectMarket(market.id)
    navigate(`/products?market=${encodeURIComponent(market.name)}`)
  }

  const toggleFilterValue = (value: string, values: string[], setValues: (next: string[]) => void) => {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
    setPage(1)
  }

  const filteredMarkets = useMemo(() => {
    const q = search.trim().toLowerCase()

    return markets.filter((market) => {
      const matchesType = selectedType === 'All' || market.type === selectedType
      const matchesServices = selectedServices.length === 0 || selectedServices.every((service) => market.services.includes(service))
      const distanceNumber = Number.parseFloat(market.distance)
      const matchesDistance = distanceNumber <= maxDistance
      const matchesOpen = !openNowOnly || market.isOpen
      const matchesPrice = selectedPrice.length === 0 || selectedPrice.includes(market.priceLevel)
      const matchesRating = market.rating >= minimumRating
      const matchesSearch = !q ||
        market.name.toLowerCase().includes(q) ||
        market.area.toLowerCase().includes(q) ||
        market.city.toLowerCase().includes(q)
      return matchesType && matchesServices && matchesDistance && matchesOpen && matchesPrice && matchesRating && matchesSearch
    }).sort((first, second) => {
      if (sortBy === 'Rating') return second.rating - first.rating
      if (sortBy === 'Distance') return Number.parseFloat(first.distance) - Number.parseFloat(second.distance)
      if (sortBy === 'Price') return Number.parseFloat(first.estimatedBasket.replace(/[^0-9]/g, '')) - Number.parseFloat(second.estimatedBasket.replace(/[^0-9]/g, ''))
      return 0
    })
  }, [maxDistance, minimumRating, openNowOnly, search, selectedPrice, selectedServices, selectedType, sortBy])

  const selectedMarket = filteredMarkets.find((market) => market.id === selectedMarketId) ?? filteredMarkets[0] ?? markets[0]
  const pageSize = 4
  const pageCount = Math.max(1, Math.ceil(filteredMarkets.length / pageSize))
  const visibleMarkets = filteredMarkets.slice((page - 1) * pageSize, page * pageSize)
  const recentlyViewedMarkets = recentlyViewedIds
    .map((id) => markets.find((market) => market.id === id))
    .filter((market): market is Market => Boolean(market))

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

      <main className="mx-auto max-w-[1280px] px-6 py-6 lg:px-8">
        <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
          <aside className="self-start">
            <div className="rounded-[16px] border border-[#dfe7e2] bg-white p-2.5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7a4f]">Find the best markets</p>
              <div className="mt-2 flex items-start justify-between gap-2">
                <p className="text-xs leading-4 text-[#5a6762]">Use filters to find markets that suit your needs.</p>
                <button
                  onClick={resetFilters}
                  className="shrink-0 text-xs font-bold text-[#2f7a4f] hover:underline"
                >
                  Clear all
                </button>
              </div>

              <div className="mt-3 space-y-2.5">
                <div>
                  <p className="mb-1 text-xs font-bold text-[#1e2a22]">Market Type</p>
                  <div className="space-y-1">
                    {['All', 'Local Market'].map((type) => (
                      <label key={type} className="flex items-center gap-2 text-xs text-[#52645a]">
                        <input
                          type="radio"
                          checked={selectedType === type}
                          onChange={() => {
                            setSelectedType(type as 'All' | 'Local Market')
                            setPage(1)
                          }}
                          className="accent-[#2f7a4f]"
                        />
                        {type === 'All' ? 'All local markets' : type}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold text-[#1e2a22]">Services offered</p>
                  <div className="space-y-1 text-xs text-[#52645a]">
                    {['Delivery', 'Pick up now', 'Pick up later'].map((service) => (
                      <label key={service} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service)}
                          onChange={() => toggleFilterValue(service, selectedServices, setSelectedServices)}
                          className="accent-[#2f7a4f]"
                        />
                        {service === 'Delivery' ? 'Home Delivery' : service}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold text-[#1e2a22]">Availability</p>
                  <div className="space-y-1 text-xs text-[#52645a]">
                    {['Open Now', 'Available today'].map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={option === 'Open Now' ? openNowOnly : false}
                          onChange={() => option === 'Open Now' && (setOpenNowOnly(!openNowOnly), setPage(1))}
                          className="accent-[#2f7a4f]"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-bold text-[#1e2a22]">Distance</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={maxDistance}
                      onChange={(event) => {
                        setMaxDistance(Number(event.target.value))
                        setPage(1)
                      }}
                      className="w-full accent-[#2f7a4f]"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#5a6762]">Within {maxDistance} km</p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold text-[#1e2a22]">Price level</p>
                  <div className="space-y-1 text-xs text-[#52645a]">
                    {['Budget Friendly', 'Moderate', 'Premium'].map((price) => (
                      <label key={price} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedPrice.includes(price)}
                          onChange={() => toggleFilterValue(price, selectedPrice, setSelectedPrice)}
                          className="accent-[#2f7a4f]"
                        />
                        {price}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold text-[#1e2a22]">Rating</p>
                  <div className="flex flex-col items-start gap-0 text-xs text-[#e99b22]">
                    {[4, 3, 2].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => {
                          setMinimumRating(minimumRating === rating ? 0 : rating)
                          setPage(1)
                        }}
                        className={minimumRating === rating ? 'font-bold' : 'opacity-60'}
                        aria-label={`${rating} stars and above`}
                      >
                        {'★'.repeat(rating)}<span className="text-[#52645a]"> {rating}.0 and up</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => setPage(1)} className="mt-3 w-full rounded-full bg-[#2f7a4f] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#266e45]">
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="mt-1 w-full rounded-full border border-[#dfe7e2] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f7a4f] hover:bg-[#f5faf6]"
              >
                Reset all
              </button>
            </div>
          </aside>

          <section className="min-w-0">
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2f7a4f]">Markets</p>
                  <h1 className="mt-1 text-3xl font-black tracking-[-0.06em] text-[#1e2a22]">Local markets near you</h1>
                </div>
                <div className="rounded-full bg-[#edf6ee] px-3 py-2 text-sm font-semibold text-[#2f7a4f]">
                  38 local markets available
                </div>
              </div>

              <p className="mt-2 max-w-3xl text-xs leading-5 text-[#4d5d53]">
                Shop from trusted local markets and compare availability, prices and delivery options before choosing where Tomiland should shop for you.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['♡', 'Local & Trusted', 'Verified local markets and sellers'],
                  ['✦', 'Best Prices', 'Compare prices and save more'],
                  ['◷', 'Real-time Updates', 'Prices and availability updated in real-time'],
                  ['⌂', 'Flexible Options', 'Delivery or pickup that works for you'],
                ].map(([icon, title, description]) => (
                  <div key={title} className="rounded-[14px] border border-[#e7ece7] bg-[#fbfcfa] p-2.5">
                    <div className="flex items-start gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf6ee] text-sm font-bold text-[#2f7a4f]">{icon}</span>
                      <div>
                        <p className="text-xs font-bold text-[#1e2a22]">{title}</p>
                        <p className="mt-0.5 text-[11px] leading-4 text-[#5a6762]">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid gap-2 rounded-[16px] border border-[#edf0ed] bg-[#f9faf8] p-2 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center">
                <div className="flex items-center gap-2 rounded-full border border-[#dfe7e2] bg-white px-3 py-2 shadow-sm">
                  <span className="text-lg text-[#5b6c63]">⌕</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search markets, locations..."
                    className="w-full border-none bg-transparent text-sm text-[#1e2a22] outline-none placeholder:text-[#5a6762]"
                  />
                </div>

                <button
                  onClick={() => setViewMode('map')}
                  className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm ${viewMode === 'map' ? 'border-[#2f7a4f] bg-[#ebf7ef] text-[#2f7a4f]' : 'border-[#dfe7e2] bg-white text-[#1e2a22] hover:bg-[#f5faf6]'}`}
                >
                  Map View
                </button>

                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${viewMode === 'list' ? 'border-[#2f7a4f] bg-[#ebf7ef] text-[#2f7a4f]' : 'border-[#dfe7e2] bg-white text-[#1e2a22] hover:bg-[#f5faf6]'}`}
                >
                  List View
                </button>

                <label className="flex items-center justify-between gap-2 rounded-full border border-[#dfe7e2] bg-white px-4 py-2 text-sm text-[#52645a]">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                    className="bg-transparent font-semibold text-[#1e2a22] outline-none"
                  >
                    <option>Best match</option>
                    <option>Rating</option>
                    <option>Distance</option>
                    <option>Price</option>
                  </select>
                </label>
              </div>
            </>

            {viewMode === 'map' && (
              <div className="mt-3 rounded-[18px] border border-[#dfe7e2] bg-[#edf6ee] p-3 shadow-sm">
                <div className="flex min-h-[150px] flex-col justify-between rounded-[14px] border border-[#cfe1d3] bg-[radial-gradient(circle_at_top,_#f8fcf7,_#dfeee3_60%,_#cfe1d3_100%)] p-4">
                  <div>
                    <p className="text-sm font-bold text-[#1e2a22]">Local markets around Kigali</p>
                    <p className="mt-1 text-xs text-[#52645a]">Select a market below to start your basket there.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {visibleMarkets.map((market) => (
                      <button key={market.id} onClick={() => selectMarket(market.id)} className="rounded-full border border-[#cfe1d3] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f7a4f] shadow-sm">
                        {market.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-2">
              {visibleMarkets.map((market) => {
                const isSelected = selectedMarket.id === market.id

                return (
                  <article
                    key={market.id}
                    className={`rounded-[18px] border p-2 shadow-sm transition ${isSelected ? 'border-[#cfe1d3] bg-[#f5faf6]' : 'border-[#dfe7e2] bg-white'}`}
                  >
                    <div className="grid gap-3 md:grid-cols-[150px_minmax(0,1fr)_150px] md:items-center">
                      <div className="overflow-hidden rounded-[14px] border border-[#e5e9e4] bg-[#f5faf6]">
                        <img src={market.image} alt={market.name} className="h-20 w-full object-cover" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-black tracking-[-0.04em] text-[#1d2f27]">{market.name}</h2>
                          {market.isOpen && <span className="rounded-full bg-[#ebf7ef] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#2f7a4f]">Open now</span>}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#52645a]">
                          <span className="font-medium text-[#1e2a22]">{market.type}</span>
                          <span>•</span>
                          <span>{market.area}, {market.city}</span>
                          <span>•</span>
                          <span>★ {market.rating.toFixed(1)} ({market.reviews})</span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#5a6762]">
                          <span>{market.distance}</span>
                          <span>•</span>
                          <span>{market.isOpen ? 'Open now' : 'Closed'} • Closes at {market.closesAt}</span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-[#edf6ee] px-2 py-0.5 text-[9px] font-semibold text-[#2f7a4f]">{market.itemsAvailable}/{market.totalItems} basket items available</span>
                          {market.services.map((service) => (
                            <span key={service} className="rounded-full border border-[#dfe7e2] bg-white px-2 py-0.5 text-[9px] font-medium text-[#52645a]">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] uppercase tracking-[0.12em] text-[#5a6762]">Estimated basket</p>
                          <p className="mt-0.5 text-lg font-black text-[#1e2a22]">{market.estimatedBasket}</p>
                        </div>

                        <div className="flex w-full flex-col gap-1.5 md:w-auto md:min-w-[130px]">
                          <button
                            onClick={() => shopFromMarket(market)}
                            className="rounded-full bg-[#2f7a4f] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#266e45]"
                          >
                            Shop Here
                          </button>
                          <button
                            onClick={() => setExpandedMarketId(expandedMarketId === market.id ? null : market.id)}
                            className="rounded-full border border-[#dfe7e2] bg-white px-4 py-2 text-xs font-semibold text-[#2f7a4f] hover:bg-[#f5faf6]"
                          >
                            {expandedMarketId === market.id ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    </div>
                    {expandedMarketId === market.id && (
                      <div className="mt-2 grid gap-2 rounded-[12px] border-t border-[#dfe7e2] bg-white/70 px-2 pt-2 text-[11px] text-[#52645a] sm:grid-cols-3">
                        <span><strong className="text-[#1e2a22]">Delivery:</strong> {market.delivery}</span>
                        <span><strong className="text-[#1e2a22]">Pickup:</strong> {market.pickup}</span>
                        <span><strong className="text-[#1e2a22]">Price level:</strong> {market.priceLevel}</span>
                      </div>
                    )}
                  </article>
                )
              })}

              {filteredMarkets.length === 0 && (
                <div className="rounded-[22px] border border-dashed border-[#cfe1d3] bg-white p-10 text-center">
                  <p className="text-lg font-bold text-[#1e2a22]">No local markets match these filters</p>
                  <p className="mt-2 text-sm text-[#5a6762]">Try clearing a filter or searching for another location.</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe7e2] bg-white text-[#52645a] disabled:opacity-40">‹</button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                  <button key={number} onClick={() => setPage(number)} className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold ${page === number ? 'border-[#2f7a4f] bg-[#2f7a4f] text-white' : 'border-[#dfe7e2] bg-white text-[#52645a]'}`}>
                    {number}
                  </button>
                ))}
                <button onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page === pageCount} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe7e2] bg-white text-[#52645a] disabled:opacity-40">›</button>
              </div>

              <div className="mt-1 flex flex-col items-center justify-between gap-3 rounded-[16px] border border-[#dfe7e2] bg-white p-3 sm:flex-row">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf6ee] text-xl text-[#2f7a4f]">▣</span>
                  <div>
                    <p className="text-sm font-bold text-[#1e2a22]">Can&apos;t find what you need?</p>
                    <p className="text-xs text-[#5a6762]">We&apos;ll help you find the best market.</p>
                  </div>
                </div>
                <button onClick={() => setAssistanceRequested(true)} className="rounded-full bg-[#2f7a4f] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#266e45]">
                  {assistanceRequested ? 'Request sent' : 'Request Assistance'}
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-3 self-start">
            <div className="rounded-[16px] border border-[#dfe7e2] bg-white p-3.5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.13em] text-[#2f7a4f]">Why shop with local markets?</h3>
              <ul className="mt-3 space-y-2.5 text-xs leading-4 text-[#52645a]">
                {['Fresh products from trusted local sellers', 'Better prices and real value for money', 'Support local businesses and communities', 'Carefully selected and quality checked'].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#edf6ee] text-[9px] font-bold text-[#2f7a4f]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => setAssistanceRequested(true)} className="mt-3 w-full rounded-full border border-[#dfe7e2] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f7a4f] hover:bg-[#f5faf6]">
                Learn more about our markets →
              </button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7e2] bg-white p-3.5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.13em] text-[#2f7a4f]">Need help choosing?</h3>
              <p className="mt-2 text-xs leading-4 text-[#5a6762]">Our team is here to help you find the right market.</p>
              <div className="mt-3 rounded-xl bg-[#edf6ee] p-2.5">
                <p className="text-xl font-black text-[#1e2a22]">0800 1234</p>
                <p className="mt-1 text-xs text-[#52645a]">Everyday: 7AM – 8PM</p>
              </div>
              <button onClick={() => window.open('https://wa.me/2508001234', '_blank', 'noopener,noreferrer')} className="mt-3 w-full rounded-full border border-[#2f7a4f] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f7a4f] hover:bg-[#ebf7ef]">
                Chat on WhatsApp
              </button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7e2] bg-white p-3.5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.13em] text-[#2f7a4f]">Fresh from local markets</h3>
              <p className="mt-2 text-xs leading-4 text-[#5a6762]">Quality you can trust, delivered to your doorstep.</p>
              <div className="mt-3 overflow-hidden rounded-[14px] bg-[#edf6ee] p-2">
                <div className="h-24 rounded-[11px] bg-[radial-gradient(circle_at_top,_#f2f9f1,_#dfeee3_55%,_#cfe1d3_100%)]" />
              </div>
              <button onClick={() => setAssistanceRequested(true)} className="mt-3 w-full rounded-full bg-[#ebf7ef] px-3 py-1.5 text-xs font-semibold text-[#2f7a4f] hover:bg-[#dfeee5]">
                Learn more →
              </button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7e2] bg-white p-3.5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.13em] text-[#2f7a4f]">Recently viewed markets</h3>
              <div className="mt-3 space-y-2.5">
                {recentlyViewedMarkets.map((market) => (
                  <button key={market.id} onClick={() => selectMarket(market.id)} className="flex w-full items-center gap-2 text-left">
                    <img src={market.image} alt="" className="h-10 w-12 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-[#1e2a22]">{market.name}</span>
                      <span className="text-[11px] text-[#5a6762]">{market.area}, {market.city}</span>
                    </span>
                    <span className="text-lg text-[#52645a]">›</span>
                  </button>
                ))}
              </div>
              <button onClick={resetFilters} className="mt-3 text-[11px] font-bold text-[#2f7a4f] hover:underline">View all markets →</button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
