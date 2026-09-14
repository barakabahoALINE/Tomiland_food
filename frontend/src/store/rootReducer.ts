import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './slices/auth/authSlice';
import cartReducer from './slices/cart/cartSlice';

const createPlaceholderReducer = <T = Record<string, never>>(initialState: T = {} as T) => {
  return (state: T = initialState) => state;
};

const restaurantsReducer = createPlaceholderReducer();
const marketsReducer = createPlaceholderReducer();
const supermarketsReducer = createPlaceholderReducer();
const homemadeMealsReducer = createPlaceholderReducer();
const mealRequestsReducer = createPlaceholderReducer();
const favoritesReducer = createPlaceholderReducer();
const notificationsReducer = createPlaceholderReducer();
const ordersReducer = createPlaceholderReducer();
const profileReducer = createPlaceholderReducer();

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  restaurants: restaurantsReducer,
  markets: marketsReducer,
  supermarkets: supermarketsReducer,
  homemadeMeals: homemadeMealsReducer,
  mealRequests: mealRequestsReducer,
  favorites: favoritesReducer,
  notifications: notificationsReducer,
  orders: ordersReducer,
  profile: profileReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
