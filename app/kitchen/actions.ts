"use server";

import { createServerClient } from "@/src/lib/supabase/serverClient";

type RawLocation = {
  id: string;
  parent_id: string | null;
  display_name: string;
  venue_id: string;
};

function buildPath(allLocs: RawLocation[], locationId: string): string {
  const map = new Map(allLocs.map((l) => [l.id, l]));
  const parts: string[] = [];
  let current = map.get(locationId);
  while (current) {
    parts.unshift(current.display_name);
    current = current.parent_id ? map.get(current.parent_id) : undefined;
  }
  return parts.join(" › ");
}

export type KitchenOrder = {
  id: string;
  order_number: string | null;
  status: string;
  created_at: string;
  customer_note: string | null;
  venue_name: string;
  location_path: string;
  items: { id: string; name: string; qty: number }[];
};

export async function getVenueAccess(userId: string): Promise<{ venueIds: string[] }> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("venue_users")
    .select("venue_id")
    .eq("user_id", userId)
    .eq("is_active", true);
  return { venueIds: (data ?? []).map((r) => r.venue_id as string) };
}

export async function fetchKitchenOrders(venueIds: string[]): Promise<{ orders?: KitchenOrder[]; error?: string }> {
  if (venueIds.length === 0) return { orders: [] };

  const supabase = createServerClient();

  // orders has venue_id directly — no need to resolve through locations
  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      created_at,
      customer_note,
      location_id,
      order_items ( id, name_snapshot, qty ),
      locations ( id, display_name, parent_id, venue_id,
        venues ( id, name )
      )
    `)
    .in("status", ["paid", "accepted"])
    .in("venue_id", venueIds)
    .order("created_at", { ascending: true });

  if (error) return { error: error.message };

  // Build location paths using all locations for these venues
  const { data: allLocs } = await supabase
    .from("locations")
    .select("id, parent_id, display_name, venue_id")
    .in("venue_id", venueIds);
  const allLocations = (allLocs ?? []) as RawLocation[];

  const orders: KitchenOrder[] = (rawOrders ?? []).map((o) => {
    const loc = o.locations as unknown as {
      id: string;
      display_name: string;
      venue_id: string;
      venues: { name: string } | null;
    } | null;
    const items = (o.order_items ?? []) as { id: string; name_snapshot: string; qty: number }[];

    return {
      id: o.id,
      order_number: o.order_number as string | null,
      status: o.status,
      created_at: o.created_at,
      customer_note: o.customer_note as string | null,
      venue_name: loc?.venues?.name ?? "Unknown Venue",
      location_path: o.location_id ? buildPath(allLocations, o.location_id) : (loc?.display_name ?? "—"),
      items: items.map((i) => ({ id: i.id, name: i.name_snapshot, qty: i.qty })),
    };
  });

  return { orders };
}

export type HistoryFilter = "last_hour" | "last_6h" | "today" | "this_week";

export type CompletedOrder = {
  id: string;
  order_number: string | null;
  completed_at: string;
  customer_note: string | null;
  venue_name: string;
  location_path: string;
  subtotal_cents: number;
  tax_cents: number;
  tip_cents: number;
  total_cents: number;
  items: { id: string; name: string; qty: number }[];
};

function getFilterCutoff(filter: HistoryFilter): Date {
  const now = new Date();
  switch (filter) {
    case "last_hour": return new Date(now.getTime() - 60 * 60 * 1000);
    case "last_6h":   return new Date(now.getTime() - 6 * 60 * 60 * 1000);
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "this_week": {
      const d = new Date(now);
      const day = d.getDay();
      d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
}

export async function fetchCompletedOrders(
  venueIds: string[],
  filter: HistoryFilter
): Promise<{ orders?: CompletedOrder[]; error?: string }> {
  if (venueIds.length === 0) return { orders: [] };

  const supabase = createServerClient();
  const cutoff = getFilterCutoff(filter);

  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      completed_at,
      customer_note,
      location_id,
      subtotal_cents,
      tax_cents,
      tip_cents,
      total_cents,
      order_items ( id, name_snapshot, qty ),
      locations ( id, display_name, parent_id, venue_id,
        venues ( id, name )
      )
    `)
    .eq("status", "completed")
    .in("venue_id", venueIds)
    .gte("completed_at", cutoff.toISOString())
    .order("completed_at", { ascending: false });

  if (error) return { error: error.message };

  const { data: allLocs } = await supabase
    .from("locations")
    .select("id, parent_id, display_name, venue_id")
    .in("venue_id", venueIds);
  const allLocations = (allLocs ?? []) as RawLocation[];

  const orders: CompletedOrder[] = (rawOrders ?? []).map((o) => {
    const loc = o.locations as unknown as {
      display_name: string;
      venue_id: string;
      venues: { name: string } | null;
    } | null;
    const items = (o.order_items ?? []) as { id: string; name_snapshot: string; qty: number }[];

    return {
      id: o.id,
      order_number: o.order_number as string | null,
      completed_at: o.completed_at as string,
      customer_note: o.customer_note as string | null,
      venue_name: loc?.venues?.name ?? "Unknown Venue",
      location_path: o.location_id ? buildPath(allLocations, o.location_id) : (loc?.display_name ?? "—"),
      subtotal_cents: o.subtotal_cents,
      tax_cents: o.tax_cents,
      tip_cents: o.tip_cents,
      total_cents: o.total_cents,
      items: items.map((i) => ({ id: i.id, name: i.name_snapshot, qty: i.qty })),
    };
  });

  return { orders };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: "accepted" | "completed"
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();

  const updates: Record<string, unknown> = { status: newStatus };
  if (newStatus === "accepted") {
    updates.accepted_at = new Date().toISOString();
  } else if (newStatus === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
