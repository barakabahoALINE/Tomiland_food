import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from './store/hooks'
import Homepage from './pages/Homepage'
import ProductsPage from './pages/Products'
import BasketPage from './pages/Basket'
import CheckoutPage from './pages/Checkout'
import MarketsPage from './pages/Markets/Markets'
import SupermarketsPage from './pages/Supermarkets/Supermarkets'
import HowItWorksPage from './pages/HowItWorks/HowItWorks'
import AccountPage from './pages/Account/Account'
import PageFooter from './components/PageFooter'
import AdminDashboardPage, { AdminOrdersPage, AdminSectionPage } from './pages/Admin/AdminDashboard'

function PageWithFooter({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PageFooter />
    </>
  )
}

function RequireAuth({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/account" replace state={{ from: location }} />
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageWithFooter><Homepage /></PageWithFooter>} />
        <Route path="/products" element={<RequireAuth><PageWithFooter><ProductsPage /></PageWithFooter></RequireAuth>} />
        <Route path="/basket" element={<RequireAuth><PageWithFooter><BasketPage /></PageWithFooter></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><PageWithFooter><CheckoutPage /></PageWithFooter></RequireAuth>} />
        <Route path="/markets" element={<RequireAuth><PageWithFooter><MarketsPage /></PageWithFooter></RequireAuth>} />
        <Route path="/supermarkets" element={<RequireAuth><PageWithFooter><SupermarketsPage /></PageWithFooter></RequireAuth>} />
        <Route path="/how-it-works" element={<RequireAuth><PageWithFooter><HowItWorksPage /></PageWithFooter></RequireAuth>} />
        <Route path="/account" element={<PageWithFooter><AccountPage /></PageWithFooter>} />

        <Route path="/admin" element={<RequireAuth adminOnly><AdminDashboardPage /></RequireAuth>} />
        <Route path="/admin/orders" element={<RequireAuth adminOnly><AdminSectionPage title="Orders" description="Manage incoming, confirmed, in-transit and completed orders across markets and supermarkets." /></RequireAuth>} />
        <Route path="/admin/orders/:orderId" element={<RequireAuth adminOnly><AdminOrdersPage /></RequireAuth>} />
        <Route path="/admin/products" element={<RequireAuth adminOnly><AdminSectionPage title="Products" description="Review inventory, low stock alerts, pricing and fresh product performance." /></RequireAuth>} />
        <Route path="/admin/markets" element={<RequireAuth adminOnly><AdminSectionPage title="Markets" description="Monitor local market partner performance and delivery coordination." /></RequireAuth>} />
        <Route path="/admin/supermarkets" element={<RequireAuth adminOnly><AdminSectionPage title="Supermarkets" description="Track retailer fulfillment, inventory availability and service levels." /></RequireAuth>} />
        <Route path="/admin/smart-basket" element={<RequireAuth adminOnly><AdminSectionPage title="Smart Basket" description="Coordinate curated grocery recommendations and basket completion workflows." /></RequireAuth>} />
        <Route path="/admin/customers" element={<RequireAuth adminOnly><AdminSectionPage title="Customers" description="Manage customer activity, retention and service support." /></RequireAuth>} />
        <Route path="/admin/delivery" element={<RequireAuth adminOnly><AdminSectionPage title="Delivery" description="Configure delivery windows, dispatch and fulfillment coverage across partner channels." /></RequireAuth>} />
        <Route path="/admin/payments" element={<RequireAuth adminOnly><AdminSectionPage title="Payments" description="Review transactions, settlement activity and financial health." /></RequireAuth>} />
        <Route path="/admin/reports" element={<RequireAuth adminOnly><AdminSectionPage title="Reports & Analytics" description="Track sales trends, product demand and operational performance." /></RequireAuth>} />
        <Route path="/admin/support" element={<RequireAuth adminOnly><AdminSectionPage title="Support" description="Respond to customer needs and operational escalations across the platform." /></RequireAuth>} />
        <Route path="/admin/settings" element={<RequireAuth adminOnly><AdminSectionPage title="Settings" description="Update platform preferences, notifications and internal admin controls." /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
