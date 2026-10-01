import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import logo from '../../assets/logo.png'

type NavItem = {
  label: string
  route: string
  hasChildren?: boolean
}

type KpiCard = {
  title: string
  value: string
  change: string
  direction: 'up' | 'down'
  subtitle: string
  icon: string
}

type OrderStatus = {
  label: string
  count: number
  color: string
}

type RowStatus = 'Preparing' | 'Confirmed' | 'Out for Delivery' | 'Delivered'

const sidebarItems: NavItem[] = [
  { label: 'Dashboard', route: '/admin' },
  { label: 'Orders', route: '/admin/orders', hasChildren: true },
  { label: 'Products', route: '/admin/products', hasChildren: true },
  { label: 'Markets', route: '/admin/markets', hasChildren: true },
  { label: 'Supermarkets', route: '/admin/supermarkets', hasChildren: true },
  { label: 'Smart Basket', route: '/admin/smart-basket', hasChildren: true },
  { label: 'Customers', route: '/admin/customers', hasChildren: true },
  { label: 'Delivery', route: '/admin/delivery', hasChildren: true },
  { label: 'Payments', route: '/admin/payments', hasChildren: true },
  { label: 'Reports & Analytics', route: '/admin/reports', hasChildren: true },
  { label: 'Support', route: '/admin/support', hasChildren: true },
  { label: 'Settings', route: '/admin/settings', hasChildren: true },
]

const kpis: KpiCard[] = [
  { title: 'Total Orders', value: '128', change: '↑ 12%', direction: 'up', subtitle: 'vs. yesterday', icon: '🛒' },
  { title: 'Total Revenue', value: '2,420,000 RWF', change: '↑ 18%', direction: 'up', subtitle: 'vs. yesterday', icon: '💰' },
  { title: 'Pending Orders', value: '24', change: '↓ 8%', direction: 'down', subtitle: 'vs. yesterday', icon: '⏳' },
  { title: 'Deliveries in Progress', value: '18', change: '↑ 5%', direction: 'up', subtitle: 'vs. yesterday', icon: '🚚' },
  { title: 'New Customers', value: '32', change: '↑ 23%', direction: 'up', subtitle: 'vs. yesterday', icon: '👥' },
  { title: 'Low Stock Products', value: '7', change: '↓ 30%', direction: 'down', subtitle: 'vs. yesterday', icon: '⚠️' },
]

const salesData = [
  { label: 'Apr 20', value: 540 },
  { label: 'Apr 21', value: 730 },
  { label: 'Apr 22', value: 620 },
  { label: 'Apr 23', value: 930 },
  { label: 'Apr 24', value: 820 },
  { label: 'Apr 25', value: 1180 },
  { label: 'Apr 26', value: 1030 },
]

const orderStatusData: OrderStatus[] = [
  { label: 'Pending', count: 24, color: '#2f7a4f' },
  { label: 'Confirmed', count: 32, color: '#f4b942' },
  { label: 'Preparing', count: 28, color: '#5ec4a6' },
  { label: 'Out for Delivery', count: 18, color: '#8f69d9' },
  { label: 'Delivered', count: 23, color: '#7ac0eb' },
  { label: 'Cancelled', count: 4, color: '#ef6f5f' },
]

const recentOrders = [
  { orderId: 'TM1024', customer: 'Aline Uwimana', items: 3, status: 'Preparing', total: '8,900 RWF', time: '10:12 AM' },
  { orderId: 'TM1023', customer: 'Jean Nyonzima', items: 5, status: 'Confirmed', total: '12,400 RWF', time: '09:48 AM' },
  { orderId: 'TM1022', customer: 'Chantal Mukamana', items: 2, status: 'Out for Delivery', total: '6,200 RWF', time: '09:32 AM' },
  { orderId: 'TM1021', customer: 'Emmanuel Nshimyimana', items: 7, status: 'Delivered', total: '15,800 RWF', time: '08:55 AM' },
  { orderId: 'TM1020', customer: 'Solange Iradukunda', items: 4, status: 'Preparing', total: '10,500 RWF', time: '08:21 AM' },
] as const

const lowStockProducts = [
  { name: 'Tomatoes', stock: '8 kg', image: '🍅' },
  { name: 'Milk (Fresh)', stock: '12 L', image: '🥛' },
  { name: 'Chicken Breast', stock: '5 kg', image: '🍗' },
  { name: 'Rice (Local)', stock: '3 kg', image: '🍚' },
  { name: 'Cooking Oil', stock: '2 L', image: '🫒' },
]

const topSellingProducts = [
  { name: 'Tomatoes', sold: '1,248 units sold', change: '↑24%', image: '🍅' },
  { name: 'Bananas', sold: '986 units sold', change: '↑18%', image: '🍌' },
  { name: 'Rice (Local)', sold: '842 units sold', change: '↑12%', image: '🍚' },
  { name: 'Milk (Fresh)', sold: '756 units sold', change: '↑9%', image: '🥛' },
  { name: 'Cooking Oil', sold: '648 units sold', change: '↑7%', image: '🫒' },
]

const quickActions = [
  { label: 'Add Product', route: '/admin/products', icon: '+' },
  { label: 'Manage Markets', route: '/admin/markets', icon: '▣' },
  { label: 'View Orders', route: '/admin/orders', icon: '◫' },
  { label: 'Manage Customers', route: '/admin/customers', icon: '◎' },
  { label: 'Reports & Analytics', route: '/admin/reports', icon: '▤' },
]

const notificationItems = [
  '3 new orders need confirmation.',
  'Rice stock is running low in Kigali market.',
  '2 customers requested delivery reschedules.',
]

function StatusPill({ status }: { status: RowStatus }) {
  const styles: Record<RowStatus, string> = {
    Preparing: 'bg-[#fef4d7] text-[#a36b00]',
    Confirmed: 'bg-[#edf6ee] text-[#2f7a4f]',
    'Out for Delivery': 'bg-[#f0ebff] text-[#6d51be]',
    Delivered: 'bg-[#e6f5ff] text-[#2467a5]',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  )
}

function buildSalesPath(data: typeof salesData) {
  const width = 780
  const height = 230
  const maxValue = Math.max(...data.map((item) => item.value))
  const minValue = Math.min(...data.map((item) => item.value))
  const range = Math.max(maxValue - minValue, 1)

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((item.value - minValue) / range) * (height - 28) - 18
    return { x, y }
  })

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  return { points, linePath, areaPath }
}

function SalesOverviewCard() {
  const { points, linePath, areaPath } = useMemo(() => buildSalesPath(salesData), [])

  return (
    <div className="rounded-[24px] border border-[#dfe7e2] bg-white p-5 shadow-[0_12px_30px_rgba(17,46,31,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[17px] font-bold tracking-[-0.03em] text-[#1e2a22]">Sales Overview</h3>
          <p className="mt-1 text-sm text-[#68756f]">Total sales for the last 7 days</p>
        </div>
        <button type="button" className="rounded-full border border-[#dfe7e2] bg-[#f6f9f7] px-3 py-1.5 text-xs font-medium text-[#2f7a4f]">
          Last 7 days
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-[18px] border border-[#edf2ef] bg-[#fbfdfb] p-3">
        <svg viewBox="0 0 780 230" className="h-[220px] w-full" role="img" aria-label="Sales chart for the last seven days">
          {[0, 1, 2, 3].map((line) => (
            <line
              key={line}
              x1="0"
              x2="780"
              y1={20 + line * 55}
              y2={20 + line * 55}
              stroke="#e7efe8"
              strokeDasharray="4 6"
            />
          ))}

          <path d={areaPath} fill="url(#salesFill)" opacity="0.8" />
          <path d={linePath} fill="none" stroke="#2f7a4f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point, index) => (
            <g key={salesData[index].label}>
              <circle cx={point.x} cy={point.y} r="4.5" fill="#2f7a4f" stroke="#ffffff" strokeWidth="2" />
              <text x={point.x} y="220" textAnchor="middle" fontSize="11" fill="#6a7d74">
                {salesData[index].label.split(' ')[1]}
              </text>
            </g>
          ))}

          <defs>
            <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6bb98c" stopOpacity="0.36" />
              <stop offset="100%" stopColor="#6bb98c" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

function DonutChart() {
  const total = orderStatusData.reduce((sum, item) => sum + item.count, 0)
  const gradient = useMemo(() => {
    let start = 0
    const segments = orderStatusData.map((item) => {
      const end = start + (item.count / total) * 100
      const segment = `${item.color} ${start}% ${end}%`
      start = end
      return segment
    })
    return `conic-gradient(${segments.join(', ')})`
  }, [total])

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex h-[210px] w-[210px] items-center justify-center rounded-full" style={{ background: gradient }}>
        <div className="flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
          <span className="text-[32px] font-bold tracking-[-0.06em] text-[#1e2a22]">128</span>
          <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6b7b72]">Total Orders</span>
        </div>
      </div>

      <div className="flex-1 space-y-2.5">
        {orderStatusData.map((item) => {
          const percentage = Math.round((item.count / total) * 100)
          return (
            <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[#42534d]">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 text-[#566a63]">
                <span className="font-semibold text-[#1e2a22]">{item.count}</span>
                <span>({percentage}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AdminDashboardPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#eef4ee] text-[#14241d]">
      <div className="flex min-h-screen">
        <aside className="fixed left-0 top-0 hidden h-screen w-[270px] border-r border-[#dfe7e2] bg-[#f5faf6] px-5 py-5 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2 pb-5 pt-2">
            <img src={logo} alt="Tomiland Foods" className="h-11 w-11 rounded-full object-cover" />
            <div className="leading-none">
              <div className="flex items-center gap-1 text-[15px] font-black tracking-[-0.08em] text-[#2f7a4f]">
                <span>TOMILAND</span>
              </div>
              <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4d685d]">FOODS</div>
            </div>
          </div>

          <nav className="mt-4 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = item.label === 'Dashboard'
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.route)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[14px] font-medium transition ${
                    isActive ? 'bg-[#e7f5ea] text-[#2f7a4f] shadow-sm ring-1 ring-[#d2ebdc]' : 'text-[#1e2a22] hover:bg-[#edf6ee] hover:text-[#2f7a4f]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base">{isActive ? '▣' : '◫'}</span>
                    {item.label}
                  </span>
                  {item.hasChildren && <span className="text-xs text-[#6a7d74]">⌄</span>}
                </button>
              )
            })}
          </nav>

          <div className="mt-auto rounded-[18px] border border-[#dfe7e2] bg-[#ecf5ee] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-[#2f7a4f] shadow-sm">🍏</div>
              <div>
                <div className="text-sm font-bold text-[#1f342b]">Tomiland Foods</div>
                <div className="text-[11px] text-[#5e766c]">Fresh food. Better lives.</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="ml-0 flex-1 lg:ml-[270px]">
          <header className="sticky top-0 z-20 border-b border-[#dfe7e2] bg-[#f3f8f3]/90 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <label className="relative block flex-1 max-w-[760px]">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a7d74]">⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search orders, products, customers..."
                  className="w-full rounded-full border border-[#dfe7e2] bg-[rgba(255,255,255,0.7)] py-3 pl-11 pr-4 text-sm text-[#1e2a22] outline-none ring-0 placeholder:text-[#6a7d74] focus:border-[#2f7a4f]"
                />
              </label>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Notifications"
                    onClick={() => setNotificationsOpen((current) => !current)}
                    className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe7e2] bg-white text-lg text-[#2f7a4f] shadow-sm"
                  >
                    🔔
                  </button>
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef6f5f] px-1 text-[10px] font-bold text-white">
                    4
                  </span>

                  {notificationsOpen && (
                    <div className="absolute right-0 top-[52px] w-72 rounded-[18px] border border-[#dfe7e2] bg-white p-3 shadow-[0_18px_35px_rgba(17,46,31,0.12)]">
                      <p className="mb-2 text-sm font-bold text-[#1e2a22]">Notifications</p>
                      <div className="space-y-2 text-sm text-[#53655e]">
                        {notificationItems.map((item) => (
                          <div key={item} className="rounded-xl bg-[#f5faf6] px-3 py-2 text-left">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((current) => !current)}
                    className="flex items-center gap-3 rounded-full border border-[#dfe7e2] bg-white px-2 py-1.5 shadow-sm"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf6ee] text-sm font-bold text-[#2f7a4f]">A</span>
                    <span className="hidden text-left sm:block">
                      <span className="block text-sm font-semibold text-[#1e2a22]">Admin</span>
                      <span className="block text-[11px] text-[#64756d]">Super Admin</span>
                    </span>
                    <span className="text-[#586c63]">⌄</span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-[60px] w-48 rounded-[18px] border border-[#dfe7e2] bg-white p-3 shadow-[0_18px_35px_rgba(17,46,31,0.12)]">
                      <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#1e2a22] hover:bg-[#f5faf6]">Profile</button>
                      <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#1e2a22] hover:bg-[#f5faf6]">Team Access</button>
                      <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#1e2a22] hover:bg-[#f5faf6]">Sign out</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-[36px] font-black tracking-[-0.07em] text-[#1b2d25]">Good morning, Admin!</h1>
                <p className="mt-2 text-[15px] text-[#5e726b]">Here&apos;s what&apos;s happening with your platform today.</p>
              </div>

              <div className="flex items-center gap-3 rounded-full border border-[#dfe7e2] bg-white px-4 py-2.5 shadow-sm">
                <span className="text-[#2f7a4f]">📅</span>
                <div className="text-left">
                  <div className="text-xs uppercase tracking-[0.14em] text-[#667a73]">Date</div>
                  <div className="text-sm font-semibold text-[#1e2a22]">Apr 26, 2025</div>
                </div>
                <div className="mx-2 h-8 w-px bg-[#e3e9e4]" />
                <div className="text-left">
                  <div className="text-xs uppercase tracking-[0.14em] text-[#667a73]">Time</div>
                  <div className="text-sm font-semibold text-[#1e2a22]">10:24 AM</div>
                </div>
              </div>
            </div>

            <section className="mt-6 grid gap-4 xl:grid-cols-6 md:grid-cols-3 sm:grid-cols-2">
              {kpis.map((item) => (
                <div key={item.title} className="rounded-[22px] border border-[#dfe7e2] bg-white p-4 shadow-[0_12px_25px_rgba(17,46,31,0.04)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf6ee] text-lg text-[#2f7a4f]">{item.icon}</span>
                  </div>
                  <h2 className="mt-4 text-sm font-medium text-[#52635d]">{item.title}</h2>
                  <div className="mt-2 text-[28px] font-black tracking-[-0.06em] text-[#1d2d26]">{item.value}</div>
                  <div className={`mt-2 inline-flex items-center gap-1 text-sm font-semibold ${item.direction === 'up' ? 'text-[#2f7a4f]' : 'text-[#d65c4a]'}`}>
                    {item.change}
                  </div>
                  <p className="mt-1 text-xs text-[#687873]">{item.subtitle}</p>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/orders')}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2f7a4f] hover:text-[#286d47]"
                  >
                    View details <span aria-hidden="true">→</span>
                  </button>
                </div>
              ))}
            </section>

            <section className="mt-7 grid gap-5 xl:grid-cols-[2.1fr_1fr]">
              <SalesOverviewCard />

              <div className="rounded-[24px] border border-[#dfe7e2] bg-white p-5 shadow-[0_12px_30px_rgba(17,46,31,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[17px] font-bold tracking-[-0.03em] text-[#1e2a22]">Order Status Overview</h3>
                    <p className="mt-1 text-sm text-[#68756f]">Distribution of orders by status</p>
                  </div>
                  <button type="button" className="rounded-full border border-[#dfe7e2] bg-[#f6f9f7] px-3 py-1.5 text-xs font-medium text-[#2f7a4f]">
                    Today
                  </button>
                </div>

                <div className="mt-6">
                  <DonutChart />
                </div>
              </div>
            </section>

            <section className="mt-7 grid gap-5 xl:grid-cols-[1.7fr_1fr_1fr]">
              <div className="rounded-[24px] border border-[#dfe7e2] bg-white shadow-[0_12px_30px_rgba(17,46,31,0.04)]">
                <div className="flex items-center justify-between border-b border-[#edf2ef] px-5 py-4">
                  <h3 className="text-[17px] font-bold tracking-[-0.03em] text-[#1e2a22]">Recent Orders</h3>
                  <button type="button" onClick={() => navigate('/admin/orders')} className="text-sm font-semibold text-[#2f7a4f]">
                    View all →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#fafcfb] text-xs uppercase tracking-[0.12em] text-[#667a73]">
                        <th className="px-5 py-3 font-semibold">Order #</th>
                        <th className="px-5 py-3 font-semibold">Customer</th>
                        <th className="px-5 py-3 font-semibold">Items</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                        <th className="px-5 py-3 font-semibold">Total</th>
                        <th className="px-5 py-3 font-semibold">Time</th>
                        <th className="px-5 py-3 font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order.orderId}
                          className="cursor-pointer border-t border-[#edf2ef] transition hover:bg-[#f9fbfa]"
                          onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                        >
                          <td className="px-5 py-3 font-semibold text-[#1e2a22]">{order.orderId}</td>
                          <td className="px-5 py-3 text-[#475b55]">{order.customer}</td>
                          <td className="px-5 py-3 text-[#475b55]">{order.items}</td>
                          <td className="px-5 py-3">
                            <StatusPill status={order.status as RowStatus} />
                          </td>
                          <td className="px-5 py-3 font-semibold text-[#1e2a22]">{order.total}</td>
                          <td className="px-5 py-3 text-[#475b55]">{order.time}</td>
                          <td className="px-5 py-3">
                            <button type="button" className="text-sm font-semibold text-[#2f7a4f]">View →</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#dfe7e2] bg-white p-4 shadow-[0_12px_30px_rgba(17,46,31,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[17px] font-bold tracking-[-0.03em] text-[#1e2a22]">Low Stock Products</h3>
                  <button type="button" onClick={() => navigate('/admin/products')} className="text-sm font-semibold text-[#2f7a4f]">
                    View all →
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.name} className="flex items-center gap-3 rounded-[16px] border border-[#edf2ef] bg-[#fbfdfb] p-2.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf6ee] text-lg">{product.image}</div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-[#1e2a22]">{product.name}</div>
                        <div className="mt-1 text-xs text-[#5d716a]">Current stock</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-[#1e2a22]">{product.stock}</div>
                        <span className="mt-1 inline-flex rounded-full bg-[#fff1ee] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#df5f4c]">
                          Low Stock
                        </span>
                      </div>
                      <button type="button" className="text-lg text-[#2f7a4f]">›</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#dfe7e2] bg-white p-4 shadow-[0_12px_30px_rgba(17,46,31,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[17px] font-bold tracking-[-0.03em] text-[#1e2a22]">Top Selling Products</h3>
                  <button type="button" onClick={() => navigate('/admin/reports')} className="text-sm font-semibold text-[#2f7a4f]">
                    View all →
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {topSellingProducts.map((product) => (
                    <div key={product.name} className="flex items-center gap-3 rounded-[16px] border border-[#edf2ef] bg-[#fbfdfb] p-2.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf6ee] text-lg">{product.image}</div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-[#1e2a22]">{product.name}</div>
                        <div className="mt-1 text-xs text-[#5d716a]">{product.sold}</div>
                      </div>
                      <div className="text-sm font-bold text-[#2f7a4f]">{product.change}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-7 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
              <div className="rounded-[24px] border border-[#dfe7e2] bg-white p-5 shadow-[0_12px_30px_rgba(17,46,31,0.04)]">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf6ee] text-lg text-[#2f7a4f]">⚡</span>
                  <h3 className="text-[17px] font-bold tracking-[-0.03em] text-[#1e2a22]">Quick Actions</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => navigate(action.route)}
                      className="flex min-h-[96px] flex-col items-center justify-center rounded-[18px] border border-[#dfe7e2] bg-[#f9fbfa] p-4 text-center transition hover:border-[#cfe2d4] hover:bg-[#edf6ee]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-[#2f7a4f] shadow-sm">
                        {action.icon}
                      </span>
                      <span className="mt-3 text-sm font-semibold text-[#1e2a22]">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#dfe7e2] bg-[#ecf8ef] p-5 shadow-[0_12px_30px_rgba(17,46,31,0.04)]">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-[17px] font-bold tracking-[-0.03em] text-[#1e2a22]">Keep your platform running smoothly</h3>
                    <p className="mt-2 max-w-[290px] text-sm leading-6 text-[#53645d]">
                      Monitor orders, manage products, and ensure customers get fresh food on time.
                    </p>
                  </div>
                  <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-white text-4xl shadow-sm">🛒</div>
                </div>
                <button type="button" onClick={() => navigate('/admin/reports')} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2f7a4f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_22px_rgba(47,122,79,0.2)] hover:bg-[#286f46]">
                  View System Health <span aria-hidden="true">→</span>
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export function AdminOrdersPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#eef4ee] p-8 text-[#1b2d25]">
      <div className="mx-auto max-w-4xl rounded-[26px] border border-[#dfe7e2] bg-white p-8 shadow-[0_12px_30px_rgba(17,46,31,0.04)]">
        <button type="button" onClick={() => navigate('/admin')} className="mb-8 text-sm font-semibold text-[#2f7a4f]">
          ← Back to dashboard
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2f7a4f]">Order details</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.06em]">{orderId ?? 'TM1024'}</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[18px] border border-[#edf2ef] bg-[#f9fbfa] p-4">
            <div className="text-sm text-[#667a73]">Customer</div>
            <div className="mt-2 text-lg font-bold">Aline Uwimana</div>
          </div>
          <div className="rounded-[18px] border border-[#edf2ef] bg-[#f9fbfa] p-4">
            <div className="text-sm text-[#667a73]">Status</div>
            <div className="mt-2 inline-flex rounded-full bg-[#fef4d7] px-2.5 py-1 text-sm font-semibold text-[#a36b00]">Preparing</div>
          </div>
          <div className="rounded-[18px] border border-[#edf2ef] bg-[#f9fbfa] p-4">
            <div className="text-sm text-[#667a73]">Items</div>
            <div className="mt-2 text-lg font-bold">3 items</div>
          </div>
          <div className="rounded-[18px] border border-[#edf2ef] bg-[#f9fbfa] p-4">
            <div className="text-sm text-[#667a73]">Total</div>
            <div className="mt-2 text-lg font-bold">8,900 RWF</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminSectionPage({ title, description }: { title: string; description: string }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#eef4ee] p-8 text-[#1b2d25]">
      <div className="mx-auto max-w-4xl rounded-[26px] border border-[#dfe7e2] bg-white p-8 shadow-[0_12px_30px_rgba(17,46,31,0.04)]">
        <button type="button" onClick={() => navigate('/admin')} className="mb-8 text-sm font-semibold text-[#2f7a4f]">
          ← Back to dashboard
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2f7a4f]">Admin module</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.06em]">{title}</h1>
        <p className="mt-3 max-w-xl text-base text-[#5c7068]">{description}</p>
        <div className="mt-8 rounded-[18px] border border-[#edf2ef] bg-[#f9fbfa] p-5 text-sm text-[#53655e]">
          This section is ready for the next admin workflow and can be wired to the backend later without changing the shell layout.
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
