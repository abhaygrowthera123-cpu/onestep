import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ShopProfile = () => {
    const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [shopName, setShopName] = useState('');
  const [gstin, setGstin] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const me = await api.getMe();
        setShopName(me.sellerShopName || '');
        setGstin(me.sellerGstin || '');
        setPhone(me.sellerPhone || me.phone || '');
      } catch { /* */ }
    })();
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg('');
    try {
      const updated = await api.updateUser(user.uid, {
        sellerShopName: shopName,
        sellerGstin: gstin,
        sellerPhone: phone,
      });
      updateProfile(updated);
      setMsg('Saved.');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-lg mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate('/seller')} className="p-2 rounded-xl hover:bg-slate-100">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Shop profile</h1>
            <p className="text-slate-500 text-sm">Shown on invoices and seller tools</p>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shop name</label>
          <input value={shopName} onChange={(e) => setShopName(e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder="Your store name" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">GSTIN (optional)</label>
          <input value={gstin} onChange={(e) => setGstin(e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder="22AAAAA0000A1Z5" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder="10-digit mobile" />
        </div>
        {msg && <p className="text-sm font-bold text-emerald-600">{msg}</p>}
        <button type="submit" disabled={saving} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-sm disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
};
