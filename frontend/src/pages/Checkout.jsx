import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  MapPin,
  Zap,
  ChevronRight,
  Info,
  Smartphone,
  ShoppingBag,
  Tag,
  Plus,
  X,
  Check,
  Loader2,
  Home,
  Briefcase,
  MoreHorizontal,
  Package,
  PartyPopper,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { resolveImageUrl } from '../lib/imageUrl';

/* ─── Razorpay loader ──────────────────────────────────────────── */
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Razorpay SDK failed to load'));
    document.body.appendChild(s);
  });
}

/* ─── Inline "Add Address" form component ──────────────────────── */
const InlineAddressForm = ({ onSaved, onCancel }) => {
  const [form, setForm] = useState({
    name: 'Home',
    fullName: '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    isDefault: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.addressLine1 || !form.city || !form.state || !form.zipCode || !form.phoneNumber) {
      setError('Please fill all required fields');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = await api.addAddress(form);
      onSaved(saved);
    } catch (err) {
      const msg =
        err?.response?.data?.details?.join(', ') ||
        err?.response?.data?.error ||
        'Failed to save address';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const typeIcons = { Home: Home, Office: Briefcase, Other: MoreHorizontal };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSave}
      className="bg-white rounded-[2rem] border-2 border-amber-200 p-6 space-y-5 shadow-lg shadow-amber-50"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Address
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold px-4 py-2 rounded-xl">
          {error}
        </div>
      )}

      {/* Address type selector */}
      <div className="flex gap-2">
        {['Home', 'Office', 'Other'].map((type) => {
          const Icon = typeIcons[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => set('name', type)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                form.name === type
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-gray-200'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {type}
            </button>
          );
        })}
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <input
          placeholder="Full Name *"
          value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-400 outline-none placeholder:text-gray-300"
          required
        />
        <input
          placeholder="Full Address (House No, Street, Area) *"
          value={form.addressLine1}
          onChange={(e) => set('addressLine1', e.target.value)}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-400 outline-none placeholder:text-gray-300"
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="City *"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-400 outline-none placeholder:text-gray-300"
            required
          />
          <input
            placeholder="State *"
            value={form.state}
            onChange={(e) => set('state', e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-400 outline-none placeholder:text-gray-300"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="PIN Code *"
            value={form.zipCode}
            onChange={(e) => set('zipCode', e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-400 outline-none placeholder:text-gray-300"
            required
          />
          <input
            placeholder="Phone Number *"
            value={form.phoneNumber}
            onChange={(e) => set('phoneNumber', e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-400 outline-none placeholder:text-gray-300"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-amber-400 text-amber-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-100 hover:bg-amber-500 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Check className="h-4 w-4" /> Save & Use This Address
          </>
        )}
      </button>
    </motion.form>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CHECKOUT PAGE
   ═══════════════════════════════════════════════════════════════════ */
export const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  /* ── State ──────────────────────────────────────────────────── */
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=done
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null);
  const [walletUse, setWalletUse] = useState(0);
  const [gstNote, setGstNote] = useState('Prices inclusive of GST where applicable');
  const [error, setError] = useState('');
  const [processingMessage, setProcessingMessage] = useState('Processing order...');

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  /* ── Computed ────────────────────────────────────────────────── */
  const subtotal = totalPrice;
  const afterCoupon = Math.max(0, subtotal - couponDiscount);
  const walletMax = Math.min(Number(profile?.walletBalance || 0), afterCoupon);
  const effectiveWallet = Math.min(walletUse, walletMax);
  const payable = Math.max(0, afterCoupon - effectiveWallet);

  /* ── Fetch addresses from API ───────────────────────────────── */
  const fetchAddresses = useCallback(async () => {
    setAddressesLoading(true);
    try {
      const data = await api.getAddresses();
      setAddresses(data);
      // Auto-select default or first
      if (data.length > 0 && !selectedAddress) {
        const def = data.find((a) => a.isDefault) || data[0];
        setSelectedAddress(def);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    api
      .getSettingsPublic()
      .then((s) => {
        if (s?.gstDisplayText) setGstNote(s.gstDisplayText);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setWalletUse((w) => Math.min(w, walletMax));
  }, [walletMax]);

  // Pre-load Razorpay script
  useEffect(() => {
    loadRazorpayScript().catch(err => console.error('Razorpay load error:', err));
  }, []);


  /* ── Coupon ─────────────────────────────────────────────────── */
  const applyCoupon = async () => {
    setError('');
    if (!couponInput.trim()) return;
    try {
      const r = await api.validateCoupon(couponInput, subtotal);
      setCouponDiscount(r.discount);
      setCouponApplied(r.code);
    } catch (e) {
      setCouponDiscount(0);
      setCouponApplied(null);
      setError(e.response?.data?.error || 'Invalid coupon');
    }
  };

  /* ── Handle new address saved inline ────────────────────────── */
  const handleAddressSaved = (newAddr) => {
    setAddresses((prev) => [newAddr, ...prev]);
    setSelectedAddress(newAddr);
    setShowAddForm(false);
    // Also refresh profile addresses
    api.getMe().then((me) => updateProfile(me)).catch(() => {});
  };

  /* ── Place order ────────────────────────────────────────────── */
  const handlePlaceOrder = async () => {
    if (!user) {
      setError('Please sign in to place an order.');
      return;
    }
    if (!profile) {
      setError('User profile not synced. Please refresh or try again.');
      // Attempt a quick re-sync
      api.getMe().then(me => updateProfile(me)).catch(() => {});
      return;
    }
    if (!items || items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!selectedAddress) {
      setError('Please select or add a shipping address.');
      setStep(1);
      return;
    }

    setLoading(true);
    setError('');
    setProcessingMessage('Creating order...');
    console.log('Initiating checkout with payload:', { itemsCount: items.length, paymentMethod });

    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          name: item.product?.name || 'Product',
          price: (item.product?.discountPrice || item.product?.price || 0),
          quantity: item.quantity,
          image: item.product?.images?.[0],
          size: item.size,
          color: item.color,
        })),
        address: selectedAddress,
        paymentMethod: ['upi', 'card', 'razorpay', 'cod'].includes(paymentMethod)
          ? paymentMethod
          : 'cod',
        couponCode: couponApplied || undefined,
        walletAmount: effectiveWallet,
      };

      const result = await api.checkout(payload);
      console.log('Checkout API result:', result);

      if (result.razorpay && result.razorpay.keyId) {
        setProcessingMessage('Opening payment gateway...');
        await loadRazorpayScript();
        
        if (!window.Razorpay) {
          throw new Error('Payment gateway (Razorpay) failed to load. Please check your internet or try COD.');
        }

        const order = result.order;
        const rz = result.razorpay;

        if (rz.isMock) {
          console.log('Mock payment mode enabled. Simulating...');
          const methodLabel = paymentMethod === 'upi' ? 'UPI' : 'Card';
          setProcessingMessage(`Processing ${methodLabel} payment...`);
          await new Promise((resolve) => setTimeout(resolve, 1200));
          setProcessingMessage(`Verifying ${methodLabel} transaction...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          try {
            await api.verifyPayment({
              orderId: order.id,
              razorpay_order_id: rz.orderId,
              razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).slice(2, 10),
              razorpay_signature: 'mock_signature',
            });
            console.log('Mock payment verified successfully');
            setOrderId(order.id);
            setOrderNumber(order.orderNumber || '');
            setStep(3);
            clearCart();
            try {
              const me = await api.getMe();
              updateProfile(me);
            } catch { /* */ }
          } catch (err) {
            console.error('Mock verification failed:', err);
            setError('Payment simulation failed. Please try again.');
          } finally {
            setLoading(false);
          }
          return;
        }


        const options = {
          key: rz.keyId,
          amount: rz.amount,
          currency: rz.currency,
          name: rz.name,
          description: rz.description,
          order_id: rz.orderId,
          prefill: rz.prefill || {},
          theme: { color: '#fbbf24' }, // OneStep Hub Amber
          // Enable UPI and Card based on user's selection
          ...(paymentMethod === 'upi' ? {
            config: {
              display: {
                blocks: {
                  upi: {
                    name: 'Pay using UPI',
                    instruments: [
                      { method: 'upi', flows: ['collect', 'qr', 'intent'] },
                    ],
                  },
                  other: {
                    name: 'Other Payment Methods',
                    instruments: [
                      { method: 'card' },
                      { method: 'netbanking' },
                      { method: 'wallet' },
                    ],
                  },
                },
                sequence: ['block.upi', 'block.other'],
                preferences: { show_default_blocks: false },
              },
            },
          } : paymentMethod === 'card' ? {
            config: {
              display: {
                blocks: {
                  card: {
                    name: 'Pay using Card / Netbanking',
                    instruments: [
                      { method: 'card' },
                      { method: 'netbanking' },
                    ],
                  },
                  other: {
                    name: 'Other Payment Methods',
                    instruments: [
                      { method: 'upi' },
                      { method: 'wallet' },
                    ],
                  },
                },
                sequence: ['block.card', 'block.other'],
                preferences: { show_default_blocks: false },
              },
            },
          } : {
            // Default: show all methods
            config: {
              display: {
                preferences: { show_default_blocks: true },
              },
            },
          }),
          handler: async (response) => {
            try {
              await api.verifyPayment({
                orderId: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              setOrderId(order.id);
              setOrderNumber(order.orderNumber || '');
              setStep(3);
              clearCart();
              try {
                const me = await api.getMe();
                updateProfile(me);
              } catch {
                /* */
              }
            } catch (err) {
              console.error('Verification error:', err);
              setError('Payment verification failed. Please contact support.');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: async () => {
              try {
                await api.cancelCheckout(order.id);
              } catch {
                /* */
              }
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (err) => {
          setError(`Payment Failed: ${err.error.description}`);
          setLoading(false);
        });
        rzp.open();
        return;
      }

      // COD or Wallet-only success
      setOrderId(result.order.id);
      setOrderNumber(result.order.orderNumber || '');
      setStep(3);
      clearCart();
      try {
        const me = await api.getMe();
        updateProfile(me);
      } catch {
        /* */
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.details?.[0] ||
        'Checkout failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════════════════
     STEP 3 — ORDER CONFIRMED
     ══════════════════════════════════════════════════════════════ */
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-emerald-100 border border-emerald-100/50 p-8 sm:p-12 text-center space-y-8"
        >
          {/* Animated success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, duration: 0.6 }}
            className="relative mx-auto"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
              <CheckCircle2 className="h-14 w-14 text-white" />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-md"
            >
              <PartyPopper className="h-5 w-5 text-amber-900" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              Order Placed!
            </h2>
            <p className="text-sm font-bold text-gray-400">
              Your order has been confirmed and is being processed.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 p-6 rounded-2xl text-left space-y-4 border border-gray-100"
          >
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-gray-400">Order Number</span>
              <span className="text-gray-900 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg">
                {orderNumber || `#${String(orderId).slice(-8).toUpperCase()}`}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-gray-400">Payment</span>
              <span className="text-gray-900">
                {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? 'UPI (Razorpay)' : 'Card / Netbanking (Razorpay)'}
              </span>
            </div>
            {selectedAddress && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Delivering To
                </p>
                <p className="text-xs font-bold text-gray-700">
                  {selectedAddress.addressLine1}, {selectedAddress.city}
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4 pt-4"
          >
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-amber-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Package className="h-4 w-4" /> Track Your Order
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-amber-500 transition-colors"
            >
              Continue Shopping
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     MAIN CHECKOUT
     ══════════════════════════════════════════════════════════════ */
  return (
    <div className="bg-gray-100 min-h-screen pb-32">
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate('/cart'))}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src="/images/logo.png" alt="OneStep Hub" className="h-6 w-auto" />
          <h1 className="text-base font-black text-gray-900">Checkout</h1>
        </div>


        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          {[
            { n: 1, label: 'Address' },
            { n: 2, label: 'Pay' },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all',
                  step >= n
                    ? 'bg-amber-400 text-amber-900 shadow-sm'
                    : 'bg-gray-100 text-gray-300'
                )}
              >
                {step > n ? <Check className="h-3.5 w-3.5" /> : n}
              </div>
              {n < 2 && (
                <div
                  className={cn(
                    'w-6 h-0.5 rounded-full transition-all',
                    step > n ? 'bg-amber-400' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Loading Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-amber-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-200 animate-bounce">
                <Loader2 className="h-8 w-8 text-amber-900 animate-spin" />
              </div>
              <p className="text-sm font-black text-gray-900 uppercase tracking-widest animate-pulse">
                {processingMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error Banner ────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto px-4 pt-4"
          >
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-4 py-3 rounded-2xl flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="p-1 rounded-lg hover:bg-rose-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ═══ STEP 1 — ADDRESS ═══════════════════════════════════ */}
          <div
            className={cn(
              'bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6 transition-all duration-300',
              step !== 1 && 'opacity-50 pointer-events-none'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all',
                    step >= 1
                      ? 'bg-amber-400 text-amber-900'
                      : 'bg-gray-100 text-gray-300'
                  )}
                >
                  {step > 1 ? <Check className="h-5 w-5" /> : '1'}
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    Delivery Address
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Where should we deliver?
                  </p>
                </div>
              </div>
              {step > 1 && selectedAddress && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700"
                >
                  Change
                </button>
              )}
            </div>

            {addressesLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-gray-200" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {addresses.length > 0 ? (
                  <motion.div
                    key="address-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    {addresses.map((addr) => (
                      <motion.button
                        layout
                        type="button"
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr)}
                        className={cn(
                          'w-full p-5 rounded-2xl border-2 text-left transition-all relative group',
                          selectedAddress?.id === addr.id
                            ? 'border-amber-400 bg-amber-50/40 shadow-md shadow-amber-50'
                            : 'border-gray-50 hover:border-amber-100 hover:bg-gray-50/50'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                              selectedAddress?.id === addr.id
                                ? 'bg-amber-400 text-amber-900'
                                : 'bg-gray-50 text-gray-300'
                            )}
                          >
                            {addr.name === 'Home' ? (
                              <Home className="h-5 w-5" />
                            ) : addr.name === 'Office' ? (
                              <Briefcase className="h-5 w-5" />
                            ) : (
                              <MapPin className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                                {addr.name}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-bold text-gray-500 leading-relaxed">
                              {addr.addressLine1}
                            </p>
                            <p className="text-[10px] font-medium text-gray-400">
                              {addr.city}, {addr.state} — {addr.zipCode}
                            </p>
                            {addr.phoneNumber && (
                              <p className="text-[10px] font-bold text-gray-400">
                                📱 {addr.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        {selectedAddress?.id === addr.id && (
                          <motion.div
                            layoutId="address-check"
                            className="absolute top-4 right-4 bg-amber-400 rounded-lg p-1 text-amber-900"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}

                    {/* Add new address inline */}
                    <AnimatePresence>
                      {showAddForm ? (
                        <InlineAddressForm
                          onSaved={handleAddressSaved}
                          onCancel={() => setShowAddForm(false)}
                        />
                      ) : (
                        <motion.button
                          type="button"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => setShowAddForm(true)}
                          className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-amber-200 hover:text-amber-500 hover:bg-amber-50/30 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add New Address
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-addresses"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-center py-8 bg-gray-50 rounded-[1.5rem] border-2 border-dashed border-gray-200">
                      <MapPin className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-xs font-bold text-gray-400 mb-4">
                        No addresses saved yet. Add one to continue.
                      </p>
                    </div>
                    <InlineAddressForm
                      onSaved={handleAddressSaved}
                      onCancel={() => {}}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Continue button */}
            {step === 1 && (
              <button
                type="button"
                disabled={!selectedAddress}
                onClick={() => {
                  setError('');
                  setStep(2);
                }}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 disabled:opacity-20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Continue to Payment <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* ═══ STEP 2 — PAYMENT ═══════════════════════════════════ */}
          <div
            className={cn(
              'bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6 transition-all duration-300',
              step !== 2 && 'opacity-50 pointer-events-none'
            )}
          >
            <div className="flex items-center space-x-4">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all',
                  step >= 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-300'
                )}
              >
                {step > 2 ? <Check className="h-5 w-5" /> : '2'}
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  Payment Method
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  How would you like to pay?
                </p>
              </div>
            </div>

            {/* Payment method selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'upi',
                  label: 'UPI',
                  sublabel: 'GPay, PhonePe, Paytm',
                  icon: Smartphone,
                  activeColor: 'border-blue-600 bg-blue-50/40 shadow-lg shadow-blue-50',
                  iconActive: 'bg-blue-600 text-white shadow-md shadow-blue-200',
                },
                {
                  id: 'card',
                  label: 'Card / Netbanking',
                  sublabel: 'Visa, Mastercard, RuPay',
                  icon: CreditCard,
                  activeColor: 'border-indigo-600 bg-indigo-50/40 shadow-lg shadow-indigo-50',
                  iconActive: 'bg-indigo-600 text-white shadow-md shadow-indigo-200',
                },
                {
                  id: 'cod',
                  label: 'Cash on Delivery',
                  sublabel: 'Pay when delivered',
                  icon: Truck,
                  activeColor: 'border-emerald-600 bg-emerald-50/40 shadow-lg shadow-emerald-50',
                  iconActive: 'bg-emerald-600 text-white shadow-md shadow-emerald-200',
                },
              ].map((method) => (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    'relative flex flex-col items-center p-5 rounded-2xl border-2 transition-all group',
                    paymentMethod === method.id
                      ? method.activeColor
                      : 'border-gray-50 hover:border-gray-200'
                  )}
                >
                  {paymentMethod === method.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Check className="h-3 w-3 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110',
                      paymentMethod === method.id
                        ? method.iconActive
                        : 'bg-gray-50 text-gray-300'
                    )}
                  >
                    <method.icon className="h-6 w-6" />
                  </div>
                  <span
                    className={cn(
                      'text-[9px] font-black uppercase tracking-widest text-center',
                      paymentMethod === method.id
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    )}
                  >
                    {method.label}
                  </span>
                  <span className="text-[8px] font-bold text-gray-300 mt-0.5">
                    {method.sublabel}
                  </span>
                </button>
              ))}
            </div>

            {/* Payment method detail panel */}
            <AnimatePresence mode="wait">
              {paymentMethod === 'upi' && (
                <motion.div
                  key="upi-detail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 bg-gradient-to-br from-blue-50 to-blue-50/30 rounded-2xl border border-blue-100 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900">Pay instantly via UPI</p>
                      <p className="text-[10px] font-medium text-gray-500">Google Pay • PhonePe • Paytm • BHIM • Any UPI App</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-blue-700 bg-blue-100/50 rounded-xl px-3 py-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Secure UPI payment powered by Razorpay. You'll be redirected to complete payment.</span>
                  </div>
                </motion.div>
              )}
              {paymentMethod === 'card' && (
                <motion.div
                  key="card-detail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-50/30 rounded-2xl border border-indigo-100 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900">Credit / Debit Card & Netbanking</p>
                      <p className="text-[10px] font-medium text-gray-500">Visa • Mastercard • RuPay • American Express • All Banks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-indigo-700 bg-indigo-100/50 rounded-xl px-3 py-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>256-bit SSL encrypted. Card details are securely handled by Razorpay — never stored on our servers.</span>
                  </div>
                </motion.div>
              )}
              {paymentMethod === 'cod' && (
                <motion.div
                  key="cod-detail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-50/30 rounded-2xl border border-emerald-100 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <Truck className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900">Cash on Delivery</p>
                      <p className="text-[10px] font-medium text-gray-500">Pay in cash or UPI when your order arrives</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-700 bg-emerald-100/50 rounded-xl px-3 py-2">
                    <Info className="h-3.5 w-3.5" />
                    <span>No advance payment required. Please keep exact change ready at the time of delivery.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {step === 2 && (
              <div className="space-y-5">
                {/* Coupon Code */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Tag className="h-4 w-4" />
                    Have a Coupon?
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold uppercase focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs font-bold text-emerald-600 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Applied{' '}
                      <strong>{couponApplied}</strong> — ₹{couponDiscount} off!
                    </motion.p>
                  )}
                </div>

                {/* Wallet */}
                {walletMax > 0 && (
                  <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-100 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                      💰 Use Wallet (₹
                      {Number(profile.walletBalance).toFixed(2)} available)
                    </p>
                    <input
                      type="number"
                      min={0}
                      max={walletMax}
                      value={effectiveWallet}
                      onChange={(e) =>
                        setWalletUse(
                          Math.min(
                            walletMax,
                            Math.max(0, Number(e.target.value) || 0)
                          )
                        )
                      }
                      className="w-full rounded-xl border border-amber-200 px-4 py-2 text-sm font-black focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>
                )}

                {/* GST note */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50 flex items-start space-x-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-emerald-700 leading-relaxed">
                    {gstNote}
                  </p>
                </div>

                {/* Selected address summary */}
                {selectedAddress && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                        Delivering to {selectedAddress.name}
                      </p>
                      <p className="text-xs font-bold text-gray-700 truncate">
                        {selectedAddress.addressLine1}, {selectedAddress.city} —{' '}
                        {selectedAddress.zipCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[9px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Place Order Button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePlaceOrder}
                  className={cn(
                    'w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all text-sm flex items-center justify-center space-x-3',
                    paymentMethod === 'cod'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-100'
                      : paymentMethod === 'upi'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-100'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-100'
                  )}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {paymentMethod === 'upi' ? (
                        <Smartphone className="h-5 w-5" />
                      ) : paymentMethod === 'card' ? (
                        <CreditCard className="h-5 w-5" />
                      ) : (
                        <Zap className="h-5 w-5 fill-white" />
                      )}
                      <span>
                        {paymentMethod === 'cod'
                          ? `Place Order — ₹${payable.toFixed(0)} COD`
                          : paymentMethod === 'upi'
                          ? `Pay ₹${payable.toFixed(0)} via UPI`
                          : `Pay ₹${payable.toFixed(0)} via Card`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN — Order Summary ─────────────────────── */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                Order Summary
              </h3>
              <ShoppingBag className="h-4 w-4 text-gray-300" />
            </div>

            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                    <img
                      src={
                        resolveImageUrl(item.product.images[0]) ||
                        item.product.images[0]
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow space-y-0.5 min-w-0">
                    <p className="text-[11px] font-black text-gray-800 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      Qty: {item.quantity}
                      {item.size ? ` | ${item.size}` : ''}
                    </p>
                    <p className="text-xs font-black text-blue-600">
                      ₹
                      {(
                        (item.product.discountPrice || item.product.price) *
                        item.quantity
                      ).toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-5 border-t border-gray-50 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Subtotal</span>
                <span className="text-gray-900">₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Delivery</span>
                <span className="text-emerald-500">FREE</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  <span>Coupon</span>
                  <span>−₹{couponDiscount.toFixed(0)}</span>
                </div>
              )}
              {effectiveWallet > 0 && (
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-amber-600">
                  <span>Wallet</span>
                  <span>−₹{effectiveWallet.toFixed(0)}</span>
                </div>
              )}
              <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Total
                  </span>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest italic">
                    {gstNote}
                  </p>
                </div>
                <span className="text-2xl font-black text-gray-900 tracking-tighter">
                  ₹{payable.toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Secure payments footer */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100/50 flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm shadow-blue-200 flex-shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <p className="text-[9px] font-black text-blue-700 uppercase leading-relaxed">
              Secure checkout powered by Razorpay. UPI, Cards, Netbanking &
              COD available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
