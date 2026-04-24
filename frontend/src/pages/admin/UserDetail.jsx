import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  ChevronLeft, User, MapPin, ShoppingBag, 
  CreditCard, Calendar, Phone, Mail, 
  ShieldCheck, Clock, ExternalLink, Package
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export const UserDetail = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, ordersData] = await Promise.all([
          api.getUser(uid),
          api.getOrders({ userId: uid, limit: 100 })
        ]);
        setUser(userData);
        setOrders(ordersData.data || []);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading User Data</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">User session not found</h2>
          <button onClick={() => navigate('/admin/users')} className="text-blue-600 font-bold hover:underline">Back to User Management</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/users')} className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm border border-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{user.displayName || 'Unnamed User'}</h1>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            UID: {user.uid.slice(-8)} <span className="text-slate-200">|</span> 
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-[1.5rem] p-6 border border-gray-200/60 shadow-sm space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  user.displayName?.charAt(0) || 'U'
                )}
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                  <p className="text-xs font-bold text-gray-900 truncate">{user.email}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Account Role</p>
                  <p className="text-xs font-bold text-gray-900 capitalize">{user.role}</p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Wallet Balance</p>
                  <p className="text-base font-black text-slate-900">₹{user.walletBalance || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-[1.5rem] p-6 border border-gray-200/60 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Saved Addresses</h2>
            </div>
            <div className="space-y-3">
              {user.addresses?.length > 0 ? (
                user.addresses.map((addr) => (
                  <div key={addr.id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/50">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5">{addr.name || 'Home'}</p>
                    <p className="text-xs font-bold text-gray-800 leading-tight">{addr.fullName || user.displayName}</p>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                      {addr.addressLine1}, {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1.5 flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> {addr.phoneNumber}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 font-medium italic">No addresses saved.</p>
              )}
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[1.5rem] border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Order History</h2>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{orders.length} TOTAL</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/20">
                    <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                    <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="p-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-all group">
                        <td className="p-6 font-bold text-gray-900">
                           #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="p-6 text-sm font-medium text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-6 font-black text-blue-600">
                          ₹{order.totalAmount}
                        </td>
                        <td className="p-6">
                           <span className={cn(
                             "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                             order.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                             order.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                             "bg-slate-50 text-slate-600 border-slate-100"
                           )}>
                             {order.status.replace('_', ' ')}
                           </span>
                        </td>
                        <td className="p-6 text-right">
                          <Link to={`/admin/orders/${order.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all inline-block">
                            <ExternalLink className="h-5 w-5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-400 font-medium italic">
                        No orders recorded for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-100">
              <Package className="h-8 w-8 mb-4 opacity-50" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Lifetime Spending</p>
              <h3 className="text-3xl font-black mt-1">₹{orders.reduce((acc, o) => acc + Number(o.totalAmount), 0).toFixed(2)}</h3>
            </div>
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200">
              <Clock className="h-8 w-8 mb-4 opacity-50" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Pending Payments</p>
              <h3 className="text-3xl font-black mt-1">₹{orders.filter(o => o.paymentStatus !== 'paid').reduce((acc, o) => acc + Number(o.totalAmount), 0).toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
