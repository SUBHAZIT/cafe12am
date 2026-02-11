import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  quantity: number;
}

interface AppliedCoupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_discount: number | null;
  min_order_amount: number;
}

interface CartContextType {
  items: Record<string, CartItem>;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  discount: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Record<string, CartItem>>({});
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + 1,
      },
    }));
    toast({ title: "Added to cart!", description: "Item added successfully" });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const newItems = { ...prev };
      if (newItems[id]?.quantity > 1) {
        newItems[id] = { ...newItems[id], quantity: newItems[id].quantity - 1 };
      } else {
        delete newItems[id];
      }
      return newItems;
    });
  };

  const clearCart = () => {
    setItems({});
    setAppliedCoupon(null);
  };

  const cartCount = Object.values(items).reduce((a, b) => a + b.quantity, 0);
  const subtotal = Object.values(items).reduce((a, b) => a + b.price * b.quantity, 0);

  const discount = appliedCoupon
    ? (() => {
        if (subtotal < appliedCoupon.min_order_amount) return 0;
        if (appliedCoupon.discount_type === "percentage") {
          const d = (subtotal * appliedCoupon.discount_value) / 100;
          return appliedCoupon.max_discount ? Math.min(d, appliedCoupon.max_discount) : d;
        }
        return appliedCoupon.discount_value;
      })()
    : 0;

  const total = Math.max(0, subtotal - discount);

  const applyCoupon = (coupon: AppliedCoupon) => {
    if (subtotal < coupon.min_order_amount) {
      toast({
        title: "Cannot apply coupon",
        description: `Minimum order ₹${coupon.min_order_amount} required`,
        variant: "destructive",
      });
      return;
    }
    setAppliedCoupon(coupon);
    toast({ title: "Coupon applied!", description: `${coupon.code} applied successfully` });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({ title: "Coupon removed" });
  };

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, cartCount, subtotal, appliedCoupon, applyCoupon, removeCoupon, discount, total }}
    >
      {children}
    </CartContext.Provider>
  );
};
