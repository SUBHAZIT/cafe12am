import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Package, ChefHat, Store, LogOut, BarChart3, ToggleLeft, ToggleRight, User,
  Clock, CheckCircle, XCircle, AlertTriangle, Truck, Bell, Timer, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import CategoryManager from "@/components/merchant/CategoryManager";
import MenuItemManager from "@/components/merchant/MenuItemManager";
import ComboManager from "@/components/merchant/ComboManager";
import emailjs from "@emailjs/browser";

type Tab = "new" | "preparing" | "ready" | "completed" | "menu" | "dashboard";
type MenuSubTab = "categories" | "items" | "combos";

const AUTO_CANCEL_MINUTES = 5;

const MerchantDashboard = () => {
  const { signOut, profile } = useAuth();
  const [tab, setTab] = useState<Tab>("new");
  const [menuSubTab, setMenuSubTab] = useState<MenuSubTab>("categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [, setTick] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevNewCountRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!profile) return;
    fetchAll();

    const channel = supabase
      .channel("merchant-orders-kitchen")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `merchant_id=eq.${profile.id}` }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  useEffect(() => {
    const newOrders = orders.filter(o => o.status === "placed" || o.status === "pending");
    if (newOrders.length > prevNewCountRef.current && prevNewCountRef.current >= 0) {
      playAlert();
    }
    prevNewCountRef.current = newOrders.length;
  }, [orders]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      orders.forEach(async (o) => {
        if ((o.status === "placed" || o.status === "pending") &&
            (now - new Date(o.created_at).getTime()) > AUTO_CANCEL_MINUTES * 60000) {
          await supabase.from("orders").update({
            status: "cancelled",
            delivery_notes: (o.delivery_notes || "") + " [Auto-cancelled: merchant did not respond]"
          }).eq("id", o.id);
          fetchOrders();
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [orders]);

  const playAlert = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTYAAAB/f39/f39/f39/f399fXt7eXl3d3V1c3NxcW9vbW1ra2lpZ2dlZWNjYWFfX11dW1tZWVdXVVVTU1FRTU1LS0lJR0c=");
      }
      audioRef.current.play().catch(() => {});
    } catch {}
  };

  const fetchAll = () => {
    fetchOrders();
    fetchMenu();
    fetchSettings();
  };

  const fetchOrders = async () => {
    if (!profile) return;
    const { data } = await supabase.from("orders").select("*, order_items(*)").eq("merchant_id", profile.id).order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const fetchMenu = async () => {
    if (!profile) return;
    const { data } = await supabase.from("menu_items").select("*, categories(name)").eq("merchant_id", profile.id);
    if (data) setMenuItems(data);
  };

  const fetchSettings = async () => {
    if (!profile) return;
    const { data } = await supabase.from("merchant_settings").select("*").eq("merchant_id", profile.id).maybeSingle();
    setSettings(data);
  };

  const acceptOrder = async (orderId: string) => {
    await supabase.from("orders").update({ status: "preparing" }).eq("id", orderId);
    fetchOrders();
    toast({ title: "Order accepted! Moving to kitchen." });
  };

  const rejectOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    await supabase.from("orders").update({
      status: "cancelled",
      delivery_notes: rejectReason ? `Rejected: ${rejectReason}` : "Rejected by merchant"
    }).eq("id", orderId);
    
    // Send rejection email
    if (order) {
      sendRejectionEmail(order, rejectReason || "Order could not be fulfilled at this time");
    }
    
    setRejectingOrderId(null);
    setRejectReason("");
    fetchOrders();
    toast({ title: "Order rejected", variant: "destructive" });
  };

  const sendRejectionEmail = async (order: any, reason: string) => {
    try {
      // Get customer profile to find email
      const { data: customerProfile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", order.customer_id)
        .maybeSingle();
      
      const customerEmail = customerProfile?.email;
      if (!customerEmail) {
        console.warn("No customer email found for rejection notification");
        return;
      }

      const itemsHtml = order.order_items?.map((i: any) => `${i.item_name} x${i.quantity} — ₹${i.total_price}`).join("\n") || "";

      await emailjs.send("service_iyz5u2i", "template_1e37z7b", {
        to_email: customerEmail,
        to_name: customerProfile?.full_name || "Customer",
        order_id: order.order_number,
        order_items: itemsHtml,
        total_amount: `₹${order.total_amount}`,
        reason: reason,
        message: `We're sorry, your order #${order.order_number} has been rejected. Reason: ${reason}`,
      }, "VsUWcXNxfOtX_MoJs");
      console.log("Rejection email sent to", customerEmail);
    } catch (err: any) {
      console.error("Failed to send rejection email:", err);
    }
  };

  const markReady = async (orderId: string) => {
    // Update order status - the database trigger will auto-assign a rider
    const { error } = await supabase.from("orders").update({ status: "ready_for_pickup" }).eq("id", orderId);
    if (error) {
      toast({ title: "Failed to update order", variant: "destructive" });
      return;
    }
    
    // Check if a rider was assigned by the trigger
    setTimeout(async () => {
      const { data: assignment } = await supabase
        .from("delivery_assignments")
        .select("id")
        .eq("order_id", orderId)
        .maybeSingle();
      
      if (assignment) {
        toast({ title: "Order ready! Rider assigned automatically." });
      } else {
        toast({ title: "Order ready! No online riders found - will auto-assign when a rider comes online.", variant: "destructive" });
      }
    }, 1000);
    
    fetchOrders();
  };

  const confirmPickup = async (orderId: string) => {
    await supabase.from("orders").update({ status: "out_for_delivery" }).eq("id", orderId);
    fetchOrders();
    toast({ title: "Order picked up by rider!" });
  };

  const toggleStore = async () => {
    if (!profile) return;
    if (settings) {
      await supabase.from("merchant_settings").update({ is_open: !settings.is_open }).eq("merchant_id", profile.id);
    } else {
      await supabase.from("merchant_settings").insert([{ merchant_id: profile.id, is_open: true }]);
    }
    fetchSettings();
  };

  const getTimeSince = (dateStr: string) => {
    const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ${secs % 60}s`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const getCountdownSecs = (dateStr: string) => {
    return Math.max(0, AUTO_CANCEL_MINUTES * 60 - Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
  };

  // Filter out online payment orders that haven't been paid yet
  const paidOrCodOrders = orders.filter(o => {
    if (o.payment_method === "cod") return true;
    // Online payment: only show if payment completed
    return o.payment_status === "paid";
  });
  
  const newOrders = paidOrCodOrders.filter(o => o.status === "placed" || o.status === "pending");
  const preparingOrders = paidOrCodOrders.filter(o => o.status === "preparing");
  const readyOrders = paidOrCodOrders.filter(o => o.status === "ready_for_pickup" || o.status === "rider_assigned");
  const completedOrders = paidOrCodOrders.filter(o => ["out_for_delivery", "delivered", "cancelled"].includes(o.status));
  const todayOrders = paidOrCodOrders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.filter(o => o.status === "delivered").reduce((a, o) => a + Number(o.total_amount || 0), 0);

  const tabs = [
    { id: "new" as Tab, label: "NEW", icon: Bell, count: newOrders.length, alert: newOrders.length > 0 },
    { id: "preparing" as Tab, label: "KITCHEN", icon: ChefHat, count: preparingOrders.length },
    { id: "ready" as Tab, label: "READY", icon: Package, count: readyOrders.length },
    { id: "completed" as Tab, label: "DONE", icon: CheckCircle, count: completedOrders.length },
    { id: "menu" as Tab, label: "MENU", icon: ChefHat },
    { id: "dashboard" as Tab, label: "STATS", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-xl font-bold text-primary uppercase tracking-tight">CAFE12AM</h1>
            <span className="text-xs font-heading font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">KITCHEN</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleStore} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${settings?.is_open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {settings?.is_open ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {settings?.is_open ? "OPEN" : "CLOSED"}
            </button>
            <Link to="/merchant/profile" className="p-2 rounded-full hover:bg-secondary"><User className="w-5 h-5 text-muted-foreground" /></Link>
            <button onClick={signOut} className="p-2 rounded-full hover:bg-secondary"><LogOut className="w-5 h-5 text-muted-foreground" /></button>
          </div>
        </div>
      </nav>

      {/* Live dashboard strip */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="font-heading font-bold text-foreground">Queue: <span className="text-primary">{newOrders.length + preparingOrders.length}</span></span>
            <span className="font-heading font-bold text-foreground">Today: <span className="text-primary">{todayOrders.filter(o => o.status === "delivered").length}</span></span>
            <span className="font-heading font-bold text-foreground">Revenue: <span className="text-primary">Rs.{todayRevenue}</span></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Tab bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all relative ${
                tab === t.id ? "bg-primary text-primary-foreground shadow-soft" : "bg-card text-muted-foreground hover:bg-secondary"
              } ${t.alert ? "animate-pulse" : ""}`}
            >
              <t.icon className="w-5 h-5" />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`ml-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                  tab === t.id ? "bg-primary-foreground text-primary" : t.alert ? "bg-red-500 text-white" : "bg-muted text-foreground"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* NEW ORDERS TAB */}
        {tab === "new" && (
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" /> NEW ORDERS
              {newOrders.length > 0 && <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full animate-bounce">{newOrders.length}</span>}
            </h2>
            {newOrders.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-3xl shadow-card">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground uppercase tracking-wider text-sm">WAITING FOR ORDERS...</p>
              </div>
            ) : newOrders.map((o) => {
              const countdown = getCountdownSecs(o.created_at);
              const isUrgent = countdown < 60;
              return (
                <div key={o.id} className={`bg-card rounded-2xl p-5 shadow-card border-2 transition-all ${isUrgent ? "border-red-400 animate-pulse" : "border-primary/30"}`}>
                  {/* Timer bar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Timer className={`w-5 h-5 ${isUrgent ? "text-red-500" : "text-primary"}`} />
                      <span className={`font-heading font-bold text-lg ${isUrgent ? "text-red-500" : "text-primary"}`}>
                        {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">to accept</span>
                    </div>
                    <span className="text-xs uppercase tracking-wider bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-heading font-bold">
                      NEW
                    </span>
                  </div>

                  {/* Order info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <p className="font-heading font-bold text-lg uppercase tracking-wide">{o.order_number}</p>
                      <p className="font-heading font-bold text-primary text-xl">Rs.{o.total_amount}</p>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {getTimeSince(o.created_at)} ago
                    </p>
                  </div>

                  {/* Items */}
                  <div className="bg-secondary/50 rounded-xl p-3 mb-3">
                    {o.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between py-1">
                        <span className="font-heading font-bold text-sm">{item.quantity}x {item.item_name}</span>
                        <span className="text-sm text-muted-foreground">Rs.{item.total_price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  <p className="text-xs text-muted-foreground mb-2">Address: {o.delivery_address}</p>

                  {/* Payment */}
                  <p className="text-xs text-muted-foreground mb-3">
                    {o.payment_method === "cod" ? "CASH ON DELIVERY" : "PAID ONLINE"} | {o.payment_status}
                  </p>

                  {/* Special notes */}
                  {o.delivery_notes && (
                    <div className="bg-yellow-50 rounded-lg p-2 mb-3">
                      <p className="text-xs text-yellow-800 font-bold">NOTE: {o.delivery_notes}</p>
                    </div>
                  )}

                  {/* Action buttons - BIG */}
                  {rejectingOrderId === o.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection (optional)..."
                        className="min-h-[60px] text-sm"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => rejectOrder(o.id)} variant="destructive" className="flex-1 h-12 rounded-2xl font-heading font-bold uppercase tracking-wider">
                          CONFIRM REJECT
                        </Button>
                        <Button onClick={() => setRejectingOrderId(null)} variant="outline" className="h-12 rounded-2xl font-heading font-bold uppercase tracking-wider">
                          CANCEL
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => acceptOrder(o.id)}
                        className="flex-1 h-14 rounded-2xl font-heading font-bold text-base uppercase tracking-wider bg-green-600 hover:bg-green-700"
                      >
                        ACCEPT & PREPARE
                      </Button>
                      <Button
                        onClick={() => setRejectingOrderId(o.id)}
                        variant="destructive"
                        className="h-14 rounded-2xl font-heading font-bold text-base uppercase tracking-wider px-6"
                      >
                        REJECT
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PREPARING TAB (Kitchen Queue) */}
        {tab === "preparing" && (
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-primary" /> KITCHEN QUEUE
            </h2>
            {preparingOrders.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-3xl shadow-card">
                <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground uppercase tracking-wider text-sm">KITCHEN IS CLEAR</p>
              </div>
            ) : preparingOrders
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((o, idx) => {
                const elapsedSecs = Math.floor((Date.now() - new Date(o.created_at).getTime()) / 1000);
                const elapsedMins = Math.floor(elapsedSecs / 60);
                const isLate = elapsedMins > 20;
                return (
                  <div key={o.id} className={`bg-card rounded-2xl p-5 shadow-card border-l-4 ${isLate ? "border-l-red-500" : "border-l-primary"}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-sm">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-heading font-bold text-sm uppercase tracking-wide">{o.order_number}</p>
                          <p className="font-heading font-bold text-primary">Rs.{o.total_amount}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 font-heading font-bold text-sm ${isLate ? "text-red-500" : "text-foreground"}`}>
                          <Timer className="w-4 h-4" /> {getTimeSince(o.created_at)}
                        </div>
                        {isLate && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3" /> DELAYED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Items checklist */}
                    <div className="bg-secondary/50 rounded-xl p-3 mb-3">
                      {o.order_items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2 py-1.5">
                          <div className="w-5 h-5 rounded border-2 border-muted-foreground/30" />
                          <span className="font-heading font-bold text-sm flex-1">{item.quantity}x {item.item_name}</span>
                        </div>
                      ))}
                    </div>

                    {o.delivery_notes && (
                      <p className="text-xs text-yellow-800 bg-yellow-50 rounded-lg p-2 mb-3">NOTE: {o.delivery_notes}</p>
                    )}

                    <Button
                      onClick={() => markReady(o.id)}
                      className="w-full h-14 rounded-2xl font-heading font-bold text-base uppercase tracking-wider"
                    >
                      MARK AS READY <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                );
              })}
          </div>
        )}

        {/* READY TAB (Rider Pickup) */}
        {tab === "ready" && (
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Truck className="w-6 h-6 text-primary" /> READY FOR PICKUP
            </h2>
            {readyOrders.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-3xl shadow-card">
                <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground uppercase tracking-wider text-sm">NO ORDERS WAITING</p>
              </div>
            ) : readyOrders.map((o) => (
              <div key={o.id} className="bg-card rounded-2xl p-5 shadow-card border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-heading font-bold text-lg uppercase tracking-wide">{o.order_number}</p>
                    <p className="font-heading font-bold text-primary text-xl">Rs.{o.total_amount}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-heading font-bold text-muted-foreground">
                      <Clock className="w-4 h-4" /> Waiting {getTimeSince(o.created_at)}
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-3 mb-3">
                  {o.order_items?.map((item: any) => (
                    <p key={item.id} className="text-sm font-heading font-bold py-0.5">{item.quantity}x {item.item_name}</p>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mb-3">Address: {o.delivery_address}</p>

                <Button
                  onClick={() => confirmPickup(o.id)}
                  className="w-full h-14 rounded-2xl font-heading font-bold text-base uppercase tracking-wider bg-blue-600 hover:bg-blue-700"
                >
                  CONFIRM RIDER PICKUP
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* COMPLETED TAB */}
        {tab === "completed" && (
          <div className="space-y-3">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" /> COMPLETED ORDERS
            </h2>
            {completedOrders.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-3xl shadow-card">
                <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground uppercase tracking-wider text-sm">NO COMPLETED ORDERS</p>
              </div>
            ) : completedOrders.slice(0, 20).map((o) => (
              <div key={o.id} className="bg-card rounded-2xl p-4 shadow-card flex items-center justify-between">
                <div>
                  <p className="font-heading font-bold text-sm uppercase tracking-wide">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{getTimeSince(o.created_at)} ago</p>
                  <p className="text-xs text-muted-foreground">{o.order_items?.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold text-primary">Rs.{o.total_amount}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-heading font-bold uppercase ${
                    o.status === "delivered" ? "bg-green-100 text-green-700" :
                    o.status === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-purple-100 text-purple-700"
                  }`}>
                    {o.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MENU TAB */}
        {tab === "menu" && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(["categories", "items", "combos"] as MenuSubTab[]).map((st) => (
                <button key={st} onClick={() => setMenuSubTab(st)} className={`px-4 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${menuSubTab === st ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}>
                  {st}
                </button>
              ))}
            </div>
            {menuSubTab === "categories" && (
              <CategoryManager selectedCategoryId={selectedCategoryId} onSelectCategory={(id) => { setSelectedCategoryId(id); setMenuSubTab("items"); }} />
            )}
            {menuSubTab === "items" && (
              <div className="space-y-4">
                {selectedCategoryId && (
                  <button onClick={() => { setSelectedCategoryId(null); setMenuSubTab("categories"); }} className="text-xs text-primary font-heading font-bold uppercase tracking-wider">← BACK TO CATEGORIES</button>
                )}
                <MenuItemManager categoryId={selectedCategoryId} />
              </div>
            )}
            {menuSubTab === "combos" && <ComboManager />}
          </div>
        )}

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" /> TODAY'S STATS
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "IN QUEUE", value: newOrders.length + preparingOrders.length, color: "text-primary" },
                { label: "COMPLETED TODAY", value: todayOrders.filter(o => o.status === "delivered").length, color: "text-green-600" },
                { label: "REVENUE TODAY", value: `Rs.${todayRevenue}`, color: "text-primary" },
                { label: "CANCELLED", value: todayOrders.filter(o => o.status === "cancelled").length, color: "text-red-500" },
                { label: "TOTAL ORDERS", value: orders.length, color: "text-foreground" },
                { label: "MENU ITEMS", value: menuItems.length, color: "text-foreground" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-2xl p-6 shadow-card">
                  <p className={`font-heading text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboard;
