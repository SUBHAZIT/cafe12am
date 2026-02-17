import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Zap, ChevronRight, Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CouponBanner from "./CouponBanner";

interface Combo {
  id: string;
  name: string;
  description: string | null;
  combo_price: number;
  image_url: string | null;
  combo_items: {
    id: string;
    quantity: number;
    menu_items: { name: string; price: number } | null;
  }[];
}

const ComboBanner = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchCombos = async () => {
      const { data } = await supabase
        .from("combos")
        .select("id, name, description, combo_price, image_url, combo_items(id, quantity, menu_items(name, price))")
        .eq("is_available", true)
        .order("created_at", { ascending: false });
      if (data) setCombos(data as any);
    };
    fetchCombos();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (combos.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % combos.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [combos.length]);

  useEffect(() => {
    if (scrollRef.current && combos.length > 0) {
      const card = scrollRef.current.children[activeIndex] as HTMLElement;
      if (card) {
        scrollRef.current.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
      }
    }
  }, [activeIndex, combos.length]);

  if (combos.length === 0) return <CouponBanner />;

  const getOriginalPrice = (combo: Combo) => {
    return combo.combo_items?.reduce(
      (sum, ci) => sum + (ci.menu_items?.price || 0) * ci.quantity,
      0
    ) || 0;
  };

  const getSavings = (combo: Combo) => {
    const original = getOriginalPrice(combo);
    return original > combo.combo_price ? original - combo.combo_price : 0;
  };

  const getItemNames = (combo: Combo) => {
    return combo.combo_items
      ?.map((ci) => `${ci.quantity > 1 ? ci.quantity + "x " : ""}${ci.menu_items?.name || ""}`)
      .filter(Boolean)
      .join(" + ") || "";
  };

  const gradients = [
    "from-orange-500 via-red-500 to-pink-500",
    "from-emerald-500 via-teal-500 to-cyan-500",
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-amber-500 via-orange-500 to-red-500",
  ];

  return (
    <section className="px-4 pt-2 pb-1">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
            HOT COMBOS
          </h2>
          <Zap className="w-4 h-4 text-yellow-500" />
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
          onScroll={(e) => {
            const el = e.currentTarget;
            const cardWidth = el.children[0]?.clientWidth || 300;
            const idx = Math.round(el.scrollLeft / (cardWidth + 16));
            setActiveIndex(Math.min(idx, combos.length - 1));
          }}
        >
          {combos.map((combo, i) => {
            const savings = getSavings(combo);
            const originalPrice = getOriginalPrice(combo);
            const gradient = gradients[i % gradients.length];

            return (
              <div
                key={combo.id}
                className={`flex-shrink-0 w-[85vw] max-w-[380px] snap-center rounded-3xl overflow-hidden shadow-lg relative bg-gradient-to-br ${gradient} p-[2px]`}
              >
                {/* Inner card */}
                <div className="bg-card rounded-[22px] overflow-hidden h-full">
                  {/* Top gradient strip with combo info */}
                  <div className={`bg-gradient-to-r ${gradient} px-5 py-4 relative overflow-hidden`}>
                    {/* Animated sparkle dots */}
                    <div className="absolute top-2 right-4 w-2 h-2 bg-white/40 rounded-full animate-ping" />
                    <div className="absolute bottom-3 right-12 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
                    <div className="absolute top-4 right-20 w-1 h-1 bg-white/50 rounded-full animate-bounce" />

                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles className="w-4 h-4 text-yellow-200" />
                          <span className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase">
                            COMBO DEAL
                          </span>
                        </div>
                        <h3 className="font-heading text-xl font-black text-white uppercase tracking-tight leading-tight">
                          {combo.name}
                        </h3>
                        {combo.description && (
                          <p className="text-white/70 text-xs mt-1 line-clamp-1">{combo.description}</p>
                        )}
                      </div>

                      {savings > 0 && (
                        <div className="bg-yellow-400 text-black rounded-xl px-3 py-1.5 flex flex-col items-center ml-3 shadow-md animate-bounce" style={{ animationDuration: "2s" }}>
                          <span className="text-[9px] font-bold uppercase tracking-wider leading-none">SAVE</span>
                          <span className="text-lg font-black leading-none">₹{savings}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-5 py-4">
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 uppercase tracking-wide">
                      {getItemNames(combo)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading text-2xl font-black text-foreground">₹{combo.combo_price}</span>
                        {originalPrice > combo.combo_price && (
                          <span className="text-sm text-muted-foreground line-through">₹{originalPrice}</span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          addItem({
                            id: combo.id,
                            name: combo.name,
                            price: combo.combo_price,
                            image_url: combo.image_url || "",
                          });
                        }}
                        className={`bg-gradient-to-r ${gradient} text-white font-heading font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-1.5 active:scale-95`}
                      >
                        ORDER NOW
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots indicator */}
        {combos.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-1">
            {combos.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ComboBanner;
