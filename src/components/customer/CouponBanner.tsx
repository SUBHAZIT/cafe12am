import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tag, Copy, Check, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
}

const CouponBanner = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      const { data } = await supabase
        .from("coupons")
        .select("id, code, description, discount_type, discount_value, min_order_amount, max_discount")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data) setCoupons(data);
    };
    fetchCoupons();
  }, []);

  const copyCode = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    toast({ title: "Code copied!", description: `Use ${coupon.code} at checkout` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (coupons.length === 0) return null;

  const formatDiscount = (c: Coupon) => {
    if (c.discount_type === "percentage") {
      return `${c.discount_value}% off`;
    }
    return `Flat ₹${c.discount_value} off`;
  };

  const formatCondition = (c: Coupon) => {
    const parts: string[] = [];
    if (c.min_order_amount > 0) parts.push(`Min order ₹${c.min_order_amount}`);
    if (c.discount_type === "percentage" && c.max_discount) parts.push(`save up to ₹${c.max_discount}`);
    if (c.discount_type === "flat") parts.push(`save ₹${c.discount_value}`);
    return parts.join(" · ") || "No minimum";
  };

  return (
    <section className="px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
            Coupons for you
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {coupons.map((coupon) => (
            <button
              key={coupon.id}
              onClick={() => copyCode(coupon)}
              className="flex-shrink-0 w-[320px] bg-card rounded-2xl p-4 shadow-card hover:shadow-soft transition-all duration-300 flex items-center gap-3 text-left group border border-border/50"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-sm text-foreground uppercase tracking-wide truncate">
                  {formatDiscount(coupon)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {coupon.description || formatCondition(coupon)}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] font-bold font-heading tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-dashed border-primary/30">
                    {coupon.code}
                  </span>
                  {copiedId === coupon.id ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CouponBanner;
