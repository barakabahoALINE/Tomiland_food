import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearCart } from '../../store/slices/cart/cartSlice'
import Header from '../../components/Header/Header'
import { getCheckoutData, type CheckoutData } from '../../data/mockApi'
import { placeOrder, saveCart } from '../../data/shopApi'

const money = (value: number) => `${value.toLocaleString()} RWF`


export default function CheckoutPage() {
  const navigate   = useNavigate()
  const dispatch   = useAppDispatch()
  const cartItems  = useAppSelector((state) => state.cart.items)
  const { user, accessToken } = useAppSelector((state) => state.auth)

  const [data, setData]                   = useState<CheckoutData | null>(null)
  const [deliveryChoice, setDeliveryChoice] = useState('Deliver now')
  const [paymentChoice, setPaymentChoice]   = useState('Mobile Money')
  const [agreed, setAgreed]               = useState(false)
  const [placing, setPlacing]             = useState(false)
  const [orderError, setOrderError]       = useState<string | null>(null)
  const [orderRef, setOrderRef]           = useState<string | null>(null)

  useEffect(() => { void getCheckoutData().then(setData) }, [])

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f1ea] text-[#1f3a2b]">
        <div className="rounded-full border border-[#dfeae3] bg-white px-6 py-3 text-sm font-medium shadow-sm">
          Preparing checkoutâ€¦
        </div>
      </div>
    )
  }

  const items = cartItems.map((item) => ({
    ...item,
    detail: `${item.quantity} item${item.quantity === 1 ? '' : 's'} · Tomiland Foods`,
    image: item.imageUrl ?? 'https://placehold.co/96x96/edf6ee/1c3f33?text=Food',
  }))

  const subtotal    = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = deliveryChoice.toLowerCase().includes('pickup') ? 0 : 2000
  const serviceFee  = subtotal ? 500 : 0
  const total       = subtotal + deliveryFee + serviceFee

  // â”€â”€ Place order â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handlePlaceOrder = async () => {
    if (!agreed) { setOrderError('Please agree to the Terms and Conditions to continue.'); return }
    if (!items.length) { setOrderError('Your basket is empty. Add products before checking out.'); return }
    if (!accessToken) { setOrderError('Please sign in again before placing your order.'); return }
    setOrderError(null)
    setPlacing(true)
    try {
      const result = await placeOrder({
        items: items.map((item) => ({ id: item.id, quantity: item.quantity, packaging: item.packaging })),
        delivery_method: deliveryChoice,
        payment_method: paymentChoice,
      }, accessToken)
      setOrderRef(result.order_id)
      dispatch(clearCart())
      void saveCart([], accessToken).catch(() => undefined)
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'We could not place your order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }
  // â”€â”€ Order success screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (orderRef) {
    return (
      <div className="min-h-screen bg-[#f5f1ea] text-[#1e2a22]">
        <Header />
        <main className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#edf6ee] text-4xl shadow-sm">
            âœ“
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-[-0.05em] text-[#1b3a2b]">
            Order placed!
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#52645a]">
            Thank you{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Your order has been received and is being prepared.
          </p>
          <div className="mt-6 w-full rounded-[20px] border border-[#dfe7e2] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7a4f]">Order reference</p>
            <p className="mt-1 text-2xl font-black tracking-[-0.04em]">{orderRef}</p>
            <div className="mt-4 space-y-2 border-t border-[#edf2ee] pt-4 text-sm text-[#52645a]">
              <div className="flex justify-between"><span>Delivery</span><span className="font-semibold text-[#1e2a22]">{deliveryChoice}</span></div>
              <div className="flex justify-between"><span>Payment</span><span className="font-semibold text-[#1e2a22]">{paymentChoice}</span></div>
              <div className="flex justify-between border-t border-[#edf2ee] pt-2 text-base font-black text-[#1e2a22]">
                <span>Order total</span>
                <span className="text-[#2f7a4f]">{money(total)}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/products')}
              className="flex-1 rounded-full bg-[#2f7a4f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#266e45]"
            >
              Continue shopping
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 rounded-full border border-[#dfe7e2] bg-white px-4 py-3 text-sm font-semibold text-[#2f7a4f] hover:bg-[#f5faf6]"
            >
              Back to home
            </button>
          </div>
        </main>
      </div>
    )
  }

  // â”€â”€ Main checkout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#1e2a22]">
      <Header />
      <main className="mx-auto max-w-[1280px] px-4 pb-12 pt-4 sm:px-6 lg:px-8">

        {/* Hero banner */}
        <section className="relative overflow-hidden rounded-xl bg-[#eaf5e9] px-5 py-5 sm:px-8">
          <div className="relative z-10 max-w-[610px]">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#168254]">Checkout</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.05em] text-[#123f39] sm:text-4xl">Complete your order</h1>
            <p className="mt-2 text-xs text-[#508070]">Review your items, choose delivery or pickup, and confirm your details.</p>
          </div>
          <div className="absolute -right-5 -top-10 hidden h-40 w-56 rounded-[45%] bg-[#d4ebd1] sm:block" aria-hidden="true" />
          <p className="absolute right-20 top-9 hidden rotate-[-7deg] text-sm font-black text-[#168254] sm:block">
            Fresh food,<br />made simple â†—
          </p>
        </section>

        {/* Step indicator */}
        <div className="mt-3 rounded-xl border border-[#dfe9e1] bg-white px-4 py-3 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-[#6b8980] sm:text-xs">
            {['Basket', 'Delivery/Pickup', 'Payment', 'Confirm'].map((label, index) => (
              <div key={label} className={`flex items-center justify-center gap-2 ${index === 1 ? 'font-black text-[#168254]' : ''}`}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${index === 1 ? 'border-[#168254] bg-[#168254] text-white' : 'border-[#bcdcca] bg-[#edf8ed] text-[#168254]'}`}>
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_336px]">
          <section className="space-y-3">

            {/* Step 1 â€” Delivery */}
            <CheckoutSection number="1" title="Delivery or Pickup" caption="Choose how you want to receive your order.">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Deliver now',       'Get it now (within 1â€“2 hours)', 'ðŸšš'],
                  ['Schedule delivery', 'Choose a future time.',          'â–¦' ],
                  ['Pickup now',        'Collect at the store.',          'â–¥' ],
                  ['Pickup later',      'Choose a convenient time.',      'â—·' ],
                ].map(([label, copy, icon]) => (
                  <label
                    key={label}
                    className={`cursor-pointer rounded-lg border p-3 ${deliveryChoice === label ? 'border-[#55c995] bg-[#effbf1] ring-1 ring-[#55c995]' : 'border-[#e1ebe4] bg-[#fbfcfa]'}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={label}
                      checked={deliveryChoice === label}
                      onChange={(e) => setDeliveryChoice(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-xl text-[#168254]">{icon}</span>
                    <span className="mt-1 block text-xs font-bold text-[#31584b]">{label}</span>
                    <span className="mt-1 block text-[10px] leading-4 text-[#78958a]">{copy}</span>
                  </label>
                ))}
              </div>
            </CheckoutSection>

            {/* Step 2 â€” Address */}
            <CheckoutSection number="2" title="Delivery Address" caption="Where should we deliver your order?">
              <div className="flex items-center justify-between rounded-lg bg-[#f7faf7] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0f3e3] text-[#168254]">â—</span>
                  <div>
                    <p className="text-xs font-bold text-[#31584b]">{data.address.city}</p>
                    <p className="text-[10px] text-[#78958a]">{data.address.street}</p>
                  </div>
                </div>
                <button type="button" className="text-[10px] font-bold text-[#168254]">Change</button>
              </div>
            </CheckoutSection>

            {/* Step 3 â€” Payment */}
            <CheckoutSection number="3" title="Payment Method" caption="Choose how you want to pay.">
              <div className="grid gap-2 sm:grid-cols-2">
                {data.paymentMethods.map((method) => (
                  <label
                    key={method}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 ${paymentChoice === method ? 'border-[#55c995] bg-[#effbf1]' : 'border-[#e1ebe4] bg-white'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentChoice === method}
                      onChange={(e) => setPaymentChoice(e.target.value)}
                      className="accent-[#168254]"
                    />
                    <span className="text-xs font-bold text-[#31584b]">{method}</span>
                  </label>
                ))}
              </div>
            </CheckoutSection>

            {/* Step 4 â€” Confirm */}
            <CheckoutSection number="4" title="Review & Confirm" caption="Please review your details before placing your order.">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] text-[#507467]">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="accent-[#168254]"
                  />
                  I agree to the{' '}
                  <button type="button" className="font-bold text-[#168254]">Terms and Conditions</button>
                  {' '}and{' '}
                  <button type="button" className="font-bold text-[#168254]">Privacy Policy</button>
                </label>

                {orderError && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                    {orderError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full rounded-full bg-[#07905a] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(7,144,90,0.18)] hover:bg-[#067a4d] disabled:opacity-60"
                >
                  {placing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Placing orderâ€¦
                    </span>
                  ) : (
                    <>Place Order <span className="ml-2">â†’</span></>
                  )}
                </button>
              </div>
            </CheckoutSection>
          </section>

          {/* Order summary sidebar */}
          <aside className="rounded-xl border border-[#dfe9e1] bg-white p-4 shadow-sm lg:sticky lg:top-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[#17463d]">Order Summary</h2>
              <span className="text-[10px] text-[#7a998e]">{items.length} items</span>
            </div>

            <div className="mt-3 divide-y divide-[#edf2ee]">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#31584b]">{item.name}</p>
                    <p className="mt-1 text-[10px] text-[#78958a]">{item.detail}</p>
                    <p className="mt-1 text-[10px] font-semibold text-[#168254]">{money(item.price)}</p>
                  </div>
                  <span className="rounded-full border border-[#dfe9e1] px-2 py-1 text-[10px] font-bold">
                    Ã—{item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2 space-y-2 border-t border-[#edf2ee] pt-3 text-xs text-[#668178]">
              <div className="flex justify-between"><span>Subtotal</span><b>{money(subtotal)}</b></div>
              <div className="flex justify-between"><span>Delivery Fee</span><b>{money(deliveryFee)}</b></div>
              <div className="flex justify-between"><span>Service Fee</span><b>{money(serviceFee)}</b></div>
              <div className="mt-2 flex justify-between rounded-lg bg-[#eef8ed] px-3 py-3 text-sm font-black text-[#17463d]">
                <span>Total</span>
                <span className="text-[#07905a]">{money(total)}</span>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-[#d8eee0] bg-[#f3faf3] p-3 text-[10px] text-[#507467]">
              <b className="text-[#168254]">ðŸšš Estimated delivery</b>
              <p className="mt-1">Today, 10:00 AM â€“ 12:00 PM</p>
            </div>
            <div className="mt-2 rounded-lg bg-[#eef8ed] p-3 text-[10px] text-[#168254]">
              âœ“ Your payment information is secure
            </div>
          </aside>
        </div>

        {/* Trust bar */}
        <div className="mt-3 grid gap-2 rounded-xl border border-[#dfe9e1] bg-[#eef7ec] px-4 py-3 text-[10px] text-[#5d7d70] sm:grid-cols-3">
          <span><b className="text-[#168254]">â™§ &nbsp; Fresh & Quality</b><br />Carefully selected products from trusted vendors.</span>
          <span><b className="text-[#168254]">â—‡ &nbsp; Great Prices</b><br />Compare available products and options.</span>
          <span><b className="text-[#168254]">ðŸšš &nbsp; Reliable Delivery</b><br />Get your groceries delivered or choose pickup where available.</span>
        </div>
      </main>
    </div>
  )
}

function CheckoutSection({
  number, title, caption, children,
}: {
  number: string
  title: string
  caption: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-[#dfe9e1] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#07905a] text-xs font-black text-white">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black text-[#17463d]">{title}</h2>
          <p className="mt-0.5 text-[10px] text-[#78958a]">{caption}</p>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </section>
  )
}
