import { createServerClient } from "@/src/lib/supabase/serverClient";
import EmailCapture from "./EmailCapture";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

type StatusInfo = {
  label: string;
  description: string;
  icon: string;
  color: string;
};

const STATUS_MAP: Record<string, StatusInfo> = {
  pending_payment: {
    label: "Awaiting Payment",
    description: "We haven't received your payment yet.",
    icon: "⏳",
    color: "text-yellow-400",
  },
  paid: {
    label: "Kitchen is Working on It",
    description: "Your payment was confirmed. The kitchen is preparing your order.",
    icon: "👨‍🍳",
    color: "text-amber-400",
  },
  accepted: {
    label: "Kitchen Accepted Your Order",
    description: "The kitchen has accepted your order and is preparing it now.",
    icon: "🍳",
    color: "text-amber-400",
  },
  preparing: {
    label: "Preparing Your Order",
    description: "The kitchen is preparing your order now.",
    icon: "🍳",
    color: "text-amber-400",
  },
  completed: {
    label: "Your order is Ready 🎉",
    description: "",
    icon: "🎉",
    color: "text-green-400",
  },
  cancelled: {
    label: "Order Cancelled",
    description: "This order was cancelled.",
    icon: "❌",
    color: "text-red-400",
  },
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
    " · " +
    d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
  );
}

export default async function OrderPage({ params }: PageProps) {
  const { orderId } = await params;
  const supabase = createServerClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      currency,
      subtotal_cents,
      tax_cents,
      tip_cents,
      total_cents,
      created_at,
      completed_at,
      customer_note,
      order_items (
        id,
        name_snapshot,
        qty,
        unit_price_cents_snapshot,
        line_total_cents
      )
    `)
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center px-6">
        <div className="text-center space-y-3">
          <div className="text-4xl">❌</div>
          <h1 className="text-xl font-bold">Order Not Found</h1>
          <p className="text-zinc-400 text-sm">We couldn&apos;t find that order.</p>
          {error && (
            <p className="text-red-400 text-xs font-mono mt-2">{error.message} (code: {error.code})</p>
          )}
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[order.status] ?? {
    label: order.status,
    description: "",
    icon: "📋",
    color: "text-zinc-300",
  };

  const items = (order.order_items ?? []) as {
    id: string;
    name_snapshot: string;
    qty: number;
    unit_price_cents_snapshot: number;
    line_total_cents: number;
  }[];

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-md mx-auto px-4 py-8 space-y-4">

        {/* Status card */}
        <div className="bg-zinc-800 rounded-2xl p-6 text-center space-y-2">
          <div className="text-5xl">{statusInfo.icon}</div>
          <h1 className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.label}</h1>
          <p className="text-zinc-400 text-sm">{statusInfo.description}</p>
        </div>

        {/* Order items */}
        {items.length > 0 && (
          <div className="bg-zinc-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Items</h2>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-zinc-300">
                    <span className="text-zinc-500 mr-1">{item.qty}×</span>
                    {item.name_snapshot}
                  </span>
                  <span className="text-zinc-400">${(item.line_total_cents / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="bg-zinc-800 rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>Order #</span>
              <span className="font-bold text-white">{order.order_number ?? "—"}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Placed</span>
              <span className="text-zinc-300">{formatTime(order.created_at)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Completed at</span>
              {order.completed_at ? (
                <span className="text-green-400">{formatTime(order.completed_at)}</span>
              ) : (
                <span className="text-zinc-500 italic">Still working on it…</span>
              )}
            </div>
            <div className="h-px bg-zinc-700" />
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span className="text-zinc-200">${(order.subtotal_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Tax</span>
              <span className="text-zinc-200">${(order.tax_cents / 100).toFixed(2)}</span>
            </div>
            {order.tip_cents > 0 && (
              <div className="flex justify-between text-zinc-400">
                <span>Tip</span>
                <span className="text-amber-400">${(order.tip_cents / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-zinc-700 text-white">
              <span>Total</span>
              <span>${(order.total_cents / 100).toFixed(2)}</span>
            </div>
          </div>
          {order.customer_note && (
            <div className="pt-1">
              <p className="text-xs text-zinc-500">Note: {order.customer_note}</p>
            </div>
          )}
        </div>

        {/* Email + copy link */}
        <EmailCapture orderId={order.id} />
      </div>
    </div>
  );
}
