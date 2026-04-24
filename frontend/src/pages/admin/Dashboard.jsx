import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, ShoppingBag, DollarSign, ArrowUpRight, Package, Clock, ArrowRight, Activity, User, Calendar, CheckCircle2 } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { resolveImageUrl } from '../../lib/imageUrl';

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [productsResData, setProductsResData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [ordersRes, productsRes, usersRes, categoriesRes] = await Promise.all([
                    api.getOrders({ limit: 1000 }),
                    api.getProducts({ limit: 1000 }),
                    api.getUsers(),
                    api.getCategories()
                ]);

                const orders = ordersRes.data || [];
                const products = productsRes.data || [];
                const users = usersRes.data || [];
                const categories = categoriesRes || [];

                setProductsResData(products);

                // 1. Basic Stats
                const totalRevenue = orders
                    .filter(o => !['cancelled', 'refunded'].includes(o.status))
                    .reduce((sum, order) => sum + Number(order.totalAmount), 0);

                setStats({
                    totalRevenue,
                    totalOrders: ordersRes.pagination?.total || orders.length,
                    totalProducts: productsRes.pagination?.total || products.length,
                    totalUsers: usersRes.pagination?.total || users.length
                });

                // 2. Weekly Revenue Chart Data
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const weeklyData = days.map(day => ({ name: day, revenue: 0 }));
                
                const last7Days = new Date();
                last7Days.setDate(last7Days.getDate() - 7);

                orders.forEach(order => {
                    const date = new Date(order.createdAt);
                    if (date >= last7Days && !['cancelled', 'refunded'].includes(order.status)) {
                        const dayName = days[date.getDay()];
                        const dayObj = weeklyData.find(d => d.name === dayName);
                        if (dayObj) dayObj.revenue += Number(order.totalAmount);
                    }
                });
                setChartData(weeklyData);

                // 3. Category Distribution (Pie Chart)
                const catMap = {};
                products.forEach(p => {
                    const catName = p.category || 'Uncategorized';
                    catMap[catName] = (catMap[catName] || 0) + 1;
                });
                
                const pie = Object.keys(catMap).map(name => ({
                    name,
                    value: catMap[name]
                })).sort((a, b) => b.value - a.value).slice(0, 3);
                
                setPieData(pie.length > 0 ? pie : [{ name: 'No Products', value: 1 }]);

                setRecentOrders(orders.slice(0, 5));
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const generateReport = () => {
        const reportData = [
            ['Metric', 'Value'],
            ['Total Revenue', `₹${stats.totalRevenue}`],
            ['Total Orders', stats.totalOrders],
            ['Total Products', stats.totalProducts],
            ['Total Users', stats.totalUsers],
            ['Report Date', new Date().toLocaleString()]
        ];

        const csvContent = "data:text/csv;charset=utf-8," 
            + reportData.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `onestep_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

    const statCards = [
        { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'brand', trend: '+12%', detail: 'vs LW' },
        { label: 'Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'emerald', trend: '+8%', detail: 'Today' },
        { label: 'Products', value: stats.totalProducts, icon: Package, color: 'indigo', trend: '+2%', detail: 'Items' },
        { label: 'Customers', value: stats.totalUsers, icon: Users, color: 'amber', trend: '+5%', detail: 'Users' },
    ];

    if (loading) return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-white rounded-2xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-64 bg-white rounded-2xl" />
          <div className="h-64 bg-white rounded-2xl" />
        </div>
      </div>
    );

    return (
      <div className="space-y-6 pb-6">
        {/* Superior Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-brand-600 font-black text-[9px] uppercase tracking-[0.2em]">
              <Activity className="h-3 w-3" />
              <span>Real-time Intelligence</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
              <Clock className="h-3.5 w-3.5 text-slate-400"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <button 
              onClick={generateReport}
              className="bg-slate-950 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-brand-600 transition-all shadow-sm"
            >
              Export
            </button>
          </div>
        </div>

        {/* Premium Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((card, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: idx * 0.05 }} 
              onClick={() => idx > 0 && navigate(['/admin/orders', '/admin/products', '/admin/users'][idx-1])}
              className={cn(
                "group relative bg-white p-4 rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5",
                idx > 0 ? "cursor-pointer" : "cursor-default"
              )}
            >
              <div className="flex flex-col space-y-3 relative z-10">
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "p-2 rounded-lg transition-all shadow-sm",
                    card.color === 'brand' && "bg-brand-600 text-white",
                    card.color === 'emerald' && "bg-emerald-500 text-white",
                    card.color === 'indigo' && "bg-indigo-600 text-white",
                    card.color === 'amber' && "bg-amber-500 text-white"
                  )}>
                    <card.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center text-[7px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                    <ArrowUpRight className="h-2 w-2 mr-0.5" />
                    {card.trend}
                  </div>
                </div>
                
                <div className="space-y-0">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{card.value}</h3>
                  <p className="text-[7px] font-bold text-slate-300 italic">{card.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recently Added Products Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-0.5">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Recently Added</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Latest Catalog Additions</p>
              </div>
              <button 
                onClick={() => navigate('/admin/products')}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                Manage All
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {productsResData?.slice(0, 4).map((product, i) => (
                <div key={i} className="group flex flex-col space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={resolveImageUrl(product.images?.[0])} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-slate-800 line-clamp-1">{product.name}</h4>
                    <p className="text-[9px] font-bold text-brand-600">₹{product.discountPrice || product.price}</p>
                  </div>
                </div>
              ))}
              {(!productsResData || productsResData.length === 0) && (
                <div className="col-span-full h-48 flex flex-col items-center justify-center text-slate-300">
                   <Package className="h-8 w-8 mb-2 opacity-20" />
                   <p className="text-[10px] font-black uppercase tracking-widest">No Products Found</p>
                </div>
              )}
            </div>
          </div>

          {/* Critical Inventory Monitor */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
            <div className="space-y-0.5 mb-6">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Inventory</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Critical Stock Alerts</p>
            </div>
            
            <div className="space-y-3 flex-grow overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
              {stats.totalProducts > 0 ? (
                productsResData?.filter(p => p.stock <= 10).sort((a, b) => a.stock - b.stock).slice(0, 6).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-10 rounded-lg overflow-hidden border border-slate-200">
                        <img src={resolveImageUrl(item.images?.[0])} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-700 line-clamp-1">{item.name}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Qty: {item.stock}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest",
                      item.stock === 0 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {item.stock === 0 ? 'Out' : 'Low'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-300">
                  <Package className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Alerts</p>
                </div>
              )}
              {stats.totalProducts > 0 && productsResData?.filter(p => p.stock <= 10).length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-slate-300">
                  <CheckCircle2 className="h-8 w-8 mb-2 text-emerald-500/20" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/40">Inventory Healthy</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => navigate('/admin/products')}
              className="mt-4 w-full py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-brand-50 hover:text-brand-600 transition-all border border-transparent hover:border-brand-100"
            >
              Manage Catalog
            </button>
          </div>
        </div>

        {/* Professional Transaction Ledger */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 flex justify-between items-center border-b border-slate-100">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Latest system operations</p>
            </div>
            <button onClick={() => navigate('/admin/orders')} className="text-brand-600 font-black text-[9px] uppercase tracking-widest bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-600 hover:text-white transition-all">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">TXN ID</th>
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50 transition-all cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                    <td className="px-6 py-3">
                       <span className="font-black text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-100 text-[10px]">
                         #{order.id.slice(-6).toUpperCase()}
                       </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors">
                          <User className="h-4 w-4"/>
                        </div>
                        <p className="text-[11px] font-black text-slate-800">{order.address?.fullName || 'Customer'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-6 py-3 font-black text-slate-900 text-sm">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shadow-sm",
                        order.status === 'delivered' 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-brand-50 text-brand-600 border-brand-100"
                      )}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
};
