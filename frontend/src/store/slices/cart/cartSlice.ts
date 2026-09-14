import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { CartItem, CartState } from './cartTypes';

const initialState: CartState = {
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  totalItems: 0,
  total: 0,
  currency: 'USD',
  updatedAt: null,
};

const recalculateTotals = (state: CartState) => {
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  state.subtotal = subtotal;
  state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  state.total = subtotal + state.deliveryFee;
  state.updatedAt = new Date().toISOString();
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const quantity = action.payload.quantity > 0 ? action.payload.quantity : 1;
      const existingItem = state.items.find((item) => item.id === action.payload.id);

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.notes = action.payload.notes ?? existingItem.notes;
      } else {
        state.items.push({ ...action.payload, quantity });
      }

      recalculateTotals(state);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      recalculateTotals(state);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((entry) => entry.id === action.payload.id);

      if (!item) {
        return;
      }

      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((entry) => entry.id !== action.payload.id);
      } else {
        item.quantity = action.payload.quantity;
      }

      recalculateTotals(state);
    },
    setDeliveryFee: (state, action: PayloadAction<number>) => {
      state.deliveryFee = Math.max(0, action.payload);
      recalculateTotals(state);
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.deliveryFee = 0;
      state.totalItems = 0;
      state.total = 0;
      state.currency = 'USD';
      state.updatedAt = null;
    },
  },
});

export const { addItem, removeItem, updateQuantity, setDeliveryFee, setCurrency, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
