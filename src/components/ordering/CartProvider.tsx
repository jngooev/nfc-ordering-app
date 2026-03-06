"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

const TAX_RATE = 0.1025;

export type CartItem = {
  menu_item_id: string;
  name: string;
  price_cents: number;
  qty: number;
  image_url?: string | null;
};

type TipSelection =
  | { type: "percent"; pct: number }
  | { type: "custom"; cents: number };

type CartContextType = {
  items: CartItem[];
  tip_cents: number;
  tip_percent: number | null;

  addItem: (item: Omit<CartItem, "qty">) => void;
  increaseQty: (menu_item_id: string) => void;
  decreaseQty: (menu_item_id: string) => void;
  removeItem: (menu_item_id: string) => void;
  clearCart: () => void;
  setTipPercent: (pct: number) => void;
  setTipCents: (cents: number) => void;

  itemCount: number;
  subtotalCents: number;
  estimatedTaxCents: number;
  estimatedTotalCents: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tipSelection, setTipSelection] = useState<TipSelection>({ type: "percent", pct: 0 });

  const addItem = (item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const existing = prev.find(
        (cartItem) => cartItem.menu_item_id === item.menu_item_id
      );

      if (existing) {
        return prev.map((cartItem) =>
          cartItem.menu_item_id === item.menu_item_id
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  };

  const increaseQty = (menu_item_id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.menu_item_id === menu_item_id
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    );
  };

  const decreaseQty = (menu_item_id: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.menu_item_id === menu_item_id
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (menu_item_id: string) => {
    setItems((prev) =>
      prev.filter((item) => item.menu_item_id !== menu_item_id)
    );
  };

  const clearCart = () => {
    setItems([]);
    setTipSelection({ type: "percent", pct: 0 });
  };

  const setTipPercent = (pct: number) => {
    if (pct < 0) return;
    setTipSelection({ type: "percent", pct });
  };

  const setTipCents = (cents: number) => {
    if (!Number.isInteger(cents) || cents < 0) return;
    setTipSelection({ type: "custom", cents });
  };

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.qty, 0);
  }, [items]);

  const subtotalCents = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price_cents * item.qty, 0);
  }, [items]);

  const estimatedTaxCents = useMemo(() => {
    return Math.round(subtotalCents * TAX_RATE);
  }, [subtotalCents]);

  const tip_cents = useMemo(() => {
    if (tipSelection.type === "percent") {
      return Math.round(subtotalCents * tipSelection.pct / 100);
    }
    return tipSelection.cents;
  }, [tipSelection, subtotalCents]);

  const tip_percent = tipSelection.type === "percent" ? tipSelection.pct : null;

  const estimatedTotalCents = useMemo(() => {
    return subtotalCents + estimatedTaxCents + tip_cents;
  }, [subtotalCents, estimatedTaxCents, tip_cents]);

  const value = useMemo(
    () => ({
      items,
      tip_cents,
      tip_percent,
      addItem,
      increaseQty,
      decreaseQty,
      removeItem,
      clearCart,
      setTipPercent,
      setTipCents,
      itemCount,
      subtotalCents,
      estimatedTaxCents,
      estimatedTotalCents,
    }),
    [items, tip_cents, tip_percent, itemCount, subtotalCents, estimatedTaxCents, estimatedTotalCents]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }

  return context;
}
