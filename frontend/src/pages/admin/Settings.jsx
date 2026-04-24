import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Save, Settings as SettingsIcon } from 'lucide-react';

export const AdminSettings = () => {
  const [form, setForm] = useState({
    name: '',
    gstin: '',
    supportEmail: '',
    supportPhone: '',
    gstDisplayText: '',
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getSettings();
        const store = s.store || {};
        setForm({
          name: store.name || '',
          gstin: store.gstin || '',
          supportEmail: store.supportEmail || '',
          supportPhone: store.supportPhone || '',
          gstDisplayText: store.gstDisplayText || '',
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.putStoreSettings(form);
      setMsg('Settings saved.');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed');
    }
  };

  if (loading) return <div className="p-8 text-slate-500 font-bold">Loading…</div>;

  return (
    <div className="max-w-xl space-y-8 pb-10">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-slate-900 text-white rounded-2xl">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Store settings</h1>
          <p className="text-slate-500 text-sm">GST label, branding, support contacts</p>
        </div>
      </div>

      <form onSubmit={save} className="bg-white rounded-3xl border border-slate-100 p-8 space-y-4 shadow-sm">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Store name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">GSTIN (on invoice)</label>
          <input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support email</label>
          <input type="email" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support phone</label>
          <input value={form.supportPhone} onChange={(e) => setForm({ ...form, supportPhone: e.target.value })} className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">GST / pricing footnote (checkout)</label>
          <textarea value={form.gstDisplayText} onChange={(e) => setForm({ ...form, gstDisplayText: e.target.value })} rows={3} className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-medium text-sm" />
        </div>
        {msg && <p className="text-sm font-bold text-emerald-600">{msg}</p>}
        <button type="submit" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-brand-600 transition-colors">
          <Save className="h-4 w-4" />
          Save
        </button>
      </form>
    </div>
  );
};
