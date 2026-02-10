import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Store, Truck, BarChart3, Tag, LogOut, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Tab = "overview" | "merchants" | "riders" | "customers" | "orders" | "coupons";

const AdminPanel = () => {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [merchants, setMerchants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showCreateMerchant, setShowCreateMerchant] = useState(false);
  const [showCreateRider, setShowCreateRider] = useState(false);
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [newMerchant, setNewMerchant] = useState({ email: "", password: "", full_name: "", phone: "" });
  const [newRider, setNewRider] = useState({ email: "", password: "", full_name: "", phone: "" });
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_type: "percentage", discount_value: 10, min_order_amount: 0, description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [merchantsRes, ridersRes, ordersRes, couponsRes] = await Promise.all([
      supabase.from("user_roles").select("user_id, role, profiles!inner(*)").eq("role", "merchant"),
      supabase.from("user_roles").select("user_id, role, profiles!inner(*)").eq("role", "delivery_partner"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("coupons").select("*").order("created_at", { ascending: false }),
    ]);
    if (merchantsRes.data) setMerchants(merchantsRes.data);
    if (ridersRes.data) setRiders(ridersRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (couponsRes.data) setCoupons(couponsRes.data);
  };

  const createMerchant = async () => {
    if (!newMerchant.email || !newMerchant.password || !newMerchant.full_name) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Use edge function to create merchant
    const { data, error } = await supabase.functions.invoke("create-staff", {
      body: { ...newMerchant, role: "merchant" },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Merchant created!" });
      setShowCreateMerchant(false);
      setNewMerchant({ email: "", password: "", full_name: "", phone: "" });
      fetchData();
    }
  };

  const createRider = async () => {
    if (!newRider.email || !newRider.password || !newRider.full_name) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("create-staff", {
      body: { ...newRider, role: "delivery_partner" },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rider created!" });
      setShowCreateRider(false);
      setNewRider({ email: "", password: "", full_name: "", phone: "" });
      fetchData();
    }
  };

  const createCoupon = async () => {
    if (!newCoupon.code) {
      toast({ title: "Missing coupon code", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("coupons").insert([newCoupon]);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Coupon created!" });
      setShowCreateCoupon(false);
      setNewCoupon({ code: "", discount_type: "percentage", discount_value: 10, min_order_amount: 0, description: "" });
      fetchData();
    }
  };

  const toggleActive = async (profileId: string, currentStatus: boolean) => {
    await supabase.from("profiles").update({ is_active: !currentStatus }).eq("id", profileId);
    fetchData();
    toast({ title: `Account ${!currentStatus ? "activated" : "deactivated"}` });
  };

  const tabs = [
    { id: "overview" as Tab, label: "OVERVIEW", icon: BarChart3 },
    { id: "merchants" as Tab, label: "MERCHANTS", icon: Store },
    { id: "riders" as Tab, label: "RIDERS", icon: Truck },
    { id: "orders" as Tab, label: "ORDERS", icon: Tag },
    { id: "coupons" as Tab, label: "COUPONS", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-xl font-bold text-primary uppercase tracking-tight">CAFÉ12AM</h1>
            <span className="text-xs font-heading font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">ADMIN</span>
          </div>
          <button onClick={signOut} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                tab === t.id ? "bg-primary text-primary-foreground shadow-soft" : "bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "TOTAL ORDERS", value: orders.length, icon: Tag },
              { label: "MERCHANTS", value: merchants.length, icon: Store },
              { label: "RIDERS", value: riders.length, icon: Truck },
              { label: "REVENUE", value: `₹${orders.reduce((a, o) => a + Number(o.total_amount || 0), 0)}`, icon: BarChart3 },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-2xl p-6 shadow-card relative overflow-hidden">
                <div className="absolute top-2 right-2 w-2 h-2 rotate-45 border border-primary/20" />
                <stat.icon className="w-6 h-6 text-primary mb-2" />
                <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Merchants */}
        {tab === "merchants" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight">MERCHANTS</h2>
              <Button onClick={() => setShowCreateMerchant(!showCreateMerchant)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 mr-1" /> CREATE MERCHANT
              </Button>
            </div>

            {showCreateMerchant && (
              <div className="bg-card rounded-2xl p-6 shadow-card mb-6 space-y-3">
                <Input placeholder="Full Name" value={newMerchant.full_name} onChange={(e) => setNewMerchant({...newMerchant, full_name: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Email" type="email" value={newMerchant.email} onChange={(e) => setNewMerchant({...newMerchant, email: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Password" type="password" value={newMerchant.password} onChange={(e) => setNewMerchant({...newMerchant, password: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Phone" value={newMerchant.phone} onChange={(e) => setNewMerchant({...newMerchant, phone: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Button onClick={createMerchant} disabled={loading} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                  {loading ? "CREATING..." : "CREATE"}
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {merchants.map((m: any) => (
                <div key={m.user_id} className="bg-card rounded-2xl p-4 shadow-card flex items-center justify-between">
                  <div>
                    <p className="font-heading font-bold text-sm uppercase tracking-wide">{(m as any).profiles?.full_name || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{(m as any).profiles?.email || (m as any).profiles?.phone}</p>
                  </div>
                  <button
                    onClick={() => toggleActive((m as any).profiles?.id, (m as any).profiles?.is_active)}
                    className={`p-2 rounded-full ${(m as any).profiles?.is_active ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    {(m as any).profiles?.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
              ))}
              {merchants.length === 0 && <p className="text-center text-muted-foreground py-8 uppercase tracking-wider text-sm">NO MERCHANTS YET</p>}
            </div>
          </div>
        )}

        {/* Riders */}
        {tab === "riders" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight">DELIVERY PARTNERS</h2>
              <Button onClick={() => setShowCreateRider(!showCreateRider)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 mr-1" /> CREATE RIDER
              </Button>
            </div>

            {showCreateRider && (
              <div className="bg-card rounded-2xl p-6 shadow-card mb-6 space-y-3">
                <Input placeholder="Full Name" value={newRider.full_name} onChange={(e) => setNewRider({...newRider, full_name: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Email" type="email" value={newRider.email} onChange={(e) => setNewRider({...newRider, email: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Password" type="password" value={newRider.password} onChange={(e) => setNewRider({...newRider, password: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Phone" value={newRider.phone} onChange={(e) => setNewRider({...newRider, phone: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Button onClick={createRider} disabled={loading} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                  {loading ? "CREATING..." : "CREATE"}
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {riders.map((r: any) => (
                <div key={r.user_id} className="bg-card rounded-2xl p-4 shadow-card flex items-center justify-between">
                  <div>
                    <p className="font-heading font-bold text-sm uppercase tracking-wide">{(r as any).profiles?.full_name || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{(r as any).profiles?.email || (r as any).profiles?.phone}</p>
                  </div>
                  <button
                    onClick={() => toggleActive((r as any).profiles?.id, (r as any).profiles?.is_active)}
                    className={`p-2 rounded-full ${(r as any).profiles?.is_active ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    {(r as any).profiles?.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
              ))}
              {riders.length === 0 && <p className="text-center text-muted-foreground py-8 uppercase tracking-wider text-sm">NO RIDERS YET</p>}
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-6">ALL ORDERS</h2>
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-card rounded-2xl p-4 shadow-card">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-heading font-bold text-sm uppercase tracking-wide">{o.order_number}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-primary">₹{o.total_amount}</p>
                      <span className="text-xs uppercase tracking-wider bg-secondary px-2 py-0.5 rounded-full">{o.status}</span>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center text-muted-foreground py-8 uppercase tracking-wider text-sm">NO ORDERS YET</p>}
            </div>
          </div>
        )}

        {/* Coupons */}
        {tab === "coupons" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight">COUPONS</h2>
              <Button onClick={() => setShowCreateCoupon(!showCreateCoupon)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 mr-1" /> CREATE COUPON
              </Button>
            </div>

            {showCreateCoupon && (
              <div className="bg-card rounded-2xl p-6 shadow-card mb-6 space-y-3">
                <Input placeholder="Coupon Code (e.g. MIDNIGHT20)" value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Description" value={newCoupon.description} onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) => setNewCoupon({...newCoupon, discount_type: e.target.value})}
                    className="rounded-xl bg-secondary border-0 p-3 text-sm"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                  <Input type="number" placeholder="Discount Value" value={newCoupon.discount_value} onChange={(e) => setNewCoupon({...newCoupon, discount_value: Number(e.target.value)})} className="rounded-xl bg-secondary border-0" />
                </div>
                <Input type="number" placeholder="Min Order Amount" value={newCoupon.min_order_amount} onChange={(e) => setNewCoupon({...newCoupon, min_order_amount: Number(e.target.value)})} className="rounded-xl bg-secondary border-0" />
                <Button onClick={createCoupon} disabled={loading} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                  {loading ? "CREATING..." : "CREATE COUPON"}
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {coupons.map((c) => (
                <div key={c.id} className="bg-card rounded-2xl p-4 shadow-card flex items-center justify-between">
                  <div>
                    <p className="font-heading font-bold text-sm uppercase tracking-wide">{c.code}</p>
                    <p className="text-xs text-muted-foreground">{c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}</p>
                  </div>
                  <span className={`text-xs font-heading font-bold px-2 py-1 rounded-full uppercase ${c.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {c.is_active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
              ))}
              {coupons.length === 0 && <p className="text-center text-muted-foreground py-8 uppercase tracking-wider text-sm">NO COUPONS YET</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
