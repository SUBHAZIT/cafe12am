import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Package, ChefHat, CheckCircle, Store, LogOut, BarChart3, Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Tab = "orders" | "menu" | "analytics" | "settings";

const statusFlow = ["placed", "preparing", "ready_for_pickup"];

const MerchantDashboard = () => {
  const { signOut, profile } = useAuth();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: 0, is_veg: false, preparation_time_mins: 15 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    fetchAll();
    
    // Realtime orders
    const channel = supabase
      .channel("merchant-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `merchant_id=eq.${profile.id}` }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile]);

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

  const addMenuItem = async () => {
    if (!profile || !newItem.name) return;
    setLoading(true);
    const { error } = await supabase.from("menu_items").insert([{ ...newItem, merchant_id: profile.id }]);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item added!" });
      setShowAddItem(false);
      setNewItem({ name: "", description: "", price: 0, is_veg: false, preparation_time_mins: 15 });
      fetchMenu();
    }
  };

  const toggleItemAvailability = async (id: string, current: boolean) => {
    await supabase.from("menu_items").update({ is_available: !current }).eq("id", id);
    fetchMenu();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("menu_items").delete().eq("id", id);
    fetchMenu();
    toast({ title: "Item deleted" });
  };

  const updateOrderStatus = async (orderId: string, currentStatus: string) => {
    const idx = statusFlow.indexOf(currentStatus);
    if (idx < statusFlow.length - 1) {
      const newStatus = statusFlow[idx + 1];
      await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
      fetchOrders();
      toast({ title: `Order updated to ${newStatus.replace(/_/g, " ")}` });
    }
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

  const tabs = [
    { id: "orders" as Tab, label: "ORDERS", icon: Package },
    { id: "menu" as Tab, label: "MENU", icon: ChefHat },
    { id: "analytics" as Tab, label: "ANALYTICS", icon: BarChart3 },
    { id: "settings" as Tab, label: "SETTINGS", icon: Store },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-xl font-bold text-primary uppercase tracking-tight">CAFÉ12AM</h1>
            <span className="text-xs font-heading font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">MERCHANT</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleStore} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${settings?.is_open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {settings?.is_open ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {settings?.is_open ? "STORE OPEN" : "STORE CLOSED"}
            </button>
            <button onClick={signOut} className="p-2 rounded-full hover:bg-secondary"><LogOut className="w-5 h-5 text-muted-foreground" /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${tab === t.id ? "bg-primary text-primary-foreground shadow-soft" : "bg-card text-muted-foreground hover:bg-secondary"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "orders" && (
          <div className="space-y-3">
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4">INCOMING ORDERS</h2>
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-3xl shadow-card">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground uppercase tracking-wider text-sm">NO ORDERS YET</p>
              </div>
            ) : orders.map((o) => (
              <div key={o.id} className="bg-card rounded-2xl p-5 shadow-card relative overflow-hidden">
                <div className="absolute top-2 right-2 w-2 h-2 rotate-45 border border-primary/20" />
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-heading font-bold text-sm uppercase tracking-wide">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wider bg-secondary px-3 py-1 rounded-full font-heading font-bold">{o.status.replace(/_/g, " ")}</span>
                </div>
                {o.order_items?.map((item: any) => (
                  <p key={item.id} className="text-sm text-muted-foreground">{item.quantity}x {item.item_name} — ₹{item.total_price}</p>
                ))}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                  <span className="font-heading font-bold text-primary">₹{o.total_amount}</span>
                  {statusFlow.indexOf(o.status) < statusFlow.length - 1 && (
                    <Button size="sm" onClick={() => updateOrderStatus(o.id, o.status)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                      {o.status === "placed" ? "ACCEPT & PREPARE" : "MARK READY"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "menu" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight">MY MENU</h2>
              <Button onClick={() => setShowAddItem(!showAddItem)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 mr-1" /> ADD ITEM
              </Button>
            </div>

            {showAddItem && (
              <div className="bg-card rounded-2xl p-6 shadow-card mb-6 space-y-3">
                <Input placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Price (₹)" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})} className="rounded-xl bg-secondary border-0" />
                  <Input type="number" placeholder="Prep Time (mins)" value={newItem.preparation_time_mins} onChange={(e) => setNewItem({...newItem, preparation_time_mins: Number(e.target.value)})} className="rounded-xl bg-secondary border-0" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newItem.is_veg} onChange={(e) => setNewItem({...newItem, is_veg: e.target.checked})} />
                  Vegetarian
                </label>
                <Button onClick={addMenuItem} disabled={loading} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                  {loading ? "ADDING..." : "ADD ITEM"}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-card rounded-2xl p-4 shadow-card flex items-center justify-between">
                  <div>
                    <p className="font-heading font-bold text-sm uppercase tracking-wide">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price} • {item.preparation_time_mins} min</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleItemAvailability(item.id, item.is_available)} className={`p-2 rounded-full ${item.is_available ? "text-green-500" : "text-muted-foreground"}`}>
                      {item.is_available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-2 rounded-full text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {menuItems.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2 uppercase tracking-wider text-sm">NO MENU ITEMS YET</p>}
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "TOTAL ORDERS", value: orders.length },
              { label: "REVENUE", value: `₹${orders.reduce((a, o) => a + Number(o.total_amount || 0), 0)}` },
              { label: "MENU ITEMS", value: menuItems.length },
              { label: "PREPARING", value: orders.filter(o => o.status === "preparing").length },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-2xl p-6 shadow-card">
                <p className="font-heading text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "settings" && (
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4">STORE SETTINGS</h2>
            <div className="flex items-center justify-between py-4 border-b border-border">
              <span className="font-heading font-bold text-sm uppercase tracking-wide">STORE STATUS</span>
              <button onClick={toggleStore} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-heading font-bold ${settings?.is_open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {settings?.is_open ? "OPEN" : "CLOSED"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboard;
