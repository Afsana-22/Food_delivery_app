import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShoppingCart, User, Shield, Store, Truck, Languages, History, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './i18n';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import DriverDashboard from './pages/DriverDashboard';
import TrackOrder from './pages/TrackOrder';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';



function Header() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <nav className="glass-nav sticky top-0 z-[1001] bg-white/60 dark:bg-slate-950/80 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-white/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center w-full">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 tracking-tight flex items-center gap-2 hover:scale-105 transition-transform origin-left">
            <span className="text-brand">ZT</span> Zaptaste
          </Link>

          {user && (
            <div className="hidden lg:flex items-center gap-4 border-l border-slate-200 pl-6">
              {user.role === 'admin' && <Link to="/admin" className="flex items-center gap-2 text-sm font-black text-slate-800 hover:text-red-500 transition-all bg-red-50 px-4 py-2 rounded-xl border border-red-100"><Shield size={16} /> Command Center</Link>}
              {user.role === 'vendor' && <Link to="/vendor" className="flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-orange-500 transition-all bg-orange-50 px-4 py-2 rounded-xl border border-orange-100"><Store size={16} /> My Kitchen <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></span></Link>}
              {user.role === 'driver' && <Link to="/driver" className="flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-blue-500 transition-all bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"><Truck size={16} /> Delivery Radar <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping ml-1"></span></Link>}
              {user.role === 'customer' && <Link to="/history" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-500 transition-colors"><History size={16} /> My Orders</Link>}
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center">
          {(!user || user.role === 'customer') && (
            <Link to="/cart" className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-all hover:bg-orange-50 dark:hover:bg-slate-800 rounded-full relative group">
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-red-600 to-red-400 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg border border-white dark:border-slate-800">{totalItems}</span>}
            </Link>
          )}

          <button onClick={toggleTheme} className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="hidden sm:flex items-center gap-2 text-slate-700 hover:text-orange-600 font-black text-sm bg-white/80 backdrop-blur-md hover:bg-white border border-slate-200/80 px-4 py-2 rounded-full shadow-sm hover:shadow-orange-500/10 hover:-translate-y-0.5 transition-all">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white"><User size={12} strokeWidth={3} /></div> 
                {user.name?.split(' ')[0] || 'Guest'}
                {user.isPro && <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full ml-1 shadow-sm">PRO</span>}
              </Link>
              <button onClick={logout} className="bg-slate-100 px-4 py-2.5 rounded-full font-bold hover:bg-red-50 hover:text-red-600 transition-colors text-slate-600 text-sm">Logout</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full font-bold hover:bg-slate-200 transition-colors text-slate-700 text-sm">Login</Link>
              <Link to="/signup" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full font-bold hover:bg-slate-700 transition-colors text-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="font-sans text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 relative w-full overflow-x-hidden min-h-screen flex flex-col transition-colors duration-300">
            <Header />
            <main className="w-full flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/track/:orderId" element={<TrackOrder />} />
                <Route path="/history" element={<OrderHistory />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/vendor" element={<VendorDashboard />} />
                <Route path="/driver" element={<DriverDashboard />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>

            <footer className="bg-slate-900 text-slate-400 py-12 px-8 mt-20">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <p className="text-2xl font-black text-white tracking-tighter">ZT Zaptaste</p>
                  <p className="text-sm mt-1">Sivakasi | Virudhunagar | Madurai</p>
                </div>
                <div className="flex gap-8 text-sm font-bold">
                  <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
                  <Link to="/history" className="hover:text-orange-500 transition-colors">Orders</Link>
                  <Link to="/cart" className="hover:text-orange-500 transition-colors">Cart</Link>
                  <Link to="/login" className="hover:text-orange-500 transition-colors">Login</Link>
                </div>
                <p className="text-xs text-slate-600">(c) 2026 Zaptaste. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

