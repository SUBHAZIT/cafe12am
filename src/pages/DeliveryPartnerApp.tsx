import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, DollarSign, Navigation, LogOut, ToggleLeft, ToggleRight, CheckCircle, Truck, Building2, User, MapPin, ExternalLink, Phone, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type Tab = "orders" | "earnings" | "bank";

const DeliveryPartnerApp = () => {
  const { signOut, profile } = useAuth();
  const [tab, setTab] = useState<Tab>("orders");
  const [isOnline, setIsOnline] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({ account_holder_name: "", bank_name: "", account_number: "", ifsc_code: "", upi_id: "" });

  useEffect(() => {
    if (!profile) return;
    fetchAll();

    const channel = supabase
      .channel("rider-assignments")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_assignments", filter: `delivery_partner_id=eq.${profile.id}` }, () => fetchAssignments())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const fetchAll = () => {
    fetchAssignments();
    fetchBankDetails();
    fetchPayouts();
    fetchOnlineStatus();
  };

  const fetchAssignments = async () => {
    if (!profile) return;
    const { data } = await supabase.from("delivery_assignments").select("*, orders(*, order_items(*))").eq("delivery_partner_id", profile.id).order("created_at", { ascending: false });
    if (data) setAssignments(data);
  };

  const fetchBankDetails = async () => {
    if (!profile) return;
    const { data } = await supabase.from("bank_details").select("*").eq("user_id", profile.id).maybeSingle();
    if (data) {
      setBankDetails(data);
      setBankForm({
        account_holder_name: data.account_holder_name,
        bank_name: data.bank_name,
        account_number: data.account_number,
        ifsc_code: data.ifsc_code,
        upi_id: data.upi_id || "",
      });
    }
  };

  const fetchPayouts = async () => {
    if (!profile) return;
    const { data } = await supabase.from("payouts").select("*").eq("recipient_id", profile.id).order("created_at", { ascending: false });
    if (data) setPayouts(data);
  };

  const fetchOnlineStatus = async () => {
    if (!profile) return;
    const { data } = await supabase.from("delivery_partner_settings").select("is_online").eq("partner_id", profile.id).maybeSingle();
    if (data) setIsOnline(data.is_online);
  };

  const toggleOnline = async () => {
    if (!profile) return;
    const newStatus = !isOnline;
    const { data: existing } = await supabase.from("delivery_partner_settings").select("id").eq("partner_id", profile.id).maybeSingle();
    if (existing) {
      await supabase.from("delivery_partner_settings").update({ is_online: newStatus }).eq("partner_id", profile.id);
    } else {
      await supabase.from("delivery_partner_settings").insert([{ partner_id: profile.id, is_online: newStatus }]);
    }
    setIsOnline(newStatus);
    toast({ title: newStatus ? "You're now online" : "You're now offline" });
  };

  const updateAssignment = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === "picked_up") updates.picked_up_at = new Date().toISOString();
    if (status === "delivered") updates.delivered_at = new Date().toISOString();
    await supabase.from("delivery_assignments").update(updates).eq("id", id);
    
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      const orderStatus = status === "picked_up" ? "out_for_delivery" : status === "delivered" ? "delivered" : "rider_assigned";
      await supabase.from("orders").update({ status: orderStatus }).eq("id", assignment.order_id);
    }
    fetchAssignments();
    toast({ title: `Delivery ${status.replace(/_/g, " ")}` });
  };

  const saveBankDetails = async () => {
    if (!profile || !bankForm.account_holder_name || !bankForm.account_number || !bankForm.ifsc_code) {
      toast({ title: "Missing required fields", variant: "destructive" });
      return;
    }
    if (bankDetails) {
      await supabase.from("bank_details").update(bankForm).eq("id", bankDetails.id);
    } else {
      await supabase.from("bank_details").insert([{ ...bankForm, user_id: profile.id }]);
    }
    toast({ title: "Bank details saved!" });
    setShowBankForm(false);
    fetchBankDetails();
  };

  const getGoogleMapsLink = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const getTimeSince = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  const tabs = [
    { id: "orders" as Tab, label: "DELIVERIES", icon: Package },
    { id: "earnings" as Tab, label: "EARNINGS", icon: DollarSign },
    { id: "bank" as Tab, label: "BANK", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-xl font-bold text-primary uppercase tracking-tight">CAFÉ12AM</h1>
            <span className="text-xs font-heading font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">RIDER</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleOnline} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {isOnline ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {isOnline ? "ONLINE" : "OFFLINE"}
            </button>
            <Link to="/delivery/profile" className="p-2 rounded-full hover:bg-secondary"><User className="w-5 h-5 text-muted-foreground" /></Link>
            <button onClick={signOut} className="p-2 rounded-full hover:bg-secondary"><LogOut className="w-5 h-5 text-muted-foreground" /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all flex-1 justify-center ${tab === t.id ? "bg-primary text-primary-foreground shadow-soft" : "bg-card text-muted-foreground hover:bg-secondary"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "orders" && (
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-3xl shadow-card">
                <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground uppercase tracking-wider text-sm">NO DELIVERIES ASSIGNED</p>
              </div>
            ) : assignments.map((a) => (
              <div key={a.id} className="bg-card rounded-2xl p-5 shadow-card relative overflow-hidden">
                <div className="absolute top-2 right-2 w-2 h-2 rotate-45 border border-primary/20" />
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-heading font-bold text-sm uppercase tracking-wide">{a.orders?.order_number || "ORDER"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {getTimeSince(a.created_at)}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wider bg-secondary px-3 py-1 rounded-full font-heading font-bold">{a.status.replace(/_/g, " ")}</span>
                </div>

                {/* Order items */}
                {a.orders?.order_items?.map((item: any) => (
                  <p key={item.id} className="text-sm text-muted-foreground">{item.quantity}x {item.item_name} — ₹{item.total_price}</p>
                ))}

                {/* Delivery Address with Google Maps Link */}
                {a.orders?.delivery_address && (
                  <div className="mt-3 p-3 bg-secondary/50 rounded-xl space-y-2">
                    <p className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" /> DELIVERY ADDRESS
                    </p>
                    <p className="text-sm text-foreground">{a.orders.delivery_address}</p>
                    <a
                      href={getGoogleMapsLink(a.orders.delivery_address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                    >
                      <Navigation className="w-4 h-4" /> NAVIGATE IN GOOGLE MAPS
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Delivery notes */}
                {a.orders?.delivery_notes && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-800">📝 {a.orders.delivery_notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="font-heading font-bold text-primary">₹{a.orders?.total_amount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {a.orders?.payment_method === "cod" ? "💵 CASH ON DELIVERY" : "✅ PAID ONLINE"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {a.status === "assigned" && (
                      <Button size="sm" onClick={() => updateAssignment(a.id, "picked_up")} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                        PICKED UP
                      </Button>
                    )}
                    {a.status === "picked_up" && (
                      <Button size="sm" onClick={() => updateAssignment(a.id, "delivered")} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                        <CheckCircle className="w-4 h-4 mr-1" /> DELIVERED
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "earnings" && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <p className="font-heading text-2xl font-bold text-foreground">{assignments.filter(a => a.status === "delivered").length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">DELIVERIES</p>
              </div>
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <p className="font-heading text-2xl font-bold text-primary">₹{payouts.reduce((a, p) => a + Number(p.amount || 0), 0)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">TOTAL EARNINGS</p>
              </div>
            </div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-3">PAYOUT HISTORY</h3>
            {payouts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 uppercase tracking-wider text-sm">NO PAYOUTS YET</p>
            ) : payouts.map((p) => (
              <div key={p.id} className="bg-card rounded-2xl p-4 shadow-card mb-2 flex justify-between">
                <div>
                  <p className="font-heading font-bold text-sm">₹{p.amount}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-heading font-bold px-2 py-1 rounded-full self-start uppercase ${p.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "bank" && (
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight">BANK DETAILS</h2>
              <Button onClick={() => setShowBankForm(!showBankForm)} size="sm" className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                {bankDetails ? "EDIT" : "ADD"}
              </Button>
            </div>

            {showBankForm || !bankDetails ? (
              <div className="space-y-3">
                <Input placeholder="Account Holder Name" value={bankForm.account_holder_name} onChange={(e) => setBankForm({...bankForm, account_holder_name: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Bank Name" value={bankForm.bank_name} onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Account Number" value={bankForm.account_number} onChange={(e) => setBankForm({...bankForm, account_number: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="IFSC Code" value={bankForm.ifsc_code} onChange={(e) => setBankForm({...bankForm, ifsc_code: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="UPI ID (Optional)" value={bankForm.upi_id} onChange={(e) => setBankForm({...bankForm, upi_id: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <Button onClick={saveBankDetails} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">SAVE DETAILS</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "NAME", value: bankDetails.account_holder_name },
                  { label: "BANK", value: bankDetails.bank_name },
                  { label: "ACCOUNT", value: `****${bankDetails.account_number.slice(-4)}` },
                  { label: "IFSC", value: bankDetails.ifsc_code },
                  ...(bankDetails.upi_id ? [{ label: "UPI", value: bankDetails.upi_id }] : []),
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-border">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</span>
                    <span className="font-heading font-bold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPartnerApp;
