import React from 'react';
import { SEO } from '../components/SEO';
import { motion } from 'motion/react';
import { Gavel, UserCheck, CreditCard, Truck, RefreshCw, Lock, Scale } from 'lucide-react';

export const Terms = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 sm:py-24">
    <SEO 
      title="Terms of Service" 
      description="Onestep-Hub terms and conditions governing use of our platform."
    />
    
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-16"
    >
      <div className="text-center space-y-4">
        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Governance</span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-slate-500 font-medium italic">Effective Date: April 10, 2026</p>
      </div>

      <div className="space-y-12">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-slate-900">
            <Scale className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-black tracking-tight">1. Agreement to Terms</h2>
          </div>
          <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100">
            By accessing 'Onestep-Hub' (onestephub.com), you agree to be bound by these Terms of Service. This platform is a B2B and B2C marketplace designed for fashion and lifestyle procurement. If you disagree with any part of these terms, please discontinue use immediately.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-black uppercase tracking-wider">2. Account Responsibility</h3>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    Users must be 18+ to register. You are responsible for maintaining the security of your account and any Mobile OTP received. Onestep-Hub is not liable for unauthorized access resulting from your negligence.
                </p>
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-black uppercase tracking-wider">3. Pricing & Payments</h3>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    All prices are in Indian Rupees (₹) and inclusive of applicable GST unless stated otherwise. We reserve the right to correct pricing errors. Payments via UPI, Cards, and COD are subject to verification.
                </p>
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-black uppercase tracking-wider">4. Logistics & Shipping</h3>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    We ship primarily within AP and Telangana. Delivery timelines (3-7 days) are estimates. Risk of loss passes to you upon delivery to the address provided during checkout.
                </p>
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-black uppercase tracking-wider">5. Orders & Returns</h3>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    Orders are subject to availability. Our 7-day return policy applies to unworn items. Onestep-Hub reserves the right to cancel suspicious orders or those with fraudulent intent.
                </p>
            </div>
        </div>

        <section className="space-y-4 pt-8">
          <div className="flex items-center gap-3 text-slate-900">
            <Lock className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-black tracking-tight">6. Prohibited Activities</h2>
          </div>
          <div className="bg-slate-900 text-slate-300 p-8 rounded-3xl space-y-4 font-mono text-xs leading-relaxed uppercase tracking-widest">
            <p>&gt; NO UNAUTHORIZED DATA SCRAPING</p>
            <p>&gt; NO FRAUDULENT TRANSACTIONS</p>
            <p>&gt; NO ABUSE OF REFERRAL SYSTEMS</p>
            <p>&gt; NO INTELLECTUAL PROPERTY INFRINGEMENT</p>
          </div>
        </section>

        <section className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-8 text-center space-y-3">
            <div className="flex justify-center mb-2"><Gavel className="w-8 h-8 text-blue-600" /></div>
            <h2 className="text-xl font-black text-slate-900">7. Governing Law</h2>
            <p className="text-slate-600 font-medium text-sm">
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.
            </p>
        </section>
      </div>

      <div className="text-center pt-8 border-t border-slate-100">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            © 2026 Onestep-Hub. All Rights Reserved.
        </p>
      </div>
    </motion.div>
  </div>
);

