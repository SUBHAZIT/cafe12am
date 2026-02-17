import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Zap, ChevronRight, Sparkles, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CouponBanner from "./CouponBanner";
import comboPizza from "@/assets/combo-pizza.png";
import comboColddrink from "@/assets/combo-colddrink.png";

interface Combo {
  id: string;
  name: string;
  description: string | null;
  combo_price: number;
  image_url: string | null;
  combo_items: {
    id: string;
    quantity: number;
    menu_items: { name: string; price: number; image_url: string | null } | null;
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
        .select("id, name, description, combo_price, image_url, combo_items(id, quantity, menu_items(name, price, image_url))")
        .eq("is_available", true)
        .order("created_at", { ascending: false });
      if (data) setCombos(data as any);
    };
    fetchCombos();
  }, []);

  useEffect(() => {
    if (combos.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % combos.length);
    }, 4000);
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

  const getOriginalPrice = (combo: Combo) =>
    combo.combo_items?.reduce((sum, ci) => sum + (ci.menu_items?.price || 0) * ci.quantity, 0) || 0;

  const getSavings = (combo: Combo) => {
    const original = getOriginalPrice(combo);
    return original > combo.combo_price ? original - combo.combo_price : 0;
  };

  const getItemThumbnails = (combo: Combo) =>
    combo.combo_items
      ?.filter((ci) => ci.menu_items?.image_url)
      .slice(0, 3) || [];

  const getItemNames = (combo: Combo) =>
    combo.combo_items
      ?.map((ci) => `${ci.quantity > 1 ? ci.quantity + "x " : ""}${ci.menu_items?.name || ""}`)
      .filter(Boolean)
      .join(" + ") || "";

  const gradients = [
    "from-orange-500 via-red-500 to-pink-500",
    "from-emerald-500 via-teal-500 to-cyan-500",
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-amber-500 via-orange-500 to-red-500",
  ];

  const bgGradients = [
    "from-orange-50 via-red-50 to-pink-50",
    "from-emerald-50 via-teal-50 to-cyan-50",
    "from-violet-50 via-purple-50 to-fuchsia-50",
    "from-amber-50 via-orange-50 to-red-50",
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
            const bgGradient = bgGradients[i % bgGradients.length];
            const thumbnails = getItemThumbnails(combo);

            return (
              <div
                key={combo.id}
                className="flex-shrink-0 w-[92vw] max-w-[500px] snap-center rounded-3xl overflow-hidden shadow-lg relative"
              >
                {/* Full card with gradient bg */}
                <div className={`bg-gradient-to-br ${bgGradient} relative overflow-hidden min-h-[220px]`}>
                  {/* Decorative circles */}
                  <div className="absolute top-[-20px] left-[-20px] w-24 h-24 rounded-full bg-primary/5" />
                  <div className="absolute bottom-[-30px] left-[40%] w-32 h-32 rounded-full bg-primary/5" />
                  <div className="absolute top-[60%] left-[20%] w-16 h-16 rounded-full bg-primary/5" />
                  
                  {/* Sparkle dots */}
                  <div className="absolute top-8 left-[45%] w-1.5 h-1.5 bg-white/60 rounded-full animate-ping" />
                  <div className="absolute bottom-12 right-[30%] w-1 h-1 bg-white/50 rounded-full animate-pulse" />

                  <div className="flex h-full relative z-10 p-5">
                    {/* Left: Text content */}
                    <div className="flex-1 flex flex-col justify-between pr-3 min-h-[200px]">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                          <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                            COMBO DEAL
                          </span>
                        </div>

                        <h3 className="font-heading text-xl font-black text-foreground uppercase tracking-tight leading-tight mb-1">
                          {combo.name}
                        </h3>

                        {combo.description && (
                          <p className="text-muted-foreground text-xs line-clamp-2 mb-2">{combo.description}</p>
                        )}

                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide line-clamp-1 mb-3">
                          {getItemNames(combo)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="font-heading text-3xl font-black text-foreground">₹{combo.combo_price}</span>
                          {originalPrice > combo.combo_price && (
                            <span className="text-sm text-muted-foreground line-through">₹{originalPrice}</span>
                          )}
                          {savings > 0 && (
                            <span className={`bg-gradient-to-r ${gradient} text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase`}>
                              Save ₹{savings}
                            </span>
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
                          className={`bg-gradient-to-r ${gradient} text-white font-heading font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-1.5 active:scale-95 w-fit`}
                        >
                          ORDER NOW
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Right: Pizza + Cold Drink with Plus icon */}
                    <div className="flex items-center justify-center w-[150px] flex-shrink-0 gap-1">
                      <img
                        src={comboPizza}
                        alt="Pizza"
                        className="w-[70px] h-[70px] object-cover rounded-full shadow-lg border-2 border-white/80 drop-shadow-xl"
                      />
                      <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center flex-shrink-0">
                        <Plus className="w-4 h-4 text-orange-500 font-bold" />
                      </div>
                      <img
                        src={comboColddrink}
                        alt="Cold Drink"
                        className="w-[70px] h-[70px] object-cover rounded-full shadow-lg border-2 border-white/80 drop-shadow-xl"
                      />
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
