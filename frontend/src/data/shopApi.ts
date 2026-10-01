import type { Market, Product, ProductsData } from './mockApi'
import type { CartItem } from '../store/slices/cart/cartTypes'

const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '')

async function request<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail ?? data.message ?? `Request failed (${response.status})`)
  return data as T
}

type ApiProduct = Omit<Product, 'price' | 'rating'> & { price: number; rating?: number; stock: number; description?: string }

export async function getProducts(): Promise<ProductsData> {
  const products = await request<ApiProduct[]>('/shop/products/')
  const categories = Array.from(new Map(products.map((p) => [p.category, {
    id: p.category,
    name: p.category.split('-').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' '),
    image: p.image,
  }])).values())
  return {
    featured: products.map((p) => ({ ...p, id: String(p.id), price: String(p.price), rating: p.rating ?? 4.7,
      image: p.image || `https://placehold.co/600x420/edf6ee/1c3f33?text=${encodeURIComponent(p.name)}`,
      vendor: p.vendor || p.market || '', freshness: p.freshness || 'Fresh', availability: p.stock === 0 ? 'out_of_stock' : p.stock < 5 ? 'limited' : 'available' })),
    categories,
    summary: { totalProducts: products.length, availableToday: 'Available today' },
  }
}

export async function getMarkets(): Promise<Market[]> {
  const markets = await request<Market[]>('/shop/markets/')
  return markets.map((market) => ({ ...market, image: market.image || `https://placehold.co/500x340/edf6ee/1c3f33?text=${encodeURIComponent(market.name)}` }))
}

export async function saveCart(items: CartItem[], token: string): Promise<void> {
  await request('/shop/cart/', token, { method: 'PUT', body: JSON.stringify({
    items: items.map((item) => ({ product_id: item.id, quantity: item.quantity, packaging: item.packaging ?? '' })),
  }) })
}

export async function getSavedCart(token: string): Promise<CartItem[]> {
  const result = await request<{ items: Array<{ id: string; name: string; price: number; quantity: number; packaging: string; imageUrl: string }> }>('/shop/cart/', token)
  return result.items.map((item) => ({ ...item, notes: undefined }))
}

export type OrderPayload = {
  items: Array<{ id: string; quantity: number; packaging?: string }>
  delivery_method: string
  payment_method: string
}

export function placeOrder(payload: OrderPayload, token: string) {
  return request<{ order_id: string; status: string; total: number }>('/shop/orders/', token, {
    method: 'POST', body: JSON.stringify(payload),
  })
}

export type AdminSummary = {
  totalOrders: number
  revenue: number
  pendingOrders: number
  lowStockProducts: number
  markets: number
  statusCounts: Array<{ label: string; count: number }>
  topProducts: Array<{ name: string; sold: number }>
  dailySales: Array<{ label: string; value: number }>
  recentOrders: Array<{ orderId: string; customer: string; items: number; status: string; total: number; time: string }>
  lowStock: Array<{ name: string; stock: number }>
}

export function getAdminSummary(token: string) {
  return request<AdminSummary>('/shop/admin/summary/', token)
}
