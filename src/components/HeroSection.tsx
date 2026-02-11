import { useNavigate } from "react-router-dom";
import heroVideo from "@/assets/hero-video.mp4";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src={heroVideo}
      />
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-up">
        <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-primary-foreground mb-4">
          CAFÉ12AM
        </h1>
        <p className="font-heading text-xl md:text-2xl lg:text-3xl font-medium tracking-widest text-primary-foreground/90 mb-2">
          CAMPUS'S MIDNIGHT SNACK DESTINATION
        </p>
        <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 tracking-wider">MIDNIGHT HUNGER SOLVED</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-card text-primary font-heading font-semibold text-lg tracking-wide shadow-card hover:shadow-soft hover:scale-105 transition-all duration-300 uppercase"
          >
            ORDER NOW
          </button>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-primary-foreground/30 text-primary-foreground font-heading font-semibold text-lg tracking-wide hover:bg-primary-foreground/10 hover:border-primary-foreground/60 transition-all duration-300 uppercase"
          >
            VIEW MENU
          </button>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
