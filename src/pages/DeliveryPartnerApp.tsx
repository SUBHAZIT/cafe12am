import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, IndianRupee, Building2, User, LogOut, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import RiderHome from "@/components/delivery/RiderHome";
import RiderOrders from "@/components/delivery/RiderOrders";
import RiderEarnings from "@/components/delivery/RiderEarnings";

type Tab = "home" | "orders" | "earnings" | "bank";
const EARNING_PER_DELIVERY = 20;

const DeliveryPartnerApp = () => {
  const { signOut, profile } = useAuth();
  const [tab, setTab] = useState<Tab>("home");
  const [isOnline, setIsOnline] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({ account_holder_name: "", bank_name: "", account_number: "", ifsc_code: "", upi_id: "" });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevIncomingCount = useRef(0);

  useEffect(() => {
    if (!profile) return;
    fetchAll();

    // Realtime subscription
    const channel = supabase
      .channel("rider-assignments")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_assignments", filter: `delivery_partner_id=eq.${profile.id}` }, () => fetchAssignments())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => fetchAssignments())
      .subscribe();

    // Polling fallback every 10s to ensure rider always sees new orders
    const pollInterval = setInterval(() => fetchAssignments(), 10000);

    return () => { 
      supabase.removeChannel(channel); 
      clearInterval(pollInterval);
    };
  }, [profile]);

  // Alert sound for new incoming orders
  useEffect(() => {
    const incoming = assignments.filter(a => a.status === "assigned");
    if (incoming.length > prevIncomingCount.current && prevIncomingCount.current >= 0) {
      playAlert();
      // Auto-switch to orders tab
      if (tab !== "orders") setTab("orders");
    }
    prevIncomingCount.current = incoming.length;
  }, [assignments]);

  const playAlert = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        setTimeout(() => { osc.frequency.value = 1000; }, 200);
        setTimeout(() => { osc.frequency.value = 800; }, 400);
        setTimeout(() => { osc.stop(); ctx.close(); }, 600);
        return;
      }
    } catch {}
  };

  const fetchAll = () => {
    fetchAssignments();
    fetchBankDetails();
    fetchPayouts();
    fetchOnlineStatus();
  };

  const fetchAssignments = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("delivery_assignments")
      .select("*, orders(*, order_items(*), customer:profiles!orders_customer_id_fkey(full_name, phone, address), merchant:profiles!orders_merchant_id_fkey(full_name, phone, address))")
      .eq("delivery_partner_id", profile.id)
      .order("created_at", { ascending: false });
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
    toast({ title: newStatus ? "You are now online" : "You are now offline" });
  };

  const acceptOrder = async (id: string) => {
    await supabase.from("delivery_assignments").update({ status: "accepted" }).eq("id", id);
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      await supabase.from("orders").update({ status: "rider_assigned" }).eq("id", assignment.order_id);
    }
    fetchAssignments();
    toast({ title: "Order accepted! Navigate to merchant for pickup." });
  };

  const declineOrder = async (id: string) => {
    await supabase.from("delivery_assignments").update({ status: "declined" }).eq("id", id);
    fetchAssignments();
    toast({ title: "Order declined" });
  };

  const pickupOrder = async (id: string) => {
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    await supabase.from("delivery_assignments").update({ status: "picked_up", picked_up_at: new Date().toISOString() }).eq("id", id);
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      const { error } = await supabase.from("orders").update({ status: "out_for_delivery", delivery_otp: otp }).eq("id", assignment.order_id);
      if (error) {
        console.error("Failed to save OTP:", error);
        toast({ title: "Error saving OTP", description: error.message, variant: "destructive" });
        return;
      }
    }
    fetchAssignments();
    toast({ title: "Order picked up! Customer has been notified." });
  };

  const deliverOrder = async (id: string, enteredOtp: string) => {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      // Verify OTP
      const { data: order } = await supabase.from("orders").select("delivery_otp").eq("id", assignment.order_id).maybeSingle();
      if (order?.delivery_otp && order.delivery_otp !== enteredOtp) {
        toast({ title: "Invalid OTP! Please check with customer.", variant: "destructive" });
        return;
      }
      await supabase.from("delivery_assignments").update({ status: "delivered", delivered_at: new Date().toISOString() }).eq("id", id);
      await supabase.from("orders").update({ status: "delivered" }).eq("id", assignment.order_id);
    }
    fetchAssignments();
    toast({ title: "Delivery completed! ₹" + EARNING_PER_DELIVERY + " earned." });
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

  // Computed stats
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayDelivered = assignments.filter(a => a.status === "delivered" && new Date(a.delivered_at || a.created_at).getTime() >= todayStart);
  const activeOrders = assignments.filter(a => ["assigned", "accepted", "picked_up"].includes(a.status)).length;

  const tabs = [
    { id: "home" as Tab, label: "HOME", icon: Home },
    { id: "orders" as Tab, label: "ORDERS", icon: Package },
    { id: "earnings" as Tab, label: "EARNINGS", icon: IndianRupee },
    { id: "bank" as Tab, label: "BANK", icon: Building2 },
  ];

  const incomingCount = assignments.filter(a => a.status === "assigned").length;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-lg font-bold text-primary uppercase tracking-tight">CAFE12AM</h1>
            <span className="text-[10px] font-heading font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">RIDER</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/delivery/profile" className="p-2 rounded-full hover:bg-secondary"><User className="w-5 h-5 text-muted-foreground" /></Link>
            <button onClick={signOut} className="p-2 rounded-full hover:bg-secondary"><LogOut className="w-5 h-5 text-muted-foreground" /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Tab Bar */}
        <div className="flex gap-1.5 mb-5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full font-heading font-bold text-[10px] uppercase tracking-wider whitespace-nowrap transition-all flex-1 justify-center ${tab === t.id ? "bg-primary text-primary-foreground shadow-soft" : "bg-card text-muted-foreground hover:bg-secondary"}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
              {t.id === "orders" && incomingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{incomingCount}</span>
              )}
            </button>
          ))}
        </div>

        {tab === "home" && (
          <RiderHome
            isOnline={isOnline}
            toggleOnline={toggleOnline}
            todayEarnings={todayDelivered.length * EARNING_PER_DELIVERY}
            todayDeliveries={todayDelivered.length}
            activeOrders={activeOrders}
          />
        )}

        {tab === "orders" && (
          <RiderOrders
            assignments={assignments}
            onAccept={acceptOrder}
            onDecline={declineOrder}
            onPickup={pickupOrder}
            onDeliver={deliverOrder}
          />
        )}

        {tab === "earnings" && (
          <RiderEarnings assignments={assignments} payouts={payouts} />
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
