import { Moon, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClosedPopupProps {
  onDismiss?: () => void;
  blockCheckout?: boolean;
}

const ClosedPopup = ({ onDismiss, blockCheckout = false }: ClosedPopupProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-md">
      <div className="bg-card rounded-3xl p-10 max-w-lg mx-4 text-center shadow-card relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full border border-primary/10" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full border border-primary/5" />
        <div className="absolute top-4 left-4 w-3 h-3 rotate-45 border border-primary/20" />
        <div className="absolute bottom-6 right-6 w-2 h-2 rounded-full bg-primary/20 animate-pulse" />

        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <Moon className="w-10 h-10 text-primary" />
          </div>

          <h2 className="font-heading text-3xl font-bold text-foreground mb-4 uppercase tracking-tight">
            WE ARE UNAVAILABLE RIGHT NOW
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed mb-6 uppercase tracking-wide">
            OUR KITCHEN IS CLOSED AFTER 2AM.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6 uppercase tracking-wide">
            PLEASE BRING YOUR SNACK CRAVINGS BACK TOMORROW FROM 7PM.
          </p>
          <p className="text-primary font-heading font-bold text-lg uppercase tracking-wider">
            THANK YOU FOR VISITING CAFE12AM
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm uppercase tracking-wider">OPEN DAILY 7:00 PM – 2:00 AM</span>
          </div>

          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="outline"
              className="mt-6 rounded-full font-heading font-bold uppercase tracking-wider"
            >
              <X className="w-4 h-4 mr-2" />
              {blockCheckout ? "GO BACK" : "BROWSE MENU ANYWAY"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClosedPopup;
