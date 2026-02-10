import featuresImage from "@/assets/features-section.png";

const FeaturesSection = () => {
  return (
    <section className="section-pink w-full" id="features">
      <img
        src={featuresImage}
        alt="What's waiting for you on the app - Features including Late Night Delivery, Live Order Tracking, Student Combo Deals, Instant Payment, Fast 20-Min Delivery, Custom Snack Builder, Coupons & Offers, 24/7 Support Chat"
        className="w-full h-auto block"
      />
    </section>
  );
};

export default FeaturesSection;
