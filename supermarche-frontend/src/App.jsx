import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CataloguePage from './pages/CataloguePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ClientOrdersPage from './pages/ClientOrdersPage';
import ProfilePage from './pages/ProfilePage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminStockPage from './pages/admin/AdminStockPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import SuperAdminPage from './pages/admin/SuperAdminPage';
import AdminClientsPage from './pages/admin/AdminClientsPage';
import AdminPromotionsPage from './pages/admin/AdminPromotionsPage';
import AboutPage from './pages/AboutPage';
import PromotionsPage from './pages/PromotionsPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

import Footer from './components/Footer';

// Guards
function ProtectedRoute({ children, reqRole }) {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/connexion" replace />;

  if (reqRole === 'client' && user.role !== 'client') return <Navigate to="/admin" replace />;
  if (reqRole === 'admin' && !isAdmin) return <Navigate to="/catalogue" replace />;
  if (reqRole === 'super_admin' && !isSuperAdmin) return <Navigate to="/admin" replace />;

  if (reqRole === 'admin_produits' && !['super_admin','admin_produits'].includes(user.role)) return <Navigate to="/admin" replace />;
  if (reqRole === 'admin_stock' && !['super_admin','admin_stock'].includes(user.role)) return <Navigate to="/admin" replace />;

  return children;
}

// Show footer only on client-facing pages (not admin)
function FooterWrapper() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin');
  const isAuth = ['/connexion','/inscription'].includes(location.pathname);
  if (isAdmin || isAuth) return null;
  return <Footer />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/connexion" element={<LoginPage />} />
              <Route path="/inscription" element={<RegisterPage />} />
              <Route path="/catalogue" element={<CataloguePage />} />
              <Route path="/produit/:id" element={<ProductDetailsPage />} />
              <Route path="/a-propos" element={<AboutPage />} />
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Client Routes */}
              <Route path="/panier" element={<ProtectedRoute reqRole="client"><CartPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute reqRole="client"><CheckoutPage /></ProtectedRoute>} />
              <Route path="/order-confirmation/:id" element={<ProtectedRoute reqRole="client"><OrderConfirmationPage /></ProtectedRoute>} />
              <Route path="/commandes" element={<ProtectedRoute reqRole="client"><ProfilePage defaultTab="commandes" /></ProtectedRoute>} />
              <Route path="/profil" element={<ProtectedRoute><ProfilePage defaultTab="infos" /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute reqRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/admin/produits" element={<ProtectedRoute reqRole="admin_produits"><AdminProductsPage /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute reqRole="admin_produits"><AdminCategoriesPage /></ProtectedRoute>} />
              <Route path="/admin/stock" element={<ProtectedRoute reqRole="admin_stock"><AdminStockPage /></ProtectedRoute>} />
              <Route path="/admin/commandes" element={<ProtectedRoute reqRole="admin_stock"><AdminOrdersPage /></ProtectedRoute>} />
              <Route path="/admin/clients" element={<ProtectedRoute reqRole="admin"><AdminClientsPage /></ProtectedRoute>} />
              <Route path="/admin/promotions" element={<ProtectedRoute reqRole="admin"><AdminPromotionsPage /></ProtectedRoute>} />
              <Route path="/superadmin" element={<ProtectedRoute reqRole="super_admin"><SuperAdminPage /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <FooterWrapper />
          </BrowserRouter>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
