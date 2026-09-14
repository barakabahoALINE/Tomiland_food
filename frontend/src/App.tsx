import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import ProductsPage from './pages/Products'
import BasketPage from './pages/Basket'
import CheckoutPage from './pages/Checkout'
import MarketsPage from './pages/Markets/Markets'
import SupermarketsPage from './pages/Supermarkets/Supermarkets'
import HowItWorksPage from './pages/HowItWorks/HowItWorks'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/basket" element={<BasketPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/supermarkets" element={<SupermarketsPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
