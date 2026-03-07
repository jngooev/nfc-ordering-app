/* eslint-disable react-hooks/error-boundaries */
import CartTest from "@/src/components/ordering/CartTest";
import { CartProvider } from "@/src/components/ordering/CartProvider";
import { fetchOrderingContext } from "@/src/lib/api/ordering";

type PageProps = {
  params: Promise<{
    venueSlug: string;
    locationId: string;
  }>;
};

export default async function LocationPage({ params }: PageProps) {
  const { venueSlug, locationId } = await params;

  try {
    const { venue, location, locationPath, menuItems } = await fetchOrderingContext(
      venueSlug,
      locationId
    );

    return (
      <CartProvider>
        <CartTest
          venue={venue}
          location={location}
          locationPath={locationPath}
          menuItems={menuItems}
        />
      </CartProvider>
    );
  } catch (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Unable to load ordering page</h1>
        <p className="mt-2 text-sm text-red-600">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}
