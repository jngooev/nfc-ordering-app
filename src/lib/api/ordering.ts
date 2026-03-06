import { supabase } from "@/src/lib/supabase/client";

export type OrderingVenue = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export type OrderingLocation = {
  id: string;
  venue_id: string;
  parent_id: string | null;
  display_name: string;
  code: string;
  type: string;
  is_active: boolean;
};

export type OrderingMenuItem = {
  id: string;
  venue_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  image_url: string | null;
  is_active: boolean;
};

export async function fetchOrderingContext(
  venueSlug: string,
  locationId: string
): Promise<{ venue: OrderingVenue; location: OrderingLocation; menuItems: OrderingMenuItem[] }> {
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("id, name, slug, is_active")
    .eq("slug", venueSlug)
    .single<OrderingVenue>();

  if (venueError) {
    throw new Error(`Venue query error: ${venueError.message} (code: ${venueError.code})`);
  }
  if (!venue) {
    throw new Error(`Venue not found for slug: "${venueSlug}"`);
  }

  if (!venue.is_active) {
    throw new Error("Venue is inactive");
  }

  const { data: location, error: locationError } = await supabase
    .from("locations")
    .select("id, venue_id, parent_id, display_name, code, type, is_active")
    .eq("id", locationId)
    .single<OrderingLocation>();

  if (locationError) {
    throw new Error(`Location query error: ${locationError.message} (code: ${locationError.code})`);
  }
  if (!location) {
    throw new Error(`Location not found for id: "${locationId}"`);
  }

  if (!location.is_active) {
    throw new Error("Location is inactive");
  }

  if (location.venue_id !== venue.id) {
    throw new Error("Location does not belong to venue");
  }

  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select(`
      id,
      venue_id,
      category_id,
      name,
      description,
      price_cents,
      currency,
      image_url,
      is_active
    `)
    .eq("venue_id", venue.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (menuError) {
    throw new Error(`Menu items query error: ${menuError.message} (code: ${menuError.code})`);
  }

  return {
    venue,
    location,
    menuItems: (menuItems ?? []) as OrderingMenuItem[],
  };
}