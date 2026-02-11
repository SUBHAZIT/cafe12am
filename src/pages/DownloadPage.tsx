import { ArrowLeft, Smartphone, Download, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const DownloadPage = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full border border-primary/20 animate-float" />
      <div className="absolute bottom-16 right-12 w-48 h-48 rounded-full border border-primary/10" />
      <div className="absolute top-20 right-1/4 w-3 h-3 rounded-full bg-primary/20 animate-pulse" />
      <div className="absolute top-16 right-16 w-4 h-4 rotate-45 border border-primary/20" />
      <div className="absolute bottom-24 left-20 w-6 h-6 rotate-45 border border-primary/15" />
      <div className="absolute top-0 left-1/3 w-px h-full opacity-[0.07]" style={{ backgroundImage: "repeating-linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--primary)) 4px, transparent 4px, transparent 12px)" }} />

      {/* Back button */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-heading text-sm uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" />
          BACK TO HOME
        </Link>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Hero */}
        <div className="mb-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-4 uppercase tracking-tight">
            GET THE CAFÉ12AM APP
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto uppercase tracking-wide leading-relaxed">
            YOUR MIDNIGHT SNACK COMPANION — ORDER FOOD, TRACK DELIVERY, AND GET EXCLUSIVE DEALS
          </p>
        </div>

        {/* Android Section */}
        <div className="bg-card rounded-3xl shadow-card p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-primary/5" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full border border-primary/8" />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Download className="w-6 h-6 text-primary" />
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight">
                ANDROID
              </h2>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 mb-6 max-w-lg mx-auto">
              <p className="font-heading font-bold text-sm uppercase tracking-wider text-primary mb-2">
                🎉 COMING SOON ON GOOGLE PLAY STORE
              </p>
              <p className="text-muted-foreground text-sm uppercase tracking-wide leading-relaxed">
                WE'VE APPLIED FOR THE GOOGLE PLAY DEVELOPER PROGRAMME. UNTIL THEN, SCAN THE QR CODE ON OUR LANDING PAGE OR CLICK BELOW TO DOWNLOAD THE APK DIRECTLY.
              </p>
            </div>

            <a
              href="https://drive.google.com/drive/folders/1JOKr1pxejak8tMsby09p2YrXwHTpvd24"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-foreground text-card font-heading font-semibold text-lg tracking-wide shadow-card hover:opacity-90 transition-all duration-300 uppercase"
            >
              <Download className="w-5 h-5" />
              DOWNLOAD APK
            </a>
          </div>
        </div>

        {/* iOS Section */}
        <div className="bg-card rounded-3xl shadow-card p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full border border-primary/5" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full border border-primary/8" />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight">
                iPHONE / iPAD
              </h2>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 mb-6 max-w-lg mx-auto">
              <p className="font-heading font-bold text-sm uppercase tracking-wider text-primary mb-3">
                USE AS PWA (PROGRESSIVE WEB APP)
              </p>
              <div className="text-left space-y-3 text-sm text-muted-foreground uppercase tracking-wide">
                <div className="flex gap-3">
                  <span className="font-heading font-bold text-primary shrink-0">1.</span>
                  <span>OPEN <strong className="text-foreground">CAFE12AM.STORE</strong> IN SAFARI</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-heading font-bold text-primary shrink-0">2.</span>
                  <span>TAP THE <strong className="text-foreground">SHARE</strong> BUTTON (SQUARE WITH ARROW)</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-heading font-bold text-primary shrink-0">3.</span>
                  <span>SELECT <strong className="text-foreground">"ADD TO HOME SCREEN"</strong></span>
                </div>
                <div className="flex gap-3">
                  <span className="font-heading font-bold text-primary shrink-0">4.</span>
                  <span>TAP <strong className="text-foreground">"ADD"</strong> — ENJOY THE APP!</span>
                </div>
              </div>
            </div>

            <a
              href="https://cafe12am.store"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-foreground text-card font-heading font-semibold text-lg tracking-wide shadow-card hover:opacity-90 transition-all duration-300 uppercase"
            >
              <Globe className="w-5 h-5" />
              OPEN IN BROWSER
            </a>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-8">
          CAFÉ12AM — MIDNIGHT HUNGER SOLVED
        </p>
      </div>
    </div>
  );
};

export default DownloadPage;
