import CartTest from "@/src/components/ordering/CartTest";
import { CartProvider } from "@/src/components/ordering/CartProvider";

export default function HomePage() {
  return (
    <CartProvider>
      <CartTest />
    </CartProvider>
  );
}