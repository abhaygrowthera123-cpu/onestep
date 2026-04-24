import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Eye, Package, Truck, CheckCircle2, XCircle, MoreVertical,
  Clock, MapPin, RotateCcw, AlertCircle, PackageCheck,
  CircleDollarSign, Ban, Undo2, ShieldCheck, ShoppingCart, User, Calendar, ArrowRight, Search, FileText,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Real statuses matching ORDER_STATUS_TRANSITIONS on the backend ─── */
const ALL_STATUSES = [
  'pending', 'confirmed', 'packed', 'shipped',
  'out_for_delivery', 'delivered', 'cancelled',
  'return_requested', 'returned', 'refunded',
];

/* ─── Allowed transitions (mirrors backend/src/utils/constants.js) ─── */
const STATUS_TRANSITIONS = {
  pending:          ['confirmed', 'cancelled'],
  confirmed:        ['packed', 'cancelled'],
  packed:           ['shipped', 'cancelled'],
  shipped:          ['out_for_delivery', 'delivered'],
  out_for_delivery: ['delivered'],
  delivered:        ['return_requested'],
  return_requested: ['returned', 'delivered'],
  returned:         ['refunded'],
  cancelled:        [],
  refunded:         [],
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':           return <Clock className="h-4 w-4" />;
    case 'confirmed':         return <CheckCircle2 className="h-4 w-4" />;
    case 'packed':            return <Package className="h-4 w-4" />;
    case 'shipped':           return <Truck className="h-4 w-4" />;
    case 'out_for_delivery':  return <PackageCheck className="h-4 w-4" />;
    case 'delivered':         return <CheckCircle2 className="h-4 w-4" />;
    case 'cancelled':         return <XCircle className="h-4 w-4" />;
    case 'return_requested':  return <RotateCcw className="h-4 w-4" />;
    case 'returned':          return <Undo2 className="h-4 w-4" />;
    case 'refunded':          return <CircleDollarSign className="h-4 w-4" />;
    default:                  return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':           return 'bg-amber-100 text-amber-700';
    case 'confirmed':         return 'bg-blue-100 text-blue-700';
    case 'packed':            return 'bg-yellow-100 text-yellow-700';
    case 'shipped':           return 'bg-purple-100 text-purple-700';
    case 'out_for_delivery':  return 'bg-indigo-100 text-indigo-700';
    case 'delivered':         return 'bg-green-100 text-green-700';
    case 'cancelled':         return 'bg-red-100 text-red-700';
    case 'return_requested':  return 'bg-orange-100 text-orange-700';
    case 'returned':          return 'bg-rose-100 text-rose-700';
    case 'refunded':          return 'bg-emerald-100 text-emerald-700';
    default:                  return 'bg-gray-100 text-gray-700';
  }
};

const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'paid':              return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'awaiting_payment':  return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'failed':            return 'bg-red-50 text-red-600 border-red-200';
    case 'refunded':          return 'bg-blue-50 text-blue-600 border-blue-200';
    default:                  return 'bg-gray-50 text-gray-500 border-gray-200';
  }
};

/** Format the normalized address stored in orders */
const formatAddress = (addr) => {
  if (!addr) return 'N/A';
  const line1 = addr.line1 || addr.addressLine1 || '';
  const line2 = addr.line2 || addr.addressLine2 || '';
  const city = addr.city || '';
  const state = addr.state || '';
  const pincode = addr.pincode || addr.zipCode || '';
  return { line1, line2, city, state, pincode, fullName: addr.fullName || addr.name || 'Customer', phone: addr.phone || addr.phoneNumber || '' };
};

export const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [refundLoading, setRefundLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders({ limit: 100 });
      setOrders(res.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    setStatusError('');
    try {
      await api.updateOrderStatus(orderId, status);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }
    } catch (error) {
      const msg = error?.response?.data?.error || 'Failed to update status';
      setStatusError(msg);
      console.error('Error updating status:', error);
    }
  };

  const initiateRefund = async (order) => {
    if (!order.razorpayPaymentId && !order.paymentId) {
      alert('No Razorpay payment ID found — manual refund required.');
      return;
    }
    if (!window.confirm(`Initiate refund of ₹${order.totalAmount} for order #${order.orderNumber || order.id.slice(-8)}?`)) return;
    setRefundLoading(true);
    try {
      await api.initiateRefund(order.id);
      fetchOrders();
      if (selectedOrder?.id === order.id) {
        setSelectedOrder((prev) => ({ ...prev, status: 'refunded', paymentStatus: 'refunded' }));
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Refund failed';
      alert(msg);
      console.error(err);
    } finally {
      setRefundLoading(false);
    }
  };

    const filteredOrders = orders
        .filter((o) => {
            const addr = formatAddress(o.address);
            const matchesSearch = 
                o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                addr.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                addr.city.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-brand-600 font-black text-[9px] uppercase tracking-[0.3em]">
            <Package className="h-3 w-3" />
            <span>Operational Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Fulfillment</h1>
          <p className="text-[11px] text-slate-400 font-medium">Real-time oversight of platform customer acquisitions.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Queue</span>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 transition-all hover:border-brand-200 group">
              <span className="text-lg font-black text-slate-900">{orders.length}</span>
              <div className="p-1.5 bg-brand-50 rounded-lg text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                <ShoppingCart className="h-3.5 w-3.5"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-grow relative group">
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none font-bold text-slate-900 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-brand-500 transition-colors"/>
        </div>
      </div>
      {/* Status filter bar */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={cn(
            'px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all border shadow-sm',
            statusFilter === 'all' 
              ? 'bg-slate-900 border-slate-900 text-white shadow-slate-200' 
              : 'bg-white border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200'
          )}
        >
          All ({orders.length})
        </button>
        {ALL_STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          if (count === 0 && statusFilter !== s) return null;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all border shadow-sm',
                statusFilter === s 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-slate-200' 
                  : 'bg-white border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200'
              )}
            >
              {s.replace(/_/g, ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders Ledger */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Profile</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Settlement</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Logistics</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="p-24 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-xs">Synchronizing Ledger...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="p-24 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-xs">No matching transactions identify.</td></tr>
              ) : (
                filteredOrders.map((order) => {
                  const addr = formatAddress(order.address);
                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="hover:bg-slate-50 transition-all group cursor-pointer"
                    >
                      <td className="px-6 py-3">
                        <p className="font-black text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 group-hover:bg-white transition-colors w-fit uppercase text-[10px]">
                          #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">{addr.fullName}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{addr.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <p className="font-black text-slate-900 text-sm tracking-tight">₹{order.totalAmount.toLocaleString()}</p>
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{order.paymentMethod}</p>
                      </td>
                      <td className="px-6 py-3">
                        <span className={cn(
                          'px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm',
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          order.status === 'cancelled' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                          'bg-brand-50 text-brand-600 border-brand-100'
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center space-x-1.5 text-slate-500 font-bold text-[10px] uppercase tracking-tight">
                          <Calendar className="h-3 w-3 opacity-50" />
                          <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); api.openInvoiceHtml(order.id); }}
                            className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-brand-600 hover:border-brand-100 rounded-xl transition-all shadow-sm flex items-center gap-2"
                            title="View Invoice"
                          >
                             <FileText className="h-4 w-4" />
                          </button>
                          <button onClick={() => navigate(`/admin/orders/${order.id}`)} className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-brand-600 hover:border-brand-100 rounded-xl transition-all shadow-sm">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (() => {
          const addr = formatAddress(selectedOrder.address);
          const allowedNext = STATUS_TRANSITIONS[selectedOrder.status] || [];
          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Order Details</h2>
                    <p className="text-sm text-gray-500 font-bold">
                      #{selectedOrder.orderNumber || selectedOrder.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-all"
                  >
                    <XCircle className="h-6 w-6 text-gray-400" />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8">
                  {statusError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold px-4 py-3 rounded-2xl flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {statusError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Customer & Shipping */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer Info</h3>
                        <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                          <p className="font-black text-gray-900">{addr.fullName}</p>
                          {addr.phone && (
                            <p className="text-sm text-gray-500 font-medium">📱 {addr.phone}</p>
                          )}
                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className={cn(
                              'px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border',
                              getPaymentStatusColor(selectedOrder.paymentStatus)
                            )}>
                              {selectedOrder.paymentStatus}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                              {selectedOrder.paymentMethod}
                            </span>
                          </div>
                          {selectedOrder.razorpayPaymentId && (
                            <p className="text-[10px] font-bold text-gray-400 mt-1">
                              RZP: {selectedOrder.razorpayPaymentId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Shipping Address</h3>
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-1" />
                          <p className="text-sm text-gray-600 font-bold leading-relaxed">
                            {addr.line1}
                            {addr.line2 && <><br />{addr.line2}</>}
                            <br />
                            {addr.city}, {addr.state}
                            <br />
                            {addr.pincode}
                          </p>
                        </div>
                      </div>

                      {/* Price breakdown */}
                      {(selectedOrder.subtotalAmount || selectedOrder.discountAmount || selectedOrder.walletAmount) && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Price Breakdown</h3>
                          <div className="bg-gray-50 p-4 rounded-2xl space-y-2 text-sm font-bold">
                            {selectedOrder.subtotalAmount > 0 && (
                              <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{selectedOrder.subtotalAmount}</span>
                              </div>
                            )}
                            {Number(selectedOrder.discountAmount) > 0 && (
                              <div className="flex justify-between text-emerald-600">
                                <span>Coupon ({selectedOrder.couponCode})</span>
                                <span>−₹{selectedOrder.discountAmount}</span>
                              </div>
                            )}
                            {Number(selectedOrder.walletAmount) > 0 && (
                              <div className="flex justify-between text-amber-600">
                                <span>Wallet</span>
                                <span>−₹{selectedOrder.walletAmount}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-gray-900 text-base pt-2 border-t border-gray-200">
                              <span className="font-black">Charged</span>
                              <span className="font-black">₹{selectedOrder.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Status Timeline */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Update Status</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {ALL_STATUSES.map((s) => {
                          const isCurrent = selectedOrder.status === s;
                          const isAllowed = allowedNext.includes(s);
                          return (
                            <button
                              key={s}
                              onClick={() => isAllowed && updateStatus(selectedOrder.id, s)}
                              disabled={!isAllowed && !isCurrent}
                              className={cn(
                                'flex items-center justify-between p-4 rounded-2xl font-bold transition-all border-2',
                                isCurrent
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                                  : isAllowed
                                    ? 'bg-white border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                                    : 'bg-gray-50 border-gray-50 text-gray-300 cursor-not-allowed'
                              )}
                            >
                              <span className="capitalize flex items-center gap-2">
                                {getStatusIcon(s)}
                                {s.replace(/_/g, ' ')}
                              </span>
                              {isCurrent && <CheckCircle2 className="h-5 w-5" />}
                              {isAllowed && !isCurrent && (
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Click to set</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Refund button */}
                      {selectedOrder.status === 'returned' && (
                        <button
                          type="button"
                          onClick={() => initiateRefund(selectedOrder)}
                          disabled={refundLoading}
                          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                          <CircleDollarSign className="h-5 w-5" />
                          {refundLoading ? 'Processing Refund...' : 'Initiate Razorpay Refund'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                              <img src={item.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="font-black text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500 font-bold">
                                Qty: {item.quantity}
                                {item.size ? ` | Size: ${item.size}` : ''}
                                {item.color ? ` | Color: ${item.color}` : ''}
                              </p>
                            </div>
                          </div>
                          <p className="font-black text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Total Amount</p>
                    <p className="text-3xl font-black text-blue-600">₹{selectedOrder.totalAmount}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};
