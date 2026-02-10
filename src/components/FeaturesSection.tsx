import { Clock, Moon, MapPin, Sandwich, CreditCard, Timer, Tag, Headphones } from "lucide-react";

const features = [
  { icon: Moon, label: "LATE NIGHT DELIVERY", desc: "Order anytime after midnight" },
  { icon: MapPin, label: "LIVE ORDER TRACKING", desc: "Watch your food come to you" },
  { icon: Sandwich, label: "STUDENT COMBO DEALS", desc: "Budget-friendly bundles" },
  { icon: CreditCard, label: "INSTANT PAYMENT", desc: "Pay in seconds, eat in minutes" },
  { icon: Timer, label: "FAST 20-MIN DELIVERY", desc: "From kitchen to your door" },
  { icon: Sandwich, label: "CUSTOM SNACK BUILDER", desc: "Build your perfect bite" },
  { icon: Tag, label: "COUPONS & OFFERS", desc: "Daily deals just for you" },
  { icon: Headphones, label: "24/7 SUPPORT CHAT", desc: "We're always here for you" },
];

const FeaturesSection = () => {
  return (
    <section className="relative px-4 py-20 md:py-32 overflow-hidden bg-background" id="features">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Large decorative circles */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full border-2 border-primary/10" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full border-2 border-primary/8" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/5" />
        
        {/* Dotted accent lines */}
        <div className="absolute top-20 left-[10%] w-24 h-[2px] bg-gradient-to-r from-primary/30 to-transparent" />
        <div className="absolute top-20 right-[10%] w-24 h-[2px] bg-gradient-to-l from-primary/30 to-transparent" />
        <div className="absolute bottom-20 left-[15%] w-16 h-[2px] bg-gradient-to-r from-primary/20 to-transparent" />
        <div className="absolute bottom-20 right-[15%] w-16 h-[2px] bg-gradient-to-l from-primary/20 to-transparent" />

        {/* Small decorative dots */}
        <div className="absolute top-32 left-[20%] w-3 h-3 rounded-full bg-primary/20" />
        <div className="absolute top-48 right-[25%] w-2 h-2 rounded-full bg-primary/30" />
        <div className="absolute bottom-32 left-[30%] w-4 h-4 rounded-full bg-primary/10" />
        <div className="absolute bottom-48 right-[18%] w-3 h-3 rounded-full bg-primary/15" />
        <div className="absolute top-[40%] left-[5%] w-2 h-2 rounded-full bg-primary/25" />
        <div className="absolute top-[60%] right-[8%] w-3 h-3 rounded-full bg-primary/20" />

        {/* Diamond shapes */}
        <div className="absolute top-24 right-[30%] w-4 h-4 rotate-45 border border-primary/15" />
        <div className="absolute bottom-28 left-[25%] w-5 h-5 rotate-45 border border-primary/10" />

        {/* Curved decorative arcs */}
        <svg className="absolute top-10 left-0 w-full h-full opacity-[0.04]" viewBox="0 0 1200 800" fill="none">
          <path d="M0 400 Q300 100 600 400 T1200 400" stroke="hsl(var(--primary))" strokeWidth="2" />
          <path d="M0 500 Q300 200 600 500 T1200 500" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 bg-accent rounded-full px-5 py-2 mb-6">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-heading text-xs font-bold text-primary uppercase tracking-widest">
              App Features
            </span>
          </div>
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-primary italic uppercase leading-tight">
            WHAT'S WAITING FOR
            <br />
            YOU ON THE APP?
          </h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-12 h-[2px] bg-primary/30" />
            <p className="font-heading text-xs md:text-sm text-muted-foreground uppercase tracking-[0.25em]">
              Powerful Features For Midnight Snack Lovers
            </p>
            <div className="w-12 h-[2px] bg-primary/30" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {features.map((f, i) => (
            <div
              key={f.label}
              className="group relative bg-card rounded-3xl p-6 md:p-7 shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border border-border/50"
            >
              {/* Card number */}
              <span className="absolute top-4 right-5 font-heading text-5xl font-bold text-primary/[0.06] leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <f.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Text */}
              <h3 className="font-heading text-sm md:text-base font-bold text-foreground uppercase tracking-wide mb-2">
                {f.label}
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider leading-relaxed">
                {f.desc}
              </p>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-6 right-6 h-[3px] rounded-full bg-primary/0 group-hover:bg-primary/40 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
