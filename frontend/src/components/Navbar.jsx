import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, Search, Menu, X, LogOut, LayoutDashboard, Heart, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = () => {
    const { user, profile, isAdmin, logout, loading: authLoading } = useAuth();
    const { totalItems } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await api.getCategories();
                setCategories(cats || []);
            } catch (err) { console.error(err); }
        };
        fetchCategories();
    }, []);
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsMenuOpen(false);
        }
    };
    return (<nav className={cn("sticky top-0 z-50 transition-all duration-300", isScrolled ? "bg-white/80 backdrop-blur-lg border-b border-slate-200 py-2 shadow-sm" : "bg-white border-b border-transparent py-4")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <img src="/images/logo.png" alt="Onestep-Hub" className="w-10 h-8 sm:w-12 sm:h-10 md:w-14 md:h-12 object-contain group-hover:scale-110 transition-transform" />
            <span className="text-lg sm:text-xl font-black tracking-tighter text-slate-900 flex items-center">
              Onestep<span className="text-blue-600">-Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8 ml-12">
            <div className="relative group">
              <button className="flex items-center space-x-1.5 text-slate-500 hover:text-blue-600 transition-colors text-[11px] font-black uppercase tracking-widest">
                <span>Collections</span>
                <ChevronDown className="h-3 w-3 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 mt-4 w-64 bg-white border border-slate-100 rounded-[2rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Shop by Category</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {(Array.isArray(categories) ? categories : []).slice(0, 8).map(cat => (
                      <Link 
                        key={cat.id} 
                        to={`/search?category=${encodeURIComponent(cat.name)}`}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-all group/item"
                      >
                        <span className="text-xs font-bold uppercase tracking-tight">{cat.name}</span>
                        <ChevronDown className="h-3 w-3 -rotate-90 opacity-0 group-hover/item:opacity-100 transition-all" />
                      </Link>
                    ))}
                    <Link to="/search" className="mt-2 text-center text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline pt-2">View All Collections</Link>
                  </div>
                </div>
              </div>
            </div>
            <Link to="/about" className="text-slate-500 hover:text-blue-600 transition-colors text-[11px] font-black uppercase tracking-widest">About</Link>
            <Link to="/contact" className="text-slate-500 hover:text-blue-600 transition-colors text-[11px] font-black uppercase tracking-widest">Contact</Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8 lg:mx-12">
            <form onSubmit={handleSearch} className="relative w-full group">
              <input type="text" placeholder="Search for premium fashion..." className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium text-slate-600" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
              <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors"/>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-4 lg:space-x-6 pr-4 lg:pr-6 border-r border-slate-100">
              {isAdmin && (<Link to="/admin" className="text-slate-500 hover:text-blue-600 transition-colors flex items-center space-x-2">
                  <LayoutDashboard className="h-5 w-5"/>
                  <span className="text-xs font-black uppercase tracking-widest hidden xl:inline">Admin</span>
                </Link>)}

              {(profile?.role === 'seller' || isAdmin) && (<Link to="/seller" className="text-slate-500 hover:text-blue-600 transition-colors flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5"/>
                  <span className="text-xs font-black uppercase tracking-widest hidden xl:inline">Seller</span>
                </Link>)}
              
              <Link to="/wishlist" className="text-slate-500 hover:text-rose-500 transition-colors">
                <Heart className="h-6 w-6"/>
              </Link>

              <Link to="/cart" className="relative text-slate-500 hover:text-blue-600 transition-colors">
                <ShoppingCart className="h-6 w-6"/>
                <AnimatePresence>
                  {totalItems > 0 && (<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-blue-200">
                      {totalItems}
                    </motion.span>)}
                </AnimatePresence>
              </Link>
            </div>

            {authLoading ? (
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse" />
              </div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-3 group bg-slate-50 p-1 rounded-full pr-4 border border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:scale-105 transition-all">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-[10px] font-black text-slate-900 truncate max-w-[80px]">
                      {user.displayName || 'Account'}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-all">
                  Login
                </Link>
                <Link to="/register" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 active:scale-95">
                  Join
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Simplified since we have MobileNav */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-slate-50 rounded-xl text-slate-600">
              {isMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Simplified */}
      <AnimatePresence>
          {isMenuOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-slate-100 overflow-hidden">
            <div className="px-4 py-6 space-y-6">
              <form onSubmit={handleSearch} className="relative">
                <input type="text" placeholder="Search products..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                <Search className="absolute left-4 top-4.5 h-5 w-5 text-slate-400"/>
              </form>

              {/* Shop by Category - Mobile */}
              {categories.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shop by Category</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(Array.isArray(categories) ? categories : []).slice(0, 6).map(cat => (
                      <Link
                        key={cat.id}
                        to={`/search?category=${encodeURIComponent(cat.name)}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-100 transition-all group"
                      >
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide text-center group-hover:text-blue-600 transition-colors">{cat.name}</span>
                        {cat.productCount > 0 && (
                          <span className="text-[8px] font-bold text-slate-400 mt-0.5">{cat.productCount}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/search"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline py-1"
                  >
                    Browse All Collections →
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {isAdmin && (<Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 text-slate-900">
                    <LayoutDashboard className="h-6 w-6 text-brand-600"/>
                    <span className="font-black text-sm uppercase tracking-widest">Admin Dashboard</span>
                  </Link>)}
                
                <Link to="/about" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 text-slate-900">
                  <span className="font-black text-sm uppercase tracking-widest">About Us</span>
                </Link>
                <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 text-slate-900">
                  <span className="font-black text-sm uppercase tracking-widest">Contact Us</span>
                </Link>
                
                {user ? (<button onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                }} className="flex items-center space-x-4 p-4 rounded-2xl bg-rose-50 text-rose-600 w-full text-left">
                    <LogOut className="h-6 w-6"/>
                    <span className="font-black text-sm uppercase tracking-widest">Logout</span>
                  </button>) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center p-4 rounded-2xl bg-slate-50 text-slate-900 font-black uppercase tracking-widest text-[11px] border border-slate-100">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center p-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-slate-200">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </nav>);
};
