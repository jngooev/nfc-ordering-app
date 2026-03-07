"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase/client";
import { getVenueAccess } from "../actions";
import HistoryBoard from "./HistoryBoard";

export default function HistoryGate() {
  const router = useRouter();
  const [venueIds, setVenueIds] = useState<string[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/kitchen");
        return;
      }
      const { venueIds: ids } = await getVenueAccess(session.user.id);
      if (ids.length === 0) {
        router.replace("/kitchen");
        return;
      }
      setVenueIds(ids);
    })();
  }, [router]);

  if (venueIds === null) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading…</div>
      </div>
    );
  }

  return <HistoryBoard venueIds={venueIds} />;
}
