import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, ChevronLeft, Calendar, DollarSign, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SellerAnalytics = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getSellerOrders({ limit: 200 });
        setOrders(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { total, chartData } = useMemo(() => {
    let sum = 0;
    const byDay = {};
    for (const o of orders) {
      sum += Number(o.totalAmount || 0);
      const d = new Date(o.createdAt).toISOString().slice(0, 10);
      byDay[d] = (byDay[d] || 0) + Number(o.totalAmount || 0);
    }
    const chartData = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, revenue]) => ({ date: date.slice(5), revenue: Math.round(revenue) }));
    return { total: sum, chartData };
  }, [orders]);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate('/seller')} className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
          <ChevronLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
          <p className="text-[11px] text-slate-500 font-medium">Revenue insights from your product catalog.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Revenue</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{total.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Orders</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{orders.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-white rounded-2xl border border-slate-100 animate-pulse" />
      ) : chartData.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
           <p className="font-black text-xs uppercase tracking-widest">No transaction data available yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Revenue (Last 14 Days)</h3>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>Real-time Sync</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '10px' }}
                  itemStyle={{ fontWeight: 900, fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
