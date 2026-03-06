"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

const TIP_PERCENTS = [0, 15, 18, 20];

export default function TipSelector() {
  const { tip_percent, tip_cents, subtotalCents, setTipPercent, setTipCents } = useCart();
  const [customInput, setCustomInput] = useState("");

  return (
    <div className="space-y-3 bg-zinc-800 rounded-xl p-3">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Add a tip</p>

      <div className="flex gap-2">
        {TIP_PERCENTS.map((pct) => (
          <button
            key={pct}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
              tip_percent === pct
                ? "bg-amber-500 text-black"
                : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
            onClick={() => {
              setTipPercent(pct);
              setCustomInput("");
            }}
          >
            {pct === 0 ? "None" : `${pct}%`}
          </button>
        ))}
        <button
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
            tip_percent === null
              ? "bg-amber-500 text-black"
              : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
          }`}
          onClick={() => setTipCents(0)}
        >
          Custom
        </button>
      </div>

      {tip_percent === null && (
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            autoFocus
          />
          <button
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs transition-colors"
            onClick={() => {
              const cents = Math.round(parseFloat(customInput) * 100);
              if (!isNaN(cents) && cents >= 0) setTipCents(cents);
            }}
          >
            Apply
          </button>
        </div>
      )}

      {tip_cents > 0 && (
        <p className="text-xs text-amber-400 text-right">
          +${(tip_cents / 100).toFixed(2)} tip
          {tip_percent !== null && tip_percent > 0 && subtotalCents > 0 && ` · ${tip_percent}%`}
        </p>
      )}
    </div>
  );
}
