import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CustomerNav from "@/components/customer/CustomerNav";
import { Package, Clock, CheckCircle, Truck, ChefHat } from "lucide-react";

const statusIcons: Record<string, any> = {
  placed: Clock,
  preparing: ChefHat,
  rider_assigned: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle,
};

const statusColors: Record<string, string> = {
  placed: "bg-yellow-100 text-yellow-700",
  preparing: "bg-orange-100 text-orange-700",
  rider_assigned: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const CustomerOrders = () => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("customer_id", profile.id)
        .order("created_at", { ascending: false });
      if (data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel("customer-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `customer_id=eq.${profile.id}` }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile]);

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
              const Icon = statusIcons[order.status] || Clock;
              return (
                <div key={order.id} className="bg-card rounded-2xl p-6 shadow-card relative overflow-hidden">
                  <div className="absolute top-2 right-2 w-2 h-2 rotate-45 border border-primary/20" />
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-heading font-bold text-sm uppercase tracking-wider">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${statusColors[order.status] || "bg-secondary text-foreground"}`}>
                      <Icon className="w-3 h-3 inline mr-1" />
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span className="text-muted-foreground uppercase tracking-wide">{item.quantity}x {item.item_name}</span>
                      <span className="font-heading font-bold">₹{item.total_price}</span>
                    </div>
                  ))}

                  <div className="border-t border-border mt-3 pt-3 flex justify-between">
                    <span className="font-heading font-bold text-sm uppercase tracking-wider">TOTAL</span>
                    <span className="font-heading font-bold text-primary text-lg">₹{order.total_amount}</span>
                  </div>
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
