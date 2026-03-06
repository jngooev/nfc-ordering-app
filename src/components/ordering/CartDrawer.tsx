"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import CartItemRow from "./CartItemRow";
import TipSelector from "./TipSelector";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: Props) {
  const {
    items,
    subtotalCents,
    estimatedTaxCents,
    tip_cents,
    estimatedTotalCents,
  } = useCart();

  const [atCheckout, setAtCheckout] = useState(false);

  const handleClose = () => {
    setAtCheckout(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={handleClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-88 max-w-[92vw] bg-zinc-900 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-700">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Your Order</h2>
            {items.length > 0 && (
              <p className="text-xs text-zinc-400 mt-0.5">
                {items.reduce((s, i) => s + i.qty, 0)} item{items.reduce((s, i) => s + i.qty, 0) !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 pb-10">
              <span className="text-4xl">🛒</span>
              <p className="text-zinc-500 text-sm">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <CartItemRow key={item.menu_item_id} item={item} />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-zinc-700 space-y-4">
            {/* Tip (only at checkout step) */}
            {atCheckout && <TipSelector />}

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-200">${(subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tax (est.)</span>
                <span className="text-zinc-200">${(estimatedTaxCents / 100).toFixed(2)}</span>
              </div>
              {tip_cents > 0 && (
                <div className="flex justify-between text-zinc-400">
                  <span>Tip</span>
                  <span className="text-amber-400">${(tip_cents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-zinc-700 text-white">
                <span>Total</span>
                <span>${(estimatedTotalCents / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Action button */}
            {atCheckout ? (
              <button className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-base tracking-wide transition-colors">
                Place Order →
              </button>
            ) : (
              <button
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-base tracking-wide transition-colors"
                onClick={() => setAtCheckout(true)}
              >
                Checkout →
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
