"use client";

import { CartItem, useCart } from "./CartProvider";

export default function CartItemRow({ item }: { item: CartItem }) {
  const { increaseQty, decreaseQty, removeItem } = useCart();

  return (
    <div className="flex items-center gap-3 bg-zinc-800 rounded-xl px-3 py-3">
      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{item.name}</p>
        <p className="text-xs text-zinc-400 mt-0.5">${(item.price_cents / 100).toFixed(2)} each</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1.5">
        <button
          className="w-7 h-7 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white flex items-center justify-center text-base leading-none transition-colors"
          onClick={() => decreaseQty(item.menu_item_id)}
        >
          −
        </button>
        <span className="w-5 text-center text-white font-medium text-sm">{item.qty}</span>
        <button
          className="w-7 h-7 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white flex items-center justify-center text-base leading-none transition-colors"
          onClick={() => increaseQty(item.menu_item_id)}
        >
          +
        </button>
      </div>

      {/* Line total */}
      <p className="w-14 text-right font-semibold text-amber-400 text-sm">
        ${((item.price_cents * item.qty) / 100).toFixed(2)}
      </p>

      {/* Remove */}
      <button
        className="text-zinc-600 hover:text-red-400 text-sm transition-colors"
        onClick={() => removeItem(item.menu_item_id)}
      >
        ✕
      </button>
    </div>
  );
}
