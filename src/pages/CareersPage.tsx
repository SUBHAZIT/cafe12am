import StaticPageLayout from "@/components/StaticPageLayout";

const CareersPage = () => {
  return (
    <StaticPageLayout title="CAREERS" subtitle="JOIN THE CAFE12AM CREW AND BUILD SOMETHING AMAZING">
      <div className="space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-muted-foreground uppercase tracking-wide text-sm leading-relaxed">
            WE'RE ALWAYS LOOKING FOR PASSIONATE, DRIVEN INDIVIDUALS WHO WANT TO BE PART OF THE LATE-NIGHT FOOD REVOLUTION. WHETHER YOU'RE A CODER, A MARKETER, OR A FOOD ENTHUSIAST — THERE'S A PLACE FOR YOU.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "DELIVERY PARTNER", type: "PART-TIME", desc: "JOIN OUR FLEET AND DELIVER HAPPINESS TO STUDENTS EVERY NIGHT. FLEXIBLE HOURS, GREAT EARNINGS." },
            { title: "CAMPUS AMBASSADOR", type: "INTERNSHIP", desc: "REPRESENT CAFE12AM ON YOUR CAMPUS. SPREAD THE WORD AND EARN EXCITING PERKS." },
            { title: "FULL-STACK DEVELOPER", type: "FULL-TIME", desc: "HELP US BUILD AND SCALE OUR PLATFORM. WORK WITH MODERN TECH STACKS IN A FAST-PACED ENVIRONMENT." },
            { title: "SOCIAL MEDIA MANAGER", type: "FULL-TIME", desc: "CREATE ENGAGING CONTENT AND GROW OUR BRAND ACROSS PLATFORMS." },
          ].map((job) => (
            <div key={job.title} className="relative bg-card rounded-2xl p-8 shadow-card border border-border hover:shadow-lg transition-all">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-heading font-bold uppercase tracking-wider mb-4">{job.type}</span>
              <h3 className="font-heading text-lg font-bold text-foreground uppercase tracking-tight mb-2">{job.title}</h3>
              <p className="text-muted-foreground uppercase tracking-wide text-xs leading-relaxed">{job.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center section-pink rounded-2xl p-10">
          <h3 className="font-heading text-xl font-bold text-foreground uppercase tracking-tight mb-3">DON'T SEE YOUR ROLE?</h3>
          <p className="text-muted-foreground uppercase tracking-wide text-xs mb-4">DROP US AN EMAIL AND WE'LL GET BACK TO YOU</p>
          <a href="mailto:careers@cafe12am.com" className="inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors">
            REACH OUT
          </a>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default CareersPage;
