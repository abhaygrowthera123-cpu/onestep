import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AddressManager } from '../components/AddressManager';
import { 
  ShoppingBag, 
  Heart, 
  Bell, 
  RotateCcw, 
  Globe, 
  MoreHorizontal, 
  ChevronRight, 
  Wallet, 
  Ticket, 
  Headset, 
  Truck,
  Edit2,
  ChevronLeft,
  BookMarked,
  PackageCheck,
  CreditCard,
  History,
  Zap,
  User,
  LogOut,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const Profile = () => {
    const { profile, user, logout, updateProfile } = useAuth();
    const { lang, setLang, t } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const res = await api.getOrders({ limit: 5 });
                setOrders(res.data || []);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    const quickActions = [
        { label: t('catalogs'), icon: BookMarked, color: 'bg-amber-100', text: 'text-amber-900', path: '/search' },
        { label: t('orders'), icon: ShoppingBag, color: 'bg-amber-100', text: 'text-amber-900', path: '/orders' },
        { label: t('favourites'), icon: Heart, color: 'bg-amber-100', text: 'text-amber-900', path: '/wishlist', badge: 'NEW' },
        { label: t('notification'), icon: Bell, color: 'bg-amber-100', text: 'text-amber-900', path: '/notifications', badge: '2' },
        { label: t('buyAgain'), icon: RotateCcw, color: 'bg-amber-100', text: 'text-amber-900', path: '/orders' },
        { label: t('language'), icon: Globe, color: 'bg-amber-100', text: 'text-amber-900', action: () => setLang(lang === 'en' ? 'hi' : 'en') },
        { label: t('return'), icon: RotateCcw, color: 'bg-amber-100', text: 'text-amber-900', path: '/orders' },
        { label: t('addresses'), icon: MapPin, color: 'bg-amber-100', text: 'text-amber-900', action: () => {
            const el = document.getElementById('address-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        } },
    ];

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ displayName: '', photoURL: '' });

    useEffect(() => {
        if (profile) {
            setEditData({ displayName: profile.displayName || '', photoURL: profile.photoURL || '' });
        }
    }, [profile]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.updateUser(user.uid, editData);
            const me = await api.getMe();
            updateProfile(me);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update profile');
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="bg-gray-100 min-h-screen pb-24">
            {/* Header: Yellow Section */}
            <div className="bg-amber-400 pt-8 pb-12 px-6 rounded-b-[3rem] shadow-lg relative overflow-hidden">
                {/* Abstract patterns */}
                <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-amber-300 rounded-full opacity-50 blur-3xl animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-amber-500 rounded-full opacity-30 blur-2xl" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-2">
                            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-amber-900 hover:bg-amber-300/50 rounded-full transition-all">
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <h1 className="text-2xl font-black text-amber-900 tracking-tight">{t('profile')}</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="p-2.5 bg-white/20 hover:bg-white/30 rounded-2xl text-amber-900 transition-all">
                                <Headset className="h-5 w-5" />
                            </button>
                            <button className="relative p-2.5 bg-white/20 hover:bg-white/30 rounded-2xl text-amber-900 transition-all">
                                <Truck className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-amber-400">
                                    27
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-4 gap-4">
                        {quickActions.map((action, idx) => (
                            <motion.button
                                key={idx}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (action.path) navigate(action.path);
                                    if (action.action) action.action();
                                }}
                                className="flex flex-col items-center space-y-2 group"
                            >
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-1",
                                    action.color
                                )}>
                                    <action.icon className={cn("h-6 w-6", action.text)} />
                                    {action.badge && (
                                      <span className={cn(
                                        "absolute -top-2 -right-2 px-1.5 py-0.5 text-[8px] font-black rounded-lg shadow-sm",
                                        action.badge === 'NEW' ? "bg-red-500 text-white" : "bg-white text-red-500 border border-red-100"
                                      )}>
                                        {action.badge}
                                      </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest text-center truncate w-full">
                                    {action.label}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* My Account Card */}
            <div className="px-4 -mt-6 relative z-20">
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-50 flex flex-col space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-gray-800">{t('myAccount')}</h2>
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center space-x-1.5 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-100 transition-all font-inter"
                        >
                            <span>{t('edit')}</span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 p-1">
                            {profile?.photoURL ? (
                                <img src={profile.photoURL} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <User className="h-8 w-8" />
                            )}
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="font-black text-gray-900 text-lg">{profile?.displayName || 'Guest User'}</h3>
                            <p className="text-sm font-bold text-gray-400">
                                {profile?.email}<br />
                                <span className="text-xs text-gray-300">{t('memberSince')} {new Date(profile?.createdAt || Date.now()).getFullYear()}</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-amber-50/50 rounded-2xl p-4 flex items-center justify-between border border-amber-50 group hover:border-amber-200 transition-all cursor-pointer">
                        <div className="space-y-1 flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('remainingCod')}</p>
                            <div className="flex items-center space-x-3">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 w-full rounded-full" />
                                </div>
                                <span className="text-xs font-black text-gray-700">₹33,000 / ₹33,000</span>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-amber-500 ml-4" />
                    </div>
                </div>
            </div>

            {/* Address Manager Section */}
            <div id="address-section" className="px-4 mt-8">
                <AddressManager />
            </div>

            {/* Wallet Section */}
            <div className="px-4 mt-8 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-black text-gray-800">Wallet</h2>
                    <button className="text-gray-400 hover:text-amber-500 transition-all">
                        <History className="h-5 w-5" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="space-y-1 relative z-10">
                            <p className="text-lg font-black text-gray-900">₹ {Number(profile?.walletBalance ?? 0).toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                One Step Coin <ChevronRight className="h-3 w-3 ml-1" />
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center relative z-10 border-2 border-white shadow-sm">
                            <span className="text-amber-900 font-black text-sm">O</span>
                        </div>
                    </div>

                    <Link to="/wallet" className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between group">
                        <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div className="flex-grow ml-4 px-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Balance</p>
                            <p className="text-sm font-black text-slate-900">₹{Number(profile?.walletBalance ?? 0).toFixed(2)}</p>
                        </div>
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center">
                            Wallet <ChevronRight className="h-3 w-3 ml-1" />
                        </span>
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="space-y-1 relative z-10">
                        <p className="text-lg font-black text-gray-900">₹{Number(profile?.walletBalance ?? 0).toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                            Wallet Balance <ChevronRight className="h-3 w-3 ml-1" />
                        </p>
                    </div>
                    <div className="w-16 h-12 bg-amber-50 rounded-xl flex items-center justify-center relative z-10 p-2 border border-amber-100">
                        <Wallet className="h-8 w-8 text-amber-400" />
                    </div>
                </div>
            </div>

            {/* Coupons Section */}
            <div className="px-4 mt-8">
                <Link to="/coupons" className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                            <Ticket className="h-6 w-6 text-rose-500" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="font-black text-gray-900">Coupons</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Exciting offers waiting for you</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="h-6 w-1 bg-amber-400 rounded-full" />
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                    </div>
                </Link>
            </div>

            {/* Bottom Actions */}
            <div className="px-4 mt-8 pb-12">
               <button onClick={() => logout()} className="w-full bg-white text-rose-500 font-black py-4 rounded-2xl border border-rose-100 shadow-sm hover:bg-rose-50 transition-all flex items-center justify-center space-x-3">
                  <LogOut className="h-5 w-5" />
                  <span>Logout From Account</span>
               </button>
            </div>
            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl space-y-6"
                        >
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-gray-900">Edit Profile</h2>
                                <p className="text-sm text-gray-500 font-medium">Update your account information.</p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Display Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-6 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                                        value={editData.displayName}
                                        onChange={e => setEditData({...editData, displayName: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Photo URL</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-6 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                                        value={editData.photoURL}
                                        onChange={e => setEditData({...editData, photoURL: e.target.value})}
                                    />
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 py-3.5 rounded-2xl font-black text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 bg-amber-400 text-amber-900 py-3.5 rounded-2xl font-black shadow-lg shadow-amber-100 hover:bg-amber-500 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
