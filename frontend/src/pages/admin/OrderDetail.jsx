import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  ChevronLeft, Package, Truck, CheckCircle2, 
  MapPin, User, CreditCard, Calendar, ShoppingBag,
  Clock, ShieldCheck, Phone, Mail, AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

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
    case 'out_for_delivery':  return <ShieldCheck className="h-4 w-4" />;
    case 'delivered':         return <CheckCircle2 className="h-4 w-4" />;
    case 'cancelled':         return <ShieldCheck className="h-4 w-4 text-red-500" />;
    default:                  return <Clock className="h-4 w-4" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':           return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'confirmed':         return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'packed':            return 'bg-yellow-50 text-yellow-600 border-yellow-100';
    case 'shipped':           return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'out_for_delivery':  return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    case 'delivered':         return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'cancelled':         return 'bg-rose-50 text-rose-600 border-rose-100';
    default:                  return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

export const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await api.getOrder(id);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await api.updateOrderStatus(order.id, status);
      await fetchOrder();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const initiateRefund = async () => {
    if (!window.confirm('Are you sure you want to initiate a refund? This process is irreversible.')) return;
    setUpdating(true);
    try {
      await api.initiateRefund(order.id, 'Admin manual refund');
      await fetchOrder();
    } catch (error) {
      console.error('Error initiating refund:', error);
      alert('Refund failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Order Details</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Order not found</h2>
          <button onClick={() => navigate('/admin/orders')} className="text-blue-600 font-bold hover:underline">Back to Orders</button>
        </div>
      </div>
    );
  }

  const addr = order.address || {};
  const fullName = addr.fullName || addr.name || 'N/A';
  const fullAddress = `${addr.line1 || ''}, ${addr.line2 ? addr.line2 + ', ' : ''}${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`;

  return (
    <div className="pb-10 relative">
      {updating && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Updating Status...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">#{order.orderNumber || order.id?.slice(-8).toUpperCase()}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn(
                "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                order.paymentStatus === 'paid' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
              )}>
                {order.paymentStatus.replace('_', ' ')}
              </span>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </p>
            </div>
          </div>
        </div>

        {/* Status Update Quick Menu */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => api.openInvoiceHtml(order.id)}
            className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            Invoice
          </button>
          
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border",
            getStatusColor(order.status)
          )}>
            {getStatusIcon(order.status)}
            <span className="text-[9px] font-black uppercase tracking-widest">{order.status.replace(/_/g, ' ')}</span>
          </div>
          
          <div className="relative group/status">
            <button className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
              Update <ChevronLeft className="h-3 w-3 -rotate-90" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-10 opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all">
              {(STATUS_TRANSITIONS[order.status] || []).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateStatus(s)}
                  className="w-full text-left px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all capitalize"
                >
                  Mark as {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-gray-400" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Order Items</h2>
              </div>
              <span className="text-[10px] font-bold text-gray-400">{order.items?.length || 0} ITEMS</span>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-4 flex gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow space-y-0.5">
                    <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {item.color} <span className="mx-1.5">|</span> {item.size}
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-500">₹{item.price} × {item.quantity}</p>
                      <p className="text-sm font-black text-blue-600">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50/50 space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Subtotal</span>
                <span>₹{(order.totalAmount + (order.couponDiscount || 0) - (order.shippingCharge || 0)).toFixed(2)}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-xs font-bold text-emerald-600">
                  <span>Discount</span>
                  <span>- ₹{order.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Shipping</span>
                <span>{order.shippingCharge > 0 ? `₹${order.shippingCharge}` : 'FREE'}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Total</span>
                <span className="text-xl font-black text-blue-600">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Payment Details */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Customer</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Name</p>
                <p className="text-sm font-bold text-gray-900">{fullName}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs font-bold text-gray-600">{addr.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Shipping Address</h3>
              </div>
              <p className="text-xs font-medium text-gray-600 leading-relaxed italic">
                {fullAddress}
              </p>
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Payment</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Method</span>
                <span className="text-xs font-black text-gray-700 uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</span>
                <span className={cn(
                  "text-xs font-black uppercase tracking-widest",
                  order.paymentStatus === 'paid' ? "text-emerald-600" : "text-amber-600"
                )}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl overflow-hidden">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">P-ID</span>
                  <span className="text-[10px] font-bold text-gray-900 truncate max-w-[120px]">{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
