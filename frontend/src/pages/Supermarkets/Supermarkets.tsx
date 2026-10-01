import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'

type Supermarket = {
  id: string
  name: string
  area: string
  city: string
  rating: number
  reviews: number
  distance: string
  isOpen: boolean
  closesAt: string
  itemsAvailable: number
  totalItems: number
  services: string[]
  estimatedBasket: string
  priceLevel: 'Budget Friendly' | 'Moderate' | 'Premium'
  image: string
}

const imageFor = (label: string) => `https://placehold.co/500x340/edf6ee/1c3f33?text=${encodeURIComponent(label)}`

const supermarkets: Supermarket[] = [
  { id: 'simba', name: 'Simba Supermarket - Kicukiro Branch', area: 'Kicukiro', city: 'Kigali', rating: 4.7, reviews: 320, distance: '2.4 km away', isOpen: true, closesAt: '9:00 PM', itemsAvailable: 8, totalItems: 12, services: ['Delivery', 'Pick up now', 'Pick up later'], estimatedBasket: '24,500 RWF', priceLevel: 'Moderate', image: imageFor('Simba Supermarket') },
  { id: 'quality', name: 'Quality Supermarket', area: 'Nyamirambo', city: 'Kigali', rating: 4.5, reviews: 189, distance: '3.6 km away', isOpen: true, closesAt: '10:00 PM', itemsAvailable: 6, totalItems: 12, services: ['Delivery', 'Pick up now', 'Pick up later'], estimatedBasket: '23,900 RWF', priceLevel: 'Premium', image: imageFor('Quality Supermarket') },
  { id: 'kicukiro', name: 'Kicukiro Family Supermarket', area: 'Kicukiro', city: 'Kigali', rating: 4.4, reviews: 152, distance: '4.1 km away', isOpen: true, closesAt: '8:30 PM', itemsAvailable: 7, totalItems: 12, services: ['Delivery', 'Pick up later'], estimatedBasket: '22,600 RWF', priceLevel: 'Budget Friendly', image: imageFor('Kicukiro Supermarket') },
  { id: 'remera', name: 'Remera City Supermarket', area: 'Remera', city: 'Kigali', rating: 4.6, reviews: 241, distance: '3.1 km away', isOpen: false, closesAt: 'Closed', itemsAvailable: 5, totalItems: 12, services: ['Pick up later'], estimatedBasket: '24,100 RWF', priceLevel: 'Moderate', image: imageFor('Remera Supermarket') },
]

export default function SupermarketsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [openNowOnly, setOpenNowOnly] = useState(false)
  const [maxDistance, setMaxDistance] = useState(10)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedPrice, setSelectedPrice] = useState<string[]>([])
  const [minimumRating, setMinimumRating] = useState(0)
  const [sortBy, setSortBy] = useState<'Best match' | 'Rating' | 'Distance' | 'Price'>('Best match')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedId, setSelectedId] = useState('simba')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [recentIds, setRecentIds] = useState(['simba', 'quality'])
  const [page, setPage] = useState(1)

  const toggle = (value: string, values: string[], update: (next: string[]) => void) => {
    update(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
    setPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setOpenNowOnly(false)
    setMaxDistance(10)
    setSelectedServices([])
    setSelectedPrice([])
    setMinimumRating(0)
    setSortBy('Best match')
    setPage(1)
  }

  const selectSupermarket = (id: string) => {
    setSelectedId(id)
    setRecentIds((current) => [id, ...current.filter((item) => item !== id)].slice(0, 3))
  }

  const shopHere = (supermarket: Supermarket) => {
    selectSupermarket(supermarket.id)
    navigate(`/products?market=${encodeURIComponent(supermarket.name)}`)
  }

  const filteredSupermarkets = useMemo(() => {
    const query = search.trim().toLowerCase()
    return supermarkets.filter((supermarket) => {
      const matchesSearch = !query || [supermarket.name, supermarket.area, supermarket.city].some((value) => value.toLowerCase().includes(query))
      const matchesServices = selectedServices.length === 0 || selectedServices.every((service) => supermarket.services.includes(service))
      const matchesDistance = Number.parseFloat(supermarket.distance) <= maxDistance
      const matchesPrice = selectedPrice.length === 0 || selectedPrice.includes(supermarket.priceLevel)
      return matchesSearch && matchesServices && matchesDistance && (!openNowOnly || supermarket.isOpen) && matchesPrice && supermarket.rating >= minimumRating
    }).sort((first, second) => {
      if (sortBy === 'Rating') return second.rating - first.rating
      if (sortBy === 'Distance') return Number.parseFloat(first.distance) - Number.parseFloat(second.distance)
      if (sortBy === 'Price') return Number.parseFloat(first.estimatedBasket.replace(/[^0-9]/g, '')) - Number.parseFloat(second.estimatedBasket.replace(/[^0-9]/g, ''))
      return 0
    })
  }, [maxDistance, minimumRating, openNowOnly, search, selectedPrice, selectedServices, sortBy])

  const pageCount = Math.max(1, Math.ceil(filteredSupermarkets.length / 4))
  const visibleSupermarkets = filteredSupermarkets.slice((page - 1) * 4, page * 4)
  const recentSupermarkets = recentIds.map((id) => supermarkets.find((item) => item.id === id)).filter((item): item is Supermarket => Boolean(item))

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#1e2a22]">
      <Header />

      <main className="mx-auto max-w-[1280px] px-6 py-6 lg:px-8">
        <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
          <aside className="rounded-[16px] border border-[#dfe7e2] bg-white p-2.5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#52645a]">Find the best supermarkets</p>
            <div className="mt-2 flex items-start justify-between gap-2 border-b border-[#edf0ed] pb-2.5">
              <p className="text-xs leading-4 text-[#5a6762]">Compare trusted supermarkets near you.</p>
              <button onClick={resetFilters} className="shrink-0 text-xs font-bold text-[#2f7a4f] hover:underline">Clear all</button>
            </div>
            <p className="mt-2.5 text-xs font-bold text-[#52645a]">Filter by</p>
            <div className="mt-2 space-y-2.5">
              <div>
                <p className="mb-1 text-[11px] font-bold">Services offered</p>
                <div className="space-y-1 text-[11px] text-[#52645a]">
                  {['Delivery', 'Pick up now', 'Pick up later'].map((service) => <label key={service} className="flex items-center gap-2"><input type="checkbox" checked={selectedServices.includes(service)} onChange={() => toggle(service, selectedServices, setSelectedServices)} className="accent-[#2f7a4f]" />{service === 'Delivery' ? 'Home Delivery' : service}</label>)}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[11px] font-bold">Availability</p>
                <label className="flex items-center gap-2 text-[11px] text-[#52645a]"><input type="checkbox" checked={openNowOnly} onChange={() => { setOpenNowOnly(!openNowOnly); setPage(1) }} className="accent-[#2f7a4f]" />Open Now</label>
              </div>
              <div>
                <p className="mb-1 text-[11px] font-bold">Distance</p>
                <input type="range" min="1" max="10" value={maxDistance} onChange={(event) => { setMaxDistance(Number(event.target.value)); setPage(1) }} className="w-full accent-[#2f7a4f]" />
                <p className="mt-1 text-[11px] text-[#5a6762]">Within {maxDistance} km</p>
              </div>
              <div className="border-t border-[#edf0ed] pt-2">
                <p className="mb-1 text-[11px] font-bold">Price level</p>
                <div className="space-y-1 text-[11px] text-[#52645a]">{['Budget Friendly', 'Moderate', 'Premium'].map((price) => <label key={price} className="flex items-center gap-2"><input type="checkbox" checked={selectedPrice.includes(price)} onChange={() => toggle(price, selectedPrice, setSelectedPrice)} className="accent-[#2f7a4f]" />{price}</label>)}</div>
              </div>
              <div className="border-t border-[#edf0ed] pt-2">
                <p className="mb-1 text-[11px] font-bold">Rating</p>
                <div className="flex flex-col text-[11px] text-[#e99b22]">{[4, 3, 2].map((rating) => <button key={rating} onClick={() => { setMinimumRating(minimumRating === rating ? 0 : rating); setPage(1) }} className={minimumRating === rating ? 'font-bold text-left' : 'text-left opacity-60'}>{'★'.repeat(rating)}<span className="text-[#52645a]"> {rating}.0 and up</span></button>)}</div>
              </div>
            </div>
            <button onClick={() => setPage(1)} className="mt-3 w-full rounded-full bg-[#2f7a4f] px-3 py-1.5 text-xs font-semibold text-white">Apply Filters</button>
            <button onClick={resetFilters} className="mt-1 w-full rounded-full border border-[#dfe7e2] px-3 py-1.5 text-xs font-semibold text-[#2f7a4f]">Reset all</button>
          </aside>

          <section className="min-w-0">
            <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2f7a4f]">Supermarkets</p><h1 className="mt-1 text-3xl font-black tracking-[-0.06em]">Top supermarkets in your area</h1></div><div className="rounded-full bg-[#edf6ee] px-3 py-2 text-sm font-semibold text-[#2f7a4f]">24 supermarkets available</div></div>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-[#4d5d53]">Compare trusted supermarkets, prices, availability, and delivery options for your everyday shopping.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{[['♡', 'Trusted Stores', 'Reliable supermarkets near you'], ['✦', 'Best Prices', 'Compare prices and save more'], ['◷', 'Real-time Updates', 'Live prices and availability'], ['⌂', 'Flexible Options', 'Delivery or pickup that works for you']].map(([icon, title, description]) => <div key={title} className="rounded-[14px] border border-[#e7ece7] bg-[#fbfcfa] p-2.5"><div className="flex items-start gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf6ee] text-sm font-bold text-[#2f7a4f]">{icon}</span><div><p className="text-xs font-bold">{title}</p><p className="mt-0.5 text-[11px] leading-4 text-[#5a6762]">{description}</p></div></div></div>)}</div>
            <div className="mt-3 grid gap-2 rounded-[16px] border border-[#edf0ed] bg-[#f9faf8] p-2 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center"><div className="flex items-center gap-2 rounded-full border border-[#dfe7e2] bg-white px-3 py-2"><span>⌕</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search supermarkets, locations..." className="w-full bg-transparent text-sm outline-none" /></div><button onClick={() => setViewMode('map')} className={`rounded-full border px-4 py-2 text-sm ${viewMode === 'map' ? 'border-[#2f7a4f] bg-[#ebf7ef] text-[#2f7a4f]' : 'border-[#dfe7e2] bg-white'}`}>Map View</button><button onClick={() => setViewMode('list')} className={`rounded-full border px-4 py-2 text-sm font-semibold ${viewMode === 'list' ? 'border-[#2f7a4f] bg-[#ebf7ef] text-[#2f7a4f]' : 'border-[#dfe7e2] bg-white'}`}>List View</button><label className="flex items-center justify-between gap-2 rounded-full border border-[#dfe7e2] bg-white px-4 py-2 text-sm"><span>Sort by:</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="bg-transparent font-semibold outline-none"><option>Best match</option><option>Rating</option><option>Distance</option><option>Price</option></select></label></div>
            {viewMode === 'map' && <div className="mt-3 rounded-[18px] border border-[#dfe7e2] bg-[#edf6ee] p-3"><div className="flex min-h-[150px] flex-col justify-between rounded-[14px] bg-[radial-gradient(circle_at_top,_#f8fcf7,_#dfeee3_60%,_#cfe1d3_100%)] p-4"><div><p className="text-sm font-bold">Supermarkets around Kigali</p><p className="mt-1 text-xs text-[#52645a]">Select a supermarket below to start shopping.</p></div><div className="flex flex-wrap gap-2">{visibleSupermarkets.map((item) => <button key={item.id} onClick={() => selectSupermarket(item.id)} className="rounded-full border border-[#cfe1d3] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f7a4f]">{item.name}</button>)}</div></div></div>}
            <div className="mt-3 space-y-2">{visibleSupermarkets.map((supermarket) => <article key={supermarket.id} className={`rounded-[18px] border p-2 shadow-sm ${selectedId === supermarket.id ? 'border-[#cfe1d3] bg-[#f5faf6]' : 'border-[#dfe7e2] bg-white'}`}><div className="grid gap-3 md:grid-cols-[150px_minmax(0,1fr)_150px] md:items-center"><div className="overflow-hidden rounded-[14px] border border-[#e5e9e4]"><img src={supermarket.image} alt={supermarket.name} className="h-20 w-full object-cover" /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black">{supermarket.name}</h2>{supermarket.isOpen && <span className="rounded-full bg-[#ebf7ef] px-2 py-0.5 text-[9px] font-bold uppercase text-[#2f7a4f]">Open now</span>}</div><div className="mt-1 flex flex-wrap gap-2 text-xs text-[#52645a]"><span>Supermarket</span><span>•</span><span>{supermarket.area}, {supermarket.city}</span><span>•</span><span>★ {supermarket.rating.toFixed(1)} ({supermarket.reviews})</span></div><div className="mt-2 text-[11px] text-[#5a6762]">{supermarket.distance} • {supermarket.isOpen ? 'Open now' : 'Closed'} • Closes at {supermarket.closesAt}</div><div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded-full bg-[#edf6ee] px-2 py-0.5 text-[9px] font-semibold text-[#2f7a4f]">{supermarket.itemsAvailable}/{supermarket.totalItems} basket items available</span>{supermarket.services.map((service) => <span key={service} className="rounded-full border border-[#dfe7e2] bg-white px-2 py-0.5 text-[9px]">{service}</span>)}</div></div><div className="flex flex-col gap-2 md:items-end"><div className="text-left md:text-right"><p className="text-[10px] uppercase tracking-[0.12em] text-[#5a6762]">Estimated basket</p><p className="text-lg font-black text-[#1e2a22]">{supermarket.estimatedBasket}</p></div><button onClick={() => shopHere(supermarket)} className="rounded-full bg-[#2f7a4f] px-4 py-2 text-xs font-semibold text-white">Shop Here</button><button onClick={() => setExpandedId(expandedId === supermarket.id ? null : supermarket.id)} className="rounded-full border border-[#dfe7e2] bg-white px-4 py-2 text-xs font-semibold text-[#2f7a4f]">{expandedId === supermarket.id ? 'Hide Details' : 'View Details'}</button></div></div>{expandedId === supermarket.id && <div className="mt-2 grid gap-2 border-t border-[#dfe7e2] px-2 pt-2 text-[11px] text-[#52645a] sm:grid-cols-2"><span><strong>Price level:</strong> {supermarket.priceLevel}</span><span><strong>Services:</strong> {supermarket.services.join(', ')}</span></div>}</article>)}</div>
            {filteredSupermarkets.length === 0 && <div className="mt-3 rounded-[18px] border border-dashed border-[#cfe1d3] bg-white p-8 text-center text-sm">No supermarkets match these filters.</div>}
            <div className="flex items-center justify-center gap-2 pt-2"><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="h-9 w-9 rounded-lg border bg-white disabled:opacity-40">‹</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} onClick={() => setPage(number)} className={`h-9 w-9 rounded-lg border text-sm font-semibold ${page === number ? 'border-[#2f7a4f] bg-[#2f7a4f] text-white' : 'border-[#dfe7e2] bg-white'}`}>{number}</button>)}<button onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page === pageCount} className="h-9 w-9 rounded-lg border bg-white disabled:opacity-40">›</button></div>
            <div className="mt-1 flex items-center justify-between gap-3 rounded-[16px] border border-[#dfe7e2] bg-white p-3"><div><p className="text-sm font-bold">Can&apos;t find what you need?</p><p className="text-xs text-[#5a6762]">We&apos;ll help you find the best supermarket.</p></div><button className="rounded-full bg-[#2f7a4f] px-5 py-2.5 text-xs font-semibold text-white">Request Assistance</button></div>
          </section>

          <aside className="flex flex-col gap-3"><div className="rounded-[16px] border border-[#dfe7e2] bg-white p-3.5 shadow-sm"><h3 className="text-xs font-black uppercase tracking-[0.13em] text-[#2f7a4f]">Why shop with supermarkets?</h3><ul className="mt-3 space-y-2.5 text-xs leading-4 text-[#52645a]">{['Wide range of everyday essentials', 'Reliable prices and product availability', 'Trusted brands in one convenient place', 'Delivery and pickup options'].map((item) => <li key={item} className="flex gap-2"><span className="text-[#2f7a4f]">✓</span>{item}</li>)}</ul><button className="mt-3 text-xs font-semibold text-[#2f7a4f]">Learn more about supermarkets →</button></div><div className="rounded-[16px] border border-[#dfe7e2] bg-white p-3.5 shadow-sm"><h3 className="text-xs font-black uppercase tracking-[0.13em] text-[#2f7a4f]">Need help choosing?</h3><p className="mt-2 text-xs text-[#5a6762]">Our team can help you find the right store.</p><p className="mt-3 text-xl font-black">0800 1234</p><button className="mt-3 w-full rounded-full border border-[#2f7a4f] px-3 py-1.5 text-xs font-semibold text-[#2f7a4f]">Chat on WhatsApp</button></div><div className="rounded-[16px] border border-[#dfe7e2] bg-white p-3.5 shadow-sm"><h3 className="text-xs font-black uppercase tracking-[0.13em] text-[#2f7a4f]">Fresh supermarket groceries</h3><p className="mt-2 text-xs text-[#5a6762]">Quality essentials delivered to your doorstep.</p><div className="mt-3 h-24 rounded-[11px] bg-[radial-gradient(circle_at_top,_#f2f9f1,_#dfeee3_55%,_#cfe1d3_100%)]" /></div><div className="rounded-[16px] border border-[#dfe7e2] bg-white p-3.5 shadow-sm"><h3 className="text-xs font-black uppercase tracking-[0.13em] text-[#2f7a4f]">Recently viewed supermarkets</h3><div className="mt-3 space-y-2.5">{recentSupermarkets.map((item) => <button key={item.id} onClick={() => selectSupermarket(item.id)} className="flex w-full items-center gap-2 text-left"><img src={item.image} alt="" className="h-10 w-12 rounded-lg object-cover" /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{item.name}</span><span className="text-[11px] text-[#5a6762]">{item.area}, {item.city}</span></span><span>›</span></button>)}</div><button className="mt-3 text-[11px] font-bold text-[#2f7a4f]">View all supermarkets →</button></div></aside>
        </div>
      </main>
    </div>
  )
}
