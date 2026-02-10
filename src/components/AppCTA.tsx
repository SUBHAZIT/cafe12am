import appMockup from "@/assets/app-mockup.png";

const AppCTA = () => {
  return (
    <section className="py-24 px-4 section-pink" id="app">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card rounded-3xl shadow-card overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-16 items-center">
            {/* Text */}
            <div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6 uppercase tracking-tight">
                DOWNLOAD THE APP NOW!
              </h2>
              <p className="text-muted-foreground text-lg mb-8 uppercase tracking-wide leading-relaxed">
                EXPERIENCE SEAMLESS MIDNIGHT ORDERING ONLY ON THE CAFE12AM APP. GET EXCLUSIVE DEALS AND FASTER DELIVERY.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-foreground text-card font-heading font-semibold hover:opacity-90 transition-opacity"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider opacity-80">GET IT ON</p>
                    <p className="text-sm font-bold uppercase">GOOGLE PLAY</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-foreground text-card font-heading font-semibold hover:opacity-90 transition-opacity"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.86 9.28 4.84C10.56 4.81 11.78 5.72 12.56 5.72C13.34 5.72 14.85 4.62 16.41 4.8C17.09 4.83 18.92 5.09 20.09 6.81C19.97 6.89 17.67 8.22 17.7 11.04C17.73 14.38 20.63 15.48 20.66 15.49C20.63 15.57 20.19 17.14 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider opacity-80">DOWNLOAD ON THE</p>
                    <p className="text-sm font-bold uppercase">APP STORE</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="flex justify-center relative">
              <div className="relative">
                <img
                  src={appMockup}
                  alt="Cafe12AM App"
                  className="w-64 md:w-80 drop-shadow-2xl"
                />
                {/* QR Code placeholder */}
                <div className="absolute -bottom-4 -right-4 bg-card rounded-2xl p-4 shadow-card">
                  <div className="w-24 h-24 bg-secondary rounded-xl flex items-center justify-center">
                    <div className="grid grid-cols-5 gap-0.5">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-sm ${Math.random() > 0.4 ? 'bg-foreground' : 'bg-transparent'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2 uppercase tracking-wider font-heading">
                    SCAN TO DOWNLOAD
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppCTA;
