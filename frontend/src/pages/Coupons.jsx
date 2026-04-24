import React, { useState, useEffect } from 'react';
import { ChevronLeft, Ticket, Copy, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { motion } from 'motion/react';

export const Coupons = () => {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await api.getCoupons();
                setCoupons(res || []);
            } catch (error) {
                console.error('Error fetching coupons:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-6 sticky top-0 z-10">
                <div className="flex items-center space-x-4 max-w-2xl mx-auto">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all">
                        <ChevronLeft className="h-6 w-6 text-gray-900" />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Available Coupons</h1>
                </div>
            </div>

            <main className="px-6 py-8 max-w-2xl mx-auto space-y-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-[2rem] animate-pulse" />)}
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100">
                        <Ticket className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                        <p className="font-bold text-gray-400">No active coupons available right now.</p>
                    </div>
                ) : (
                    coupons.map((coupon, idx) => (
                        <motion.div
                            key={coupon.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[2rem] border-2 border-dashed border-amber-100 p-6 flex flex-col sm:flex-row items-center justify-between relative overflow-hidden group hover:border-amber-400 transition-all"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full translate-x-12 -translate-y-12" />
                            
                            <div className="flex items-center space-x-6 relative z-10">
                                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                    <Ticket className="h-8 w-8" />
                                </div>
                                <div className="space-y-1 text-center sm:text-left">
                                    <h3 className="text-lg font-black text-gray-900">
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                    </h3>
                                    <p className="text-xs font-medium text-gray-500">Min. order ₹{coupon.minOrderAmount}</p>
                                    <div className="flex items-center justify-center sm:justify-start space-x-2 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full w-fit">
                                        <Clock className="h-3 w-3" />
                                        <span>Expires {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => copyToClipboard(coupon.code)}
                                className="mt-6 sm:mt-0 px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-3 hover:bg-amber-500 transition-all shadow-xl shadow-gray-200"
                            >
                                {copied === coupon.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                <span>{copied === coupon.code ? 'Copied!' : coupon.code}</span>
                            </button>
                        </motion.div>
                    ))
                )}
            </main>
        </div>
    );
};
