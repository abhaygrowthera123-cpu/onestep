import React, { useState, useEffect, useCallback } from 'react';
import { Bell, ChevronLeft, CheckCircle2, ShoppingBag, Tag, Info, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const TYPE_ICONS = {
  order: ShoppingBag,
  payment: CreditCard,
  promotion: Tag,
  system: Info,
  seller: Info,
  success: CheckCircle2,
};

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString();
}

export const Notifications = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.getNotifications({ limit: 50 }),
        api.getNotificationUnreadCount(),
      ]);
      setNotifications(listRes.data || []);
      setUnreadCount(countRes.count ?? 0);
    } catch (e) {
      console.error(e);
      showToast('Could not load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      showToast('Failed to update notification', 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (e) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const iconFor = (type) => TYPE_ICONS[type] || Bell;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100 px-6 py-6 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all">
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {unreadCount} New
            </span>
          )}
        </div>
      </div>

      <main className="px-6 py-8 max-w-2xl mx-auto space-y-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        )}
        {!loading && notifications.length === 0 && (
          <p className="text-center text-gray-500 font-medium py-12">No notifications yet.</p>
        )}
        {!loading && notifications.map((notif, idx) => {
          const Icon = iconFor(notif.type);
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => !notif.isRead && markRead(notif.id)}
              className={cn(
                'bg-white p-5 rounded-[2rem] border transition-all flex items-start space-x-4 group cursor-pointer',
                notif.isRead ? 'border-gray-50 opacity-70' : 'border-amber-100 shadow-sm shadow-amber-50',
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
                  notif.type === 'payment' && 'bg-emerald-50 text-emerald-500',
                  notif.type === 'promotion' && 'bg-purple-50 text-purple-500',
                  notif.type === 'order' && 'bg-blue-50 text-blue-500',
                  !['payment', 'promotion', 'order'].includes(notif.type) && 'bg-gray-50 text-gray-500',
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-gray-900 text-sm">{notif.title}</h3>
                  <span className="text-[10px] font-bold text-gray-400">{formatTime(notif.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{notif.body}</p>
              </div>
              {!notif.isRead && <div className="w-2 h-2 bg-amber-400 rounded-full shrink-0" />}
            </motion.div>
          );
        })}

        {notifications.length > 0 && unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-amber-500 transition-all"
          >
            Mark all as read
          </button>
        )}
      </main>
    </div>
  );
};
