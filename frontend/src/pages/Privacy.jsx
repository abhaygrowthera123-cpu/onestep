import React from 'react';
import { SEO } from '../components/SEO';
import { motion } from 'motion/react';
import { Eye as EyeIcon, Shield as ShieldIcon, Database as DatabaseIcon, Bell as BellIcon, Lock as LockIcon, Globe as GlobeIcon } from 'lucide-react';

export const Privacy = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 sm:py-24">
    <SEO 
      title="Privacy Policy" 
      description="How Onestep-Hub collects, uses, and protects your personal information."
    />
    
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-16"
    >
      <div className="text-center space-y-4">
        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Confidentiality</span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-slate-500 font-medium italic">Last updated: April 10, 2026</p>
      </div>

      <div className="prose prose-slate max-w-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section className="space-y-4">
                <div className="flex items-center gap-3 text-slate-900">
                    <DatabaseIcon className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-black m-0">Data Collection</h2>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                    We collect info you provide when creating an account (Name, Email, Phone Number via OTP), shipping addresses, and transaction details. We also capture device information and browsing history to optimize performance.
                </p>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3 text-slate-900">
                    <ShieldIcon className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-black m-0">Our Promise</h2>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                    We do not sell, trade, or rent your personal identification information to others. Your data is strictly used for order fulfillment and enhancing your marketplace experience.
                </p>
            </section>
        </div>

        <section className="mt-16 bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <div className="flex items-center gap-3 mb-6 text-slate-900">
                <LockIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-black m-0">Security Protocols</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-2">Auth</h4>
                    <p className="text-slate-700 font-bold text-sm">Firebase End-to-End Encryption</p>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-2">Storage</h4>
                    <p className="text-slate-700 font-bold text-sm">Secure MySQL with AES-256</p>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-2">Payments</h4>
                    <p className="text-slate-700 font-bold text-sm">PCI DSS Compliant Gateways</p>
                </div>
            </div>
        </section>

        <section className="mt-16 space-y-8">
            <div className="flex items-center gap-3 text-slate-900">
                <BellIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-black m-0">Your Rights & Choices</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <EyeIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900">Access & Update</h4>
                        <p className="text-slate-500 text-sm font-medium">Request a copy of your data or update inaccurate information via account settings.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                        <GlobeIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900">Right to Erasure</h4>
                        <p className="text-slate-500 text-sm font-medium">Delete your account and all associated data permanently after resolving open orders.</p>
                    </div>
                </div>
            </div>
        </section>
      </div>

      <div className="bg-slate-900 rounded-3xl p-12 text-center text-white space-y-4">
        <h2 className="text-3xl font-black italic">Transparency Matters.</h2>
        <p className="text-slate-400 font-medium">Have questions about your data? Our Data Protection Officer is here to help.</p>
        <div className="pt-4">
            <a href="mailto:privacy@onestep.com" className="text-blue-400 font-black uppercase tracking-[0.2em] text-xs hover:text-blue-300 transition-colors">
                privacy@onestep.com
            </a>
        </div>
      </div>
    </motion.div>
  </div>
);

