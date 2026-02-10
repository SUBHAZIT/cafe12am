import { Clock, Moon, MapPin, Sandwich, CreditCard, Timer, Tag, Headphones } from "lucide-react";
import phoneMockup from "@/assets/phone-mockup.png";

const features = [
  { icon: Moon, label: "LATE NIGHT\nDELIVERY", side: "left" },
  { icon: MapPin, label: "LIVE ORDER\nTRACKING", side: "left" },
  { icon: Sandwich, label: "STUDENT\nCOMBO DEALS", side: "left" },
  { icon: CreditCard, label: "INSTANT\nPAYMENT", side: "left" },
  { icon: Timer, label: "FAST 20-MIN\nDELIVERY", side: "right" },
  { icon: Sandwich, label: "CUSTOM SNACK\nBUILDER", side: "right" },
  { icon: Tag, label: "COUPONS &\nOFFERS", side: "right" },
  { icon: Headphones, label: "24/7 SUPPORT\nCHAT", side: "right" },
];

const FeatureCard = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div className="flex items-center gap-3 bg-card rounded-2xl px-5 py-4 shadow-card w-[220px] md:w-[250px]">
    <span className="font-heading text-sm md:text-base font-bold text-foreground whitespace-pre-line leading-tight">
      {label}
    </span>
    <div className="ml-auto shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent flex items-center justify-center">
      <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
    </div>
  </div>
);

const FeatureCardRight = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div className="flex items-center gap-3 bg-card rounded-2xl px-5 py-4 shadow-card w-[220px] md:w-[250px]">
    <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent flex items-center justify-center">
      <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
    </div>
    <span className="font-heading text-sm md:text-base font-bold text-foreground whitespace-pre-line leading-tight">
      {label}
    </span>
  </div>
);

const FeaturesSection = () => {
  const leftFeatures = features.filter((f) => f.side === "left");
  const rightFeatures = features.filter((f) => f.side === "right");

  return (
    <section className="section-pink px-4 py-16 md:py-24 overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-primary italic uppercase">
            WHAT'S WAITING FOR YOU ON THE APP?
          </h2>
          <p className="font-heading text-sm md:text-base text-muted-foreground uppercase tracking-widest mt-3">
            POWERFUL FEATURES DESIGNED FOR MIDNIGHT SNACK LOVERS
          </p>
        </div>

        {/* Features Layout */}
        <div className="flex items-center justify-center gap-4 md:gap-8 lg:gap-12">
          {/* Left column */}
          <div className="flex flex-col gap-4 md:gap-5 items-end">
            {leftFeatures.map((f) => (
              <FeatureCard key={f.label} icon={f.icon} label={f.label} />
            ))}
          </div>

          {/* Center phone */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="relative w-48 md:w-64 lg:w-72">
              <img src={phoneMockup} alt="App mockup" className="w-full h-auto relative z-10" />
              {/* Screen overlay with schedule card */}
              <div className="absolute inset-[12%] top-[15%] bottom-[12%] z-20 flex items-center justify-center">
                <div className="bg-accent/80 rounded-3xl p-6 md:p-8 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-card shadow-soft flex items-center justify-center">
                    <Clock className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                  </div>
                  <span className="font-heading text-xs md:text-sm font-bold text-foreground uppercase text-center leading-tight">
                    SCHEDULE<br />MIDNIGHT<br />ORDER
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4 md:gap-5 items-start">
            {rightFeatures.map((f) => (
              <FeatureCardRight key={f.label} icon={f.icon} label={f.label} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
