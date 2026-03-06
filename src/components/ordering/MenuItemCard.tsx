"use client";

import Image from "next/image";
import { useCart } from "./CartProvider";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
};

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { addItem, items } = useCart();

  const inCart = items.find((i) => i.menu_item_id === item.id);

  return (
    <div className="bg-zinc-800 rounded-2xl overflow-hidden flex flex-col">
      {item.image_url ? (
        <div className="relative w-full h-36">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-36 bg-zinc-700 flex items-center justify-center text-3xl">
          🍽️
        </div>
      )}

      <div className="p-3 flex flex-col flex-1 gap-1">
        <p className="font-semibold text-white text-sm leading-snug">{item.name}</p>
        {item.description && (
          <p className="text-zinc-400 text-xs leading-snug line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-amber-400 font-bold text-sm">
            ${(item.price_cents / 100).toFixed(2)}
          </span>
          <button
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            onClick={() =>
              addItem({
                menu_item_id: item.id,
                name: item.name,
                price_cents: item.price_cents,
                image_url: item.image_url,
              })
            }
          >
            {inCart ? `In cart (${inCart.qty})` : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
