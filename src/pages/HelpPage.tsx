import StaticPageLayout from "@/components/StaticPageLayout";

const HelpPage = () => {
  return (
    <StaticPageLayout title="HELP & FAQ" subtitle="GOT QUESTIONS? WE'VE GOT ANSWERS">
      <div className="space-y-8 max-w-3xl mx-auto">
        {[
          { q: "WHAT ARE YOUR OPERATING HOURS?", a: "WE OPERATE LATE NIGHT, TYPICALLY FROM 8 PM TO 3 AM. HOURS MAY VARY BASED ON CAMPUS AND DEMAND." },
          { q: "HOW DO I PLACE AN ORDER?", a: "SIMPLY LOG IN, BROWSE THE MENU, ADD ITEMS TO YOUR CART, AND CHECKOUT. YOUR ORDER WILL BE PREPARED AND DELIVERED FRESH." },
          { q: "CAN I CANCEL MY ORDER?", a: "YOU CAN CANCEL YOUR ORDER BEFORE IT'S ACCEPTED BY THE MERCHANT. ONCE PREPARATION BEGINS, CANCELLATION IS NOT POSSIBLE." },
          { q: "HOW DOES DELIVERY VERIFICATION WORK?", a: "WHEN YOUR ORDER IS PICKED UP, YOU'LL RECEIVE A 4-DIGIT OTP. SHARE IT WITH THE DELIVERY PARTNER TO CONFIRM DELIVERY." },
          { q: "WHAT PAYMENT METHODS DO YOU ACCEPT?", a: "WE ACCEPT UPI, DEBIT/CREDIT CARDS, NET BANKING, AND CASH ON DELIVERY." },
          { q: "IS THE FOOD HYGIENIC?", a: "ABSOLUTELY. WE MAINTAIN 100% HYGIENE STANDARDS. ALL FOOD IS FRESHLY PREPARED IN CLEAN, SANITIZED KITCHENS." },
          { q: "HOW DO I BECOME A DELIVERY PARTNER?", a: "VISIT THE CAREERS PAGE AND APPLY FOR THE DELIVERY PARTNER ROLE. FLEXIBLE HOURS AND GREAT EARNINGS AWAIT." },
          { q: "I HAVE AN ISSUE WITH MY ORDER. WHAT DO I DO?", a: "CONTACT US THROUGH THE CONTACT PAGE OR EMAIL SUPPORT@CAFE12AM.STORE. WE'LL RESOLVE IT QUICKLY." },
        ].map((faq, i) => (
          <div key={i} className="bg-card rounded-2xl p-6 shadow-card border border-border">
            <h3 className="font-heading text-sm font-bold text-foreground uppercase tracking-tight mb-2">{faq.q}</h3>
            <p className="text-muted-foreground uppercase tracking-wide text-xs leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </StaticPageLayout>
  );
};

export default HelpPage;
