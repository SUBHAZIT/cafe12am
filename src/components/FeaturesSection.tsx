import { Truck, MapPin, GraduationCap, CreditCard, Zap, Wrench, Tag, MessageCircle, Clock } from "lucide-react";
import phoneMockup from "@/assets/phone-mockup.png";

const leftFeatures = [
  { icon: Truck, title: "LATE NIGHT DELIVERY" },
  { icon: MapPin, title: "LIVE ORDER TRACKING" },
  { icon: GraduationCap, title: "STUDENT COMBO DEALS" },
  { icon: CreditCard, title: "INSTANT PAYMENT" },
];

const rightFeatures = [
  { icon: Zap, title: "FAST 20-MIN DELIVERY" },
  { icon: Wrench, title: "CUSTOM SNACK BUILDER" },
  { icon: Tag, title: "COUPONS & OFFERS" },
  { icon: MessageCircle, title: "24/7 SUPPORT CHAT" },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 section-pink overflow-hidden" id="features">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 tracking-tight uppercase">
          WHAT'S WAITING FOR YOU ON THE APP?
        </h2>
        <p className="text-muted-foreground text-base md:text-lg mb-16 max-w-2xl mx-auto uppercase tracking-wide">
          POWERFUL FEATURES DESIGNED FOR MIDNIGHT SNACK LOVERS
        </p>

        {/* Phone + Features Layout */}
        <div className="relative flex items-center justify-center min-h-[500px] md:min-h-[600px]">
          {/* Left Features */}
          <div className="hidden md:flex flex-col gap-6 absolute left-0 lg:left-[5%] top-1/2 -translate-y-1/2">
            {leftFeatures.map((f, i) => (
              <div
                key={f.title}
                className={`bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 w-56 hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ${i % 2 === 0 ? 'ml-0' : 'ml-8'}`}
              >
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-heading text-xs font-bold tracking-wide uppercase text-foreground">{f.title}</p>
              </div>
            ))}
          </div>

          {/* Center Phone */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-52 md:w-64">
              <img src={phoneMockup} alt="Smartphone" className="w-full drop-shadow-2xl" />
              {/* Card on phone screen */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-2xl p-5 shadow-card w-36 md:w-44 text-center">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <p className="font-heading text-xs font-bold tracking-wide uppercase text-foreground">SCHEDULE MIDNIGHT ORDER</p>
              </div>
            </div>
          </div>

          {/* Right Features */}
          <div className="hidden md:flex flex-col gap-6 absolute right-0 lg:right-[5%] top-1/2 -translate-y-1/2">
            {rightFeatures.map((f, i) => (
              <div
                key={f.title}
                className={`bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 w-56 hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ${i % 2 === 0 ? 'mr-0 ml-auto' : 'mr-8 ml-auto'}`}
              >
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-heading text-xs font-bold tracking-wide uppercase text-foreground">{f.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: show features as grid */}
        <div className="grid grid-cols-2 gap-4 mt-8 md:hidden">
          {[...leftFeatures, ...rightFeatures].map((f) => (
            <div key={f.title} className="bg-card rounded-2xl p-4 shadow-card flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-heading text-[10px] font-bold tracking-wide uppercase text-foreground text-center">{f.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
