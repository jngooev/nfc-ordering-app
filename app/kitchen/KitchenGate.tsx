"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase/client";
import { getVenueAccess, fetchKitchenOrders, type KitchenOrder } from "./actions";
import KitchenBoard from "./KitchenBoard";

type View = "checking" | "login" | "denied" | "board";

export default function KitchenGate() {
  const [view, setView] = useState<View>("checking");
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [venueIds, setVenueIds] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const loadOrders = async (ids: string[]) => {
    const result = await fetchKitchenOrders(ids);
    setOrders(result.orders ?? []);
  };

  const checkAccessAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setView("login");
      return;
    }

    const { venueIds: ids } = await getVenueAccess(session.user.id);

    if (ids.length === 0) {
      setView("denied");
      return;
    }

    setVenueIds(ids);
    await loadOrders(ids);
    setView("board");
  };

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      setLoginLoading(false);
      return;
    }

    setView("checking");
    await checkAccessAndLoad();
    setLoginLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setView("login");
    setEmail("");
    setPassword("");
  };

  if (view === "checking") {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading…</div>
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="text-4xl">🍳</div>
            <h1 className="text-2xl font-bold text-white">Kitchen Login</h1>
            <p className="text-zinc-400 text-sm">Staff access only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl placeholder-zinc-500 outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl placeholder-zinc-500 outline-none focus:ring-2 focus:ring-amber-500"
            />
            {loginError && (
              <p className="text-red-400 text-xs">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold rounded-xl text-sm transition-colors"
            >
              {loginLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === "denied") {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="text-4xl">🚫</div>
          <h1 className="text-xl font-bold text-white">Access Denied</h1>
          <p className="text-zinc-400 text-sm">Your account is not linked to any active venue.</p>
          <button
            onClick={handleSignOut}
            className="text-sm text-zinc-500 underline hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <KitchenBoard
      orders={orders}
      onRefresh={() => loadOrders(venueIds)}
      onSignOut={handleSignOut}
    />
  );
}
