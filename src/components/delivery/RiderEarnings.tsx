import { IndianRupee, Package, Clock, CheckCircle, ChefHat } from "lucide-react";

const EARNING_PER_DELIVERY = 20;

interface RiderEarningsProps {
  assignments: any[];
  payouts: any[];
}

const RiderEarnings = ({ assignments, payouts }: RiderEarningsProps) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - (now.getDay() * 86400000);

  const delivered = assignments.filter(a => a.status === "delivered");
  const todayDelivered = delivered.filter(a => new Date(a.delivered_at || a.created_at).getTime() >= todayStart);
  const weekDelivered = delivered.filter(a => new Date(a.delivered_at || a.created_at).getTime() >= weekStart);

  const todayEarnings = todayDelivered.length * EARNING_PER_DELIVERY;
  const weekEarnings = weekDelivered.length * EARNING_PER_DELIVERY;
  const totalPaidOut = payouts.filter(p => p.status === "completed").reduce((a, p) => a + Number(p.amount || 0), 0);
  const pendingPayout = payouts.filter(p => p.status === "pending").reduce((a, p) => a + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <IndianRupee className="w-5 h-5 text-primary mb-2" />
          <p className="font-heading text-2xl font-bold text-primary">Rs.{todayEarnings}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">TODAY ({todayDelivered.length} orders)</p>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <IndianRupee className="w-5 h-5 text-foreground mb-2" />
          <p className="font-heading text-2xl font-bold text-foreground">Rs.{weekEarnings}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">THIS WEEK ({weekDelivered.length} orders)</p>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <Clock className="w-5 h-5 text-yellow-600 mb-2" />
          <p className="font-heading text-2xl font-bold text-yellow-600">Rs.{pendingPayout}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">PENDING PAYOUT</p>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
          <p className="font-heading text-2xl font-bold text-green-600">Rs.{totalPaidOut}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">TOTAL PAID</p>
        </div>
      </div>

      {/* Earning Rate Info */}
      <div className="bg-primary/10 rounded-2xl p-4 flex items-center gap-3">
        <IndianRupee className="w-8 h-8 text-primary" />
        <div>
          <p className="font-heading font-bold text-sm uppercase tracking-wider">Rs.{EARNING_PER_DELIVERY} PER DELIVERY</p>
          <p className="text-xs text-muted-foreground">You earn Rs.{EARNING_PER_DELIVERY} for every completed delivery</p>
        </div>
      </div>

      {/* All Delivered Orders with Food Details */}
      <div>
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <ChefHat className="w-4 h-4" /> ALL DELIVERIES ({delivered.length})
        </h3>
        {delivered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 uppercase tracking-wider text-sm">NO DELIVERIES YET</p>
        ) : (
          <div className="space-y-2">
            {delivered.map((a) => (
              <div key={a.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-heading font-bold text-sm">{a.orders?.order_number || "ORDER"}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.delivered_at ? new Date(a.delivered_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                  <span className="font-heading font-bold text-primary flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />{EARNING_PER_DELIVERY}
                  </span>
                </div>
                {/* Food Items */}
                <div className="space-y-0.5">
                  {a.orders?.order_items?.map((item: any) => (
                    <p key={item.id} className="text-xs text-muted-foreground">{item.quantity}x {item.item_name}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout History */}
      <div>
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-3">PAYOUT HISTORY</h3>
        {payouts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 uppercase tracking-wider text-sm">NO PAYOUTS YET</p>
        ) : payouts.map((p) => (
          <div key={p.id} className="bg-card rounded-2xl p-4 shadow-card mb-2 flex justify-between">
            <div>
              <p className="font-heading font-bold text-sm">Rs.{p.amount}</p>
              <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`text-xs font-heading font-bold px-2 py-1 rounded-full self-start uppercase ${p.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiderEarnings;
