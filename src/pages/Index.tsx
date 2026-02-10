import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import FoodShowcase from "@/components/FoodShowcase";
import NightGoldSection from "@/components/NightGoldSection";
import AppCTA from "@/components/AppCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FoodShowcase />
      <FeaturesSection />
      <NightGoldSection />
      <AppCTA />
      <Footer />
    </div>
  );
};

export default Index;
