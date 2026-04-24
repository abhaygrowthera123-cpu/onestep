import React from 'react';
import { Bell, ChevronLeft, CheckCircle2, ShoppingBag, Tag, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Notifications = () => {
    const navigate = useNavigate();

    const notifications = [
        {
            id: 1,
            title: 'Order Delivered!',
            message: 'Your order #12345 has been delivered successfully. Enjoy your purchase!',
            time: '2 hours ago',
            icon: CheckCircle2,
            type: 'success',
            read: false
        },
        {
            id: 2,
            title: 'New Discount Available',
            message: 'Get 20% off on your next purchase with code SUMMER20.',
            time: '5 hours ago',
            icon: Tag,
            type: 'promo',
            read: false
        },
        {
            id: 3,
            title: 'Welcome to Onestep-Hub',
            message: 'Thanks for joining our community. Start exploring premium fashion now.',
            time: '1 day ago',
            icon: Info,
            type: 'info',
            read: true
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-6 sticky top-0 z-10">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all">
                            <ChevronLeft className="h-6 w-6 text-gray-900" />
                        </button>
                        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Notifications</h1>
                    </div>
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        2 New
                    </span>
                </div>
            </div>

            <main className="px-6 py-8 max-w-2xl mx-auto space-y-4">
                {notifications.map((notif, idx) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn(
                            "bg-white p-5 rounded-[2rem] border transition-all flex items-start space-x-4 group cursor-pointer",
                            notif.read ? "border-gray-50 opacity-70" : "border-amber-100 shadow-sm shadow-amber-50"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                            notif.type === 'success' && "bg-emerald-50 text-emerald-500",
                            notif.type === 'promo' && "bg-purple-50 text-purple-500",
                            notif.type === 'info' && "bg-blue-50 text-blue-500"
                        )}>
                            <notif.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-grow space-y-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-black text-gray-900 text-sm">{notif.title}</h3>
                                <span className="text-[10px] font-bold text-gray-400">{notif.time}</span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{notif.message}</p>
                        </div>
                        {!notif.read && (
                            <div className="w-2 h-2 bg-amber-400 rounded-full shrink-0" />
                        )}
                    </motion.div>
                ))}

                <button className="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-amber-500 transition-all">
                    Mark all as read
                </button>
            </main>
        </div>
    );
};
