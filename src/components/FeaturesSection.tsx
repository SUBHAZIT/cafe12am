import { Truck, ChefHat, GraduationCap, Smartphone, MapPin } from "lucide-react";

const features = [
  { icon: Truck, title: "FAST DELIVERY", desc: "AT YOUR DOOR IN 30 MINS" },
  { icon: ChefHat, title: "FRESHLY COOKED", desc: "MADE TO ORDER, ALWAYS HOT" },
  { icon: GraduationCap, title: "STUDENT PRICING", desc: "POCKET-FRIENDLY COMBOS" },
  { icon: Smartphone, title: "EASY ORDERING", desc: "ORDER IN JUST 3 TAPS" },
  { icon: MapPin, title: "LIVE TRACKING", desc: "TRACK YOUR ORDER LIVE" },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 section-pink" id="features">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight uppercase">
          WHAT'S WAITING FOR YOU
        </h2>
        <p className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto uppercase tracking-wide">
          EVERYTHING YOU NEED FOR THE PERFECT MIDNIGHT SNACK EXPERIENCE
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <f.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-heading text-sm font-bold tracking-wide mb-1 uppercase">
                {f.title}
              </h3>
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
