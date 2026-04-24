import React from 'react';
import { SEO } from '../components/SEO';
import { motion } from 'motion/react';
import { ShieldCheck, Truck, RefreshCw, AlertCircle } from 'lucide-react';

export const Refund = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 sm:py-24">
    <SEO 
      title="Refund & Return Policy" 
      description="Learn about Onestep-Hub's 7-day easy return and refund policy."
    />
    
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-16"
    >
      <div className="text-center space-y-4">
        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Legal & Policy</span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">Refund & Return</h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
          At Onestep-Hub, we aim for 100% customer satisfaction. If you're not happy with your purchase, our 7-day return policy is here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50 rounded-3xl p-8 space-y-4 border border-slate-100">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">7-Day Easy Returns</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Items must be returned within 7 days of delivery. The products must be unworn, unwashed, and in their original packaging with all tags intact.
          </p>
        </div>

        <div className="bg-slate-50 rounded-3xl p-8 space-y-4 border border-slate-100">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Quality Checks</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            All returned items undergo a quality check. Once approved, the refund is initiated immediately to your original payment method.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Truck className="w-6 h-6 text-blue-600" />
            Reverse Pickup
          </h2>
          <div className="space-y-3 text-slate-600 font-medium">
            <p>We provide free reverse pickup for most pincodes in AP & Telangana. If your location is outside the pickup zone, you may need to self-ship the item.</p>
            <p>Pickup usually happens within 24-48 hours after the request is approved.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            Non-Returnable Items
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium">
            <li>Innerwear, Lingerie, and Socks for hygiene reasons.</li>
            <li>Fragrances and Beauty products once opened.</li>
            <li>Customized or personalized items.</li>
            <li>Items sold during "Clearance Sales" unless damaged.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Refund Process</h2>
          <div className="bg-white border-2 border-slate-50 rounded-3xl p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
              <p className="text-slate-600 font-medium pt-1">Request a return from your 'Order History' panel.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
              <p className="text-slate-600 font-medium pt-1">Our partner will collect the item from your doorstep.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
              <p className="text-slate-600 font-medium pt-1">Refund credited back (Prepaid: 5-7 days, COD: Via UPI/Bank Transfer).</p>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-blue-600 rounded-3xl p-12 text-center text-white space-y-4">
        <h2 className="text-3xl font-black italic">Need assistance with a return?</h2>
        <p className="text-blue-100 font-medium">Our support team is available from 10 AM to 7 PM IST.</p>
        <div className="pt-4">
            <a href="mailto:support@onestep.com" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-colors inline-block">
                Contact Support
            </a>
        </div>
      </div>
    </motion.div>
  </div>
);
