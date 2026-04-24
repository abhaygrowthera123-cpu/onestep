import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight, ShieldCheck, CreditCard, Truck } from 'lucide-react';
import { api } from '../services/api';

export const Footer = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const cats = await api.getCategories();
                setCategories(cats || []);
            } catch (err) { /* silent */ }
        };
        fetchCats();
    }, []);

    return (<footer className="bg-slate-950 text-slate-400 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <img src="/images/logo.png" alt="Onestep-Hub" className="w-10 h-8 sm:w-12 sm:h-10 md:w-14 md:h-12 object-contain group-hover:scale-110 transition-transform brightness-0 invert" />
              <span className="text-lg sm:text-xl font-black tracking-tighter text-white">
                Onestep<span className="text-blue-500">-Hub</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed font-medium">
              A technology-driven B2B digital marketplace connecting manufacturers, wholesalers, and retailers for seamless procurement.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (<a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all">
                  <Icon className="h-5 w-5"/>
                </a>))}
            </div>
          </div>

          {/* Quick Links — Dynamic Categories */}
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Collections</h3>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/search" className="hover:text-brand-500 transition-colors flex items-center group">
                <ArrowRight className="h-4 w-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"/>
                <span>All Collections</span>
              </Link></li>
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}><Link to={`/search?category=${encodeURIComponent(cat.name)}`} className="hover:text-brand-500 transition-colors flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"/>
                  <span>{cat.name}</span>
                  {cat.productCount > 0 && <span className="ml-auto text-[10px] text-slate-600 font-bold">({cat.productCount})</span>}
                </Link></li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Support</h3>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/about" className="hover:text-brand-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-500 transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-brand-500 transition-colors">FAQ</Link></li>
              <li><Link to="/profile" className="hover:text-brand-500 transition-colors">My Account</Link></li>
              <li><Link to="/profile" className="hover:text-brand-500 transition-colors">Order Tracking</Link></li>
              <li><Link to="/wishlist" className="hover:text-brand-500 transition-colors">My Wishlist</Link></li>
              <li><Link to="/terms" className="hover:text-brand-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="hover:text-brand-500 transition-colors">Refund & Return Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h3 className="text-white font-black text-sm uppercase tracking-[0.2em]">Contact</h3>
            <ul className="space-y-6 text-sm font-bold">
              <li className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-brand-500"/>
                </div>
                <span className="leading-relaxed">11-29-201/A, <br />Warangal – 506002</span>
              </li>
              <li className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-brand-500"/>
                </div>
                <span className="break-all font-medium">harivardhan.budde007@gmail.com</span>
              </li>
              <li className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-brand-500"/>
                </div>
                <span>+91 9398022656</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-12 flex flex-col lg:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-center lg:text-left">
            © 2026 Onestep-Hub. <br className="sm:hidden"/>Excellence in Fashion.
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8">
            <div className="flex items-center space-x-2 text-slate-600">
              <ShieldCheck className="h-4 w-4"/>
              <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <CreditCard className="h-4 w-4"/>
              <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Truck className="h-4 w-4"/>
              <span className="text-[10px] font-black uppercase tracking-widest">Global</span>
            </div>
          </div>
        </div>
      </div>
    </footer>);
};
