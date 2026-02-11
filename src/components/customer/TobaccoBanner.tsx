import { useState } from "react";
import { Cigarette, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import tobaccoBannerImg from "@/assets/tobacco-banner.png";

interface TobaccoBannerProps {
  onConfirmed: () => void;
}

const TobaccoBanner = ({ onConfirmed }: TobaccoBannerProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const [campusChecked, setCampusChecked] = useState(false);

  const canConfirm = ageChecked && campusChecked;

  const handleConfirm = () => {
    if (canConfirm) {
      setShowDialog(false);
      onConfirmed();
    }
  };

  return (
    <>
      {/* Banner */}
      <div className="mx-4 my-6">
        <div className="max-w-7xl mx-auto rounded-2xl overflow-hidden bg-amber-400 relative flex items-center">
          <div className="p-6 md:p-8 flex-1">
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
              Looking for tobacco products?
            </h3>
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-green-700 hover:bg-green-800 text-white font-heading font-bold uppercase tracking-wider rounded-xl px-6"
            >
              View Items
            </Button>
            <p className="text-foreground/70 text-sm mt-3">
              Caution: Tobacco products are injurious to health
            </p>
          </div>
          <div className="hidden sm:block w-40 md:w-52 h-full">
            <img
              src={tobaccoBannerImg}
              alt="Tobacco products"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Age verification dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-bold">
              Please make sure...
            </DialogTitle>
            <DialogDescription className="sr-only">
              Age and location verification for tobacco products
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="mt-1">
                <Checkbox
                  checked={ageChecked}
                  onCheckedChange={(v) => setAgeChecked(v === true)}
                />
              </div>
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                <span className="text-sm text-foreground leading-relaxed">
                  You are above the legal age (18+) and not buying tobacco on behalf of anyone who doesn't qualify the legal age.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <div className="mt-1">
                <Checkbox
                  checked={campusChecked}
                  onCheckedChange={(v) => setCampusChecked(v === true)}
                />
              </div>
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                <span className="text-sm text-foreground leading-relaxed">
                  Your delivery location is not inside a college hostel or campus premises.
                </span>
              </div>
            </label>

            <div className="bg-destructive/10 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-foreground leading-relaxed">
                For orders inside college hostel or campus, we do <strong>not support or accept</strong> any kind of tobacco or smoking orders. If you place such an order, it will be <strong>automatically cancelled and refunded</strong> to you.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              We are bound to report your account in case of any transgressions!
            </p>
          </div>

          <DialogFooter className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl font-heading font-bold uppercase tracking-wider"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!canConfirm}
              className="flex-1 bg-green-700 hover:bg-green-800 text-white rounded-xl font-heading font-bold uppercase tracking-wider"
              onClick={handleConfirm}
            >
              Yes, I Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TobaccoBanner;
