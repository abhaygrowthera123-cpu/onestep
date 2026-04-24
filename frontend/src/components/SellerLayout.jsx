import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ShoppingCart, User, LogOut, ChevronRight, Menu, X, BarChart3, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const SellerLayout = ({ children }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/seller' },
        { id: 'products', label: 'Products', icon: ShoppingBag, path: '/seller/products' },
        { id: 'orders', label: 'My Orders', icon: ShoppingCart, path: '/seller/orders' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/seller/analytics' },
        { id: 'profile', label: 'Shop Details', icon: User, path: '/seller/profile' },
    ];

    const isActive = (path) => {
        if (path === '/seller') return location.pathname === '/seller';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 sticky top-0 h-screen overflow-y-auto custom-scrollbar flex-shrink-0">
                <div className="p-6">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <img src="/images/logo.png" alt="Onestep-Hub" className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl object-contain shadow-md shadow-slate-100 group-hover:scale-105 transition-transform" />
                        <div className="flex flex-col">
                            <span className="text-sm xl:text-base font-black text-slate-900 leading-none">Onestep<span className="text-blue-600">-Hub</span></span>
                            <span className="text-[8px] xl:text-[9px] font-black text-slate-400 uppercase tracking-widest">Seller Hub</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-grow space-y-0.5">
                    {menuItems.map((item) => (
                        <Link 
                            key={item.id} 
                            to={item.path} 
                            className={cn(
                                "flex items-center justify-between py-2.5 px-4 rounded-none transition-all group",
                                isActive(item.path) 
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100/20 border-r-4 border-white/20" 
                                    : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                            )}
                        >
                            <div className="flex items-center space-x-3">
                                <item.icon className={cn("h-5 w-5", isActive(item.path) ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                                <span className="font-bold text-[13px] tracking-tight">{item.label}</span>
                            </div>
                            <ChevronRight className={cn("h-4 w-4 opacity-0 group-hover:opacity-100 transition-all", isActive(item.path) && "opacity-100")} />
                        </Link>
                    ))}
                </nav>

                <div className="p-4">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Need Help?</p>
                            <p className="text-sm font-bold mt-1">Visit Seller Support</p>
                        </div>
                        <HelpCircle className="absolute -bottom-2 -right-2 h-16 w-16 text-white/5 group-hover:scale-110 transition-transform" />
                    </div>
                </div>

                <div className="mt-auto border-t border-slate-100">
                    <button 
                        onClick={() => navigate('/')} 
                        className="w-full flex items-center space-x-3 py-3 px-4 rounded-none text-slate-400 hover:bg-slate-50 transition-all font-bold text-[13px] group"
                    >
                        <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Store</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-[60] flex items-center justify-between px-4">
                <Link to="/" className="flex items-center space-x-3 group">
                    <img src="/images/logo.png" alt="Onestep-Hub" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-contain" />
                    <span className="text-xs sm:text-sm font-black text-slate-900">Onestep<span className="text-blue-600">-Hub</span></span>
                </Link>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                    className="p-2 bg-slate-50 rounded-lg"
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setIsMobileMenuOpen(false)} 
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[50] lg:hidden"
                        />
                        <motion.aside 
                            initial={{ x: -300 }} 
                            animate={{ x: 0 }} 
                            exit={{ x: -300 }} 
                            className="fixed inset-y-0 left-0 w-56 bg-white z-[55] lg:hidden flex flex-col"
                        >
                            <div className="p-6 pt-20 flex items-center space-x-3">
                                <img src="/images/logo.png" alt="Onestep-Hub" className="w-10 h-10 rounded-xl object-contain" />
                                <div className="flex flex-col">
                                    <span className="text-base font-black text-slate-900 leading-none">Onestep<span className="text-blue-600">-Hub</span></span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Seller Hub</span>
                                </div>
                            </div>
                            <nav className="flex-grow space-y-1">
                                {menuItems.map((item) => (
                                    <Link 
                                        key={item.id} 
                                        to={item.path} 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center space-x-3 p-4 rounded-2xl transition-all",
                                            isActive(item.path) ? "bg-blue-600 text-white" : "text-slate-500"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-bold text-sm">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-grow p-4 lg:p-5 pt-20 lg:pt-5 overflow-x-hidden">
                <div className="max-w-[1400px] mx-auto w-full">
                    <div className="bg-white lg:rounded-[32px] min-h-[calc(100vh-2.5rem)] border border-slate-100 lg:shadow-sm p-4 lg:p-5">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
