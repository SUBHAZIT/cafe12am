import featuresImage from "@/assets/features-section.png";

const FeaturesSection = () => {
  return (
    <section className="section-pink px-4 py-16 md:py-24" id="features">
      <div className="max-w-6xl mx-auto">
        <img
          src={featuresImage}
          alt="What's waiting for you on the app - Features including Late Night Delivery, Live Order Tracking, Student Combo Deals, Instant Payment, Fast 20-Min Delivery, Custom Snack Builder, Coupons & Offers, 24/7 Support Chat"
          className="w-full h-auto"
        />
      </div>
    </section>
  );
};

export default FeaturesSection;
