import foodBurger from "@/assets/food-burger.png";
import foodMaggi from "@/assets/food-maggi.png";
import foodFries from "@/assets/food-fries.png";
import foodCoffee from "@/assets/food-coffee.png";
import foodSandwich from "@/assets/food-sandwich.png";

const FoodShowcase = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-background" id="food-showcase">
      {/* SVG Decorative Curve Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 800"
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Large curve from top-left sweeping down */}
        <path
          d="M-100 100 C200 50, 400 400, 300 700"
          stroke="hsl(350 80% 75% / 0.25)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Curve from top-right sweeping to bottom-right */}
        <path
          d="M1200 -50 C1400 200, 1500 400, 1300 800"
          stroke="hsl(350 80% 75% / 0.25)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Middle flowing curve */}
        <path
          d="M-50 300 C300 250, 500 500, 700 300 S1100 600, 1500 400"
          stroke="hsl(350 80% 75% / 0.15)"
          strokeWidth="1"
          fill="none"
        />
        {/* Small decorative circle top-left area */}
        <circle cx="150" cy="200" r="80" stroke="hsl(350 80% 75% / 0.15)" strokeWidth="1" fill="none" />
        {/* Small decorative circle bottom-right area */}
        <circle cx="1300" cy="600" r="120" stroke="hsl(350 80% 75% / 0.12)" strokeWidth="1" fill="none" />
      </svg>

      <div className="max-w-7xl mx-auto relative min-h-[600px] md:min-h-[700px] flex items-center justify-center">
        {/* Floating food images - positioned like reference */}
        <img
          src={foodBurger}
          alt="Burger"
          className="absolute top-1/2 -translate-y-1/2 left-0 md:left-[5%] w-40 md:w-64 lg:w-72 animate-float drop-shadow-2xl z-10"
        />
        <img
          src={foodMaggi}
          alt="Maggi"
          className="absolute top-[5%] right-[10%] md:right-[15%] w-32 md:w-48 lg:w-56 animate-float-delayed drop-shadow-2xl z-10"
        />
        <img
          src={foodFries}
          alt="Fries"
          className="absolute bottom-[10%] left-[5%] md:left-[10%] w-28 md:w-40 lg:w-48 animate-float-slow drop-shadow-2xl z-10"
        />
        <img
          src={foodCoffee}
          alt="Coffee"
          className="absolute bottom-[5%] right-[5%] md:right-[10%] w-28 md:w-40 lg:w-48 animate-float drop-shadow-2xl z-10"
        />
        <img
          src={foodSandwich}
          alt="Sandwich"
          className="absolute top-[8%] left-[15%] md:left-[20%] w-24 md:w-36 lg:w-44 animate-float-delayed drop-shadow-2xl z-10 hidden md:block"
        />

        {/* Center content */}
        <div className="text-center max-w-xl mx-auto relative z-20">
          <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 tracking-tight">
            BETTER SNACKS FOR MORE PEOPLE
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed uppercase tracking-wide max-w-md mx-auto">
            FROM LATE-NIGHT MAGGI TO LOADED FRIES, WE'VE BEEN FUELING MIDNIGHT CRAVINGS ACROSS CAMPUSES AND CITIES.
          </p>

          {/* Stats - only 2 now */}
          <div className="mt-12 grid grid-cols-2 gap-6 max-w-sm mx-auto">
            <div className="bg-card rounded-2xl p-5 shadow-card">
              <p className="font-heading text-2xl md:text-3xl font-bold text-primary">50+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">MENU ITEMS</p>
            </div>
            <div className="bg-card rounded-2xl p-5 shadow-card">
              <p className="font-heading text-2xl md:text-3xl font-bold text-primary">100%</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">FULLY HYGIENE</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodShowcase;
