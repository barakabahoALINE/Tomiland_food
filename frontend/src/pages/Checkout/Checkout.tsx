import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearCart } from '../../store/slices/cart/cartSlice'
import Header from '../../components/Header/Header'
import { getCheckoutData, type CheckoutData } from '../../data/mockApi'
import { placeOrder, saveCart } from '../../data/shopApi'

const money = (value: number) => `${value.toLocaleString()} RWF`

export default function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector((state) => state.cart.items)
  const { user, accessToken } = useAppSelector((state) => state.auth)

  const [data, setData] = useState<CheckoutData | null>(null)
  const [deliveryChoice, setDeliveryChoice] = useState('Deliver now')
  const [paymentChoice, setPaymentChoice] = useState('Mobile Money')
  const [agreed, setAgreed] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [orderRef, setOrderRef] = useState<string | null>(null)

  useEffect(() => {
    void getCheckoutData().then(setData)
  }, [])

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f1ea]">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#2f7a4f] border-t-transparent" />
          <p className="font-syne font-bold text-[#2f7a4f]">Preparing secure checkout…</p>
        </div>
      </div>
    )
  }

  const items = cartItems.map((item) => ({
    ...item,
    detail: `${item.quantity} item${item.quantity === 1 ? '' : 's'} • Tomiland Foods`,
    image: item.imageUrl ?? 'https://placehold.co/96x96/edf6ee/1c3f33?text=Food',
  }))

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = deliveryChoice.toLowerCase().includes('pickup') ? 0 : 2000
  const serviceFee = subtotal ? 500 : 0
  const total = subtotal + deliveryFee + serviceFee

  // ── Place order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!agreed) {
      setOrderError('Please agree to the Terms and Conditions to continue.')
      return
    }
    if (!items.length) {
      setOrderError('Your basket is empty. Add products before checking out.')
      return
    }
    if (!accessToken) {
      setOrderError('Please sign in before placing your order.')
      return
    }
    setOrderError(null)
    setPlacing(true)
    try {
      const result = await placeOrder(
        {
          items: items.map((item) => ({ id: item.id, quantity: item.quantity, packaging: item.packaging })),
          delivery_method: deliveryChoice,
          payment_method: paymentChoice,
        },
        accessToken,
      )
      setOrderRef(result.order_id)
      dispatch(clearCart())
      void saveCart([], accessToken).catch(() => undefined)
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'We could not place your order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  // ── Order success screen ───────────────────────────────────────────────────
  if (orderRef) {
    return (
      <div className="min-h-screen bg-[#f5f1ea] text-[#1e2a22]">
        <Header />
        <main className="mx-auto flex max-w-[600px] flex-col items-center px-6 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#edf6ee] text-3xl font-black text-[#2f7a4f] shadow-sm">
            ✓
          </div>
          <h1 className="mt-6 font-syne text-3xl font-black tracking-tight text-[#16231a] sm:text-4xl">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#5a6762]">
            Thank you{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Your order has been registered and is being prepared by our market partners.
          </p>

          <div className="mt-8 w-full rounded-[28px] border border-[#dfe7e2] bg-white p-6 shadow-md text-left">
            <div className="flex items-center justify-between border-b border-[#edf2ee] pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#2f7a4f]">Order Tracking ID</p>
                <p className="mt-0.5 font-syne text-xl font-black text-[#16231a]">{orderRef}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                Processing
              </span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-[#5a6762]">
              <div className="flex justify-between">
                <span>Delivery Method</span>
                <span className="font-bold text-[#16231a]">{deliveryChoice}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-bold text-[#16231a]">{paymentChoice}</span>
              </div>
              <div className="flex justify-between border-t border-[#edf2ee] pt-3 text-sm font-black text-[#16231a]">
                <span>Total Paid / Payable</span>
                <span className="font-syne text-base text-[#2f7a4f]">{money(total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/products')}
              className="flex-1 rounded-full bg-[#2f7a4f] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2f7a4f]/25 transition hover:bg-[#256340]"
            >
              Continue Shopping →
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 rounded-full border border-[#dfe7e2] bg-white px-6 py-3.5 text-sm font-bold text-[#2f7a4f] shadow-sm transition hover:bg-[#edf6ee]"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ── Main checkout ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#1e2a22]">
      <Header />
      <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* Hero banner */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#eaf5e9] via-[#dcf0dc] to-[#cbebd0] px-6 py-8 sm:px-10">
          <div className="relative z-10 max-w-[620px]">
            <span className="rounded-full bg-[#2f7a4f]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2f7a4f]">
              Secure Checkout
            </span>
            <h1 className="mt-2 font-syne text-3xl font-black tracking-tight text-[#16231a] sm:text-4xl">
              Complete your order
            </h1>
            <p className="mt-2 text-sm text-[#465c50]">
              Review your fresh food items, choose delivery or pickup, and confirm your details.
            </p>
          </div>
        </section>

        {/* Step indicator */}
        <div className="mt-6 rounded-2xl border border-[#dfe7e2] bg-white px-6 py-4 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold text-[#6b8980]">
            {[
              { num: 1, label: 'Basket' },
              { num: 2, label: 'Delivery / Pickup' },
              { num: 3, label: 'Payment' },
              { num: 4, label: 'Confirmation' },
            ].map((step, idx) => (
              <div
                key={step.label}
                className={`flex items-center justify-center gap-2 ${idx === 1 ? 'font-black text-[#2f7a4f]' : ''}`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    idx === 1
                      ? 'bg-[#2f7a4f] text-white shadow-sm'
                      : 'border border-[#bcdcca] bg-[#edf8ed] text-[#2f7a4f]'
                  }`}
                >
                  {step.num}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* Step 1 — Delivery / Pickup Choice */}
            <CheckoutSection number="1" title="Delivery or Pickup" caption="Choose how you want to receive your order.">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { id: 'Deliver now', label: 'Express Delivery', desc: 'Arrives within 30 - 45 mins', icon: '⚡' },
                  { id: 'Schedule delivery', label: 'Schedule Delivery', desc: 'Choose a later time slot', icon: '📅' },
                  { id: 'Pickup now', label: 'Direct Pickup', desc: 'Collect at market vendor', icon: '🏬' },
                  { id: 'Pickup later', label: 'Pickup Later', desc: 'Ready whenever you arrive', icon: '🕒' },
                ].map((opt) => {
                  const isSelected = deliveryChoice === opt.id
                  return (
                    <label
                      key={opt.id}
                      className={`relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-[#2f7a4f] bg-[#edf6ee] ring-2 ring-[#2f7a4f]/20 shadow-sm'
                          : 'border-[#dfe7e2] bg-white hover:border-[#2f7a4f]/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryOption"
                        value={opt.id}
                        checked={isSelected}
                        onChange={(e) => setDeliveryChoice(e.target.value)}
                        className="sr-only"
                      />
                      <div>
                        <span className="text-2xl">{opt.icon}</span>
                        <p className="mt-2 font-syne text-sm font-black text-[#16231a]">{opt.label}</p>
                        <p className="mt-1 text-xs text-[#5a6762] leading-snug">{opt.desc}</p>
                      </div>
                      {isSelected && (
                        <span className="mt-3 inline-block text-[11px] font-bold text-[#2f7a4f]">✓ Selected</span>
                      )}
                    </label>
                  )
                })}
              </div>
            </CheckoutSection>

            {/* Step 2 — Address */}
            <CheckoutSection number="2" title="Delivery Address" caption="Where should our rider deliver your package?">
              <div className="flex items-center justify-between rounded-2xl border border-[#dfe7e2] bg-[#f8faf8] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf6ee] text-lg">
                    📍
                  </div>
                  <div>
                    <p className="font-syne text-sm font-bold text-[#16231a]">{data.address.city || 'Kigali, Rwanda'}</p>
                    <p className="text-xs text-[#5a6762]">{data.address.street || 'KG 15 Ave, Kimironko'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Delivery address is currently mapped to central Kigali zones.')}
                  className="rounded-full border border-[#dfe7e2] bg-white px-3 py-1.5 text-xs font-bold text-[#2f7a4f] transition hover:bg-[#edf6ee]"
                >
                  Change
                </button>
              </div>
            </CheckoutSection>

            {/* Step 3 — Payment Method */}
            <CheckoutSection number="3" title="Payment Method" caption="Select your preferred payment channel in Rwanda.">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    id: 'Mobile Money',
                    name: 'MTN / Airtel MoMo',
                    subtitle: 'Instant MoMo prompt',
                    icon: '📱',
                  },
                  {
                    id: 'Card Payment',
                    name: 'Credit / Debit Card',
                    subtitle: 'Visa, Mastercard',
                    icon: '💳',
                  },
                  {
                    id: 'Cash on Delivery',
                    name: 'Cash on Delivery',
                    subtitle: 'Pay rider on delivery',
                    icon: '💵',
                  },
                ].map((pm) => {
                  const isSelected = paymentChoice === pm.id
                  return (
                    <label
                      key={pm.id}
                      className={`relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-[#2f7a4f] bg-[#edf6ee] ring-2 ring-[#2f7a4f]/25 shadow-sm'
                          : 'border-[#dfe7e2] bg-white hover:border-[#2f7a4f]/50 hover:bg-[#fafdfa]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.id}
                        checked={isSelected}
                        onChange={(e) => setPaymentChoice(e.target.value)}
                        className="sr-only"
                      />
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-xs border border-[#e2eae4]">
                            {pm.icon}
                          </span>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black transition ${
                              isSelected
                                ? 'bg-[#2f7a4f] text-white shadow-xs'
                                : 'border border-[#ccd8cf] bg-white text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                        <p className="mt-3 font-syne text-sm font-black text-[#16231a]">{pm.name}</p>
                        <p className="mt-0.5 text-xs text-[#5a6762]">{pm.subtitle}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </CheckoutSection>

            {/* Step 4 — Confirmation & Agreement */}
            <CheckoutSection number="4" title="Review & Confirm" caption="Agree to our terms to finalize your fresh order.">
              <div className="space-y-4">
                <label className="flex cursor-pointer items-start gap-3 text-xs text-[#465c50]">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-[#2f7a4f]"
                  />
                  <span>
                    I confirm that the delivery details and quantities are correct, and I agree to Tomiland's{' '}
                    <strong className="text-[#2f7a4f] underline">Terms of Service</strong> and{' '}
                    <strong className="text-[#2f7a4f] underline">Fresh Food Guarantee</strong>.
                  </span>
                </label>

                {orderError && (
                  <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                    <span>⚠️</span>
                    <span>{orderError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f7a4f] px-6 py-4 font-syne text-base font-bold text-white shadow-xl shadow-[#2f7a4f]/25 transition hover:bg-[#256340] active:scale-[0.99] disabled:opacity-60"
                >
                  {placing ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Securing your order…</span>
                    </>
                  ) : (
                    `Place Order (${money(total)}) →`
                  )}
                </button>
              </div>
            </CheckoutSection>
          </div>

          {/* Right Sidebar: Order Summary */}
          <aside className="rounded-[28px] border border-[#dfe7e2] bg-white p-6 shadow-md lg:sticky lg:top-6">
            <div className="flex items-center justify-between border-b border-[#edf2ee] pb-4">
              <h2 className="font-syne text-base font-black text-[#16231a]">Order Summary</h2>
              <span className="rounded-full bg-[#edf6ee] px-2.5 py-0.5 text-xs font-bold text-[#2f7a4f]">
                {items.length} items
              </span>
            </div>

            {items.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#5a6762]">
                <p>Your basket is currently empty.</p>
                <Link to="/products" className="mt-2 inline-block font-bold text-[#2f7a4f] underline">
                  Browse products →
                </Link>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-[#edf2ee]">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover bg-[#edf6ee]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-syne text-xs font-bold text-[#16231a]">{item.name}</p>
                      <p className="text-[11px] text-[#5a6762]">{money(item.price)} each</p>
                    </div>
                    <span className="rounded-lg border border-[#dfe7e2] bg-[#f8faf8] px-2 py-1 text-xs font-bold text-[#16231a]">
                      × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 space-y-2 border-t border-[#edf2ee] pt-4 text-xs text-[#5a6762]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#16231a]">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kigali Delivery Fee</span>
                <span className="font-bold text-emerald-600">{deliveryFee ? money(deliveryFee) : 'FREE (Pickup)'}</span>
              </div>
              <div className="flex justify-between">
                <span>Packaging & Service Fee</span>
                <span className="font-bold text-[#16231a]">{money(serviceFee)}</span>
              </div>

              <div className="mt-4 flex items-baseline justify-between rounded-2xl bg-[#edf6ee] p-4 text-[#16231a]">
                <span className="font-syne text-sm font-bold">Total Payable</span>
                <span className="font-syne text-xl font-black text-[#2f7a4f]">{money(total)}</span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#f8faf8] p-3 text-[11px] text-[#465c50] border border-[#e5ece7]">
              <p className="font-bold text-[#16231a]">🚚 Fast Delivery Guarantee</p>
              <p className="mt-0.5">Orders in Kigali are dispatched directly from verified market vendors.</p>
            </div>

            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#2f7a4f]">
              <span>🔒</span>
              <span>100% Secure & Encrypted Checkout</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function CheckoutSection({
  number,
  title,
  caption,
  children,
}: {
  number: string
  title: string
  caption: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-[#dfe7e2] bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[#2f7a4f] font-syne text-xs font-bold text-white shadow-sm">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-syne text-base font-black text-[#16231a]">{title}</h2>
          <p className="mt-0.5 text-xs text-[#5a6762]">{caption}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  )
}
