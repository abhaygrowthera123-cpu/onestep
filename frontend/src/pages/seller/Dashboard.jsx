import React from 'react';
import { SEO } from '../../components/SEO';
import { motion } from 'motion/react';
import { Package, ShoppingBag, TrendingUp, Users, DollarSign, ArrowUpRight, Activity } from 'lucide-react';

export const SellerDashboard = () => {
    const stats = [
        { label: 'Revenue', value: '₹4.5L', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Orders', value: '128', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Products', value: '45', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Views', value: '2.4K', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-6 pb-6">
            <SEO title="Seller Dashboard | OneStep Hub" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Seller Hub</h1>
                    <p className="text-[11px] text-slate-500 font-medium italic">Monitor your store performance and sales metrics.</p>
                </div>
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-all shadow-sm">
                    New Listing
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="flex items-center text-emerald-600 text-[9px] font-black bg-emerald-50 px-1.5 py-0.5 rounded-lg">
                                +12% <TrendingUp size={10} className="ml-1" />
                            </span>
                        </div>
                        <div className="mt-4 space-y-0.5">
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-xl font-black text-slate-900">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart Area */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6">
                    <div className="space-y-0.5 mb-6">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Sales Trend</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue performance overview</p>
                    </div>
                    <div className="h-[240px] flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.3em] italic">Analytics Visualization</p>
                    </div>
                </div>
                
                {/* Activity Feed */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col">
                    <div className="space-y-0.5 mb-6">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Feed</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Latest interactions</p>
                    </div>
                    <div className="space-y-4 flex-grow">
                        {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="flex items-start gap-3 group cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-all">
                                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-white transition-colors">
                                    <ShoppingBag size={16} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-[11px] font-black text-slate-900">New order #1234{i}</p>
                                    <p className="text-[9px] text-slate-400 font-bold">2 mins ago</p>
                                </div>
                                <ArrowUpRight size={14} className="text-slate-200 group-hover:text-brand-600 transition-all" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
