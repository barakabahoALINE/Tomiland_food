export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  restaurantId?: string | null;
  notes?: string;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalItems: number;
  total: number;
  currency: string;
  updatedAt: string | null;
}
