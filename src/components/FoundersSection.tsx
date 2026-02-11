import founderUjjal from "@/assets/founder-ujjal.jpg";
import founderSubhajit from "@/assets/founder-subhajit.jpg";

const founders = [
  {
    name: "UJJAL ROY",
    roles: ["CO-FOUNDER", "COO", "CFO"],
    image: founderUjjal,
    bio: "UJJAL IS THE OPERATIONAL BACKBONE OF CAFE12AM. WITH A SHARP EYE FOR LOGISTICS AND FINANCE, HE ENSURES EVERY ORDER REACHES STUDENTS ON TIME, EVERY NIGHT. HIS RELENTLESS DRIVE TO OPTIMIZE OPERATIONS HAS BEEN KEY TO SCALING THE BUSINESS.",
  },
  {
    name: "SUBHAJIT PATHAK",
    roles: ["FOUNDER", "CTO", "CEO", "CMO"],
    image: founderSubhajit,
    bio: "SUBHAJIT IS THE VISIONARY BEHIND CAFE12AM. FROM CODING THE PLATFORM TO CRAFTING THE BRAND, HE BUILT CAFE12AM FROM A LATE-NIGHT IDEA INTO A CAMPUS MOVEMENT. HIS PASSION FOR TECHNOLOGY AND FOOD DRIVES EVERY INNOVATION.",
  },
];

const FoundersSection = () => {
  return (
    <section className="relative py-16 md:py-20">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-16 h-16 rounded-full border-2 border-dashed border-primary/20 animate-float" />
      <div className="absolute bottom-20 left-8 w-10 h-10 rounded-full border-2 border-dashed border-primary/15 animate-float-delayed" />
      <div className="absolute top-1/3 left-6 w-3 h-3 bg-primary/20 rotate-45" />

      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-heading text-xs font-bold uppercase tracking-widest mb-4">
          THE PEOPLE BEHIND THE BRAND
        </span>
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground uppercase tracking-tight mb-4">
          MEET OUR FOUNDERS
        </h2>
        <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
      </div>

      {/* Story */}
      <div className="max-w-3xl mx-auto mb-16 text-center">
        <p className="text-muted-foreground uppercase tracking-wide text-sm leading-relaxed">
          CAFE12AM WAS BORN IN A COLLEGE HOSTEL ROOM IN 2024. TWO FRIENDS, HUNGRY AT MIDNIGHT WITH NO OPTIONS, DECIDED TO SOLVE THE PROBLEM — NOT JUST FOR THEMSELVES, BUT FOR EVERY STUDENT CRAVING A HOT MEAL AFTER HOURS. WHAT STARTED AS A SIMPLE IDEA QUICKLY BECAME A FULL-FLEDGED PLATFORM SERVING FRESHLY COOKED FOOD TO CAMPUSES LATE INTO THE NIGHT. TODAY, CAFE12AM IS MORE THAN A FOOD DELIVERY SERVICE — IT'S A COMMUNITY BUILT BY STUDENTS, FOR STUDENTS.
        </p>
      </div>

      {/* Founder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        {founders.map((founder) => (
          <div
            key={founder.name}
            className="group relative bg-card rounded-2xl overflow-hidden shadow-card border border-border hover:shadow-lg transition-all duration-300"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={founder.image}
                alt={founder.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <h3 className="font-heading text-xl font-bold text-foreground uppercase tracking-tight mb-1">
                {founder.name}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {founder.roles.map((role) => (
                  <span
                    key={role}
                    className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-heading font-bold uppercase tracking-wider"
                  >
                    {role}
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide leading-relaxed">
                {founder.bio}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FoundersSection;
