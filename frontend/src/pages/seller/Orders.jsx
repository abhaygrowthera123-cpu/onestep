import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Package, ChevronLeft, Calendar, DollarSign, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getSellerOrders({ limit: 100 });
        setOrders(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate('/seller')} className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
          <ChevronLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Queue</h1>
          <p className="text-[11px] text-slate-500 font-medium">Orders containing your curated listings.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-black text-xs uppercase tracking-widest">No order activity detected</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((o) => (
            <div key={o.id} className="group bg-white rounded-2xl border border-slate-100 p-4 flex flex-col justify-between gap-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg w-fit">
                    <Hash className="h-3 w-3" />
                    <span>{o.orderNumber || o.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-lg font-black text-slate-900">
                    <DollarSign className="h-4 w-4 text-slate-300" />
                    <span>{Number(o.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm",
                  o.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                  {o.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                  <Calendar className="h-3 w-3 opacity-50" />
                  <span>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <button className="text-[9px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 px-2.5 py-1 rounded-lg hover:bg-brand-600 hover:text-white transition-all">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
