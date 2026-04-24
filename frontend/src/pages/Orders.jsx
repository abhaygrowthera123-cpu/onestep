import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Truck,
  CheckCircle2,
  Clock,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { SEO } from '../components/SEO';
import { resolveImageUrl } from '../lib/imageUrl';

const FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
];

function orderMatchesFilter(order, key) {
    if (key === 'all') return true;
    if (key === 'pending') return ['pending', 'confirmed', 'packed'].includes(order.status);
    if (key === 'shipped') return ['shipped', 'out_for_delivery'].includes(order.status);
    if (key === 'delivered') return order.status === 'delivered';
    return true;
}

export const Orders = () => {
    const { user, profile } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [returnId, setReturnId] = useState(null);
    const [returnReason, setReturnReason] = useState('');
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const res = await api.getOrders({ limit: 50 });
                setOrders(res.data || []);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    const filteredOrders = orders.filter((o) => orderMatchesFilter(o, filter));

    const submitReturn = async () => {
        if (!returnId || returnReason.trim().length < 5) return;
        setBusy(true);
        try {
            await api.requestOrderReturn(returnId, returnReason.trim());
            const res = await api.getOrders({ limit: 50 });
            setOrders(res.data || []);
            setReturnId(null);
            setReturnReason('');
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    };

    const openInvoice = (id) => {
        api.openInvoiceHtml(id);
    };

    if (!user) {
        return null;
    }

    return (
        <div className="bg-gray-100 min-h-screen pb-24">
            <SEO title="Order History" />
            
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                    <button onClick={() => navigate('/profile')} className="p-2 -ml-2 text-gray-600">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-base font-black text-gray-900">Order History</h1>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 overflow-hidden border border-amber-100 p-0.5">
                   {profile?.photoURL ? (
                     <img src={profile.photoURL} alt="" className="w-full h-full object-cover rounded-lg" />
                   ) : (
                     <Package className="h-5 w-5" />
                   )}
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="bg-white border-b border-gray-50 px-4 py-2 flex items-center space-x-2 overflow-x-auto scrollbar-hide">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setFilter(tab.key)}
                        className={cn(
                            "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                            filter === tab.key
                                ? "bg-amber-400 text-amber-900 shadow-lg shadow-amber-100"
                                : "bg-gray-50 text-gray-400 hover:text-gray-600"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {returnId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                        <h3 className="font-black text-gray-900">Request return</h3>
                        <textarea
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            placeholder="Reason (min 5 characters)"
                            rows={4}
                            className="w-full rounded-2xl border border-gray-200 p-4 text-sm font-medium"
                        />
                        <div className="flex gap-2">
                            <button type="button" onClick={() => { setReturnId(null); setReturnReason(''); }} className="flex-1 py-3 rounded-2xl border border-gray-200 font-black text-xs uppercase">Cancel</button>
                            <button type="button" disabled={busy || returnReason.trim().length < 5} onClick={submitReturn} className="flex-1 py-3 rounded-2xl bg-gray-900 text-white font-black text-xs uppercase disabled:opacity-40">Submit</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto p-4 space-y-4">
                {loading ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compiling History...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-20 text-center space-y-6">
                        <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-sm flex items-center justify-center mx-auto text-gray-200">
                            <ShoppingBag className="h-12 w-12" />
                        </div>
                        <div className="space-y-2">
                           <h2 className="text-xl font-black text-gray-900">No orders found</h2>
                           <p className="text-sm text-gray-400 font-medium">Your purchase history will appear here.</p>
                        </div>
                        <button onClick={() => navigate('/')} className="bg-amber-400 text-amber-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-100">
                            Explore Catalog
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4 relative overflow-hidden group"
                            >
                                {/* Top: ID and Status */}
                                <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center space-x-2">
                                           <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Order ID</span>
                                           <span className="text-xs font-black text-gray-900">#{order.orderNumber || order.id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center space-x-2",
                                        order.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                                    )}>
                                        {order.status === 'delivered' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                        <span>{order.status}</span>
                                    </div>
                                </div>

                                {/* Middle: Items Preview */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex -space-x-3 overflow-hidden">
                                            {order.items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="w-12 h-16 rounded-xl border-2 border-white shadow-md overflow-hidden bg-gray-50 flex-shrink-0">
                                                    <img src={resolveImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className="w-12 h-16 rounded-xl border-2 border-white shadow-md bg-gray-900 text-white flex items-center justify-center text-[10px] font-black">
                                                    +{order.items.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-gray-800 leading-tight">
                                                {order.items.length} {order.items.length === 1 ? 'Product' : 'Products'} Purchased
                                            </p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                Package tracked via {order.paymentMethod === 'cod' ? 'Manual Link' : 'Automated API'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Total Pay</span>
                                        <span className="text-base font-black text-gray-900">₹{order.totalAmount}</span>
                                    </div>
                                </div>

                                {/* Bottom: Action */}
                                <div className="pt-4 flex flex-wrap items-center gap-2 justify-between border-t border-gray-50">
                                    <div className="flex items-center space-x-2">
                                       <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                          <Truck className="h-4 w-4" />
                                       </div>
                                       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest max-w-[140px] truncate">{order.trackingId ? `Tracking: ${order.trackingId}` : 'Processing'}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button type="button" onClick={() => openInvoice(order.id)} className="py-2 px-4 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50">
                                            Invoice
                                        </button>
                                        {order.status === 'delivered' && (
                                            <button type="button" onClick={() => setReturnId(order.id)} className="py-2 px-4 rounded-xl border border-amber-200 text-[10px] font-black uppercase tracking-widest text-amber-800 hover:bg-amber-50">
                                                Return
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
