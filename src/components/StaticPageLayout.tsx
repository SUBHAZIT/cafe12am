import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "./Footer";

interface StaticPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const StaticPageLayout = ({ title, subtitle, children }: StaticPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <Link to="/" className="font-heading text-2xl font-bold text-primary uppercase tracking-tight">
            CAFÉ12AM
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative section-pink py-20 md:py-28 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full border-2 border-dashed border-primary/20 animate-float" />
        <div className="absolute bottom-10 right-16 w-14 h-14 rounded-full border-2 border-dashed border-primary/30 animate-float-delayed" />
        <div className="absolute top-1/2 right-10 w-4 h-4 bg-primary/20 rotate-45" />
        <div className="absolute top-20 right-1/3 w-3 h-3 bg-primary/15 rotate-45" />
        <div className="absolute bottom-16 left-1/4 w-6 h-6 rounded-full bg-primary/10" />
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none">
          <path d="M0 60L1440 60L1440 30Q1080 0 720 30Q360 60 0 30Z" fill="hsl(var(--background))" />
        </svg>

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground uppercase tracking-tight mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground uppercase tracking-wider text-sm md:text-base max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default StaticPageLayout;
