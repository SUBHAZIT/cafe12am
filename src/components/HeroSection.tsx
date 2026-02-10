import heroFood from "@/assets/hero-food.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroFood})` }}
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
          <a
            href="#menu"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-card text-primary font-heading font-semibold text-lg tracking-wide shadow-card hover:shadow-soft hover:scale-105 transition-all duration-300 uppercase"
          >
            ORDER NOW
          </a>
          <a
            href="#food-showcase"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-primary-foreground/30 text-primary-foreground font-heading font-semibold text-lg tracking-wide hover:bg-primary-foreground/10 hover:border-primary-foreground/60 transition-all duration-300 uppercase"
          >
            VIEW MENU
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce">
          <p className="text-primary-foreground/60 text-sm tracking-widest uppercase mb-2">SCROLL DOWN</p>
          <svg
            className="w-6 h-6 mx-auto text-primary-foreground/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
