'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { ordersApi, cartApi, type Order } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

function daysAgo(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function ReorderBanner() {
  const { user, isAuthenticated } = useAuth();
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role === 'company') return;
    let cancelled = false;
    setLoading(true);
    ordersApi
      .getAll({ page: 1, per_page: 1 })
      .then((res) => {
        if (cancelled) return;
        const order = res.data?.orders?.[0];
        if (order) setLastOrder(order);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !lastOrder) return null;

  const items = lastOrder.items ?? [];
  if (items.length === 0) return null;

  const days = daysAgo(lastOrder.created_at);

  const handleReorder = async () => {
    setSubmitting(true);
    let added = 0;
    let failed = 0;
    for (const item of items) {
      if (!item.offer_id) {
        failed++;
        continue;
      }
      try {
        await cartApi.addItem(item.offer_id, item.quantity);
        added++;
      } catch {
        failed++;
      }
    }
    setSubmitting(false);
    if (added > 0) toast.success(`${added} kalem sepete eklendi.`);
    if (failed > 0) toast.error(`${failed} kalem eklenemedi (stok değişmiş olabilir).`);
  };

  if (loading) return null;

  return (
    <div className="bg-primary-50 border border-primary-100 rounded-md px-4 py-3 flex items-center gap-3 flex-wrap">
      <div className="w-9 h-9 rounded-sm bg-primary-700 flex items-center justify-center flex-shrink-0">
        <RotateCcw className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900">
          Son siparişini tekrarla
        </p>
        <p className="text-xs text-neutral-600 tabular-num">
          {days !== null ? `${days} gün önce` : ''}
          {days !== null && items.length > 0 ? ' • ' : ''}
          {items.length} kalem
        </p>
      </div>
      <button
        type="button"
        onClick={handleReorder}
        disabled={submitting}
        className="inline-flex items-center gap-1.5 px-4 h-9 rounded-sm bg-accent-500 hover:bg-accent-400 text-primary-900 font-bold text-sm transition-colors disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RotateCcw className="w-4 h-4" />
        )}
        Sepete Doldur
      </button>
    </div>
  );
}
