import React, { useEffect, useState } from 'react';
import { Mail, Inbox, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminMessages = () => {
  const [tab, setTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadInbox = async () => {
    setLoading(true);
    try {
      const res = await api.getContactMessages({ limit: 50 });
      setMessages(res.data || []);
    } catch (e) {
      showToast('Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadNewsletter = async () => {
    setLoading(true);
    try {
      const res = await api.getNewsletterSubscribers({ limit: 50 });
      setSubscribers(res.data || []);
    } catch (e) {
      showToast('Failed to load subscribers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'inbox') loadInbox();
    else loadNewsletter();
  }, [tab]);

  const markRead = async (id) => {
    try {
      await api.markContactRead(id);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    } catch {
      showToast('Failed to update', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Messages</h1>
        <p className="text-sm text-slate-500">Contact form submissions and newsletter subscribers</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('inbox')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${tab === 'inbox' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          <Inbox className="inline h-4 w-4 mr-1" /> Inbox
        </button>
        <button
          type="button"
          onClick={() => setTab('newsletter')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${tab === 'newsletter' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          <Mail className="inline h-4 w-4 mr-1" /> Newsletter
        </button>
      </div>

      {loading && <div className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />}

      {!loading && tab === 'inbox' && (
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="text-slate-500 text-sm py-8 text-center bg-white rounded-2xl border">No messages yet.</p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border p-5 ${m.isRead ? 'border-slate-100 opacity-80' : 'border-blue-100 shadow-sm'}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-black text-slate-900">{m.name} · {m.email}</p>
                  {m.subject && <p className="text-xs font-bold text-slate-500 mt-1">{m.subject}</p>}
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{m.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2">{new Date(m.createdAt).toLocaleString()}</p>
                </div>
                {!m.isRead && (
                  <button
                    type="button"
                    onClick={() => markRead(m.id)}
                    className="shrink-0 flex items-center gap-1 text-xs font-black uppercase text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg"
                  >
                    <Check className="h-4 w-4" /> Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'newsletter' && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Email</th>
                <th className="px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Active</th>
                <th className="px-4 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Joined</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-400">No subscribers yet.</td>
                </tr>
              )}
              {subscribers.map((s) => (
                <tr key={s.id} className="border-t border-slate-50">
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3">{s.isActive ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
