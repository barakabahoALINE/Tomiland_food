export type Category = {
  id: string
  name: string
  image: string
}

export type BasketItem = {
  id: string
  name: string
  quantity: string
  price: string
}

export type Product = {
  id: string
  name: string
  price: string
  vendor: string
  freshness: string
  image: string
}

export type Market = {
  id: string
  name: string
  rating: number
  location: string
  image: string
}

export type Benefit = {
  id: string
  title: string
  description: string
  icon: string
}

export type HomepageData = {
  navItems: string[]
  basketSummary: {
    items: number
    subtotal: string
    delivery: string
    total: string
  }
  basketItems: BasketItem[]
  categories: Category[]
  topPicks: Product[]
  markets: Market[]
  benefits: Benefit[]
}

const placeholder = (text: string, width = 600, height = 420) =>
  `https://placehold.co/${width}x${height}/edf6ee/1c3f33?text=${encodeURIComponent(text)}`

const categoryFallback = (text: string) => placeholder(text, 220, 220)

export const getHomepageData = async (): Promise<HomepageData> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    navItems: ['Shop Fresh Food', 'Smart Basket', 'Markets', 'Supermarkets', 'How it Works'],
    basketSummary: {
      items: 12,
      subtotal: '24,500 RWF',
      delivery: '2,000 RWF',
      total: '26,500 RWF',
    },
    basketItems: [
      { id: 'tomatoes', name: 'Tomatoes', quantity: '1kg', price: '1,200 RWF' },
      { id: 'spinach', name: 'Spinach', quantity: '2kg', price: '2,400 RWF' },
      { id: 'cabbage', name: 'Cabbage', quantity: '1kg', price: '1,100 RWF' },
      { id: 'avocado', name: 'Avocado', quantity: '2pcs', price: '1,300 RWF' },
    ],
    categories: [
      { id: 'fresh-produce', name: 'Fresh Produce', image: categoryFallback('Fresh Produce') },
      { id: 'meat-fish', name: 'Meat & Fish', image: categoryFallback('Meat & Fish') },
      { id: 'dairy-eggs', name: 'Dairy & Eggs', image: categoryFallback('Dairy & Eggs') },
      { id: 'grains', name: 'Grains & Cereals', image: categoryFallback('Grains') },
      { id: 'essentials', name: 'Cooking Essentials', image: categoryFallback('Essentials') },
      { id: 'bread', name: 'Bread & Bakery', image: categoryFallback('Bakery') },
      { id: 'drinks', name: 'Drinks', image: categoryFallback('Drinks') },
    ],
    topPicks: [
      { id: 'tomato', name: 'Tomatoes', price: '1,200 RWF / kg', vendor: 'Market A', freshness: 'Fresh', image: placeholder('Tomatoes', 320, 220) },
      { id: 'avocado', name: 'Avocado', price: '1,500 RWF / kg', vendor: 'Market B', freshness: 'Fresh', image: placeholder('Avocado', 320, 220) },
      { id: 'chicken', name: 'Chicken (Fresh)', price: '4,800 RWF / kg', vendor: 'Supermarket C', freshness: 'Fresh', image: placeholder('Chicken', 320, 220) },
      { id: 'rice', name: 'Rice (Local)', price: '1,300 RWF / kg', vendor: 'Market A', freshness: 'Fresh', image: placeholder('Rice', 320, 220) },
      { id: 'milk', name: 'Milk (1L)', price: '1,200 RWF', vendor: 'Supermarket C', freshness: 'Fresh', image: placeholder('Milk', 320, 220) },
    ],
    markets: [
      { id: 'kimironko', name: 'Kimironko Market', rating: 4.6, location: 'Kimironko', image: placeholder('Kimironko Market', 420, 260) },
      { id: 'nyabugogo', name: 'Nyabugogo Market', rating: 4.5, location: 'Nyabugogo', image: placeholder('Nyabugogo Market', 420, 260) },
      { id: 'simba', name: ' Simba Supermarket', rating: 4.7, location: 'Remera', image: placeholder('Simba Supermarket', 420, 260) },
      { id: 'quality', name: 'Quality Supermarket', rating: 4.6, location: 'Kacyiru', image: placeholder('Quality Supermarket', 420, 260) },
    ],
    benefits: [
      { id: 'fresh', title: 'Fresh & Quality', description: 'Carefully selected everyday', icon: '✓' },
      { id: 'prices', title: 'Great Prices', description: 'Compare and save more', icon: '₵' },
      { id: 'delivery', title: 'Reliable Delivery', description: 'Fast and on-time delivery', icon: '🚚' },
      { id: 'support', title: 'Support You Can Trust', description: 'We are here for you anytime', icon: '☎' },
    ],
  }
}
