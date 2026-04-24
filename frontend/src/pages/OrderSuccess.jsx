import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Calendar, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const orderId = location.state?.orderId;

  // Clear cart on mount if we came from checkout
  React.useEffect(() => {
    if (orderId) {
      clearCart();
    } else {
      // If no orderId in state, redirect home
      // navigate('/');
    }
  }, [orderId, clearCart, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 p-8 md:p-12 text-center border border-slate-100"
      >
        {/* Brand Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Success Icon Animation */}
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-0 left-1/2 -ml-12 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl"
          />
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Order Placed!</h1>
        <p className="text-slate-500 font-medium mb-8">
          Thank you for shopping with OneStep Hub. Your style journey begins now.
        </p>

        {/* Order Info Card */}
        <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Package className="w-3 h-3" />
              Order ID
            </div>
            <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
              #{orderId || 'OSH-XXXX-XXXX'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Calendar className="w-3 h-3" />
              Date
            </div>
            <span className="text-xs font-bold text-slate-900">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <CreditCard className="w-3 h-3" />
              Payment
            </div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Paid Successfully
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            to="/orders" 
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4" />
            Track Your Order
          </Link>
          
          <Link 
            to="/" 
            className="w-full bg-white text-slate-600 border border-slate-200 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          A confirmation email has been sent to your inbox
        </p>
      </motion.div>
    </div>
  );
};
