import StaticPageLayout from "@/components/StaticPageLayout";

const ContactPage = () => {
  return (
    <StaticPageLayout title="CONTACT US" subtitle="WE'D LOVE TO HEAR FROM YOU">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        <div className="space-y-8">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground uppercase tracking-tight mb-4">GET IN TOUCH</h3>
            <p className="text-muted-foreground uppercase tracking-wide text-xs leading-relaxed mb-6">
              HAVE A QUESTION, FEEDBACK, OR PARTNERSHIP INQUIRY? REACH OUT AND WE'LL GET BACK TO YOU AS SOON AS POSSIBLE.
            </p>
          </div>

          {[
            { label: "EMAIL", value: "SUPPORT@CAFE12AM.COM", icon: "📧" },
            { label: "PHONE", value: "+91 98765 43210", icon: "📱" },
            { label: "ADDRESS", value: "CAMPUS HQ, KOLKATA, WEST BENGAL, INDIA", icon: "📍" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h4 className="font-heading text-xs font-bold text-foreground uppercase tracking-wider mb-1">{item.label}</h4>
                <p className="text-muted-foreground uppercase tracking-wide text-xs">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
          <h3 className="font-heading text-lg font-bold text-foreground uppercase tracking-tight mb-6">SEND A MESSAGE</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="YOUR NAME" className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground font-heading text-xs uppercase tracking-wider border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="email" placeholder="YOUR EMAIL" className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground font-heading text-xs uppercase tracking-wider border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
            <textarea rows={4} placeholder="YOUR MESSAGE" className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground font-heading text-xs uppercase tracking-wider border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            <button type="submit" className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors">
              SEND MESSAGE
            </button>
          </form>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default ContactPage;
