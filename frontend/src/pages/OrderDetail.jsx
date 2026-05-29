import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Package, Truck, CheckCircle2, Clock, MapPin, CreditCard, XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { resolveImageUrl } from '../lib/imageUrl';
import { cn } from '../lib/utils';
import { SEO } from '../components/SEO';

const CANCELLABLE = ['pending', 'confirmed', 'packed'];

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const data = await api.getOrder(id);
      setOrder(data);
    } catch (e) {
      showToast('Could not load order', 'error');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setBusy(true);
    try {
      await api.cancelOrder(id, 'Cancelled by customer');
      showToast('Order cancelled', 'success');
      await load();
    } catch (e) {
      showToast(e.response?.data?.error || 'Cancel failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleReturn = async () => {
    const reason = window.prompt('Return reason (min 5 characters):');
    if (!reason || reason.trim().length < 5) return;
    setBusy(true);
    try {
      await api.requestOrderReturn(id, reason.trim());
      showToast('Return requested', 'success');
      await load();
    } catch (e) {
      showToast(e.response?.data?.error || 'Return failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <SEO title={`Order ${order.orderNumber}`} />
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button type="button" onClick={() => navigate('/orders')} className="p-2 -ml-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-black text-gray-900">#{order.orderNumber}</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</p>
          <p className="text-lg font-black text-gray-900 capitalize mt-1">{order.status.replace(/_/g, ' ')}</p>
          {stepIndex >= 0 && order.status !== 'cancelled' && (
            <div className="flex justify-between mt-4 gap-1">
              {STATUS_STEPS.slice(0, 6).map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    'h-1 flex-1 rounded-full',
                    i <= stepIndex ? 'bg-amber-400' : 'bg-gray-100',
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {(order.trackingId || order.courierName || order.trackingUrl) && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-amber-600">
              <Truck className="h-5 w-5" />
              <span className="font-black text-sm">Tracking</span>
            </div>
            {order.courierName && <p className="text-sm text-gray-600">Courier: {order.courierName}</p>}
            {order.trackingId && <p className="text-sm font-bold text-gray-900">ID: {order.trackingId}</p>}
            {order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 font-bold underline">
                Track shipment
              </a>
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Items</p>
          <div className="space-y-3">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <img src={resolveImageUrl(item.image)} alt="" className="w-14 h-18 object-cover rounded-xl bg-gray-50" />
                <div>
                  <p className="font-bold text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty {item.quantity} · ₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-right font-black text-lg mt-4">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
        </div>

        {order.address && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 flex gap-3">
            <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-bold text-gray-900">{order.address.fullName}</p>
              <p>{order.address.line1}</p>
              <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => api.openInvoiceHtml(order.id)}
            className="flex-1 min-w-[120px] py-3 rounded-2xl border border-gray-200 font-black text-xs uppercase"
          >
            Invoice
          </button>
          {CANCELLABLE.includes(order.status) && (
            <button
              type="button"
              disabled={busy}
              onClick={handleCancel}
              className="flex-1 min-w-[120px] py-3 rounded-2xl border border-red-200 text-red-700 font-black text-xs uppercase flex items-center justify-center gap-1"
            >
              <XCircle className="h-4 w-4" /> Cancel
            </button>
          )}
          {order.status === 'delivered' && (
            <button
              type="button"
              disabled={busy}
              onClick={handleReturn}
              className="flex-1 min-w-[120px] py-3 rounded-2xl bg-gray-900 text-white font-black text-xs uppercase"
            >
              Request return
            </button>
          )}
        </div>

        <Link to="/orders" className="block text-center text-xs font-black uppercase text-gray-400 hover:text-amber-600">
          Back to orders
        </Link>
      </div>
    </div>
  );
};
