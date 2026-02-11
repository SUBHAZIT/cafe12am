import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package, Navigation, MapPin, ExternalLink, Phone, Clock, CheckCircle,
  Truck, XCircle, Timer, ChefHat, User, IndianRupee, AlertCircle, KeyRound
} from "lucide-react";

interface RiderOrdersProps {
  assignments: any[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onPickup: (id: string) => void;
  onDeliver: (id: string, otp: string) => void;
}

const getGoogleMapsLink = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

const getTimeSince = (dateStr: string) => {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};

const EARNING_PER_DELIVERY = 20;

const RiderOrders = ({ assignments, onAccept, onDecline, onPickup, onDeliver }: RiderOrdersProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const incoming = assignments.filter(a => a.status === "assigned");
  const accepted = assignments.filter(a => a.status === "accepted");
  const pickedUp = assignments.filter(a => a.status === "picked_up");
  const delivered = assignments.filter(a => a.status === "delivered").slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Incoming Orders */}
      {incoming.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-orange-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> NEW REQUESTS ({incoming.length})
          </h3>
          {incoming.map((a) => (
            <IncomingOrderCard key={a.id} assignment={a} onAccept={onAccept} onDecline={onDecline} />
          ))}
        </div>
      )}

      {/* Accepted - Navigate to Merchant */}
      {accepted.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-blue-600 flex items-center gap-2">
            <Navigation className="w-4 h-4" /> PICKUP ({accepted.length})
          </h3>
          {accepted.map((a) => (
            <ActiveDeliveryCard key={a.id} assignment={a} stage="pickup" onPickup={onPickup} />
          ))}
        </div>
      )}

      {/* Picked Up - Navigate to Customer */}
      {pickedUp.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-purple-600 flex items-center gap-2">
            <Truck className="w-4 h-4" /> DELIVERING ({pickedUp.length})
          </h3>
          {pickedUp.map((a) => (
            <ActiveDeliveryCard key={a.id} assignment={a} stage="deliver" onDeliver={onDeliver} />
          ))}
        </div>
      )}

      {/* No active orders */}
      {incoming.length === 0 && accepted.length === 0 && pickedUp.length === 0 && (
        <div className="text-center py-12 bg-card rounded-3xl shadow-card">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground uppercase tracking-wider text-sm font-heading font-bold">NO ACTIVE DELIVERIES</p>
          <p className="text-xs text-muted-foreground mt-1">New orders will appear here</p>
        </div>
      )}

      {/* Recent Completed */}
      {delivered.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-green-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> RECENTLY COMPLETED
          </h3>
          {delivered.map((a) => (
            <div key={a.id} className="bg-card rounded-2xl p-4 shadow-card opacity-70">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-heading font-bold text-sm">{a.orders?.order_number || "ORDER"}</p>
                  <p className="text-xs text-muted-foreground">{getTimeSince(a.delivered_at || a.created_at)}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-heading font-bold uppercase">DELIVERED</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* Incoming Order Card with Accept/Decline */
const IncomingOrderCard = ({ assignment: a, onAccept, onDecline }: { assignment: any; onAccept: (id: string) => void; onDecline: (id: string) => void }) => {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(a.created_at).getTime()) / 1000);
      setCountdown(Math.max(0, 120 - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, [a.created_at]);

  const customer = a.orders?.customer;
  const merchant = a.orders?.merchant;

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border-2 border-orange-400 animate-pulse-slow relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-orange-200">
        <div className="h-full bg-orange-500 transition-all" style={{ width: `${(countdown / 120) * 100}%` }} />
      </div>

      <div className="flex justify-between items-start mb-3 mt-1">
        <div>
          <p className="font-heading font-bold text-base uppercase tracking-wide">{a.orders?.order_number || "NEW ORDER"}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Timer className="w-3 h-3" /> {countdown}s remaining
          </p>
        </div>
        <div className="text-right">
          <p className="font-heading font-bold text-lg text-primary flex items-center gap-0.5">
            <IndianRupee className="w-4 h-4" />{EARNING_PER_DELIVERY}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase">EARNING</p>
        </div>
      </div>

      {/* Food Items */}
      <div className="bg-secondary/50 rounded-xl p-3 mb-3">
        <p className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
          <ChefHat className="w-3 h-3" /> ORDER ITEMS
        </p>
        {a.orders?.order_items?.map((item: any) => (
          <p key={item.id} className="text-sm text-foreground">{item.quantity}x {item.item_name} - Rs.{item.total_price}</p>
        ))}
        <div className="border-t border-border mt-2 pt-2 flex justify-between">
          <span className="text-xs font-heading font-bold uppercase">TOTAL</span>
          <span className="font-heading font-bold text-primary">Rs.{a.orders?.total_amount}</span>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
          {a.orders?.payment_method === "cod" ? "CASH ON DELIVERY" : "PAID ONLINE"}
        </p>
      </div>

      {/* Pickup Location */}
      <div className="bg-blue-50 rounded-xl p-3 mb-2">
        <p className="text-xs font-heading font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1 mb-1">
          <ChefHat className="w-3 h-3" /> PICKUP FROM
        </p>
        <p className="text-sm font-bold">{merchant?.full_name || "Merchant"}</p>
        {merchant?.address && <p className="text-xs text-muted-foreground">{merchant.address}</p>}
        {merchant?.phone && (
          <a href={`tel:${merchant.phone}`} className="inline-flex items-center gap-1 text-xs text-blue-600 mt-1">
            <Phone className="w-3 h-3" /> {merchant.phone}
          </a>
        )}
      </div>

      {/* Drop Location */}
      <div className="bg-green-50 rounded-xl p-3 mb-3">
        <p className="text-xs font-heading font-bold uppercase tracking-wider text-green-600 flex items-center gap-1 mb-1">
          <MapPin className="w-3 h-3" /> DELIVER TO
        </p>
        <p className="text-sm font-bold">{customer?.full_name || "Customer"}</p>
        <p className="text-xs text-muted-foreground">{a.orders?.delivery_address}</p>
        {customer?.phone && (
          <a href={`tel:${customer.phone}`} className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
            <Phone className="w-3 h-3" /> {customer.phone}
          </a>
        )}
      </div>

      {/* Delivery Notes */}
      {a.orders?.delivery_notes && (
        <div className="bg-yellow-50 rounded-xl p-2 mb-3">
          <p className="text-xs text-yellow-800">Note: {a.orders.delivery_notes}</p>
        </div>
      )}

      {/* Accept / Decline Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => onDecline(a.id)}
          variant="outline"
          className="flex-1 rounded-full font-heading font-bold text-xs uppercase tracking-wider border-red-300 text-red-600 hover:bg-red-50"
        >
          <XCircle className="w-4 h-4 mr-1" /> DECLINE
        </Button>
        <Button
          onClick={() => onAccept(a.id)}
          className="flex-1 rounded-full font-heading font-bold text-xs uppercase tracking-wider bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="w-4 h-4 mr-1" /> ACCEPT
        </Button>
      </div>
    </div>
  );
};

/* Active Delivery Card - Pickup or Deliver stage */
const ActiveDeliveryCard = ({ assignment: a, stage, onPickup, onDeliver }: {
  assignment: any;
  stage: "pickup" | "deliver";
  onPickup?: (id: string) => void;
  onDeliver?: (id: string, otp: string) => void;
}) => {
  const [otpInput, setOtpInput] = useState("");
  const customer = a.orders?.customer;
  const merchant = a.orders?.merchant;
  const targetAddress = stage === "pickup" ? (merchant?.address || "Merchant location") : a.orders?.delivery_address;
  const targetName = stage === "pickup" ? (merchant?.full_name || "Merchant") : (customer?.full_name || "Customer");
  const targetPhone = stage === "pickup" ? merchant?.phone : customer?.phone;

  return (
    <div className={`bg-card rounded-2xl p-5 shadow-card border-l-4 ${stage === "pickup" ? "border-l-blue-500" : "border-l-purple-500"}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-heading font-bold text-sm uppercase tracking-wide">{a.orders?.order_number || "ORDER"}</p>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-heading font-bold ${
            stage === "pickup" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
          }`}>
            {stage === "pickup" ? "GO TO MERCHANT" : "GO TO CUSTOMER"}
          </span>
        </div>
        <div className="text-right">
          <p className="font-heading font-bold text-sm text-primary flex items-center gap-0.5">
            <IndianRupee className="w-3 h-3" />{a.orders?.total_amount}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {a.orders?.payment_method === "cod" ? "COD" : "PAID"}
          </p>
        </div>
      </div>

      {/* Food Items */}
      <div className="bg-secondary/50 rounded-xl p-3 mb-3">
        <p className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground mb-1">ITEMS</p>
        {a.orders?.order_items?.map((item: any) => (
          <p key={item.id} className="text-sm">{item.quantity}x {item.item_name}</p>
        ))}
      </div>

      {/* Target Location */}
      <div className="bg-secondary/50 rounded-xl p-3 mb-3 space-y-2">
        <p className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3 text-primary" />
          {stage === "pickup" ? "PICKUP FROM" : "DELIVER TO"}
        </p>
        <p className="text-sm font-bold">{targetName}</p>
        <p className="text-sm text-foreground">{targetAddress}</p>

        <div className="flex gap-2">
          {targetAddress && (
            <a
              href={getGoogleMapsLink(targetAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              <Navigation className="w-4 h-4" /> NAVIGATE
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {targetPhone && (
            <a
              href={`tel:${targetPhone}`}
              className="inline-flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-wider hover:bg-secondary/80 transition-colors"
            >
              <Phone className="w-4 h-4" /> CALL
            </a>
          )}
        </div>
      </div>

      {/* Customer info when in pickup stage */}
      {stage === "pickup" && customer && (
        <div className="bg-green-50 rounded-xl p-3 mb-3">
          <p className="text-xs font-heading font-bold uppercase tracking-wider text-green-600 flex items-center gap-1 mb-1">
            <User className="w-3 h-3" /> CUSTOMER
          </p>
          <p className="text-sm font-bold">{customer.full_name}</p>
          <p className="text-xs text-muted-foreground">{a.orders?.delivery_address}</p>
        </div>
      )}

      {/* Delivery Notes */}
      {a.orders?.delivery_notes && (
        <div className="bg-yellow-50 rounded-xl p-2 mb-3">
          <p className="text-xs text-yellow-800">Note: {a.orders.delivery_notes}</p>
        </div>
      )}

      {/* Action Button */}
      <div>
        {stage === "pickup" && onPickup && (
          <Button
            onClick={() => onPickup(a.id)}
            className="w-full rounded-full font-heading font-bold text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Package className="w-4 h-4 mr-1" /> PICKED UP
          </Button>
        )}
        {stage === "deliver" && onDeliver && (
          <div className="space-y-3">
            <div className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-xl p-4">
              <p className="text-xs font-heading font-bold uppercase tracking-wider text-primary flex items-center gap-1 mb-2">
                <KeyRound className="w-3.5 h-3.5" /> ENTER DELIVERY OTP
              </p>
              <p className="text-[10px] text-muted-foreground mb-3">Ask the customer for the 4-digit OTP shown in their app</p>
              <Input
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="Enter 4-digit OTP"
                className="text-center text-2xl font-heading font-bold tracking-[0.3em] h-14 rounded-xl bg-card border-2 border-primary/20 focus:border-primary"
                maxLength={4}
                inputMode="numeric"
              />
            </div>
            <Button
              onClick={() => {
                if (otpInput.length !== 4) {
                  return;
                }
                onDeliver(a.id, otpInput);
              }}
              disabled={otpInput.length !== 4}
              className="w-full rounded-full font-heading font-bold text-xs uppercase tracking-wider bg-green-600 hover:bg-green-700 text-white h-12"
            >
              <CheckCircle className="w-4 h-4 mr-1" /> VERIFY & MARK DELIVERED
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderOrders;
