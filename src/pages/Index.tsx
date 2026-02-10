import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import FoodShowcase from "@/components/FoodShowcase";
import AppCTA from "@/components/AppCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FoodShowcase />
      <FeaturesSection />
      <AppCTA />
      <Footer />
    </div>
  );
};

export default Index;
