import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, ShoppingCart, Tag, Settings, LogOut, ChevronRight, Menu, X, Ticket } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
export const AdminLayout = ({ children }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const navigate = useNavigate();
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { id: 'products', label: 'Products', icon: ShoppingBag, path: '/admin/products' },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
        { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
        { id: 'categories', label: 'Categories', icon: Tag, path: '/admin/categories' },
        { id: 'coupons', label: 'Coupons', icon: Ticket, path: '/admin/coupons' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    ];
    const isActive = (path) => {
        if (path === '/admin')
            return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };
    return (<div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 sticky top-0 h-screen overflow-y-auto custom-scrollbar flex-shrink-0">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="/images/logo.png" alt="Onestep-Hub" className="w-10 h-8 sm:w-12 sm:h-10 object-contain group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 leading-none">Onestep<span className="text-blue-600">-Hub</span></span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Admin Panel</span>
            </div>
          </Link>
          <div className="px-1 pt-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Store Admin</p>
          </div>
        </div>

        <nav className="flex-grow space-y-0.5">
          {menuItems.map((item) => (<Link key={item.id} to={item.path} className={cn("flex items-center justify-between py-2.5 px-4 rounded-none transition-all group", isActive(item.path)
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100/20 border-r-4 border-white/20"
                : "text-gray-500 hover:bg-gray-50 hover:text-blue-600")}>
              <div className="flex items-center space-x-3">
                <item.icon className={cn("h-5 w-5", isActive(item.path) ? "text-white" : "text-gray-400 group-hover:text-blue-600")}/>
                <span className="font-bold text-[13px]">{item.label}</span>
              </div>
              <ChevronRight className={cn("h-4 w-4 opacity-0 group-hover:opacity-100 transition-all", isActive(item.path) && "opacity-100")}/>
            </Link>))}
        </nav>

        <div className="border-t border-gray-50 mt-auto">
          <button onClick={() => navigate('/')} className="w-full flex items-center space-x-3 py-3 px-4 rounded-none text-red-500 hover:bg-red-50 transition-all font-bold group">
            <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform"/>
            <span className="text-[13px]">Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-gray-100">
          {isMobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (<>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] lg:hidden"/>
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed inset-y-0 left-0 w-56 bg-white z-[55] lg:hidden flex flex-col">
              <div className="p-8 pt-20">
                <Link to="/" className="flex items-center space-x-3">
                  <img src="/images/logo.png" alt="Onestep-Hub" className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-blue-200" />
                  <div className="flex flex-col">
                    <span className="text-base font-black text-gray-900 leading-none">Onestep<span className="text-blue-600">-Hub</span></span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Admin Panel</span>
                  </div>
                </Link>
              </div>
              <nav className="flex-grow space-y-1">
                {menuItems.map((item) => (<Link key={item.id} to={item.path} onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center justify-between p-4 rounded-2xl transition-all group", isActive(item.path)
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-100"
                    : "text-gray-500 hover:bg-gray-50 hover:text-blue-600")}>
                    <div className="flex items-center space-x-3">
                      <item.icon className={cn("h-5 w-5", isActive(item.path) ? "text-white" : "text-gray-400 group-hover:text-blue-600")}/>
                      <span className="font-bold">{item.label}</span>
                    </div>
                  </Link>))}
              </nav>
            </motion.aside>
          </>)}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow p-4 lg:p-5 overflow-x-hidden">
        <div className="max-w-[1280px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>);
};
