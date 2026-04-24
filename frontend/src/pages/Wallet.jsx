import React, { useState, useCallback } from 'react';
import { ChevronLeft, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, Plus, CreditCard, Loader2, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

/* ── Razorpay loader ─────────────────────────────────────────── */
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

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];

export const Wallet = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const balance = Number(profile?.walletBalance ?? 0);

  const handleAddMoney = useCallback(async () => {
    const num = Number(amount);
    if (!num || num < 1 || num > 50000) {
      setError('Enter an amount between ₹1 and ₹50,000');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.addMoneyToWallet(num);

      if (!result.razorpay) {
        setError('Payment gateway not available. Please try later.');
        setLoading(false);
        return;
      }

      await loadRazorpayScript();
      if (!window.Razorpay) {
        setError('Payment gateway failed to load. Please refresh.');
        setLoading(false);
        return;
      }

      const rz = result.razorpay;
      const options = {
        key: rz.keyId,
        amount: rz.amount,
        currency: rz.currency,
        name: rz.name,
        description: rz.description,
        order_id: rz.orderId,
        prefill: rz.prefill || {},
        theme: { color: '#f59e0b' },
        handler: async (response) => {
          try {
            const verifyResult = await api.verifyWalletTopup({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: num,
            });

            setSuccess(`₹${num} added successfully! New balance: ₹${verifyResult.walletBalance?.toFixed(2)}`);
            setAmount('');
            setShowAddMoney(false);

            // Refresh profile to update balance
            try {
              const me = await api.getMe();
              updateProfile(me);
            } catch { /* silent */ }
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
            console.error('Wallet verify error:', err);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (err) => {
        setError(`Payment failed: ${err.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to initiate payment';
      setError(msg);
      setLoading(false);
    }
  }, [amount, updateProfile]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-amber-400 pt-8 pb-32 px-6 rounded-b-[4rem] relative overflow-hidden shadow-xl shadow-amber-100">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-amber-300 rounded-full opacity-50 blur-3xl" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-amber-900 hover:bg-amber-300/50 rounded-full transition-all">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-black text-amber-900 uppercase tracking-tight">OneStep Wallet</h1>
            </div>
            <button className="p-2.5 bg-white/20 rounded-2xl text-amber-900">
              <History className="h-5 w-5" />
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-[0.3em]">Available Balance</p>
            <h2 className="text-5xl font-black text-amber-900 tracking-tighter">
              ₹ {balance.toFixed(2)}
            </h2>
          </div>
        </div>
      </div>

      {/* Actions & Content */}
      <main className="px-6 -mt-16 max-w-2xl mx-auto space-y-8 relative z-20">
        {/* Success / Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold px-5 py-4 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {success}
              </div>
              <button onClick={() => setSuccess('')} className="p-1 rounded-lg hover:bg-emerald-100">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold px-5 py-4 rounded-2xl flex items-center justify-between"
            >
              <span>{error}</span>
              <button onClick={() => setError('')} className="p-1 rounded-lg hover:bg-rose-100">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-gray-200/50 border border-gray-50 flex items-center justify-between">
          <button
            onClick={() => { setShowAddMoney((v) => !v); setError(''); }}
            className="flex-1 flex flex-col items-center space-y-3 group"
          >
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-400 group-hover:text-amber-900 transition-all shadow-sm">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Money</span>
          </button>
          <div className="w-px h-12 bg-gray-100" />
          <button className="flex-1 flex flex-col items-center space-y-3 group opacity-40 cursor-not-allowed">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
              <CreditCard className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Withdraw</span>
          </button>
          <div className="w-px h-12 bg-gray-100" />
          <button className="flex-1 flex flex-col items-center space-y-3 group opacity-40 cursor-not-allowed">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transfer</span>
          </button>
        </div>

        {/* Add Money Panel */}
        <AnimatePresence>
          {showAddMoney && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="bg-white rounded-[2.5rem] p-6 shadow-lg shadow-gray-200/50 border border-gray-50 space-y-6 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Money to Wallet
                </h3>
                <button
                  onClick={() => setShowAddMoney(false)}
                  className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Quick amount pills */}
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { setAmount(String(a)); setError(''); }}
                    className={cn(
                      'px-5 py-2.5 rounded-xl text-xs font-black transition-all border-2',
                      String(a) === amount
                        ? 'bg-amber-400 border-amber-400 text-amber-900 shadow-md shadow-amber-100'
                        : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-amber-200'
                    )}
                  >
                    ₹{a.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-gray-300">₹</span>
                <input
                  type="number"
                  min={1}
                  max={50000}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-gray-100 text-lg font-black text-gray-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none placeholder:text-gray-200"
                />
              </div>

              {/* Pay button */}
              <button
                type="button"
                disabled={loading || !amount}
                onClick={handleAddMoney}
                className="w-full bg-amber-400 text-amber-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-100 hover:bg-amber-500 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    {amount ? `Add ₹${Number(amount).toLocaleString()} via Razorpay` : 'Enter Amount'}
                  </>
                )}
              </button>

              <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest">
                Secure payment powered by Razorpay • UPI, Cards & Netbanking
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info note */}
        <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100/50 space-y-2">
          <p className="text-[11px] font-black text-blue-700 uppercase tracking-widest">How wallet works</p>
          <ul className="text-[10px] font-bold text-blue-600 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Add money instantly via UPI, cards, or netbanking</li>
            <li>Use wallet balance at checkout for faster payments</li>
            <li>Refunds for cancelled orders are credited automatically</li>
            <li>Wallet balance never expires</li>
          </ul>
        </div>
      </main>
    </div>
  );
};
