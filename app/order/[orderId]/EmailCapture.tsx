"use client";

import { useState } from "react";
import { saveOrderEmail } from "./actions";

type Props = {
  orderId: string;
};

export default function EmailCapture({ orderId }: Props) {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await saveOrderEmail(orderId, email);
    setLoading(false);
    if (result.success) {
      setSaved(true);
    } else {
      setError(result.error ?? "Failed to save email");
    }
  };

  return (
    <div className="bg-zinc-800 rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Track Your Order</h2>

      {/* Copy link */}
      <div>
        <p className="text-zinc-400 text-xs mb-2">Bookmark or share this link to check back anytime:</p>
        <button
          className="w-full py-2.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm rounded-xl transition-colors"
          onClick={handleCopy}
        >
          {copied ? "✓ Copied!" : "Copy Order Link"}
        </button>
      </div>

      <div className="h-px bg-zinc-700" />

      {/* Email save */}
      {saved ? (
        <div className="text-center space-y-1">
          <p className="text-green-400 text-sm font-medium">Email saved</p>
          <p className="text-zinc-500 text-xs">{email}</p>
          <button className="text-zinc-500 text-xs underline mt-1" onClick={() => setSaved(false)}>
            Change
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-3">
          <p className="text-zinc-400 text-xs">Save your email to track this order later:</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-2.5 bg-zinc-700 text-white text-sm rounded-xl placeholder-zinc-500 outline-none focus:ring-2 focus:ring-amber-500"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold rounded-xl text-sm transition-colors"
          >
            {loading ? "Saving…" : "Save Email"}
          </button>
        </form>
      )}
    </div>
  );
}
