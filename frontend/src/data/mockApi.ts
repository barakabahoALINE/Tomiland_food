export type BasketItem = {
  id: string
  name: string
  quantity: string
  price: string
  image: string
}

export type ProductDetail = {
  [key: string]: string
}

export type ProductOption = {
  label: string
  options: string[]
}

export type Product = {
  id: string
  name: string
  kinyarwandaName?: string
  price: string
  priceUnit?: string
  vendor: string
  market?: string
  freshness: string
  rating: number
  image: string
  category: string
  subcategory?: string
  details?: ProductDetail
  options?: ProductOption[]
  packaging?: string[]
  availability?: 'available' | 'limited' | 'out_of_stock'
  badge?: string
}

export type Market = {
  id: string
  name: string
  rating: number
  location: string
  image: string
  city?: string
}

export type Category = {
  id: string
  name: string
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

export type ProductsData = {
  featured: Product[]
  categories: Category[]
  summary: {
    totalProducts: number
    availableToday: string
  }
}

export type BasketData = {
  items: BasketItem[]
  summary: {
    subtotal: string
    delivery: string
    serviceFee: string
    total: string
  }
}

export type CheckoutData = {
  deliveryOptions: Array<{ id: string; label: string; eta: string; price: string }>
  paymentMethods: string[]
  address: {
    name: string
    phone: string
    street: string
    city: string
    note: string
  }
}

const placeholder = (text: string, width = 600, height = 420) =>
  `https://placehold.co/${width}x${height}/edf6ee/1c3f33?text=${encodeURIComponent(text)}`

const categoryFallback = (text: string) => placeholder(text, 220, 220)

export const getHomepageData = async (): Promise<HomepageData> => {
  await new Promise((resolve) => setTimeout(resolve, 250))

  return {
    navItems: ['Shop Fresh Food', 'Smart Basket', 'Markets', 'Supermarkets', 'How it Works'],
    basketSummary: {
      items: 12,
      subtotal: '24,500 RWF',
      delivery: '2,000 RWF',
      total: '26,500 RWF',
    },
    basketItems: [
      { id: 'tomatoes', name: 'Tomatoes', quantity: '1kg', price: '1,200 RWF', image: placeholder('Tomatoes', 100, 100) },
      { id: 'spinach', name: 'Spinach', quantity: '2kg', price: '2,400 RWF', image: placeholder('Spinach', 100, 100) },
      { id: 'cabbage', name: 'Cabbage', quantity: '1kg', price: '1,100 RWF', image: placeholder('Cabbage', 100, 100) },
      { id: 'avocado', name: 'Avocado', quantity: '2pcs', price: '1,300 RWF', image: placeholder('Avocado', 100, 100) },
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
      { id: 'tomato', name: 'Tomatoes', price: '1,200 RWF / kg', vendor: 'Market A', freshness: 'Fresh', rating: 4.9, image: placeholder('Tomatoes', 320, 220), category: 'fresh-produce' },
      { id: 'avocado', name: 'Avocado', price: '1,500 RWF / kg', vendor: 'Market B', freshness: 'Fresh', rating: 4.8, image: placeholder('Avocado', 320, 220), category: 'fresh-produce' },
      { id: 'chicken', name: 'Chicken (Fresh)', price: '4,800 RWF / kg', vendor: 'Supermarket C', freshness: 'Fresh', rating: 4.7, image: placeholder('Chicken', 320, 220), category: 'meat-fish' },
      { id: 'rice', name: 'Rice (Local)', price: '1,300 RWF / kg', vendor: 'Market A', freshness: 'Fresh', rating: 4.6, image: placeholder('Rice', 320, 220), category: 'dry-goods' },
      { id: 'milk', name: 'Milk (1L)', price: '1,200 RWF', vendor: 'Supermarket C', freshness: 'Fresh', rating: 4.9, image: placeholder('Milk', 320, 220), category: 'dairy-eggs' },
    ],
    markets: [
      { id: 'kimironko', name: 'Kimironko Market', rating: 4.6, location: 'Kimironko', image: placeholder('Kimironko Market', 420, 260) },
      { id: 'nyabugogo', name: 'Nyabugogo Market', rating: 4.5, location: 'Nyabugogo', image: placeholder('Nyabugogo Market', 420, 260) },
      { id: 'simba', name: 'Simba Supermarket', rating: 4.7, location: 'Remera', image: placeholder('Simba Supermarket', 420, 260) },
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

export const getProductsData = async (): Promise<ProductsData> => {
  await new Promise((resolve) => setTimeout(resolve, 250))

  return {
    categories: [
      { id: 'fresh-produce', name: 'Fresh Produce', image: categoryFallback('Fresh Produce') },
      { id: 'dry-goods', name: 'Dry Goods', image: categoryFallback('Dry Goods') },
      { id: 'cooking-essentials', name: 'Cooking Essentials', image: categoryFallback('Cooking Essentials') },
      { id: 'beverages', name: 'Beverages', image: categoryFallback('Beverages') },
      { id: 'dairy-eggs', name: 'Dairy & Eggs', image: categoryFallback('Dairy & Eggs') },
      { id: 'meat-fish', name: 'Meat & Fish', image: categoryFallback('Meat & Fish') },
      { id: 'personal-care', name: 'Personal Care', image: categoryFallback('Personal Care') },
      { id: 'household', name: 'Household', image: categoryFallback('Household') },
      { id: 'baby-care', name: 'Baby Care', image: categoryFallback('Baby Care') },
    ],
    featured: [
      {
        id: 'p-01',
        name: 'Tomatoes',
        kinyarwandaName: 'Inyanya',
        price: '1,200',
        priceUnit: 'RWF / kg',
        market: 'Kimironko Market',
        vendor: 'Kimironko Market',
        freshness: 'Fresh',
        badge: 'FRESH',
        rating: 4.9,
        category: 'fresh-produce',
        subcategory: 'Vegetables',
        image: placeholder('Tomatoes'),
        details: { Size: 'Large', Ripeness: 'Ripe' },
        packaging: ['1 kg', '2 kg', '5 kg'],
        availability: 'available',
      },
      {
        id: 'p-02',
        name: 'Avocados',
        kinyarwandaName: 'Avoka',
        price: '1,500',
        priceUnit: 'RWF / kg',
        market: 'Nyabugogo Market',
        vendor: 'Nyabugogo Market',
        freshness: 'Fresh',
        badge: 'FARM FRESH',
        rating: 4.8,
        category: 'fresh-produce',
        subcategory: 'Fruits',
        image: placeholder('Avocados'),
        details: { Type: 'Hass' },
        packaging: ['500g', '1 kg'],
        availability: 'available',
      },
      {
        id: 'p-03',
        name: 'Onions',
        kinyarwandaName: 'Igitunguru',
        price: '1,200',
        priceUnit: 'RWF / kg',
        market: 'Simba Supermarket',
        vendor: 'Simba Supermarket',
        freshness: 'Fresh',
        badge: 'FRESH',
        rating: 4.7,
        category: 'fresh-produce',
        subcategory: 'Vegetables',
        image: placeholder('Onions'),
        details: { Size: 'Medium' },
        packaging: ['1 kg', '2 kg'],
        availability: 'available',
      },
      {
        id: 'p-04',
        name: 'Potatoes',
        kinyarwandaName: 'Ibirayi',
        price: '3,000',
        priceUnit: 'RWF',
        market: 'Kimironko Market',
        vendor: 'Kimironko Market',
        freshness: 'Fresh',
        badge: 'FRESH',
        rating: 4.8,
        category: 'fresh-produce',
        subcategory: 'Root Vegetables',
        image: placeholder('Potatoes'),
        details: { Variety: 'Ibirayi Butukura (Red)' },
        options: [{ label: 'Variety', options: ['Ibirayi Butukura (Red)', 'Ibirayi by\'Umweru (White)'] }],
        packaging: ['2 kg', '5 kg'],
        availability: 'available',
      },
      {
        id: 'p-05',
        name: 'Rice',
        kinyarwandaName: 'Umuceri',
        price: '9,000',
        priceUnit: 'RWF',
        market: 'Quality Supermarket',
        vendor: 'Quality Supermarket',
        freshness: 'Fresh',
        badge: 'FRESH',
        rating: 4.6,
        category: 'dry-goods',
        subcategory: 'Grains',
        image: placeholder('Rice'),
        details: { Type: 'Long Grain' },
        options: [{ label: 'Type', options: ['Long Grain', 'Basmati', 'Local Rice'] }],
        packaging: ['5 kg'],
        availability: 'available',
      },
      {
        id: 'p-06',
        name: 'Beans',
        kinyarwandaName: 'Ibishyimbo',
        price: '2,400',
        priceUnit: 'RWF',
        market: 'Nyabugogo Market',
        vendor: 'Nyabugogo Market',
        freshness: 'Fresh',
        badge: 'FRESH',
        rating: 4.7,
        category: 'dry-goods',
        subcategory: 'Legumes',
        image: placeholder('Beans'),
        details: { Type: 'Red' },
        packaging: ['2 kg'],
        availability: 'available',
      },
      {
        id: 'p-07',
        name: 'Cooking Oil',
        kinyarwandaName: 'Amavuta',
        price: '2,600',
        priceUnit: 'RWF',
        market: 'Simba Supermarket',
        vendor: 'Simba Supermarket',
        freshness: 'Fresh',
        badge: 'FRESH',
        rating: 4.9,
        category: 'cooking-essentials',
        subcategory: 'Oils',
        image: placeholder('Cooking Oil'),
        details: { Type: 'Pure Sunflower Oil' },
        packaging: ['1 L'],
        availability: 'available',
      },
      {
        id: 'p-08',
        name: 'Leafy Greens',
        kinyarwandaName: 'Imiboga',
        price: '900',
        priceUnit: 'RWF',
        market: 'Kimironko Market',
        vendor: 'Kimironko Market',
        freshness: 'Fresh',
        badge: 'FRESH',
        rating: 4.7,
        category: 'fresh-produce',
        subcategory: 'Herbs & Greens',
        image: placeholder('Leafy Greens'),
        packaging: ['1 bunch'],
        availability: 'available',
      },
      {
        id: 'p-09',
        name: 'Chicken Breast',
        kinyarwandaName: 'Nyama y\'Inkoko',
        price: '4,800',
        priceUnit: 'RWF / kg',
        market: 'Quality Supermarket',
        vendor: 'Quality Supermarket',
        freshness: 'Fresh',
        badge: 'FRESH',
        rating: 4.9,
        category: 'meat-fish',
        subcategory: 'Poultry',
        image: placeholder('Chicken'),
        details: { Type: 'Chicken Breast' },
        packaging: ['500g', '1 kg'],
        availability: 'available',
      },
      {
        id: 'p-10',
        name: 'Fresh Milk',
        kinyarwandaName: 'Amata',
        price: '1,200',
        priceUnit: 'RWF',
        market: 'Quality Supermarket',
        vendor: 'Quality Supermarket',
        freshness: 'Fresh',
        badge: 'FRESH',
        rating: 4.9,
        category: 'dairy-eggs',
        subcategory: 'Milk',
        image: placeholder('Milk'),
        details: { Size: '1 L' },
        packaging: ['1 L'],
        availability: 'available',
      },
      {
        id: 'p-11',
        name: 'Eggs',
        kinyarwandaName: 'Amagi',
        price: '2,500',
        priceUnit: 'RWF',
        market: 'Kimironko Market',
        vendor: 'Kimironko Market',
        freshness: 'Fresh',
        badge: 'FRESH',
        rating: 4.8,
        category: 'dairy-eggs',
        subcategory: 'Eggs',
        image: placeholder('Eggs'),
        details: { Count: '12 pieces' },
        packaging: ['6 pieces', '12 pieces'],
        availability: 'available',
      },
      {
        id: 'p-12',
        name: 'Spinach',
        kinyarwandaName: 'Isombe',
        price: '900',
        priceUnit: 'RWF',
        market: 'Nyabugogo Market',
        vendor: 'Nyabugogo Market',
        freshness: 'Fresh',
        badge: 'FRESH',
        rating: 4.7,
        category: 'fresh-produce',
        subcategory: 'Vegetables',
        image: placeholder('Spinach'),
        packaging: ['500g', '1 kg'],
        availability: 'limited',
      },
    ],
    summary: {
      totalProducts: 126,
      availableToday: 'Available today',
    },
  }
}

export const getBasketData = async (): Promise<BasketData> => {
  await new Promise((resolve) => setTimeout(resolve, 250))

  return {
    items: [
      { id: 'b-01', name: 'Red Tomatoes', quantity: '1kg', price: '1,200 RWF', image: placeholder('Tomatoes', 120, 120) },
      { id: 'b-02', name: 'Fresh Spinach', quantity: '2 bunches', price: '2,400 RWF', image: placeholder('Spinach', 120, 120) },
      { id: 'b-03', name: 'Organic Avocado', quantity: '2pcs', price: '1,300 RWF', image: placeholder('Avocado', 120, 120) },
      { id: 'b-04', name: 'Local Rice', quantity: '2kg', price: '2,600 RWF', image: placeholder('Rice', 120, 120) },
    ],
    summary: {
      subtotal: '7,500 RWF',
      delivery: '2,000 RWF',
      serviceFee: '300 RWF',
      total: '9,800 RWF',
    },
  }
}

export const getCheckoutData = async (): Promise<CheckoutData> => {
  await new Promise((resolve) => setTimeout(resolve, 250))

  return {
    deliveryOptions: [
      { id: 'standard', label: 'Standard delivery', eta: '25 - 35 min', price: '2,000 RWF' },
      { id: 'express', label: 'Express delivery', eta: '15 - 20 min', price: '3,500 RWF' },
      { id: 'pickup', label: 'Store pickup', eta: 'Ready in 20 min', price: '0 RWF' },
    ],
    paymentMethods: ['Mobile Money', 'Card Payment', 'Cash on Delivery'],
    address: {
      name: 'Nadia Mutesa',
      phone: '+250 788 123 456',
      street: 'KG 15 Ave, Kimironko',
      city: 'Kigali, Rwanda',
      note: 'Ring the bell and leave at the gate if not home.',
    },
  }
}
