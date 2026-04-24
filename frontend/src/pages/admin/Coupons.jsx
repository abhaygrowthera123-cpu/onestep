import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2, Ticket, Search, Filter, Calendar, Zap, IndianRupee, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const AdminCoupons = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'percent',
    value: 10,
    minOrderAmount: 0,
    maxDiscountAmount: '',
    usageLimit: '',
    isActive: true,
  });

  const load = async () => {
    try {
      const data = await api.getCoupons();
      setRows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.createCoupon({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount),
        maxDiscountAmount: form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
        usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
        isActive: form.isActive,
      });
      setShowModal(false);
      setForm({
        code: '',
        type: 'percent',
        value: 10,
        minOrderAmount: 0,
        maxDiscountAmount: '',
        usageLimit: '',
        isActive: true,
      });
      await load();
    } catch (err) {
      alert('Failed to create coupon');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete coupon?')) return;
    try {
      await api.deleteCoupon(id);
      await load();
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="h-16 bg-white rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Coupons & Rewards</h1>
          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <Ticket className="h-3.5 w-3.5 text-rose-500" />
            Manage promotional codes and discount campaigns.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: rows.filter(r => r.isActive).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Used', value: rows.reduce((acc, r) => acc + (r.usedCount || 0), 0), color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Savings', value: '₹94k+', color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Expired', value: 0, color: 'text-slate-400', bg: 'bg-slate-50' }
        ].map((stat, i) => (
          <div key={i} className={cn("p-4 rounded-2xl border border-white shadow-sm flex flex-col items-center justify-center space-y-0.5", stat.bg)}>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">{stat.label}</span>
            <span className={cn("text-xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rows.map((coupon, idx) => (
          <motion.div
            key={coupon.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all p-4 overflow-hidden"
          >
            {/* Ticket Cutout Effect */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 border border-slate-100 rounded-full -translate-y-1/2" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 border border-slate-100 rounded-full -translate-y-1/2" />

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-rose-600 transition-colors uppercase tracking-tight">{coupon.code}</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      {coupon.type === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`} OFF
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => remove(coupon.id)}
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2 pt-3 border-t border-dashed border-slate-100">
              <div className="flex justify-between items-center text-[9px]">
                <span className="font-bold text-slate-400">Min Order</span>
                <span className="font-black text-slate-900">₹{coupon.minOrderAmount}</span>
              </div>
              <div className="flex justify-between items-center text-[9px]">
                <span className="font-bold text-slate-400">Used</span>
                <div className="flex items-center space-x-1">
                  <span className="font-black text-slate-900">{coupon.usedCount || 0}</span>
                  {coupon.usageLimit && <span className="text-slate-300">/ {coupon.usageLimit}</span>}
                </div>
              </div>
              {coupon.usageLimit && (
                <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-400 rounded-full" 
                    style={{ width: `${Math.min(((coupon.usedCount || 0) / coupon.usageLimit) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-slate-900">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tight">New Coupon</h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={create} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Promo Code</label>
                    <input required className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none uppercase text-sm" placeholder="e.g. SUMMER50" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none appearance-none text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed (₹)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Value</label>
                    <div className="relative">
                      <input type="number" required className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none text-sm" placeholder="10" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                      {form.type === 'percent' ? (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 text-sm">%</span>
                      ) : (
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Order</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none text-sm" placeholder="₹0" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Limit</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none text-sm" placeholder="Unlimited" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-slate-200">
                    Create Coupon
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
