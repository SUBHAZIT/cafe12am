import StaticPageLayout from "@/components/StaticPageLayout";

const PrivacyPage = () => {
  return (
    <StaticPageLayout title="PRIVACY POLICY" subtitle="YOUR PRIVACY MATTERS TO US">
      <div className="space-y-8 max-w-3xl mx-auto">
        {[
          { title: "1. INFORMATION WE COLLECT", content: "WE COLLECT PERSONAL INFORMATION SUCH AS YOUR NAME, EMAIL, PHONE NUMBER, AND DELIVERY ADDRESS WHEN YOU CREATE AN ACCOUNT AND PLACE ORDERS." },
          { title: "2. HOW WE USE YOUR INFORMATION", content: "YOUR INFORMATION IS USED TO PROCESS ORDERS, SEND CONFIRMATIONS, IMPROVE OUR SERVICES, AND COMMUNICATE WITH YOU ABOUT PROMOTIONS AND UPDATES." },
          { title: "3. DATA SECURITY", content: "WE IMPLEMENT INDUSTRY-STANDARD SECURITY MEASURES TO PROTECT YOUR PERSONAL INFORMATION. HOWEVER, NO METHOD OF TRANSMISSION OVER THE INTERNET IS 100% SECURE." },
          { title: "4. THIRD-PARTY SHARING", content: "WE DO NOT SELL YOUR PERSONAL INFORMATION. WE MAY SHARE DATA WITH DELIVERY PARTNERS AND PAYMENT PROCESSORS SOLELY TO FULFILL YOUR ORDERS." },
          { title: "5. COOKIES", content: "OUR PLATFORM USES COOKIES TO ENHANCE YOUR EXPERIENCE. YOU CAN DISABLE COOKIES IN YOUR BROWSER SETTINGS, BUT SOME FEATURES MAY NOT FUNCTION PROPERLY." },
          { title: "6. YOUR RIGHTS", content: "YOU HAVE THE RIGHT TO ACCESS, UPDATE, OR DELETE YOUR PERSONAL INFORMATION AT ANY TIME BY VISITING YOUR PROFILE SETTINGS OR CONTACTING US." },
          { title: "7. CHANGES TO POLICY", content: "WE MAY UPDATE THIS PRIVACY POLICY FROM TIME TO TIME. WE WILL NOTIFY YOU OF SIGNIFICANT CHANGES VIA EMAIL OR IN-APP NOTIFICATION." },
        ].map((section) => (
          <div key={section.title} className="bg-card rounded-2xl p-6 shadow-card border border-border">
            <h3 className="font-heading text-sm font-bold text-foreground uppercase tracking-tight mb-3">{section.title}</h3>
            <p className="text-muted-foreground uppercase tracking-wide text-xs leading-relaxed">{section.content}</p>
          </div>
        ))}

        <div className="text-center section-pink rounded-2xl p-8">
          <p className="text-muted-foreground uppercase tracking-wide text-xs">
            FOR ANY PRIVACY-RELATED CONCERNS, EMAIL US AT PRIVACY@CAFE12AM.COM
          </p>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default PrivacyPage;
