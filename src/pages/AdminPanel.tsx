import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Store, Truck, BarChart3, Tag, LogOut, Plus, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, User, Phone, Mail, MapPin, Building, CreditCard, Clock, Package, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type Tab = "overview" | "merchants" | "riders" | "customers" | "orders" | "coupons" | "rider_earnings";

const EARNING_PER_DELIVERY = 20;

const AdminPanel = () => {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [merchants, setMerchants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [deliveryAssignments, setDeliveryAssignments] = useState<any[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showCreateMerchant, setShowCreateMerchant] = useState(false);
  const [showCreateRider, setShowCreateRider] = useState(false);
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [newMerchant, setNewMerchant] = useState({ email: "", password: "", full_name: "", phone: "" });
  const [newRider, setNewRider] = useState({ email: "", password: "", full_name: "", phone: "" });
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_type: "percentage", discount_value: 10, min_order_amount: 0, max_discount: 0, usage_limit: 0, expires_at: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setDataLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-fetch-users");
    if (error) {
      toast({ title: "Error loading data", description: error.message, variant: "destructive" });
    } else if (data) {
      setMerchants(data.merchants || []);
      setRiders(data.riders || []);
      setCustomers(data.customers || []);
      setOrders(data.orders || []);
      setCoupons(data.coupons || []);
      setDeliveryAssignments(data.delivery_assignments || []);
    }
    setDataLoading(false);
  };

  const createMerchant = async () => {
    if (!newMerchant.email || !newMerchant.password || !newMerchant.full_name) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.functions.invoke("create-staff", {
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
    const { error } = await supabase.functions.invoke("create-staff", {
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
    const payload: any = {
      code: newCoupon.code,
      description: newCoupon.description || null,
      discount_type: newCoupon.discount_type,
      discount_value: newCoupon.discount_value,
      min_order_amount: newCoupon.min_order_amount,
    };
    if (newCoupon.max_discount > 0) payload.max_discount = newCoupon.max_discount;
    if (newCoupon.usage_limit > 0) payload.usage_limit = newCoupon.usage_limit;
    if (newCoupon.expires_at) payload.expires_at = new Date(newCoupon.expires_at).toISOString();
    const { error } = await supabase.from("coupons").insert([payload]);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Coupon created!" });
      setShowCreateCoupon(false);
      setNewCoupon({ code: "", discount_type: "percentage", discount_value: 10, min_order_amount: 0, max_discount: 0, usage_limit: 0, expires_at: "", description: "" });
      fetchData();
    }
  };

  const toggleCoupon = async (id: string, currentActive: boolean) => {
    await supabase.from("coupons").update({ is_active: !currentActive }).eq("id", id);
    fetchData();
    toast({ title: `Coupon ${!currentActive ? "activated" : "deactivated"}` });
  };

  const deleteCoupon = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    fetchData();
    toast({ title: "Coupon deleted" });
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
    { id: "rider_earnings" as Tab, label: "EARNINGS", icon: IndianRupee },
    { id: "customers" as Tab, label: "CUSTOMERS", icon: Users },
    { id: "orders" as Tab, label: "ORDERS", icon: Package },
    { id: "coupons" as Tab, label: "COUPONS", icon: Tag },
  ];

  const totalRevenue = orders.reduce((a: number, o: any) => a + Number(o.total_amount || 0), 0);

  // Rider earnings helpers
  const getRiderEarnings = (riderId: string) => {
    const riderAssignments = deliveryAssignments.filter((a: any) => a.delivery_partner_id === riderId && a.status === "delivered");
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - (now.getDay() * 86400000);
    const todayDelivered = riderAssignments.filter((a: any) => new Date(a.delivered_at || a.created_at).getTime() >= todayStart);
    const weekDelivered = riderAssignments.filter((a: any) => new Date(a.delivered_at || a.created_at).getTime() >= weekStart);
    return {
      total: riderAssignments.length * EARNING_PER_DELIVERY,
      totalDeliveries: riderAssignments.length,
      today: todayDelivered.length * EARNING_PER_DELIVERY,
      todayDeliveries: todayDelivered.length,
      week: weekDelivered.length * EARNING_PER_DELIVERY,
      weekDeliveries: weekDelivered.length,
    };
  };

  const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-2 text-sm">
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground">{label}:</span>
        <span className="text-foreground font-medium truncate">{value}</span>
      </div>
    );
  };

  const UserCard = ({ user, type }: { user: any; type: string }) => {
    const isExpanded = expandedUser === user.id;
    return (
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedUser(isExpanded ? null : user.id)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-sm uppercase tracking-wide truncate">{user.full_name || "N/A"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email || user.phone || "No contact"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-heading font-bold px-2 py-1 rounded-full uppercase ${user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {user.is_active ? "ACTIVE" : "INACTIVE"}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); toggleActive(user.id, user.is_active); }}
              className={`p-1.5 rounded-full ${user.is_active ? "text-green-500" : "text-muted-foreground"}`}
            >
              {user.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            </button>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
            <div>
              <p className="text-xs font-heading font-bold uppercase tracking-wider text-primary mb-2">PERSONAL INFO</p>
              <div className="space-y-1.5">
                <DetailRow icon={User} label="Name" value={user.full_name} />
                <DetailRow icon={Mail} label="Email" value={user.email} />
                <DetailRow icon={Phone} label="Phone" value={user.phone} />
                <DetailRow icon={MapPin} label="Address" value={user.address} />
                {user.emergency_contact && <DetailRow icon={Phone} label="Emergency" value={user.emergency_contact} />}
              </div>
            </div>

            {type === "merchant" && user.merchant_settings && (
              <div>
                <p className="text-xs font-heading font-bold uppercase tracking-wider text-primary mb-2">STORE SETTINGS</p>
                <div className="space-y-1.5">
                  <DetailRow icon={Store} label="Store" value={user.merchant_settings.store_name} />
                  <DetailRow icon={Clock} label="Hours" value={`${user.merchant_settings.opening_time} - ${user.merchant_settings.closing_time}`} />
                  <div className="flex items-center gap-2 text-sm">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-bold ${user.merchant_settings.is_open ? "text-green-600" : "text-red-500"}`}>
                      {user.merchant_settings.is_open ? "OPEN" : "CLOSED"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {type === "rider" && user.delivery_settings && (
              <div>
                <p className="text-xs font-heading font-bold uppercase tracking-wider text-primary mb-2">DELIVERY SETTINGS</p>
                <div className="space-y-1.5">
                  <DetailRow icon={Truck} label="Vehicle" value={user.delivery_settings.vehicle_type} />
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-bold ${user.delivery_settings.is_online ? "text-green-600" : "text-red-500"}`}>
                      {user.delivery_settings.is_online ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {user.saved_addresses && user.saved_addresses.length > 0 && (
              <div>
                <p className="text-xs font-heading font-bold uppercase tracking-wider text-primary mb-2">SAVED ADDRESSES</p>
                <div className="space-y-2">
                  {user.saved_addresses.map((addr: any) => (
                    <div key={addr.id} className="bg-secondary/50 rounded-xl p-2.5 text-sm">
                      <span className="font-bold text-xs uppercase tracking-wider">{addr.label}</span>
                      {addr.is_default && <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">DEFAULT</span>}
                      <p className="text-muted-foreground mt-0.5">{addr.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user.bank_details && user.bank_details.length > 0 && (
              <div>
                <p className="text-xs font-heading font-bold uppercase tracking-wider text-primary mb-2">BANK DETAILS</p>
                <div className="space-y-2">
                  {user.bank_details.map((bank: any) => (
                    <div key={bank.id} className="bg-secondary/50 rounded-xl p-2.5 text-sm space-y-1">
                      <DetailRow icon={CreditCard} label="Bank" value={bank.bank_name} />
                      <DetailRow icon={CreditCard} label="A/C" value={bank.account_number} />
                      <DetailRow icon={CreditCard} label="Holder" value={bank.account_holder_name} />
                      <DetailRow icon={Building} label="IFSC" value={bank.ifsc_code} />
                      {bank.upi_id && <DetailRow icon={CreditCard} label="UPI" value={bank.upi_id} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    );
  };

  const CreateForm = ({ fields, values, onChange, onSubmit, label }: any) => (
    <div className="bg-card rounded-2xl p-6 shadow-card mb-6 space-y-3">
      {fields.map((f: any) => (
        <Input
          key={f.key}
          placeholder={f.placeholder}
          type={f.type || "text"}
          value={values[f.key]}
          onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}
          className="rounded-xl bg-secondary border-0"
        />
      ))}
      <Button onClick={onSubmit} disabled={loading} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
        {loading ? "CREATING..." : `CREATE ${label}`}
      </Button>
    </div>
  );

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-xl font-bold text-primary uppercase tracking-tight">CAFÉ12AM</h1>
            <span className="text-xs font-heading font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/profile" className="p-2 rounded-full hover:bg-secondary transition-colors">
              <User className="w-5 h-5 text-muted-foreground" />
            </Link>
            <button onClick={signOut} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
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
              {t.id === "merchants" && <span className="bg-primary-foreground/20 px-1.5 py-0.5 rounded-full text-[10px]">{merchants.length}</span>}
              {t.id === "riders" && <span className="bg-primary-foreground/20 px-1.5 py-0.5 rounded-full text-[10px]">{riders.length}</span>}
              {t.id === "customers" && <span className="bg-primary-foreground/20 px-1.5 py-0.5 rounded-full text-[10px]">{customers.length}</span>}
              {t.id === "orders" && <span className="bg-primary-foreground/20 px-1.5 py-0.5 rounded-full text-[10px]">{orders.length}</span>}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "TOTAL ORDERS", value: orders.length, icon: Package },
              { label: "MERCHANTS", value: merchants.length, icon: Store },
              { label: "RIDERS", value: riders.length, icon: Truck },
              { label: "CUSTOMERS", value: customers.length, icon: Users },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-2xl p-6 shadow-card relative overflow-hidden">
                <div className="absolute top-2 right-2 w-2 h-2 rotate-45 border border-primary/20" />
                <stat.icon className="w-6 h-6 text-primary mb-2" />
                <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
            <div className="col-span-2 md:col-span-4 bg-card rounded-2xl p-6 shadow-card">
              <BarChart3 className="w-6 h-6 text-primary mb-2" />
              <p className="font-heading text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">TOTAL REVENUE</p>
            </div>
          </div>
        )}

        {/* Rider Earnings Tab */}
        {tab === "rider_earnings" && (
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-6">RIDER EARNINGS</h2>
            {riders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 uppercase tracking-wider text-sm">NO RIDERS YET</p>
            ) : (
              <div className="space-y-4">
                {/* Total summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card rounded-2xl p-5 shadow-card">
                    <IndianRupee className="w-5 h-5 text-primary mb-2" />
                    <p className="font-heading text-2xl font-bold text-primary">
                      ₹{deliveryAssignments.filter((a: any) => a.status === "delivered").length * EARNING_PER_DELIVERY}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">TOTAL RIDER EARNINGS</p>
                  </div>
                  <div className="bg-card rounded-2xl p-5 shadow-card">
                    <Truck className="w-5 h-5 text-foreground mb-2" />
                    <p className="font-heading text-2xl font-bold text-foreground">
                      {deliveryAssignments.filter((a: any) => a.status === "delivered").length}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">TOTAL DELIVERIES</p>
                  </div>
                </div>
                <div className="bg-primary/10 rounded-2xl p-4 flex items-center gap-3">
                  <IndianRupee className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-heading font-bold text-sm uppercase tracking-wider">₹{EARNING_PER_DELIVERY} PER DELIVERY</p>
                    <p className="text-xs text-muted-foreground">Each rider earns ₹{EARNING_PER_DELIVERY} per completed delivery</p>
                  </div>
                </div>
                {/* Per-rider breakdown */}
                {riders.map((rider: any) => {
                  const earnings = getRiderEarnings(rider.id);
                  return (
                    <div key={rider.id} className="bg-card rounded-2xl shadow-card p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-heading font-bold text-sm uppercase tracking-wide">{rider.full_name || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">{rider.phone || rider.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-secondary/50 rounded-xl p-3 text-center">
                          <p className="font-heading font-bold text-primary text-lg">₹{earnings.today}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">TODAY ({earnings.todayDeliveries})</p>
                        </div>
                        <div className="bg-secondary/50 rounded-xl p-3 text-center">
                          <p className="font-heading font-bold text-foreground text-lg">₹{earnings.week}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">WEEK ({earnings.weekDeliveries})</p>
                        </div>
                        <div className="bg-secondary/50 rounded-xl p-3 text-center">
                          <p className="font-heading font-bold text-green-600 text-lg">₹{earnings.total}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">TOTAL ({earnings.totalDeliveries})</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Merchants */}
        {tab === "merchants" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight">MERCHANTS ({merchants.length})</h2>
              <Button onClick={() => setShowCreateMerchant(!showCreateMerchant)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 mr-1" /> CREATE
              </Button>
            </div>
            {showCreateMerchant && (
              <CreateForm
                fields={[
                  { key: "full_name", placeholder: "Full Name" },
                  { key: "email", placeholder: "Email", type: "email" },
                  { key: "password", placeholder: "Password", type: "password" },
                  { key: "phone", placeholder: "Phone" },
                ]}
                values={newMerchant}
                onChange={setNewMerchant}
                onSubmit={createMerchant}
                label="MERCHANT"
              />
            )}
            <div className="space-y-3">
              {merchants.map((m: any) => <UserCard key={m.id} user={m} type="merchant" />)}
              {merchants.length === 0 && <p className="text-center text-muted-foreground py-8 uppercase tracking-wider text-sm">NO MERCHANTS YET</p>}
            </div>
          </div>
        )}

        {/* Riders */}
        {tab === "riders" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight">DELIVERY PARTNERS ({riders.length})</h2>
              <Button onClick={() => setShowCreateRider(!showCreateRider)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 mr-1" /> CREATE
              </Button>
            </div>
            {showCreateRider && (
              <CreateForm
                fields={[
                  { key: "full_name", placeholder: "Full Name" },
                  { key: "email", placeholder: "Email", type: "email" },
                  { key: "password", placeholder: "Password", type: "password" },
                  { key: "phone", placeholder: "Phone" },
                ]}
                values={newRider}
                onChange={setNewRider}
                onSubmit={createRider}
                label="RIDER"
              />
            )}
            <div className="space-y-3">
              {riders.map((r: any) => <UserCard key={r.id} user={r} type="rider" />)}
              {riders.length === 0 && <p className="text-center text-muted-foreground py-8 uppercase tracking-wider text-sm">NO RIDERS YET</p>}
            </div>
          </div>
        )}

        {/* Customers */}
        {tab === "customers" && (
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-6">CUSTOMERS ({customers.length})</h2>
            <div className="space-y-3">
              {customers.map((c: any) => <UserCard key={c.id} user={c} type="customer" />)}
              {customers.length === 0 && <p className="text-center text-muted-foreground py-8 uppercase tracking-wider text-sm">NO CUSTOMERS YET</p>}
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-6">ALL ORDERS ({orders.length})</h2>
            <div className="space-y-3">
              {orders.map((o: any) => {
                const isExpanded = expandedOrder === o.id;
                return (
                  <div key={o.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
                    <div
                      className="p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedOrder(isExpanded ? null : o.id)}
                    >
                      <div>
                        <p className="font-heading font-bold text-sm uppercase tracking-wide">{o.order_number}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-heading font-bold text-primary">₹{o.total_amount}</p>
                          <span className="text-xs uppercase tracking-wider bg-secondary px-2 py-0.5 rounded-full">{o.status}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border pt-3 space-y-2 text-sm">
                        <DetailRow icon={MapPin} label="Address" value={o.delivery_address} />
                        <DetailRow icon={CreditCard} label="Payment" value={`${o.payment_method} (${o.payment_status})`} />
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Subtotal: ₹{o.subtotal}</span>
                          {Number(o.discount) > 0 && <span>Discount: -₹{o.discount}</span>}
                        </div>
                        {o.order_items && o.order_items.length > 0 && (
                          <div>
                            <p className="text-xs font-heading font-bold uppercase tracking-wider text-primary mt-2 mb-1">ITEMS</p>
                            {o.order_items.map((item: any) => (
                              <div key={item.id} className="flex justify-between text-xs bg-secondary/50 rounded-lg px-3 py-1.5 mb-1">
                                <span>{item.item_name} × {item.quantity}</span>
                                <span className="font-bold">₹{item.total_price}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {o.delivery_notes && <p className="text-xs text-muted-foreground italic">Note: {o.delivery_notes}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
              {orders.length === 0 && <p className="text-center text-muted-foreground py-8 uppercase tracking-wider text-sm">NO ORDERS YET</p>}
            </div>
          </div>
        )}

        {/* Coupons */}
        {tab === "coupons" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight">COUPONS ({coupons.length})</h2>
              <Button onClick={() => setShowCreateCoupon(!showCreateCoupon)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 mr-1" /> CREATE
              </Button>
            </div>
            {showCreateCoupon && (
              <div className="bg-card rounded-2xl p-6 shadow-card mb-6 space-y-3">
                <Input placeholder="Coupon Code (e.g. MIDNIGHT20)" value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Description (e.g. Get 50% off!)" value={newCoupon.description} onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})} className="rounded-xl bg-secondary border-0" />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) => setNewCoupon({...newCoupon, discount_type: e.target.value})}
                    className="rounded-xl bg-secondary border-0 p-3 text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                  <Input type="number" placeholder="Discount Value" value={newCoupon.discount_value} onChange={(e) => setNewCoupon({...newCoupon, discount_value: Number(e.target.value)})} className="rounded-xl bg-secondary border-0" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Min Order ₹" value={newCoupon.min_order_amount || ""} onChange={(e) => setNewCoupon({...newCoupon, min_order_amount: Number(e.target.value)})} className="rounded-xl bg-secondary border-0" />
                  <Input type="number" placeholder="Max Discount ₹ (optional)" value={newCoupon.max_discount || ""} onChange={(e) => setNewCoupon({...newCoupon, max_discount: Number(e.target.value)})} className="rounded-xl bg-secondary border-0" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Usage Limit (optional)" value={newCoupon.usage_limit || ""} onChange={(e) => setNewCoupon({...newCoupon, usage_limit: Number(e.target.value)})} className="rounded-xl bg-secondary border-0" />
                  <Input type="datetime-local" placeholder="Expires At" value={newCoupon.expires_at} onChange={(e) => setNewCoupon({...newCoupon, expires_at: e.target.value})} className="rounded-xl bg-secondary border-0" />
                </div>
                <Button onClick={createCoupon} disabled={loading} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                  {loading ? "CREATING..." : "CREATE COUPON"}
                </Button>
              </div>
            )}
            <div className="space-y-3">
              {coupons.map((c: any) => (
                <div key={c.id} className="bg-card rounded-2xl p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-heading font-bold text-sm uppercase tracking-wide">{c.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                        {c.min_order_amount > 0 && ` · Min ₹${c.min_order_amount}`}
                        {c.max_discount && ` · Max ₹${c.max_discount}`}
                      </p>
                      {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {c.usage_limit ? `${c.used_count}/${c.usage_limit} used` : `${c.used_count} used`}
                        {c.expires_at && ` · Expires ${new Date(c.expires_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleCoupon(c.id, c.is_active)}
                        className={`p-1.5 rounded-full ${c.is_active ? "text-green-500" : "text-muted-foreground"}`}
                      >
                        {c.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => deleteCoupon(c.id)}
                        className="p-1.5 rounded-full text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
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
