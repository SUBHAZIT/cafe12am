import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CustomerNav from "@/components/customer/CustomerNav";
import { Package, Clock, CheckCircle, Truck, ChefHat, MapPin, XCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const statusSteps = [
  { key: "placed", label: "Order Placed", icon: Clock },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready_for_pickup", label: "Ready", icon: Package },
  { key: "out_for_delivery", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const statusColors: Record<string, string> = {
  placed: "bg-yellow-100 text-yellow-700",
  pending: "bg-yellow-100 text-yellow-700",
  preparing: "bg-orange-100 text-orange-700",
  ready_for_pickup: "bg-blue-100 text-blue-700",
  rider_assigned: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const getTimeSince = (dateStr: string) => {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const CustomerOrders = () => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingComments, setRatingComments] = useState<Record<string, string>>({});
  const [submittedRatings, setSubmittedRatings] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!profile) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("customer_id", profile.id)
        .order("created_at", { ascending: false });
      if (data) {
        setOrders(data);
        const active = data.find(o => !["delivered", "cancelled"].includes(o.status));
        if (active) setExpandedOrder(active.id);
      }
      setLoading(false);
    };

    // Fetch existing ratings
    const fetchRatings = async () => {
      const { data } = await supabase
        .from("ratings")
        .select("order_id")
        .eq("user_id", profile.id);
      if (data) {
        setSubmittedRatings(new Set(data.map(r => r.order_id)));
      }
    };

    fetchOrders();
    fetchRatings();

    const channel = supabase
      .channel("customer-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `customer_id=eq.${profile.id}` }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const getStepIndex = (status: string) => {
    if (status === "rider_assigned") return 2;
    const idx = statusSteps.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const isActiveOrder = (status: string) => !["delivered", "cancelled"].includes(status);

  const submitRating = async (orderId: string) => {
    if (!profile) return;
    const rating = ratings[orderId];
    if (!rating) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("ratings").insert({
      order_id: orderId,
      user_id: profile.id,
      rating,
      comment: ratingComments[orderId] || null,
    });
    if (error) {
      toast({ title: "Failed to submit rating", variant: "destructive" });
    } else {
      setSubmittedRatings(prev => new Set(prev).add(orderId));
      toast({ title: "Thank you for your feedback! ⭐" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CustomerNav />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight mb-8">MY ORDERS</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-card animate-pulse h-32" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl shadow-card">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground uppercase tracking-wider">NO ORDERS YET</p>
            <p className="text-sm text-muted-foreground mt-2">YOUR ORDERS WILL APPEAR HERE</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const currentStep = getStepIndex(order.status);
              const isActive = isActiveOrder(order.status);
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className={`bg-card rounded-2xl shadow-card relative overflow-hidden transition-all ${isActive ? "ring-2 ring-primary/20" : ""}`}
                >
                  {isActive && (
                    <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}

                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full text-left p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="pl-4">
                        <p className="font-heading font-bold text-sm uppercase tracking-wider">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground mt-1">{getTimeSince(order.created_at)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${statusColors[order.status] || "bg-secondary text-foreground"}`}>
                        {order.status === "cancelled" && <XCircle className="w-3 h-3 inline mr-1" />}
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {!isExpanded && (
                      <div className="pl-4 mt-2 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {order.order_items?.length} item{order.order_items?.length !== 1 ? "s" : ""}
                        </p>
                        <span className="font-heading font-bold text-primary">₹{order.total_amount}</span>
                      </div>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4">
                      {/* Tracking pipeline */}
                      {order.status !== "cancelled" && (
                        <div className="bg-secondary/50 rounded-xl p-4">
                          <p className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground mb-4">ORDER TRACKING</p>
                          <div className="flex items-center justify-between relative">
                            <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
                            <div
                              className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
                              style={{ width: `${Math.min(100, (currentStep / (statusSteps.length - 1)) * 100)}%`, maxWidth: "calc(100% - 2rem)" }}
                            />
                            {statusSteps.map((step, i) => {
                              const StepIcon = step.icon;
                              const isCompleted = i <= currentStep;
                              const isCurrent = i === currentStep;
                              return (
                                <div key={step.key} className="relative z-10 flex flex-col items-center" style={{ width: "20%" }}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    isCurrent ? "bg-primary text-primary-foreground scale-110 ring-4 ring-primary/20" :
                                    isCompleted ? "bg-primary text-primary-foreground" :
                                    "bg-muted text-muted-foreground"
                                  }`}>
                                    <StepIcon className="w-4 h-4" />
                                  </div>
                                  <p className={`text-[9px] mt-1.5 text-center font-heading font-bold uppercase tracking-wider ${
                                    isCompleted ? "text-primary" : "text-muted-foreground"
                                  }`}>
                                    {step.label}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          {isActive && (
                            <div className="mt-4 text-center">
                              <p className="text-xs text-muted-foreground">
                                {order.status === "placed" && "⏳ Waiting for restaurant to accept..."}
                                {order.status === "pending" && "⏳ Waiting for restaurant to accept..."}
                                {order.status === "preparing" && "👨‍🍳 Your food is being prepared..."}
                                {order.status === "ready_for_pickup" && "📦 Your order is ready! Waiting for rider..."}
                                {order.status === "rider_assigned" && "🚴 Rider assigned! Picking up your order..."}
                                {order.status === "out_for_delivery" && "🛵 Your order is on its way!"}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ===== OTP SECTION - Prominent display ===== */}
                      {order.delivery_otp && order.status === "out_for_delivery" && (
                        <div className="text-center p-5 bg-primary/10 rounded-2xl border-2 border-dashed border-primary/40 animate-pulse">
                          <p className="text-xs font-heading font-bold text-primary uppercase tracking-wider mb-2">🔐 YOUR DELIVERY OTP</p>
                          <p className="font-heading text-4xl font-bold text-primary tracking-[0.4em] my-3">{order.delivery_otp}</p>
                          <p className="text-xs text-muted-foreground">Share this code with your delivery partner to confirm delivery</p>
                          <p className="text-[10px] text-red-500 font-bold mt-2 uppercase">DO NOT SHARE BEFORE RECEIVING YOUR ORDER</p>
                        </div>
                      )}

                      {/* Order items */}
                      <div>
                        <p className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">ITEMS</p>
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm py-1.5">
                            <span className="text-muted-foreground">{item.quantity}x {item.item_name}</span>
                            <span className="font-heading font-bold">₹{item.total_price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery info */}
                      {order.delivery_address && (
                        <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-xl">
                          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">DELIVERY TO</p>
                            <p className="text-sm text-foreground mt-0.5">{order.delivery_address}</p>
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      <div className="border-t border-border pt-3 flex justify-between items-center">
                        <div>
                          <span className="font-heading font-bold text-sm uppercase tracking-wider">TOTAL</span>
                          <p className="text-[10px] text-muted-foreground uppercase">
                            {order.payment_method === "cod" ? "💵 Cash on Delivery" : "✅ Paid Online"}
                          </p>
                        </div>
                        <span className="font-heading font-bold text-primary text-xl">₹{order.total_amount}</span>
                      </div>

                      {/* ===== RATING SECTION - After delivery ===== */}
                      {order.status === "delivered" && !submittedRatings.has(order.id) && (
                        <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                          <p className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">RATE YOUR ORDER</p>
                          <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRatings(prev => ({ ...prev, [order.id]: star }))}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-8 h-8 ${(ratings[order.id] || 0) >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                />
                              </button>
                            ))}
                          </div>
                          <Textarea
                            placeholder="Tell us about your experience (optional)"
                            value={ratingComments[order.id] || ""}
                            onChange={(e) => setRatingComments(prev => ({ ...prev, [order.id]: e.target.value }))}
                            className="rounded-xl bg-card border-0 text-sm min-h-[60px]"
                          />
                          <Button
                            onClick={() => submitRating(order.id)}
                            disabled={!ratings[order.id]}
                            className="w-full rounded-full font-heading font-bold text-xs uppercase tracking-wider"
                          >
                            SUBMIT RATING
                          </Button>
                        </div>
                      )}

                      {order.status === "delivered" && submittedRatings.has(order.id) && (
                        <div className="text-center p-3 bg-green-50 rounded-xl">
                          <p className="text-xs font-heading font-bold text-green-600 uppercase tracking-wider">⭐ THANKS FOR YOUR FEEDBACK!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
