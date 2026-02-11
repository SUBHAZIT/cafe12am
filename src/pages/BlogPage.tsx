import StaticPageLayout from "@/components/StaticPageLayout";

const BlogPage = () => {
  return (
    <StaticPageLayout title="BLOG" subtitle="STORIES, UPDATES, AND LATE-NIGHT FOOD CULTURE">
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "WHY MIDNIGHT SNACKING IS A STUDENT RITUAL", date: "FEB 10, 2026", tag: "CULTURE", excerpt: "FROM HOSTEL CORRIDORS TO STUDY HALLS, LATE-NIGHT FOOD IS MORE THAN A MEAL — IT'S A TRADITION." },
            { title: "HOW CAFE12AM STARTED FROM A HOSTEL ROOM", date: "JAN 28, 2026", tag: "STORY", excerpt: "THE JOURNEY FROM A HUNGRY MIDNIGHT TO BUILDING A PLATFORM THAT SERVES THOUSANDS." },
            { title: "TOP 5 MIDNIGHT SNACKS EVERY STUDENT LOVES", date: "JAN 15, 2026", tag: "FOOD", excerpt: "MAGGI, BURGERS, FRIES — WE RANKED THE MOST ORDERED LATE-NIGHT FAVORITES." },
            { title: "THE IMPORTANCE OF FOOD HYGIENE", date: "DEC 20, 2025", tag: "HEALTH", excerpt: "HOW WE MAINTAIN 100% HYGIENE STANDARDS ACROSS OUR ENTIRE KITCHEN AND DELIVERY CHAIN." },
            { title: "STUDENT COMBO DEALS: MORE FOOD, LESS MONEY", date: "DEC 05, 2025", tag: "DEALS", excerpt: "EXPLORE OUR SPECIALLY CRAFTED COMBO MEALS DESIGNED FOR STUDENT BUDGETS." },
            { title: "DELIVERY PARTNER STORIES", date: "NOV 20, 2025", tag: "PEOPLE", excerpt: "MEET THE HEROES WHO DELIVER YOUR FOOD RAIN OR SHINE, NIGHT AFTER NIGHT." },
          ].map((post) => (
            <article key={post.title} className="bg-card rounded-2xl overflow-hidden shadow-card border border-border group hover:shadow-lg transition-all">
              <div className="h-40 section-pink flex items-center justify-center relative overflow-hidden">
                <span className="font-heading text-6xl font-bold text-primary/10 uppercase">{post.tag}</span>
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full border-2 border-dashed border-primary/20" />
              </div>
              <div className="p-6">
                <span className="text-primary text-[10px] font-heading font-bold uppercase tracking-wider">{post.date}</span>
                <h3 className="font-heading text-sm font-bold text-foreground uppercase tracking-tight mt-2 mb-3 leading-snug">{post.title}</h3>
                <p className="text-muted-foreground uppercase tracking-wide text-[10px] leading-relaxed">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default BlogPage;
