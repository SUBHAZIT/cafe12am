import StaticPageLayout from "@/components/StaticPageLayout";

const TermsPage = () => {
  return (
    <StaticPageLayout title="TERMS OF SERVICE" subtitle="PLEASE READ THESE TERMS CAREFULLY BEFORE USING CAFE12AM">
      <div className="space-y-8 max-w-3xl mx-auto">
        {[
          { title: "1. ACCEPTANCE OF TERMS", content: "BY ACCESSING OR USING CAFE12AM'S PLATFORM, YOU AGREE TO BE BOUND BY THESE TERMS OF SERVICE. IF YOU DO NOT AGREE, PLEASE DO NOT USE OUR SERVICES." },
          { title: "2. USE OF SERVICES", content: "CAFE12AM PROVIDES A FOOD ORDERING AND DELIVERY PLATFORM FOR CAMPUS STUDENTS. YOU MUST BE AT LEAST 16 YEARS OLD TO USE OUR SERVICES. YOU ARE RESPONSIBLE FOR MAINTAINING THE CONFIDENTIALITY OF YOUR ACCOUNT." },
          { title: "3. ORDERS AND PAYMENTS", content: "ALL ORDERS ARE SUBJECT TO AVAILABILITY AND MERCHANT ACCEPTANCE. PRICES MAY CHANGE WITHOUT NOTICE. PAYMENT MUST BE COMPLETED AT THE TIME OF ORDER UNLESS CASH ON DELIVERY IS SELECTED." },
          { title: "4. DELIVERY", content: "DELIVERY TIMES ARE ESTIMATES AND MAY VARY. CAFE12AM IS NOT RESPONSIBLE FOR DELAYS CAUSED BY FACTORS BEYOND OUR CONTROL. DELIVERY VERIFICATION VIA OTP IS REQUIRED." },
          { title: "5. CANCELLATION & REFUNDS", content: "ORDERS MAY BE CANCELLED BEFORE MERCHANT ACCEPTANCE. REFUNDS WILL BE PROCESSED WITHIN 5-7 BUSINESS DAYS TO THE ORIGINAL PAYMENT METHOD." },
          { title: "6. LIMITATION OF LIABILITY", content: "CAFE12AM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM THE USE OF OUR PLATFORM." },
          { title: "7. CHANGES TO TERMS", content: "WE RESERVE THE RIGHT TO MODIFY THESE TERMS AT ANY TIME. CONTINUED USE OF THE PLATFORM AFTER CHANGES CONSTITUTES ACCEPTANCE." },
        ].map((section) => (
          <div key={section.title} className="bg-card rounded-2xl p-6 shadow-card border border-border">
            <h3 className="font-heading text-sm font-bold text-foreground uppercase tracking-tight mb-3">{section.title}</h3>
            <p className="text-muted-foreground uppercase tracking-wide text-xs leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </StaticPageLayout>
  );
};

export default TermsPage;
