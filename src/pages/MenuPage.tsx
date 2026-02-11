import StaticPageLayout from "@/components/StaticPageLayout";
import { Link } from "react-router-dom";

const MenuPage = () => {
  return (
    <StaticPageLayout title="OUR MENU" subtitle="EXPLORE WHAT'S COOKING AT CAFE12AM">
      <div className="space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-muted-foreground uppercase tracking-wide text-sm leading-relaxed">
            FROM CRISPY MAGGI TO LOADED BURGERS, REFRESHING FRAPPES TO CLASSIC SANDWICHES — OUR MENU IS CRAFTED TO SATISFY EVERY MIDNIGHT CRAVING. ALL ITEMS ARE FRESHLY PREPARED WITH 100% HYGIENIC INGREDIENTS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "BURGERS & WRAPS", desc: "JUICY, LOADED, AND MADE FRESH EVERY TIME", icon: "🍔" },
            { name: "MAGGI & NOODLES", desc: "THE ULTIMATE LATE-NIGHT COMFORT FOOD", icon: "🍜" },
            { name: "FRIES & SIDES", desc: "CRISPY, GOLDEN, AND PERFECTLY SEASONED", icon: "🍟" },
            { name: "SANDWICHES", desc: "PACKED WITH FLAVOR, PERFECT FOR A QUICK BITE", icon: "🥪" },
            { name: "BEVERAGES", desc: "FROM ICED COFFEE TO FRAPPES — STAY REFRESHED", icon: "☕" },
            { name: "COMBO DEALS", desc: "STUDENT-FRIENDLY COMBOS THAT SAVE YOU MORE", icon: "🎉" },
          ].map((cat) => (
            <div key={cat.name} className="relative bg-card rounded-2xl p-8 shadow-card border border-border text-center group hover:shadow-lg transition-all">
              <span className="text-4xl mb-4 block">{cat.icon}</span>
              <h3 className="font-heading text-lg font-bold text-foreground uppercase tracking-tight mb-2">{cat.name}</h3>
              <p className="text-muted-foreground uppercase tracking-wide text-xs leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/login" className="inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors">
            ORDER NOW
          </Link>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default MenuPage;
