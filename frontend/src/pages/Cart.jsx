import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ChevronLeft, 
  ShieldCheck, 
  Info,
  CreditCard,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { resolveImageUrl } from '../lib/imageUrl';

export const Cart = () => {
    const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center space-y-6">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-gray-200">
                    <ShoppingBag className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900">Your cart is empty</h2>
                    <p className="text-sm text-gray-400 font-medium">Add some premium products to get started!</p>
                </div>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-amber-400 text-amber-900 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-amber-200"
                >
                  Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-base font-black text-gray-900">Cart Summary</h1>
                </div>
                <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-200">
                  {totalItems} Items
                </span>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-4">
                {/* User Info Card (Reference UI style) */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between group">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 overflow-hidden border border-amber-100">
                           {profile?.photoURL ? (
                             <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <User className="h-5 w-5" />
                           )}
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-black text-gray-900">{profile?.displayName || 'Guest User'}</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[150px]">{profile?.email || 'Login to checkout'}</p>
                        </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-gray-300 rotate-180" />
                </div>

                {/* Cart Items */}
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                            <motion.div
                                key={`${item.productId}-${item.size}-${item.color}`}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4"
                            >
                                <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-50 flex-shrink-0">
                                    <img 
                                      src={resolveImageUrl(item.product.images[0]) || item.product.images[0]} 
                                      alt="" 
                                      className="w-full h-full object-cover" 
                                      referrerPolicy="no-referrer"
                                    />
                                </div>
                                <div className="flex-grow space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight flex-1 mr-2">{item.product.name}</h4>
                                        <button 
                                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                                          className="p-1 text-gray-300 hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {item.size && <span className="text-[9px] font-black bg-gray-50 text-gray-500 px-2 py-0.5 rounded-lg border border-gray-100 uppercase tracking-widest">S: {item.size}</span>}
                                      {item.color && <span className="text-[9px] font-black bg-gray-50 text-gray-500 px-2 py-0.5 rounded-lg border border-gray-100 uppercase tracking-widest">C: {item.color}</span>}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-baseline space-x-2">
                                            <span className="text-base font-black text-gray-900">₹{item.product.discountPrice || item.product.price}</span>
                                            {item.product.discountPrice && (
                                                <span className="text-[10px] text-gray-300 line-through font-bold">₹{item.product.price}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                                            <button 
                                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                                              className="p-1 hover:bg-white rounded-md text-gray-400 disabled:opacity-30"
                                              disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center text-xs font-black text-gray-900">{item.quantity}</span>
                                            <button 
                                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                                              className="p-1 hover:bg-white rounded-md text-gray-400"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Summary Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Pricing Summary</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm font-medium text-gray-500">
                            <span>Subtotal</span>
                            <span className="font-black text-gray-900">₹{totalPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-gray-500">
                            <span>Delivery Fees</span>
                            <span className="text-emerald-500 font-black">FREE</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-gray-500">
                            <span>Platform Fee</span>
                            <span className="text-amber-500 font-black">₹0</span>
                        </div>
                        <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                            <div className="space-y-0.5">
                                <p className="text-lg font-black text-gray-900">Total Amount</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">All Taxes Included</p>
                            </div>
                            <span className="text-3xl font-black text-amber-500 tracking-tighter">₹{totalPrice}</span>
                        </div>
                    </div>

                    {/* Payment Indicators */}
                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                       <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center p-1.5 grayscale opacity-50">
                             <CreditCard className="text-indigo-600" />
                          </div>
                          <div className="w-12 h-8 rounded-lg bg-pink-50 flex items-center justify-center p-1 uppercase text-[8px] font-black text-pink-600 grayscale opacity-50">
                             UPI
                          </div>
                          <p className="text-[8px] font-black text-gray-400 uppercase leading-none">Safe & Secure<br/>Payments</p>
                       </div>
                       <ShieldCheck className="h-6 w-6 text-emerald-500" />
                    </div>
                </div>

                {/* Info Note */}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start space-x-3">
                   <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                   <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                     Items in your cart are subject to availability. Place your order now to reserve your stock.
                   </p>
                </div>
            </div>

            {/* Sticky Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:static sm:bg-transparent sm:border-none sm:shadow-none">
                <div className="max-w-3xl mx-auto space-y-2">
                    <button
                        onClick={() => {
                            if (user) {
                                navigate('/checkout');
                            } else {
                                navigate('/login', { state: { from: '/cart' } });
                            }
                        }}
                        className="w-full bg-amber-400 hover:bg-amber-500 text-amber-900 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-amber-200 transition-all active:scale-95"
                    >
                        {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                    </button>
                    {!user && (
                        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Sign in to place your order & choose payment
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
