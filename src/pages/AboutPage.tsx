import StaticPageLayout from "@/components/StaticPageLayout";
import FoundersSection from "@/components/FoundersSection";

const AboutPage = () => {
  return (
    <StaticPageLayout title="ABOUT US" subtitle="THE STORY BEHIND CAMPUS'S MIDNIGHT SNACK DESTINATION">
      <div className="space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight mb-6">
            WHO WE ARE
          </h2>
          <p className="text-muted-foreground uppercase tracking-wide text-sm leading-relaxed mb-4">
            CAFE12AM IS A LATE-NIGHT FOOD DELIVERY PLATFORM BUILT EXCLUSIVELY FOR COLLEGE CAMPUSES. WE DELIVER FRESHLY COOKED SNACKS AND MEALS RIGHT TO YOUR HOSTEL DOOR — NO MATTER HOW LATE IT GETS.
          </p>
          <p className="text-muted-foreground uppercase tracking-wide text-sm leading-relaxed">
            WE BELIEVE NO STUDENT SHOULD GO HUNGRY DURING THOSE LATE-NIGHT STUDY SESSIONS, PROJECT MARATHONS, OR JUST CASUAL HANGOUTS. THAT'S WHY WE OPERATE WHEN OTHERS DON'T.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: "01", title: "OUR MISSION", desc: "TO MAKE DELICIOUS, AFFORDABLE, HYGIENIC FOOD ACCESSIBLE TO EVERY STUDENT AT ANY HOUR OF THE NIGHT." },
            { num: "02", title: "OUR VISION", desc: "TO BECOME THE #1 LATE-NIGHT FOOD PLATFORM ACROSS CAMPUSES NATIONWIDE, FUELING STUDENT LIFE ONE SNACK AT A TIME." },
            { num: "03", title: "OUR VALUES", desc: "HYGIENE FIRST, STUDENT-FRIENDLY PRICING, LIGHTNING-FAST DELIVERY, AND A GENUINE PASSION FOR GOOD FOOD." },
          ].map((item) => (
            <div key={item.num} className="relative bg-card rounded-2xl p-8 shadow-card border border-border">
              <span className="absolute top-4 right-4 font-heading text-5xl font-bold text-primary/10">{item.num}</span>
              <h3 className="font-heading text-lg font-bold text-foreground uppercase tracking-tight mb-3">{item.title}</h3>
              <p className="text-muted-foreground uppercase tracking-wide text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <FoundersSection />
      </div>
    </StaticPageLayout>
  );
};

export default AboutPage;
