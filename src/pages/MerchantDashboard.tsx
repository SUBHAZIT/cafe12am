import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, ChefHat, Store, LogOut, BarChart3, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import CategoryManager from "@/components/merchant/CategoryManager";
import MenuItemManager from "@/components/merchant/MenuItemManager";
import ComboManager from "@/components/merchant/ComboManager";

type Tab = "orders" | "menu" | "analytics" | "settings";
type MenuSubTab = "categories" | "items" | "combos";

const statusFlow = ["placed", "preparing", "ready_for_pickup"];

const MerchantDashboard = () => {
  const { signOut, profile } = useAuth();
  const [tab, setTab] = useState<Tab>("orders");
  const [menuSubTab, setMenuSubTab] = useState<MenuSubTab>("categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

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
