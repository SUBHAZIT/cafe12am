import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import CustomerNav from "@/components/customer/CustomerNav";
import { ShoppingBag, Sparkles, Plus, Minus, Trash2, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import foodBurger from "@/assets/food-burger.png";

const CartPage = () => {
  const { items, addItem, removeItem, cartCount, subtotal, appliedCoupon, applyCoupon, removeCoupon, discount, total } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);

  const cartItems = Object.values(items);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        toast({ title: "Invalid coupon", description: "This coupon code doesn't exist or is expired", variant: "destructive" });
        setApplying(false);
        return;
      }

      if (data.usage_limit && data.used_count >= data.usage_limit) {
        toast({ title: "Coupon expired", description: "This coupon has reached its usage limit", variant: "destructive" });
        setApplying(false);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({ title: "Coupon expired", description: "This coupon has expired", variant: "destructive" });
        setApplying(false);
        return;
      }

      applyCoupon({
        id: data.id,
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        max_discount: data.max_discount,
        min_order_amount: data.min_order_amount,
      });
      setCouponCode("");
    } catch {
      toast({ title: "Error", description: "Failed to apply coupon", variant: "destructive" });
    }
    setApplying(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerNav />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight mb-8">YOUR CART</h1>
          <div className="text-center py-16 bg-card rounded-3xl shadow-card relative overflow-hidden">
            <div className="absolute top-4 right-4 w-3 h-3 rotate-45 border border-primary/20" />
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground uppercase tracking-wider font-heading font-bold">YOUR CART IS EMPTY</p>
            <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">ADD ITEMS FROM THE MENU TO GET STARTED</p>
            <Link to="/order">
              <Button className="mt-6 rounded-full font-heading font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 mr-2" /> BROWSE MENU
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <CustomerNav cartCount={cartCount} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight mb-6">YOUR CART</h1>

        {/* Cart items */}
        <div className="space-y-3 mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-4">
              <img src={item.image_url || foodBurger} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-foreground truncate">{item.name}</h3>
                <p className="font-heading text-primary font-bold">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2 bg-primary rounded-full">
                <button onClick={() => removeItem(item.id)} className="p-2 text-primary-foreground hover:opacity-80">
                  {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </button>
                <span className="text-primary-foreground font-heading font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                <button onClick={() => addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url })} className="p-2 text-primary-foreground hover:opacity-80">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon section */}
        <div className="bg-card rounded-2xl p-4 shadow-card mb-6">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" /> APPLY COUPON
          </h3>
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-primary/10 rounded-xl p-3 border border-dashed border-primary/30">
              <div>
                <p className="font-heading font-bold text-sm text-primary uppercase tracking-wider">{appliedCoupon.code}</p>
                <p className="text-xs text-muted-foreground">You save ₹{discount.toFixed(0)}</p>
              </div>
              <button onClick={removeCoupon} className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors">
                <X className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="font-heading uppercase tracking-wider text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              />
              <Button onClick={handleApplyCoupon} disabled={applying} className="rounded-xl font-heading font-bold uppercase tracking-wider text-xs shrink-0">
                {applying ? "..." : "APPLY"}
              </Button>
            </div>
          )}
        </div>

        {/* Bill summary */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-4">BILL SUMMARY</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase tracking-wide">Subtotal</span>
              <span className="font-heading font-bold text-foreground">₹{subtotal.toFixed(0)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary">
                <span className="uppercase tracking-wide">Coupon Discount</span>
                <span className="font-heading font-bold">-₹{discount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase tracking-wide">Delivery Fee</span>
              <span className="font-heading font-bold text-foreground">₹30</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-heading font-bold uppercase tracking-wider text-foreground">Total</span>
              <span className="font-heading font-bold text-lg text-primary">₹{(total + 30).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <button className="max-w-lg mx-auto flex items-center justify-between bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow w-full">
          <p className="font-heading font-bold text-sm uppercase tracking-wider">₹{(total + 30).toFixed(0)}</p>
          <span className="font-heading font-bold uppercase tracking-wider text-sm">PLACE ORDER →</span>
        </button>
      </div>
    </div>
  );
};

export default CartPage;
