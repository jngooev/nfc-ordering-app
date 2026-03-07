"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchCompletedOrders, type CompletedOrder, type HistoryFilter } from "../actions";

const FILTERS: { value: HistoryFilter; label: string }[] = [
  { value: "last_hour",  label: "Last Hour" },
  { value: "last_6h",   label: "Last 6 Hours" },
  { value: "today",     label: "Today" },
  { value: "this_week", label: "This Week" },
];

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
    " · " +
    d.toLocaleDateString([], { month: "short", day: "numeric" })
  );
}

function fmt(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

function OrderRow({ order }: { order: CompletedOrder }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-zinc-800 rounded-2xl overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-green-400 font-bold font-mono text-sm shrink-0">
            #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="text-zinc-400 text-xs truncate">{order.location_path}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-white font-bold text-sm">{fmt(order.total_cents)}</span>
          <span className="text-zinc-500 text-xs">{order.completed_at ? formatTime(order.completed_at) : "—"}</span>
          <span className="text-zinc-500 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-4 space-y-3 border-t border-zinc-700">
          <div className="pt-3 space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-2 text-sm">
                <span className="text-amber-400 font-bold w-6 shrink-0">{item.qty}×</span>
                <span className="text-zinc-200">{item.name}</span>
              </div>
            ))}
          </div>
          {order.customer_note && (
            <div className="bg-zinc-700/50 rounded-xl px-3 py-2 text-xs text-zinc-300">
              <span className="text-zinc-500 mr-1">Note:</span>{order.customer_note}
            </div>
          )}
          <div className="space-y-1 text-xs text-zinc-400 pt-1 border-t border-zinc-700">
            <div className="flex justify-between"><span>Subtotal</span><span>{fmt(order.subtotal_cents)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{fmt(order.tax_cents)}</span></div>
            {order.tip_cents > 0 && (
              <div className="flex justify-between"><span>Tip</span><span className="text-amber-400">{fmt(order.tip_cents)}</span></div>
            )}
            <div className="flex justify-between font-bold text-white text-sm pt-1 border-t border-zinc-700">
              <span>Total</span><span>{fmt(order.total_cents)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type Props = {
  venueIds: string[];
};

export default function HistoryBoard({ venueIds }: Props) {
  const [filter, setFilter] = useState<HistoryFilter>("today");
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (f: HistoryFilter) => {
    setLoading(true);
    setError(null);
    const result = await fetchCompletedOrders(venueIds, f);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOrders(result.orders ?? []);
    }
  };

  useEffect(() => { load(filter); }, []);

  const handleFilter = (f: HistoryFilter) => {
    setFilter(f);
    load(f);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_cents, 0);

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Order History</h1>
            {!loading && (
              <p className="text-zinc-500 text-sm mt-0.5">
                {orders.length} order{orders.length !== 1 ? "s" : ""} · {fmt(totalRevenue)}
              </p>
            )}
          </div>
          <Link
            href="/kitchen"
            className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            ← Kitchen
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-amber-500 text-black"
                  : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div className="text-center py-16 text-zinc-500 text-sm">Loading…</div>
        )}
        {error && (
          <div className="text-center py-16 text-red-400 text-sm font-mono">{error}</div>
        )}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <div className="text-4xl mb-3">📭</div>
            <p>No completed orders in this period</p>
          </div>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
