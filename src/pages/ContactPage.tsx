import { useState } from "react";
import StaticPageLayout from "@/components/StaticPageLayout";
import emailjs from "@emailjs/browser";
import { toast } from "@/hooks/use-toast";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: "ALL FIELDS REQUIRED", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await emailjs.send("service_iyz5u2i", "template_b6yper6", {
        to_email: "support@cafe12am.store",
        from_name: name,
        reply_to: email,
        to_name: "CAFE12AM SUPPORT",
        message: `From: ${name} (${email})\n\n${message}`,
      }, "VsUWcXNxfOtX_MoJs");
      toast({ title: "MESSAGE SENT SUCCESSFULLY! 📧" });
      setName(""); setEmail(""); setMessage("");
    } catch (err: any) {
      toast({ title: "FAILED TO SEND", description: err?.text || err?.message, variant: "destructive" });
    }
    setSending(false);
  };

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
            { label: "EMAIL", value: "SUPPORT@CAFE12AM.STORE", icon: "📧" },
            { label: "PHONE", value: "+91 9531605804", icon: "📱" },
            { label: "ADDRESS", value: "BARASAT, NEAR BRAINWARE UNIVERSITY, 700125", icon: "📍" },
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input type="text" placeholder="YOUR NAME" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground font-heading text-xs uppercase tracking-wider border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="email" placeholder="YOUR EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground font-heading text-xs uppercase tracking-wider border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
            <textarea rows={4} placeholder="YOUR MESSAGE" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground font-heading text-xs uppercase tracking-wider border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            <button type="submit" disabled={sending} className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50">
              {sending ? "SENDING..." : "SEND MESSAGE"}
            </button>
          </form>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default ContactPage;
