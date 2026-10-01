import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { addItem } from '../../store/slices/cart/cartSlice'
import Header from '../../components/Header/Header'

type BasketType = 'weekly' | 'recipe' | 'budget' | 'reorder'
type Category = 'Fresh Produce' | 'Dry Goods' | 'Cooking Essentials' | 'Dairy & Eggs' | 'Meat & Fish' | 'Beverages'
type Product = { id: string; name: string; detail: string; price: number; unit: string; stock: string; options?: string[]; category: Category }
type LocationOption = { name: string; branch: string; availability: string; price: number; distance: string; bestFor: string }
type Recipe = { id: string; name: string; description: string; ingredients: Record<string, number> }

const money = (value: number) => `${value.toLocaleString()} RWF`
const sidebarCategories: { name: string; image: string; selectable: Category | null }[] = [
  { name: 'Fresh Produce', image: 'https://placehold.co/96x96/edf6ee/1c3f33?text=Fresh', selectable: 'Fresh Produce' },
  { name: 'Dry Goods', image: 'https://placehold.co/96x96/edf6ee/1c3f33?text=Dry', selectable: 'Dry Goods' },
  { name: 'Cooking Essentials', image: 'https://placehold.co/96x96/edf6ee/1c3f33?text=Oil', selectable: 'Cooking Essentials' },
  { name: 'Beverages', image: 'https://placehold.co/96x96/edf6ee/1c3f33?text=Drinks', selectable: 'Beverages' },
  { name: 'Dairy & Eggs', image: 'https://placehold.co/96x96/edf6ee/1c3f33?text=Dairy', selectable: 'Dairy & Eggs' },
  { name: 'Meat & Fish', image: 'https://placehold.co/96x96/edf6ee/1c3f33?text=Meat', selectable: 'Meat & Fish' },
  { name: 'Personal Care', image: 'https://placehold.co/96x96/edf6ee/1c3f33?text=Care', selectable: null },
  { name: 'Household', image: 'https://placehold.co/96x96/edf6ee/1c3f33?text=Home', selectable: null },
  { name: 'Baby Care', image: 'https://placehold.co/96x96/edf6ee/1c3f33?text=Baby', selectable: null },
]
const basketTypes: { id: BasketType; icon: string; title: string; copy: string; badge?: string }[] = [
  { id: 'weekly', icon: '🛒', title: 'Weekly Basket', copy: 'Everyday groceries for the week.', badge: 'Most popular' },
  { id: 'recipe', icon: '🍳', title: 'Recipe Basket', copy: 'Ingredients needed for selected recipes.' },
  { id: 'budget', icon: '▣', title: 'Budget Basket', copy: 'Essentials that fit your budget.' },
  { id: 'reorder', icon: '↻', title: 'Reorder Basket', copy: 'Buy again from your previous orders.' },
]
const products: Product[] = [
  { id: 'tomatoes', name: 'Tomatoes / Inyanya', detail: 'Fresh • Local', price: 1500, unit: '1 kg', stock: 'Available', options: ['Large • Firm', 'Medium • Ripe'], category: 'Fresh Produce' },
  { id: 'onions', name: 'Onions / Igitunguru', detail: 'Fresh • Local', price: 1200, unit: '1 kg', stock: 'Available', category: 'Fresh Produce' },
  { id: 'potatoes', name: 'Potatoes / Ibirayi', detail: 'Variety: Ibirayi Butukura (Red)', price: 3000, unit: '2 kg', stock: 'Available', options: ['Ibirayi Butukura (Red)', 'Ibirayi Byera (White)'], category: 'Fresh Produce' },
  { id: 'rice', name: 'Rice / Umuceri', detail: 'Long Grain', price: 9000, unit: '5 kg', stock: 'Available', options: ['Long Grain', 'Basmati'], category: 'Dry Goods' },
  { id: 'beans', name: 'Beans / Ibishyimbo', detail: 'Red', price: 2400, unit: '2 kg', stock: 'Low Stock', category: 'Dry Goods' },
  { id: 'oil', name: 'Cooking Oil / Amavuta', detail: 'Everyday cooking oil', price: 2600, unit: '1 L', stock: 'Available', category: 'Cooking Essentials' },
]
const recipes: Recipe[] = [
  { id: 'stew', name: 'Tomato & Bean Stew', description: 'A hearty family meal with local staples.', ingredients: { tomatoes: 2, onions: 1, beans: 1, oil: 1 } },
  { id: 'rice-beans', name: 'Rice & Beans', description: 'A simple, filling everyday meal.', ingredients: { rice: 1, beans: 1, onions: 1, oil: 1 } },
  { id: 'roast-potatoes', name: 'Seasoned Potatoes', description: 'Crispy potatoes for a quick side dish.', ingredients: { potatoes: 1, onions: 1, oil: 1 } },
]
const previousOrderItems: Record<string, number> = { tomatoes: 2, onions: 1, rice: 1, oil: 1 }
const locations: LocationOption[] = [
  { name: 'Simba Supermarket', branch: 'Kicukiro Branch', availability: '8/12 items available', price: 24500, distance: '~2.4 km', bestFor: 'Best match' },
  { name: 'Simba Supermarket', branch: 'Remera Branch', availability: '6/12 items available', price: 23900, distance: '~4.6 km', bestFor: 'Good price' },
  { name: 'Kimironko Market', branch: '', availability: '7/12 items available', price: 22800, distance: '~1.8 km', bestFor: 'Lowest price' },
]
const receivingOptions = [
  ['Deliver now', 'Get it as soon as possible.', '45–90 min', true],
  ['Schedule your delivery', 'Choose your preferred date/time.', '', true],
  ['Pick it up now', 'Collect from the selected market.', 'Unavailable at this market', false],
  ['Pick it up later', 'Choose when to collect it.', '', true],
] as const

type BasketModeControlsProps = { basketType: BasketType; selectedRecipe: string; budget: number; activeRecipe?: Recipe; subtotal: number; budgetRecommendation: Product[]; onRecipeChange: (recipeId: string) => void; onBudgetChange: (value: number) => void; onApplyRecommendation: () => void; onAddRecommendedProduct: (product: Product) => void }

function BasketModeControls({ basketType, selectedRecipe, budget, activeRecipe, subtotal, budgetRecommendation, onRecipeChange, onBudgetChange, onApplyRecommendation, onAddRecommendedProduct }: BasketModeControlsProps) {
  if (basketType === 'weekly') return null
  if (basketType === 'reorder') return <section className="mx-auto mt-5 max-w-[1280px] rounded-[20px] border border-[#cfe0d4] bg-[#edf6ee] p-5 lg:mx-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2f7a4f]">Reorder Basket</p><h2 className="mt-1 text-xl font-black">Your last grocery order is ready</h2><p className="mt-1 text-sm text-[#607068]">We loaded your previous items. Review the quantities below and add anything else you need.</p></section>
  if (basketType === 'budget') return <section className="mx-auto mt-5 max-w-[1280px] rounded-[20px] border border-[#ead7b8] bg-[#fff8eb] p-5 lg:mx-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b76a21]">Budget Basket</p><h2 className="mt-1 text-xl font-black">Choose products within your budget</h2><p className="mt-1 text-sm text-[#607068]">Select individual recommendations below or add them all at once.</p></div><label className="text-xs font-bold text-[#52645a]">Budget (RWF)<input type="number" min="0" step="500" value={budget} onChange={(event) => onBudgetChange(Math.max(0, Number(event.target.value)))} className="mt-1 block w-36 rounded-lg border border-[#e3d4b9] bg-white px-3 py-2 text-sm font-bold text-[#1e2a22]" /></label></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{budgetRecommendation.map((product) => <div key={product.id} className="flex items-center justify-between gap-2 rounded-xl border border-[#eadfca] bg-white p-3"><div className="min-w-0"><b className="block truncate text-xs">{product.name.split(' / ')[0]}</b><span className="text-[10px] text-[#8c571e]">{money(product.price)}</span></div><button onClick={() => onAddRecommendedProduct(product)} className="shrink-0 rounded-full border border-[#b76a21] px-2 py-1 text-[10px] font-bold text-[#b76a21]">Choose</button></div>)}</div><button onClick={onApplyRecommendation} disabled={!budgetRecommendation.length} className="mt-3 rounded-full bg-[#b76a21] px-3 py-2 text-[10px] font-bold text-white disabled:opacity-50">Add all recommendations</button><p className={`mt-3 text-xs font-bold ${subtotal > budget ? 'text-[#b74321]' : 'text-[#b76a21]'}`}>{money(Math.max(0, budget - subtotal))} remaining</p></section>
  return <section className="mx-auto mt-5 max-w-[1280px] rounded-[20px] border border-[#cfe0d4] bg-[#edf6ee] p-5 lg:mx-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2f7a4f]">Recipe Basket</p><h2 className="mt-1 text-xl font-black">Choose a recipe</h2><p className="mt-1 text-sm text-[#607068]">We have added the ingredients needed for your selected meal.</p></div><span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-[#2f7a4f]">{activeRecipe?.name}</span></div><div className="mt-4 grid gap-2 sm:grid-cols-3">{recipes.map((recipe) => <button key={recipe.id} onClick={() => onRecipeChange(recipe.id)} className={`rounded-xl border p-3 text-left ${selectedRecipe === recipe.id ? 'border-[#2f7a4f] bg-white ring-1 ring-[#2f7a4f]' : 'border-[#dfe7e2] bg-[#f8fbf8]'}`}><b className="text-xs">{recipe.name}</b><p className="mt-1 text-[10px] leading-4 text-[#687671]">{recipe.description}</p></button>)}</div></section>
}

export default function BasketPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [basketType, setBasketType] = useState<BasketType>('weekly')
  const [selectedRecipe, setSelectedRecipe] = useState(recipes[0].id)
  const [budget, setBudget] = useState(15000)
  const [category, setCategory] = useState<Category>('Fresh Produce')
  const [selectedLocation, setSelectedLocation] = useState(0)
  const [filter, setFilter] = useState('Best Match')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [receiving, setReceiving] = useState('Deliver now')
  const [toast, setToast] = useState('')
  useEffect(() => {
    if (basketType === 'reorder') {
      setQuantities(previousOrderItems)
    } else if (basketType === 'recipe') {
      setQuantities(recipes.find((recipe) => recipe.id === selectedRecipe)?.ingredients ?? {})
    } else {
      setQuantities({})
    }
  }, [basketType, selectedRecipe])
  const activeRecipe = recipes.find((recipe) => recipe.id === selectedRecipe)
  const budgetRecommendation = useMemo(() => {
    let remaining = budget
    return [...products].sort((first, second) => first.price - second.price).filter((product) => {
      if (product.price > remaining) return false
      remaining -= product.price
      return true
    })
  }, [budget])
  const visibleProducts = basketType === 'recipe' || basketType === 'reorder'
    ? products.filter((product) => (quantities[product.id] ?? 0) > 0)
    : products.filter((product) => product.category === category)
  const basketProducts = products.filter((product) => (quantities[product.id] ?? 0) > 0)
  const subtotal = useMemo(() => basketProducts.reduce((sum, product) => sum + product.price * (quantities[product.id] ?? 0), 0), [basketProducts, quantities])
  const delivery = receiving.includes('Pick') ? 0 : 2000
  const total = subtotal + delivery + (subtotal ? 500 : 0)
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2400) }
  const changeQuantity = (product: Product, amount: number) => {
    if (basketType === 'recipe' || basketType === 'reorder') return
    if (amount > 0 && basketType === 'budget' && subtotal + product.price > budget) {
      notify(`This would exceed your ${money(budget)} budget`)
      return
    }
    setQuantities((current) => ({ ...current, [product.id]: Math.max(0, (current[product.id] ?? 0) + amount) }))
  }
  const selectRecipe = (recipeId: string) => {
    setSelectedRecipe(recipeId)
    setBasketType('recipe')
  }
  const applyBudgetRecommendation = () => {
    setQuantities((current) => ({ ...current, ...Object.fromEntries(budgetRecommendation.map((product) => [product.id, Math.max(1, current[product.id] ?? 0)])) }))
    notify('Budget recommendation added')
  }
  const addRecommendedProduct = (product: Product) => {
    if (subtotal + product.price > budget) {
      notify(`This would exceed your ${money(budget)} budget`)
      return
    }
    setQuantities((current) => ({ ...current, [product.id]: Math.max(1, current[product.id] ?? 0) }))
  }
  const addToCart = () => { basketProducts.forEach((product) => dispatch(addItem({ id: `smart-${product.id}`, name: product.name, price: product.price, quantity: quantities[product.id] ?? 1, notes: `${basketType} basket${activeRecipe ? ` - ${activeRecipe.name}` : ''}` }))); notify('Basket added to your cart') }

  return <div className="min-h-screen bg-[#f5f1ea] text-[#1e2a22]">
    <Header />
    <main className="mx-auto max-w-[1280px] px-6 pb-20 pt-7 lg:px-8"><div className="grid gap-5 lg:grid-cols-[155px_minmax(0,1fr)_235px] xl:gap-7">
      <aside className="hidden lg:block"><div className="sticky top-5 space-y-4"><div className="rounded-[20px] border border-[#dfe7e2] bg-white p-4 shadow-sm"><h2 className="text-sm font-black">All Categories</h2><div className="mt-3 space-y-1">{sidebarCategories.map((item) => <button key={item.name} disabled={!item.selectable} onClick={() => item.selectable && setCategory(item.selectable)} className={`flex w-full items-center gap-2 rounded-xl p-2 text-left transition ${item.selectable && category === item.selectable ? 'bg-[#edf6ee] text-[#2f7a4f] ring-1 ring-[#c9dfce]' : 'text-[#52645a] hover:bg-[#f5faf6] hover:text-[#2f7a4f]'} ${!item.selectable ? 'cursor-not-allowed opacity-60' : ''}`}><img src={item.image} alt="" className="h-7 w-7 shrink-0 rounded-lg object-cover" /><span className="text-[10px] font-semibold leading-4">{item.name}</span>{item.selectable && category === item.selectable && <span className="ml-auto text-xs font-black">✓</span>}</button>)}</div></div><div className="rounded-[20px] border border-[#dfe7e2] bg-[#eaf3eb] p-4"><p className="text-[10px] font-black uppercase tracking-wider text-[#2f7a4f]">Need help ordering?</p><p className="mt-2 text-xs text-[#52645a]">Call us toll free</p><strong className="text-sm text-[#1f3a2b]">0800 1234</strong><p className="mt-1 text-[10px] text-[#687671]">Everyday: 7AM – 8PM</p></div><div className="rounded-[20px] border border-[#dfe7e2] bg-white p-4"><p className="text-[10px] font-black uppercase tracking-wider text-[#2f7a4f]">Fresh from trusted markets</p><p className="mt-2 text-xs leading-5 text-[#52645a]">Quality you can trust, delivered to you.</p><button className="mt-3 text-xs font-bold text-[#2f7a4f]">Learn more →</button></div></div></aside>

      <div className="min-w-0"><section className="rounded-[26px] bg-[#f7f4ef] px-2 py-2"><div className="max-w-[680px] px-4 py-5 sm:px-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2f7a4f]">Shop smarter</p><h1 className="mt-3 text-4xl font-black leading-[0.98] tracking-[-0.06em] sm:text-5xl">Build your shopping basket <span className="text-[#1c7b4f]">smarter.</span></h1><p className="mt-4 max-w-[620px] text-sm leading-6 text-[#4d5d53]">Tell us what you need, your household size and your budget. Tomiland helps you build a practical grocery basket from available local products.</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => document.getElementById('basket-types')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full bg-[#2f7a4f] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(47,122,79,0.25)]">Build My Basket →</button></div><div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-[#557060]"><span>✓ Fresh & quality checked</span><span>✓ Best prices from trusted markets</span><span>✓ Real-time prices & availability</span><span>✓ You’re in control</span></div></div></section>

        <section id="basket-types" className="mt-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2f7a4f]">Start here</p><h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">1. Choose the type of basket that fits your needs</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{basketTypes.map((item) => <button key={item.id} onClick={() => setBasketType(item.id)} className={`relative rounded-[18px] border p-4 text-left transition hover:-translate-y-0.5 ${basketType === item.id ? 'border-[#2f7a4f] bg-[#edf6ee] shadow-sm' : 'border-[#e5e9e4] bg-white'}`}><span className="text-2xl">{item.icon}</span>{item.badge && <span className="absolute right-3 top-3 rounded-full bg-[#dceedd] px-2 py-1 text-[9px] font-bold text-[#2f7a4f]">{item.badge}</span>}<h3 className="mt-3 text-sm font-bold">{item.title}</h3><p className="mt-1 text-xs leading-5 text-[#687671]">{item.copy}</p><span className="mt-3 block text-[11px] font-bold text-[#2f7a4f]">{basketType === item.id ? 'Selected ✓' : 'Choose →'}</span></button>)}</div><BasketModeControls basketType={basketType} selectedRecipe={selectedRecipe} budget={budget} activeRecipe={activeRecipe} subtotal={subtotal} budgetRecommendation={budgetRecommendation} onRecipeChange={selectRecipe} onBudgetChange={setBudget} onApplyRecommendation={applyBudgetRecommendation} onAddRecommendedProduct={addRecommendedProduct} /></section>

        <section className="mt-8"><h2 className="text-2xl font-black tracking-[-0.04em]">2. Choose where to shop</h2><p className="mt-1 text-sm text-[#607068]">Prices and availability are updated in real-time from your selected location.</p><div className="mt-4 grid gap-3 md:grid-cols-3">{locations.map((item, index) => <button key={item.branch || item.name} onClick={() => setSelectedLocation(index)} className={`rounded-[18px] border bg-white p-4 text-left ${selectedLocation === index ? 'border-[#2f7a4f] ring-2 ring-[#c9dfce]' : 'border-[#dfe7e2]'}`}><div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-bold">{item.name}</h3><p className="text-xs text-[#687671]">{item.branch}</p></div><span className="text-[#2f7a4f]">{selectedLocation === index ? '✓' : '○'}</span></div><p className="mt-4 text-xs font-semibold text-[#2f7a4f]">{item.availability}</p><p className="mt-1 text-xs text-[#687671]">{item.distance}</p></button>)}</div><div className="mt-3 flex flex-wrap gap-2">{['Best Match', 'Everything Available', 'Lowest Price', 'Closest to Me'].map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-3 py-2 text-[10px] font-bold ${filter === item ? 'border-[#2f7a4f] bg-[#2f7a4f] text-white' : 'border-[#dfe7e2] bg-white text-[#52645a]'}`}>{item}</button>)}</div></section>

        <section className="mt-8 rounded-[24px] border border-[#dfe7e2] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-end justify-between gap-3"><div><h2 className="text-2xl font-black tracking-[-0.04em]">3. Build your basket</h2><p className="mt-1 text-sm text-[#607068]">Showing products from <strong className="text-[#2f7a4f]">{category}</strong>. Select a category from the sidebar to change products.</p></div><span className="text-xs font-semibold text-[#2f7a4f]">{basketProducts.length} items</span></div><div className="mt-3 divide-y divide-[#edf2ee]">{visibleProducts.length ? visibleProducts.map((product) => <div key={product.id} className="flex flex-wrap items-center gap-3 py-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#b9d2bf] bg-[#edf6ee] text-lg">▧</div><div className="min-w-[150px] flex-1"><h3 className="text-sm font-bold">{product.name}</h3><p className="text-xs text-[#687671]">{product.detail} · {product.unit}</p>{product.options && <select value={selectedOptions[product.id] ?? product.options[0]} onChange={(event) => setSelectedOptions((current) => ({ ...current, [product.id]: event.target.value }))} className="mt-2 rounded-lg border border-[#dfe7e2] bg-white px-2 py-1 text-[10px] text-[#52645a]"><option value="">Choose option</option>{product.options.map((option) => <option key={option}>{option}</option>)}</select>}</div><div className="text-right"><p className="text-xs font-bold">{money(product.price)}</p><p className={`text-[10px] font-semibold ${product.stock === 'Low Stock' ? 'text-[#b76a21]' : 'text-[#2f7a4f]'}`}>{product.stock}</p></div><div className="flex items-center gap-2"><button aria-label={`Decrease ${product.name}`} onClick={() => changeQuantity(product, -1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#dfe7e2] bg-white">−</button><span className="w-5 text-center text-xs font-bold">{quantities[product.id] ?? 0}</span><button aria-label={`Increase ${product.name}`} onClick={() => changeQuantity(product, 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#dfe7e2] bg-white">+</button></div></div>) : <p className="py-8 text-center text-sm text-[#687671]">Products from this category will appear here when vendors add them.</p>}</div><button onClick={() => setCategory('Dry Goods')} className="mt-2 w-full rounded-xl border border-dashed border-[#b9d2bf] py-3 text-xs font-bold text-[#2f7a4f]">+ Add more items to your basket</button></section>

        <section className="mt-8 rounded-[24px] border border-[#dfe7e2] bg-white p-5 shadow-sm sm:p-6"><h2 className="text-2xl font-black tracking-[-0.04em]">4. Where can I buy this basket?</h2><p className="mt-1 text-sm text-[#607068]">Compare availability, estimated prices and distance.</p><div className="mt-4 overflow-x-auto"><div className="min-w-[650px]"><div className="grid grid-cols-[1.4fr_1fr_1fr_.7fr_.8fr_auto] gap-3 px-3 pb-2 text-[10px] font-bold uppercase tracking-wide text-[#87958c]"><span>Shopping location</span><span>Availability</span><span>Estimated total</span><span>Distance</span><span>Best for</span><span /></div>{locations.map((item, index) => <div key={`${item.name}-${item.branch}-compare`} className={`mb-2 grid grid-cols-[1.4fr_1fr_1fr_.7fr_.8fr_auto] items-center gap-3 rounded-xl border p-3 text-xs ${selectedLocation === index ? 'border-[#2f7a4f] bg-[#f5faf6]' : 'border-[#e5e9e4]'}`}><span><b>{item.name}</b><small className="block text-[#687671]">{item.branch}</small></span><span className="text-[#52645a]">{item.availability}<small className="block text-[#b76a21]">{index === 1 ? '2 items unavailable' : ''}</small></span><b className="text-[#2f7a4f]">{money(item.price)}</b><span>{item.distance}</span><span className="text-[#52645a]">{item.bestFor}</span><button onClick={() => { setSelectedLocation(index); notify(`${item.name} selected`) }} className="rounded-full bg-[#2f7a4f] px-3 py-2 text-[10px] font-bold text-white">{selectedLocation === index ? 'Selected' : 'Choose'}</button></div>)}</div></div></section>


        <section className="mt-8 py-5"><h2 className="text-center text-2xl font-black">How Smart Basket works</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['1', 'Choose what you need', 'Add items from product categories and build your basket.'], ['2', 'Choose where to shop', 'Compare markets based on availability, price and distance.'], ['3', 'Review & customize', 'Adjust quantities and product choices.'], ['4', 'Checkout & relax', 'Choose delivery or pickup and complete checkout.']].map(([number, title, copy]) => <div key={number} className="rounded-[18px] border border-[#dfe7e2] bg-white p-4 shadow-sm"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf6ee] text-sm font-black text-[#2f7a4f]">{number}</span><h3 className="mt-3 text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-5 text-[#687671]">{copy}</p></div>)}</div></section></div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-5"><div className="rounded-[22px] border border-[#dfe7e2] bg-white p-5 shadow-sm"><h2 className="text-lg font-black">Basket Summary</h2><p className="mt-1 text-xs text-[#687671]">{basketProducts.length} items</p><div className="mt-5 space-y-3 text-xs text-[#5b6c63]"><div className="flex justify-between"><span>Items Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between"><span>Delivery Fee</span><span>{money(delivery)}</span></div><div className="flex justify-between"><span>Service Fee</span><span>{money(subtotal ? 500 : 0)}</span></div><div className="flex justify-between border-t border-[#edf2ee] pt-3 text-base font-black text-[#1e2a22]"><span>Total</span><span className="text-[#2f7a4f]">{money(total)}</span></div></div><button onClick={() => { addToCart(); navigate('/checkout') }} disabled={!basketProducts.length} className="mt-5 w-full rounded-full bg-[#2f7a4f] px-4 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Proceed to Delivery</button><button onClick={() => notify('Basket saved for later')} className="mt-2 w-full rounded-full border border-[#dfe7e2] px-4 py-3 text-xs font-bold text-[#2f7a4f]">♡ Save Basket for Later</button><div className="mt-4 rounded-xl bg-[#edf6ee] p-3 text-[10px] text-[#52645a]"><b className="text-[#2f7a4f]">✓ QUALITY CHECKED</b><p className="mt-1">All items are carefully checked before delivery.</p></div></div>
  <div className="rounded-[22px] border border-[#dfe7e2] bg-white p-5 shadow-sm"><h2 className="text-sm font-black">How would you like to receive your basket?</h2><div className="mt-3 space-y-2">{receivingOptions.map(([title, copy, meta, available]) => <div key={title} className={`rounded-xl border p-3 ${receiving === title ? 'border-[#2f7a4f] bg-[#edf6ee]' : 'border-[#e5e9e4]'} ${!available ? 'opacity-75' : ''}`}><button disabled={!available} onClick={() => setReceiving(title)} className="w-full text-left"><div className="flex justify-between gap-2"><b className="text-xs">{title}</b><span className="text-[#2f7a4f]">{receiving === title ? '✓' : '○'}</span></div><p className="mt-1 text-[10px] text-[#687671]">{copy}</p>{meta && <p className={`mt-2 text-[10px] font-bold ${available ? 'text-[#2f7a4f]' : 'text-[#b76a21]'}`}>{meta}</p>}</button>{!available && <button onClick={() => notify('Showing locations with pickup available')} className="mt-2 text-[10px] font-bold text-[#2f7a4f]">Find another location →</button>}</div>)}</div></div><div className="rounded-[22px] border border-[#dfe7e2] bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-wider text-[#2f7a4f]">Categories</p><p className="mt-2 text-xs leading-5 text-[#687671]">Help customers quickly find what they need by category.</p><p className="mt-5 text-[10px] font-black uppercase tracking-wider text-[#2f7a4f]">Need help ordering?</p><p className="mt-2 text-xs text-[#52645a]">Call us toll free<br /><b>0800 1234</b></p><p className="mt-5 text-[10px] font-black uppercase tracking-wider text-[#2f7a4f]">Fresh from trusted markets</p><p className="mt-2 text-xs leading-5 text-[#687671]">Fresh products delivered to your doorstep.</p></div></aside>
  </div></main>{toast && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1f3a2b] px-5 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
  </div>
}
