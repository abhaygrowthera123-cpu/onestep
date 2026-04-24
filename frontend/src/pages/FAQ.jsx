import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { ChevronDown, HelpCircle, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
const faqs = [
    {
        category: 'Shipping & Delivery',
        icon: Truck,
        questions: [
            {
                q: "How long does shipping take?",
                a: "Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 business day delivery."
            },
            {
                q: "Do you ship internationally?",
                a: "Yes, we ship to over 50 countries worldwide. International shipping times vary by location."
            }
        ]
    },
    {
        category: 'Returns & Exchanges',
        icon: RotateCcw,
        questions: [
            {
                q: "What is your return policy?",
                a: "We offer a 15-day easy return policy for all unworn items in their original packaging with tags attached."
            },
            {
                q: "How do I start an exchange?",
                a: "Contact our support team via the profile section or email concierge@onestep.com to initiate an exchange."
            }
        ]
    },
    {
        category: 'Payments & Security',
        icon: ShieldCheck,
        questions: [
            {
                q: "What payment methods do you accept?",
                a: "We accept all major credit/debit cards, UPI, Net Banking, and popular digital wallets."
            },
            {
                q: "Is my payment information secure?",
                a: "Absolutely. We use industry-standard SSL encryption and PCI-compliant payment gateways to ensure your data is always protected."
            }
        ]
    }
];
export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    return (<div className="max-w-4xl mx-auto px-4 py-12 sm:py-24">
      <SEO title="FAQ" description="Frequently asked questions about shipping, returns, and payments at Onestep-Hub."/>
      
      <div className="relative rounded-[3rem] overflow-hidden mb-16 h-[300px] group">
        <img 
          src="/uploads/images/faq-hero.png" 
          alt="FAQ Support" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => e.target.style.display = 'none'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        <div className="absolute bottom-10 left-0 right-0 text-center space-y-4 px-4">
          <div className="inline-flex items-center space-x-2 bg-brand-50/80 backdrop-blur-md text-brand-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100 mx-auto">
            <HelpCircle className="h-4 w-4"/>
            <span>Support Center</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">How can we help?</h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Find answers to common questions about our premium services and shopping experience.
          </p>
        </div>
      </div>

      <div className="space-y-16">
        {faqs.map((section, sIdx) => (<div key={sIdx} className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                <section.icon className="h-6 w-6"/>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{section.category}</h2>
            </div>

            <div className="space-y-4">
              {section.questions.map((item, qIdx) => {
                const id = `${sIdx}-${qIdx}`;
                const isOpen = openIndex === id;
                return (<div key={qIdx} className={cn("bg-white rounded-3xl border transition-all duration-300 overflow-hidden", isOpen ? "border-brand-200 shadow-xl shadow-brand-50" : "border-slate-100 hover:border-brand-100")}>
                    <button onClick={() => setOpenIndex(isOpen ? null : id)} className="w-full flex items-center justify-between p-6 sm:p-8 text-left">
                      <span className="text-lg font-bold text-slate-900">{item.q}</span>
                      <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform duration-300", isOpen && "rotate-180 text-brand-600")}/>
                    </button>
                    <AnimatePresence>
                      {isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                          <div className="px-6 sm:px-8 pb-8 text-slate-500 font-medium leading-relaxed">
                            {item.a}
                          </div>
                        </motion.div>)}
                    </AnimatePresence>
                  </div>);
            })}
            </div>
          </div>))}
      </div>

      <div className="mt-24 bg-slate-900 rounded-[3rem] p-12 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"/>
        <h3 className="text-2xl font-black text-white tracking-tight">Still have questions?</h3>
        <p className="text-slate-400 font-medium max-w-md mx-auto">
          Our concierge team is available 24/7 to assist you with any inquiries.
        </p>
        <button className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all shadow-xl">
          Contact Support
        </button>
      </div>
    </div>);
};
