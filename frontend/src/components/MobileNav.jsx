import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, LayoutDashboard, Heart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const MobileNav = () => {
    const location = useLocation();
    const { totalItems } = useCart();
    const { user } = useAuth();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: ShoppingBag, label: 'Orders', path: '/orders' },
        { icon: LayoutDashboard, label: 'Dashboard', path: user ? '/profile' : '/login' },
        { icon: Heart, label: 'Favorites', path: '/wishlist' },
    ];

    // Cart badge on Orders
    navItems[0].badge = totalItems > 0 ? totalItems : null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex justify-around items-center px-2 py-3">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={`${item.path}-${item.label}`}
                            to={item.path}
                            className={`relative flex flex-col items-center space-y-1 px-3 py-1 transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                        >
                            <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            {item.badge && item.badge > 0 && (
                                <span className="absolute top-1 right-2 bg-slate-900 text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                                    {item.badge}
                                </span>
                            )}
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-lg shadow-blue-200" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
