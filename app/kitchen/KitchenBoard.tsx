"use client";

import Link from "next/link";
import { useEffect, useTransition } from "react";
import { updateOrderStatus, type KitchenOrder } from "./actions";

function timeSince(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function OrderCard({ order, onAction }: { order: KitchenOrder; onAction: () => void }) {
  const [isPending, startTransition] = useTransition();
  const isPaid = order.status === "paid";

  const handleAction = () => {
    const newStatus = isPaid ? "accepted" : "completed";
    startTransition(async () => {
      await updateOrderStatus(order.id, newStatus);
      onAction();
    });
  };

  return (
    <div className={`bg-zinc-800 rounded-2xl p-5 space-y-4 border-l-4 ${isPaid ? "border-amber-500" : "border-blue-500"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPaid ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>
              {isPaid ? "NEW" : "IN KITCHEN"}
            </span>
            <span className="text-zinc-500 text-xs">{timeSince(order.created_at)}</span>
          </div>
          <div className="mt-1 text-white font-bold text-lg font-mono">
            #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
          </div>
        </div>
        <div className="text-right text-xs text-zinc-400">
          <div className="font-medium text-zinc-200">{order.venue_name}</div>
          <div>{order.location_path}</div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-2 text-sm">
            <span className="text-amber-400 font-bold w-6 shrink-0">{item.qty}×</span>
            <span className="text-zinc-200">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Note */}
      {order.customer_note && (
        <div className="bg-zinc-700/50 rounded-xl px-3 py-2 text-xs text-zinc-300">
          <span className="text-zinc-500 mr-1">Note:</span>{order.customer_note}
        </div>
      )}

      {/* Action */}
      <button
        onClick={handleAction}
        disabled={isPending}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${
          isPaid
            ? "bg-blue-600 hover:bg-blue-500 text-white"
            : "bg-green-600 hover:bg-green-500 text-white"
        }`}
      >
        {isPending ? "Updating…" : isPaid ? "Accept & Start Preparing" : "Mark Complete"}
      </button>
    </div>
  );
}

type Props = {
  orders: KitchenOrder[];
  onRefresh: () => Promise<void>;
  onSignOut: () => void;
};

export default function KitchenBoard({ orders, onRefresh, onSignOut }: Props) {
  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(onRefresh, 30_000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  const paid = orders.filter((o) => o.status === "paid");
  const preparing = orders.filter((o) => o.status === "accepted");

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Kitchen Queue</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/kitchen/history"
              className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              History
            </Link>
            <button
              onClick={onRefresh}
              className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={onSignOut}
              className="text-xs text-zinc-500 hover:text-red-400 border border-zinc-700 hover:border-red-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-lg font-medium">All clear — no active orders</p>
          </div>
        )}

        {paid.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-widest">
              New Orders ({paid.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {paid.map((o) => (
                <OrderCard key={o.id} order={o} onAction={onRefresh} />
              ))}
            </div>
          </section>
        )}

        {preparing.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-widest">
              In Progress ({preparing.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {preparing.map((o) => (
                <OrderCard key={o.id} order={o} onAction={onRefresh} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
