"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import CartDrawer from "./CartDrawer";

export default function CartTest() {
  const { itemCount, addItem, clearCart } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Demo add buttons */}
      <div className="p-4 flex gap-2 flex-wrap">
        <button
          className="border px-3 py-2 rounded"
          onClick={() =>
            addItem({ menu_item_id: "beer-1", name: "Beer", price_cents: 700, image_url: null })
          }
        >
          Add Beer
        </button>
        <button
          className="border px-3 py-2 rounded"
          onClick={() =>
            addItem({ menu_item_id: "nachos-1", name: "Nachos", price_cents: 900, image_url: null })
          }
        >
          Add Nachos
        </button>
        <button className="border px-3 py-2 rounded" onClick={clearCart}>
          Clear Cart
        </button>
      </div>

      {/* Floating cart button */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open cart"
      >
        <span className="text-2xl">🛒</span>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
