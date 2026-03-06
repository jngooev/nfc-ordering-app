"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import MenuItemCard from "./MenuItemCard";
import CartDrawer from "./CartDrawer";
import type {
  OrderingVenue,
  OrderingLocation,
  OrderingMenuItem,
} from "@/src/lib/api/ordering";

type Props = {
  venue: OrderingVenue;
  location: OrderingLocation;
  menuItems: OrderingMenuItem[];
};

export default function CartTest({ venue, location, menuItems }: Props) {
  const { itemCount } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <h1 className="text-xl font-bold leading-tight">{venue.name}</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          {location.display_name} · {location.type}
        </p>
      </div>

      {/* Menu grid */}
      <div className="px-4 py-4 pb-24">
        {menuItems.length === 0 ? (
          <p className="text-zinc-500 text-sm mt-8 text-center">No menu items available.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {menuItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Floating cart button */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-amber-500 hover:bg-amber-400 text-black rounded-full shadow-lg flex items-center justify-center transition-colors"
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
    </div>
  );
}
