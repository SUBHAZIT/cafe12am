import foodBurger from "@/assets/food-burger.png";
import foodMaggi from "@/assets/food-maggi.png";
import foodFries from "@/assets/food-fries.png";
import foodSandwich from "@/assets/food-sandwich.png";

const FoodShowcase = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden" id="food-showcase">
      {/* Decorative pink circles */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full border border-primary/10 opacity-50" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full border border-primary/10 opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/5" />

      {/* Deep pink curved SVG lines */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800" fill="none" preserveAspectRatio="none">
        <path d="M-50 200 Q300 50 600 300 T1250 200" stroke="#E91E63" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" />
        <path d="M-50 600 Q400 400 700 550 T1250 500" stroke="#E91E63" strokeWidth="2" strokeDasharray="8 6" opacity="0.3" />
        <path d="M200 -50 Q350 300 500 400 T800 850" stroke="#E91E63" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.25" />
      </svg>

      {/* Deep pink decorative dots */}
      <div className="absolute top-32 right-1/4 w-3 h-3 rounded-full bg-[#E91E63]/30" />
      <div className="absolute bottom-40 left-1/4 w-2 h-2 rounded-full bg-[#E91E63]/40" />
      <div className="absolute top-1/2 right-16 w-2.5 h-2.5 rounded-full bg-[#E91E63]/25" />
      <div className="absolute top-24 left-1/3 w-2 h-2 rotate-45 border border-[#E91E63]/30" />
      <div className="absolute bottom-32 right-1/3 w-3 h-3 rotate-45 border border-[#E91E63]/25" />

      <div className="max-w-7xl mx-auto relative">
        {/* Floating food images */}
        <img
          src={foodBurger}
          alt="Burger"
          className="absolute top-0 left-0 md:left-10 w-32 md:w-52 animate-float drop-shadow-2xl"
        />
        <img
          src={foodMaggi}
          alt="Maggi"
          className="absolute top-10 right-0 md:right-10 w-28 md:w-44 animate-float-delayed drop-shadow-2xl"
        />
        <img
          src={foodFries}
          alt="Fries"
          className="absolute bottom-10 left-5 md:left-20 w-24 md:w-40 animate-float-slow drop-shadow-2xl"
        />
        <img
          src={foodSandwich}
          alt="Sandwich"
          className="absolute bottom-0 right-5 md:right-20 w-28 md:w-40 animate-float drop-shadow-2xl"
        />

        {/* Center content */}
        <div className="text-center py-32 md:py-40 max-w-xl mx-auto relative z-10">
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-primary mb-6 uppercase tracking-tight">
            BETTER SNACKS FOR MORE PEOPLE
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed uppercase tracking-wide">
            FROM LATE-NIGHT MAGGI TO LOADED FRIES, WE'VE BEEN FUELING MIDNIGHT CRAVINGS ACROSS CAMPUSES AND CITIES.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl p-4 shadow-card">
              <p className="font-heading text-2xl md:text-3xl font-bold text-primary">30</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">MINS</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-card">
              <p className="font-heading text-2xl md:text-3xl font-bold text-primary">50+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">MENU ITEMS</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-card">
              <p className="font-heading text-2xl md:text-3xl font-bold text-primary">4.8★</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">RATING</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodShowcase;
