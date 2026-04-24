import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Mail, Phone, Send, CheckCircle2,
  Clock, MessageCircle, ChevronDown, Headphones,
  Globe, ArrowRight, Sparkles, Shield, Zap
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { api } from '../services/api';

/* ───── Floating label input ───── */
const FloatingInput = ({ label, id, type = 'text', required, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative group">
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          peer w-full bg-white/60 backdrop-blur-sm border-2 rounded-2xl px-6 pt-7 pb-3
          text-slate-900 font-semibold text-[15px] transition-all duration-300
          focus:outline-none focus:bg-white
          ${focused ? 'border-brand-500 shadow-lg shadow-brand-500/10' : 'border-slate-200 hover:border-slate-300'}
        `}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-6 transition-all duration-300 pointer-events-none font-bold
          ${active
            ? 'top-2 text-[10px] uppercase tracking-[0.15em] text-brand-600'
            : 'top-1/2 -translate-y-1/2 text-sm text-slate-400'
          }
        `}
      >
        {label}
      </label>
      {/* bottom glow */}
      <div className={`absolute -bottom-px left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500 ${focused ? 'w-3/4 opacity-100' : 'w-0 opacity-0'}`} />
    </div>
  );
};

/* ───── Floating label textarea ───── */
const FloatingTextarea = ({ label, id, required, value, onChange, rows = 5 }) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative group">
      <textarea
        id={id}
        rows={rows}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          peer w-full bg-white/60 backdrop-blur-sm border-2 rounded-2xl px-6 pt-7 pb-3
          text-slate-900 font-semibold text-[15px] transition-all duration-300 resize-none
          focus:outline-none focus:bg-white
          ${focused ? 'border-brand-500 shadow-lg shadow-brand-500/10' : 'border-slate-200 hover:border-slate-300'}
        `}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-6 transition-all duration-300 pointer-events-none font-bold
          ${active
            ? 'top-2 text-[10px] uppercase tracking-[0.15em] text-brand-600'
            : 'top-5 text-sm text-slate-400'
          }
        `}
      >
        {label}
      </label>
      <div className={`absolute -bottom-px left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500 ${focused ? 'w-3/4 opacity-100' : 'w-0 opacity-0'}`} />
    </div>
  );
};

/* ───── FAQ Accordion Item ───── */
const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <motion.div
    layout
    className={`
      border-2 rounded-2xl overflow-hidden transition-all duration-300
      ${isOpen ? 'border-brand-200 bg-brand-50/40 shadow-lg shadow-brand-100/30' : 'border-slate-100 bg-white hover:border-slate-200'}
    `}
  >
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-6 text-left group"
    >
      <span className={`font-bold text-[15px] transition-colors ${isOpen ? 'text-brand-700' : 'text-slate-800'}`}>{question}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className={`flex-shrink-0 ml-4 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}
      >
        <ChevronDown className="h-4 w-4" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <p className="px-6 pb-6 text-slate-600 font-medium leading-relaxed text-[14px]">{answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);


/* ═══════════════════════  MAIN COMPONENT  ═══════════════════════ */
export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [openFaq, setOpenFaq] = useState(null);
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.sendContactMessage(form);
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /* ── Data ── */
  const contactCards = [
    {
      icon: MapPin,
      title: 'Visit Us',
      detail: '11-29-201/A, Warangal',
      sub: 'Telangana 506002, India',
      gradient: 'from-rose-500 to-orange-500',
      bgGlow: 'bg-rose-500/20',
    },
    {
      icon: Mail,
      title: 'Email Us',
      detail: 'harivardhan.budde007@gmail.com',
      sub: 'We reply within 24 hours',
      gradient: 'from-brand-500 to-blue-600',
      bgGlow: 'bg-brand-500/20',
    },
    {
      icon: Phone,
      title: 'Call Us',
      detail: '+91 93980 22656',
      sub: '+91 63014 24149 · +91 98663 22421',
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'bg-emerald-500/20',
    },
  ];

  const stats = [
    { value: '24/7', label: 'Support Available' },
    { value: '<2h', label: 'Avg Response' },
    { value: '10K+', label: 'Happy Customers' },
    { value: '4.9★', label: 'Satisfaction' },
  ];

  const faqs = [
    { q: 'What are your business hours?', a: 'We operate Monday to Saturday, 9:00 AM – 7:00 PM IST. Our online support is available 24/7 for urgent queries.' },
    { q: 'How can I track my bulk order?', a: 'Once your order is placed, you\'ll receive a tracking ID via email and SMS. You can also track from your account dashboard under "Orders".' },
    { q: 'Do you offer customization on bulk orders?', a: 'Yes! We offer labeling, packaging customization, and product modifications for orders above ₹50,000. Contact our sales team for details.' },
    { q: 'What is your return/refund policy?', a: 'We offer hassle-free returns within 7 days of delivery. Refunds are processed within 5-7 business days after approval.' },
    { q: 'How do I become a verified supplier?', a: 'Visit our Seller registration page, submit your GSTIN and business documents, and our team will verify within 2-3 business days.' },
  ];

  const businessHours = [
    { day: 'Monday – Friday', time: '9:00 AM – 7:00 PM' },
    { day: 'Saturday', time: '10:00 AM – 5:00 PM' },
    { day: 'Sunday', time: 'Closed' },
  ];

  return (
    <div className="pb-0 overflow-x-hidden">
      <SEO title="Contact Us" description="Get in touch with Onestep-Hub. We are here to help." />

      {/* ─────────────── HERO ─────────────── */}
      <section className="relative min-h-[600px] flex items-center justify-center bg-slate-950 overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-slate-950 to-slate-900" />
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-600/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[80px]"
          />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center space-y-8 px-4 max-w-4xl mx-auto py-32">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 150, damping: 18 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-500/20 rounded-3xl blur-2xl animate-pulse" />
              <img
                src="/images/logo.png"
                alt="Onestep-Hub"
                className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl shadow-2xl shadow-brand-500/30 bg-white/10 backdrop-blur-xl border border-white/10 p-3"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center space-x-2 bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] text-white/80 text-[10px] font-black px-6 py-3 rounded-full uppercase tracking-[0.4em]"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span>Get In Touch</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9]"
          >
            Let's Start a{' '}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-cyan-400">
                Conversation
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-cyan-400 rounded-full origin-left"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="text-lg sm:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Have questions about bulk orders, partnerships, or our platform?
            We're here to help you grow your business.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.36 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={scrollToForm}
              className="group flex items-center space-x-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-brand-600/30 hover:shadow-2xl hover:shadow-brand-600/40 hover:scale-[1.02] transition-all duration-300"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Send a Message</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="tel:+919398022656"
              className="group flex items-center space-x-3 bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/[0.1] transition-all duration-300"
            >
              <Headphones className="h-5 w-5 text-brand-400" />
              <span>Call Now</span>
            </a>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50/30 to-transparent" />
      </section>

      {/* ─────────────── STATS BAR ─────────────── */}
      <section className="relative z-20 -mt-12 max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100"
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 sm:p-8 text-center"
            >
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{s.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─────────────── CONTACT CARDS ─────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center space-y-4 mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-brand-600 font-black text-xs uppercase tracking-[0.3em]"
          >
            Reach Out To Us
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight"
          >
            Multiple Ways to Connect
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {contactCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group relative bg-white rounded-[2rem] p-8 lg:p-10 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden"
            >
              {/* Gradient glow on hover */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 ${card.bgGlow} rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

              <div className="relative space-y-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <card.icon className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{card.title}</h3>
                  <p className="text-lg font-black text-slate-900 tracking-tight break-all leading-snug">{card.detail}</p>
                  <p className="text-sm font-semibold text-slate-500">{card.sub}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─────────────── FORM + SIDEBAR ─────────────── */}
      <section ref={formRef} className="bg-gradient-to-b from-slate-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-brand-600 font-black text-xs uppercase tracking-[0.3em]"
            >
              Contact Form
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight"
            >
              Send Us a Message
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 font-medium max-w-lg mx-auto"
            >
              Fill out the form below and our team will get back to you within 24 hours.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
            {/* ── FORM CARD ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-8 sm:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/40">
                <AnimatePresence mode="wait">
                  {status === 'sent' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center space-y-6 py-16"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                        className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-200"
                      >
                        <CheckCircle2 className="h-12 w-12" />
                      </motion.div>
                      <h3 className="text-3xl font-black text-slate-900">Message Sent!</h3>
                      <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto">
                        Thank you for reaching out. We'll respond within 24 hours.
                      </p>
                      <button
                        onClick={() => setStatus('idle')}
                        className="inline-flex items-center space-x-2 text-brand-600 font-black text-sm uppercase tracking-widest hover:text-brand-700 transition-colors"
                      >
                        <span>Send Another Message</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                      onSubmit={handleSubmit}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FloatingInput
                          label="Full Name"
                          id="contact-name"
                          required
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                        <FloatingInput
                          label="Email Address"
                          id="contact-email"
                          type="email"
                          required
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                      </div>

                      <FloatingInput
                        label="Subject"
                        id="contact-subject"
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                      />

                      <FloatingTextarea
                        label="Your Message"
                        id="contact-message"
                        required
                        rows={6}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                      />

                      {status === 'error' && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-rose-500 font-bold text-sm flex items-center space-x-2"
                        >
                          <span>⚠</span>
                          <span>Failed to send. Please try again.</span>
                        </motion.p>
                      )}

                      <button
                        disabled={status === 'sending'}
                        className="
                          group w-full relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white
                          py-5 rounded-2xl font-black uppercase tracking-widest text-sm
                          hover:from-brand-600 hover:to-brand-700
                          transition-all duration-500 shadow-xl shadow-slate-300/40
                          flex items-center justify-center space-x-3
                          disabled:opacity-50 disabled:cursor-not-allowed
                        "
                      >
                        {/* Shine animation */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>
                        <span className="relative">{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
                        <Send className="h-5 w-5 relative group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ── SIDEBAR ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="space-y-6"
            >
              {/* Business Hours */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-slate-900 text-lg tracking-tight">Business Hours</h3>
                </div>
                <div className="space-y-4">
                  {businessHours.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-600">{item.day}</span>
                      <span className={`text-sm font-bold ${item.time === 'Closed' ? 'text-rose-500' : 'text-slate-900'}`}>
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Zap className="h-5 w-5 text-brand-400" />
                  </div>
                  <h3 className="font-black text-lg tracking-tight">Quick Links</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'FAQs', icon: MessageCircle },
                    { label: 'Terms & Conditions', icon: Shield },
                    { label: 'Refund Policy', icon: Globe },
                  ].map((link, i) => (
                    <a
                      key={i}
                      href={`/${link.label.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                      className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-white/[0.06] transition-colors"
                    >
                      <link.icon className="h-4 w-4 text-slate-400 group-hover:text-brand-400 transition-colors" />
                      <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{link.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600 ml-auto group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Guarantee Badge */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-[2rem] p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-200">
                  <Shield className="h-7 w-7" />
                </div>
                <h4 className="font-black text-slate-900 tracking-tight">100% Secure</h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Your information is encrypted and never shared with third parties.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────── MAP + FAQ ─────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Google Maps */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <p className="text-brand-600 font-black text-xs uppercase tracking-[0.3em] mb-3">Our Location</p>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Find Us on the Map</h2>
              </div>
              <div className="rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/40 aspect-[4/3]">
                <iframe
                  title="OneStep-Hub Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60893.15!2d79.55!3d17.97!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a334729db279cd1%3A0x5c5e6f2e2a2ef5f1!2sWarangal%2C%20Telangana%20506002!5e0!3m2!1sen!2sin!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <p className="text-brand-600 font-black text-xs uppercase tracking-[0.3em] mb-3">Frequently Asked</p>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Common Questions</h2>
              </div>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <FAQItem
                    key={i}
                    question={faq.q}
                    answer={faq.a}
                    isOpen={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────── CTA BANNER ─────────────── */}
      <section className="pb-24 pt-8">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-12 sm:p-16 text-center"
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0">
              <motion.div
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 right-0 w-80 h-80 bg-brand-600/20 rounded-full blur-[80px]"
              />
              <motion.div
                animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/15 rounded-full blur-[60px]"
              />
            </div>

            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Ready to Scale Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-cyan-400">
                  Business?
                </span>
              </h2>
              <p className="text-slate-400 font-medium text-lg">
                Join thousands of retailers and wholesalers who trust Onestep-Hub for their procurement needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={scrollToForm}
                  className="group flex items-center space-x-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-brand-600/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="tel:+919398022656"
                  className="flex items-center space-x-3 text-slate-300 hover:text-white font-bold text-sm uppercase tracking-widest transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>+91 93980 22656</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
