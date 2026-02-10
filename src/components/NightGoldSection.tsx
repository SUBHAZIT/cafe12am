import { Truck, Percent, Star } from "lucide-react";
import drinkFrappe from "@/assets/drink-frappe.png";
import drinkIcedCoffee from "@/assets/drink-iced-coffee.png";

const NightGoldSection = () => {
  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)" }}>
      {/* Top curved white overlap */}
      <div className="absolute top-0 left-0 w-full">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full" preserveAspectRatio="none">
          <path d="M0 0H1440V40C1440 40 1200 120 720 120C240 120 0 40 0 40V0Z" fill="hsl(var(--background))" />
        </svg>
      </div>

      {/* Bottom curved shape */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full" preserveAspectRatio="none">
          <path d="M0 80H1440V60C1440 60 1200 0 720 0C240 0 0 60 0 60V80Z" fill="hsl(var(--background))" />
        </svg>
      </div>

      {/* Gold geometric pattern - bottom left */}
      <div className="absolute bottom-8 left-8 opacity-20">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          <polygon points="40,0 80,23 80,69 40,92 0,69 0,23" stroke="#D4AF37" strokeWidth="1" fill="none" transform="translate(0,0)" />
          <polygon points="40,0 80,23 80,69 40,92 0,69 0,23" stroke="#D4AF37" strokeWidth="1" fill="none" transform="translate(40,23)" />
          <polygon points="40,0 80,23 80,69 40,92 0,69 0,23" stroke="#D4AF37" strokeWidth="1" fill="none" transform="translate(80,0)" />
          <polygon points="40,0 80,23 80,69 40,92 0,69 0,23" stroke="#D4AF37" strokeWidth="1" fill="none" transform="translate(40,69)" />
          <polygon points="40,0 80,23 80,69 40,92 0,69 0,23" stroke="#D4AF37" strokeWidth="1" fill="none" transform="translate(0,46)" />
          <polygon points="40,0 80,23 80,69 40,92 0,69 0,23" stroke="#D4AF37" strokeWidth="1" fill="none" transform="translate(80,46)" />
        </svg>
      </div>

      {/* Gold geometric pattern - bottom right */}
      <div className="absolute bottom-8 right-8 opacity-20">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          <polygon points="40,0 80,23 80,69 40,92 0,69 0,23" stroke="#D4AF37" strokeWidth="1" fill="none" transform="translate(0,0)" />
          <polygon points="40,0 80,23 80,69 40,92 0,69 0,23" stroke="#D4AF37" strokeWidth="1" fill="none" transform="translate(40,23)" />
          <polygon points="40,0 80,23 80,69 40,92 0,69 0,23" stroke="#D4AF37" strokeWidth="1" fill="none" transform="translate(80,0)" />
          <polygon points="40,0 80,23 80,69 40,92 0,69 0,23" stroke="#D4AF37" strokeWidth="1" fill="none" transform="translate(40,69)" />
        </svg>
      </div>

      {/* Floating drink - top left */}
      <div className="absolute top-16 left-4 md:left-12 w-24 h-32 md:w-36 md:h-48 animate-float opacity-90">
        <img src={drinkFrappe} alt="Caramel Frappe" className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(212,175,55,0.3)]" />
      </div>

      {/* Floating drink - top right */}
      <div className="absolute top-10 right-4 md:right-12 w-28 h-36 md:w-40 md:h-52 animate-float-delayed opacity-90">
        <img src={drinkIcedCoffee} alt="Iced Coffee" className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(212,175,55,0.3)]" />
      </div>

      {/* Floating drink - bottom left */}
      <div className="absolute bottom-20 left-8 md:left-24 w-20 h-28 md:w-28 md:h-36 animate-float-slow opacity-80">
        <img src={drinkIcedCoffee} alt="Iced Coffee" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.2)] -scale-x-100" />
      </div>

      {/* Floating drink - bottom right */}
      <div className="absolute bottom-24 right-8 md:right-28 w-20 h-28 md:w-28 md:h-36 animate-float opacity-80">
        <img src={drinkFrappe} alt="Caramel Frappe" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.2)] -scale-x-100" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 py-40 md:py-52">
        {/* Brand name */}
        <p className="font-heading text-2xl md:text-3xl font-bold italic tracking-wide" style={{ color: "#E8D5A3" }}>
          CAFE12AM
        </p>

        {/* NIGHT GOLD heading */}
        <h2 className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mt-2 mb-6" style={{ background: "linear-gradient(180deg, #f5e6b8 0%, #D4AF37 40%, #b8942e 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          <span className="flex items-center justify-center gap-3 md:gap-5">
            NIGHT
            <span className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-yellow-600/50" style={{ background: "radial-gradient(circle, #D4AF37, #8B7226)" }}>
              <Crown className="w-7 h-7 md:w-10 md:h-10 text-yellow-200" />
            </span>
            OLD
          </span>
        </h2>

        {/* Subtext */}
        <p className="text-lg md:text-xl tracking-widest mb-16" style={{ color: "#c4a96a" }}>
          CAMPUS'S PREMIUM MIDNIGHT SNACK EXPERIENCE
        </p>

        {/* Section title */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <Star className="w-4 h-4" style={{ color: "#D4AF37", fill: "#D4AF37" }} />
          <span className="font-heading text-sm md:text-base font-bold tracking-[0.3em] uppercase" style={{ color: "#D4AF37" }}>
            NIGHT BENEFITS
          </span>
          <Star className="w-4 h-4" style={{ color: "#D4AF37", fill: "#D4AF37" }} />
        </div>

        {/* Benefits */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 max-w-3xl mx-auto">
          {/* Benefit 1 */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center border border-yellow-700/50" style={{ background: "radial-gradient(circle, #2a2215, #1a1508)" }}>
              <Truck className="w-6 h-6" style={{ color: "#D4AF37" }} />
            </div>
            <div className="text-left">
              <p className="font-heading text-base md:text-lg font-bold text-white tracking-wide">
                PRIORITY MIDNIGHT DELIVERY
              </p>
              <p className="text-sm tracking-wider" style={{ color: "#c4a96a" }}>
                FAST SERVICE FOR NIGHT ORDERS
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center border border-yellow-700/50" style={{ background: "radial-gradient(circle, #2a2215, #1a1508)" }}>
              <Percent className="w-6 h-6" style={{ color: "#D4AF37" }} />
            </div>
            <div className="text-left">
              <p className="font-heading text-base md:text-lg font-bold text-white tracking-wide">
                EXCLUSIVE MEMBER DISCOUNTS
              </p>
              <p className="text-sm tracking-wider" style={{ color: "#c4a96a" }}>
                UP TO 30% SAVINGS ON SNACKS
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NightGoldSection;
