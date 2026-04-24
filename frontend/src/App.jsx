import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import ScrollToTop from './components/ScrollToTop';
import { Splash } from './pages/Splash';

// Lazy load pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Search = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const CategoryProducts = lazy(() => import('./pages/CategoryProducts').then(m => ({ default: m.CategoryProducts })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Refund = lazy(() => import('./pages/Refund').then(m => ({ default: m.Refund })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Wallet = lazy(() => import('./pages/Wallet').then(m => ({ default: m.Wallet })));
const Coupons = lazy(() => import('./pages/Coupons').then(m => ({ default: m.Coupons })));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));

// Admin Pages
const AdminLayout = lazy(() => import('./components/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/admin/Products').then(m => ({ default: m.AdminProducts })));
const AdminOrders = lazy(() => import('./pages/admin/Orders').then(m => ({ default: m.AdminOrders })));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail').then(m => ({ default: m.AdminOrderDetail })));
const AdminUsers = lazy(() => import('./pages/admin/Users').then(m => ({ default: m.AdminUsers })));
const UserDetail = lazy(() => import('./pages/admin/UserDetail').then(m => ({ default: m.UserDetail })));
const AdminCategories = lazy(() => import('./pages/admin/Categories').then(m => ({ default: m.AdminCategories })));
const AdminSettings = lazy(() => import('./pages/admin/Settings').then(m => ({ default: m.AdminSettings })));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons').then(m => ({ default: m.AdminCoupons })));

// Seller Pages
const SellerLayout = lazy(() => import('./components/SellerLayout').then(m => ({ default: m.SellerLayout })));
const SellerDashboard = lazy(() => import('./pages/seller/Dashboard').then(m => ({ default: m.SellerDashboard })));
const SellerProducts = lazy(() => import('./pages/seller/Products').then(m => ({ default: m.SellerProducts })));
const SellerOrders = lazy(() => import('./pages/seller/Orders').then(m => ({ default: m.SellerOrders })));
const SellerAnalytics = lazy(() => import('./pages/seller/Analytics').then(m => ({ default: m.SellerAnalytics })));
const ShopProfile = lazy(() => import('./pages/seller/ShopProfile').then(m => ({ default: m.ShopProfile })));

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
    </div>
);

const ProtectedRoute = ({ children, adminOnly, sellerOnly }) => {
    const { user, isAdmin, profile, loading } = useAuth();
    const isSeller = profile?.role === 'seller' || isAdmin;
    
    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
    if (sellerOnly && !isSeller) return <Navigate to="/" replace />;
    return <>{children}</>;
};

const AuthRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (user) return <Navigate to="/" replace />;
    return <>{children}</>;
};

const UserLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow pb-20 md:pb-0">
            {children}
        </main>
        <Footer />
        <MobileNav />
    </div>
);

function AppContent() {
    const [isSplashComplete, setIsSplashComplete] = React.useState(false);

    if (!isSplashComplete) {
        return <Splash onComplete={() => setIsSplashComplete(true)} />;
    }

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                {/* Admin Routes - Most specific first */}
                <Route path="/admin/*" element={<ProtectedRoute adminOnly>
                    <AdminLayout>
                        <Routes>
                            <Route path="/" element={<AdminDashboard />}/>
                            <Route path="/products" element={<AdminProducts />}/>
                            <Route path="/orders" element={<AdminOrders />}/>
                            <Route path="/orders/:id" element={<AdminOrderDetail />}/>
                            <Route path="/users" element={<AdminUsers />}/>
                            <Route path="/users/:uid" element={<UserDetail />}/>
                            <Route path="/categories" element={<AdminCategories />}/>
                            <Route path="/coupons" element={<AdminCoupons />}/>
                            <Route path="/settings" element={<AdminSettings />}/>
                        </Routes>
                    </AdminLayout>
                </ProtectedRoute>}/>

                {/* Seller Routes */}
                <Route path="/seller/*" element={<ProtectedRoute sellerOnly>
                    <SellerLayout>
                        <Routes>
                            <Route path="/" element={<SellerDashboard />}/>
                            <Route path="/products" element={<SellerProducts />}/>
                            <Route path="/orders" element={<SellerOrders />}/>
                            <Route path="/analytics" element={<SellerAnalytics />}/>
                            <Route path="/profile" element={<ShopProfile />}/>
                        </Routes>
                    </SellerLayout>
                </ProtectedRoute>}/>

                {/* User Routes */}
                <Route path="/*" element={<UserLayout>
                    <Routes>
                        <Route path="/" element={<Home />}/>
                        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>}/>
                        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>}/>
                        <Route path="/search" element={<Search />}/>
                        <Route path="/product/:id" element={<ProductDetails />}/>
                        <Route path="/cart" element={<Cart />}/>
                        <Route path="/wishlist" element={<Wishlist />}/>
                        <Route path="/category/:id" element={<CategoryProducts />}/>
                        <Route path="/about" element={<About />}/>
                        <Route path="/contact" element={<Contact />}/>
                        <Route path="/faq" element={<FAQ />}/>
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>}/>
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
                        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>}/>
                        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>}/>
                        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>}/>
                        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>}/>
                        <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>}/>
                        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>}/>
                        <Route path="/terms" element={<Terms />}/>
                        <Route path="/privacy" element={<Privacy />}/>
                        <Route path="/refund" element={<Refund />}/>
                        <Route path="*" element={<div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                            <h1 className="text-6xl font-black text-slate-900">404</h1>
                            <p className="text-slate-500 font-medium">Page not found</p>
                            <a href="/" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-600 transition-all">Go Home</a>
                        </div>}/>
                    </Routes>
                </UserLayout>}/>
            </Routes>
        </Suspense>
    );
}

export default function App() {
    return (
        <HelmetProvider>
            <LanguageProvider>
                <AuthProvider>
                    <CartProvider>
                        <WishlistProvider>
                            <Router>
                                <ScrollToTop />
                                <AppContent />
                            </Router>
                        </WishlistProvider>
                    </CartProvider>
                </AuthProvider>
            </LanguageProvider>
        </HelmetProvider>
    );
}
