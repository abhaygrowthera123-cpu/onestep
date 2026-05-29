import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { motion } from 'motion/react';
import { Package, ShoppingBag, TrendingUp, DollarSign, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../../services/api';

function formatRevenue(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function formatTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getSellerStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = stats
    ? [
        { label: 'Revenue', value: formatRevenue(stats.revenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Orders', value: String(stats.orderCount), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Products', value: String(stats.productCount), icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Low stock', value: String(stats.lowStockCount), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
      ]
    : [];

  return (
    <div className="space-y-6 pb-6">
      <SEO title="Seller Dashboard | OneStep Hub" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Seller Hub</h1>
          <p className="text-[11px] text-slate-500 font-medium italic">Monitor your store performance and sales metrics.</p>
        </div>
        <Link
          to="/seller/products"
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-all shadow-sm"
        >
          New Listing
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md"
            >
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} w-fit`}>
                <stat.icon size={20} />
              </div>
              <div className="mt-4 space-y-0.5">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-xl font-black text-slate-900">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6">
          <div className="space-y-0.5 mb-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Sales Trend</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last 7 days revenue</p>
          </div>
          {loading ? (
            <div className="h-[240px] bg-slate-50 rounded-2xl animate-pulse" />
          ) : stats?.revenueByDay?.length ? (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[240px] flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.3em]">No sales data yet</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col">
          <div className="space-y-0.5 mb-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent orders</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Latest activity</p>
          </div>
          <div className="space-y-4 flex-grow">
            {loading && <p className="text-slate-400 text-xs">Loading...</p>}
            {!loading && (!stats?.recentOrders?.length) && (
              <p className="text-slate-400 text-xs font-medium">No orders yet.</p>
            )}
            {stats?.recentOrders?.map((o) => (
              <Link
                key={o.id}
                to="/seller/orders"
                className="flex items-start gap-3 group p-2 hover:bg-slate-50 rounded-xl transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                  <ShoppingBag size={16} className="text-slate-400 group-hover:text-brand-600" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-[11px] font-black text-slate-900 truncate">{o.orderNumber}</p>
                  <p className="text-[9px] text-slate-400 font-bold">{formatTime(o.createdAt)} · ₹{Number(o.totalAmount).toLocaleString('en-IN')}</p>
                </div>
                <ArrowUpRight size={14} className="text-slate-200 group-hover:text-brand-600 shrink-0" />
              </Link>
            ))}
          </div>
          <Link
            to="/seller/analytics"
            className="mt-4 text-center text-[10px] font-black uppercase tracking-widest text-brand-600 hover:underline"
          >
            View analytics <TrendingUp className="inline h-3 w-3 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
