import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import CustomerNav from "@/components/customer/CustomerNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import foodBurger from "@/assets/food-burger.png";
import {
  Plus, Minus, Trash2, Tag, X, MapPin, Clock, CreditCard, Banknote,
  Wallet, Shield, Zap, Headphones, ChevronDown, ChevronUp, Navigation,
  Edit3, Phone, User, FileText, Sparkles,
} from "lucide-react";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  is_default: boolean;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const {
    items, addItem, removeItem, clearCart, cartCount, subtotal,
    appliedCoupon, applyCoupon, removeCoupon, discount, total,
  } = useCart();

  const cartItems = Object.values(items);

  // Address state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [newAddress, setNewAddress] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Delivery time
  const [deliveryOption, setDeliveryOption] = useState<"asap" | "scheduled">("asap");
  const [scheduledTime, setScheduledTime] = useState("");
  const prepTime = 20; // default merchant prep time

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Order notes
  const [orderNotes, setOrderNotes] = useState("");

  // Sections expand
  const [expandedSection, setExpandedSection] = useState<string | null>("items");

  // Placing
  const [placing, setPlacing] = useState(false);

  const deliveryFee = 30;
  const finalTotal = total + deliveryFee;

  useEffect(() => {
    if (!user) return;
    const fetchAddresses = async () => {
      const { data } = await supabase
        .from("saved_addresses")
        .select("*")
        .eq("user_id", profile?.id || "")
        .order("is_default", { ascending: false });
      if (data) {
        setSavedAddresses(data);
        const def = data.find((a) => a.is_default) || data[0];
        if (def) setSelectedAddressId(def.id);
      }
    };
    const fetchCoupons = async () => {
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true);
      if (data) setAvailableCoupons(data);
    };
    fetchAddresses();
    fetchCoupons();
    if (profile) {
      setContactName(profile.full_name || "");
      setContactPhone(profile.phone || "");
    }
  }, [user, profile]);

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId);

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setNewAddress(data.display_name || `${latitude}, ${longitude}`);
        } catch {
          setNewAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        setFetchingLocation(false);
      },
      () => {
        toast({ title: "Location access denied", variant: "destructive" });
        setFetchingLocation(false);
      }
    );
  };

  const handleSaveAddress = async () => {
    if (!newAddress.trim() || !profile?.id) return;
    const { data, error } = await supabase.from("saved_addresses").insert({
      user_id: profile.id,
      label: newLabel,
      address: newAddress.trim(),
      is_default: savedAddresses.length === 0,
    }).select().single();
    if (data) {
      setSavedAddresses((prev) => [...prev, data]);
      setSelectedAddressId(data.id);
      setShowAddressForm(false);
      setNewAddress("");
      toast({ title: "Address saved!" });
    }
    if (error) toast({ title: "Failed to save address", variant: "destructive" });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (error || !data) {
        toast({ title: "Invalid coupon", variant: "destructive" });
        setApplying(false);
        return;
      }
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        toast({ title: "Coupon limit reached", variant: "destructive" });
        setApplying(false);
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({ title: "Coupon expired", variant: "destructive" });
        setApplying(false);
        return;
      }
      applyCoupon({
        id: data.id, code: data.code, discount_type: data.discount_type,
        discount_value: data.discount_value, max_discount: data.max_discount,
        min_order_amount: data.min_order_amount,
      });
      setCouponCode("");
    } catch {
      toast({ title: "Error applying coupon", variant: "destructive" });
    }
    setApplying(false);
  };

  const handlePlaceOrder = async () => {
    if (!user || !profile) {
      toast({ title: "Please log in first", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (!selectedAddress) {
      toast({ title: "Please select a delivery address", variant: "destructive" });
      return;
    }
    if (cartItems.length === 0) return;

    setPlacing(true);
    try {
      const orderNumber = `C12AM-${Date.now().toString(36).toUpperCase()}`;
      const { data: merchants } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", (await supabase.from("user_roles").select("user_id").eq("role", "merchant").limit(1)).data?.[0]?.user_id || "")
        .maybeSingle();

      const merchantId = merchants?.id || profile.id;

      const { data: order, error: orderError } = await supabase.from("orders").insert({
        customer_id: profile.id,
        merchant_id: merchantId,
        order_number: orderNumber,
        delivery_address: selectedAddress.address,
        delivery_notes: deliveryInstructions || orderNotes || null,
        subtotal,
        delivery_fee: deliveryFee,
        discount,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        coupon_id: appliedCoupon?.id || null,
        status: "pending",
        payment_status: paymentMethod === "cod" ? "pending" : "paid",
      }).select().single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id.startsWith("d") ? null : item.id,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      await supabase.from("order_items").insert(orderItems);

      toast({ title: "Order placed! 🎉", description: `Order #${orderNumber}` });
      clearCart();
      navigate("/order/orders");
    } catch (err: any) {
      toast({ title: "Failed to place order", description: err.message, variant: "destructive" });
    }
    setPlacing(false);
  };

  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? null : s);

  if (cartItems.length === 0) {
    navigate("/order");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <CustomerNav cartCount={cartCount} />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">CHECKOUT</h1>

        {/* SECTION 1 — Order Summary */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <button onClick={() => toggleSection("items")} className="w-full flex items-center justify-between p-4">
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> ORDER SUMMARY ({cartCount})
            </h2>
            {expandedSection === "items" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {expandedSection === "items" && (
            <div className="px-4 pb-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image_url || foodBurger} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-xs uppercase tracking-wide truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-primary rounded-full">
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-primary-foreground">
                      {item.quantity === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    </button>
                    <span className="text-primary-foreground font-heading font-bold text-xs min-w-[16px] text-center">{item.quantity}</span>
                    <button onClick={() => addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url })} className="p-1.5 text-primary-foreground">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-heading font-bold text-sm text-foreground min-w-[50px] text-right">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2 — Delivery Address */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <button onClick={() => toggleSection("address")} className="w-full flex items-center justify-between p-4">
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> DELIVERY ADDRESS
            </h2>
            {expandedSection === "address" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {expandedSection === "address" && (
            <div className="px-4 pb-4 space-y-3">
              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1"><User className="w-3 h-3" /> Name</Label>
                  <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your name" className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1"><Phone className="w-3 h-3" /> Phone</Label>
                  <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone number" className="h-9 text-sm" />
                </div>
              </div>

              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedAddressId === addr.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <p className="font-heading font-bold text-xs uppercase tracking-wider text-primary">{addr.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{addr.address}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Add new address */}
              {!showAddressForm ? (
                <Button variant="outline" onClick={() => setShowAddressForm(true)} className="w-full rounded-xl text-xs uppercase tracking-wider font-heading font-bold">
                  <Plus className="w-3 h-3 mr-1" /> ADD NEW ADDRESS
                </Button>
              ) : (
                <div className="space-y-2 p-3 rounded-xl border border-dashed border-primary/30 bg-primary/5">
                  <div className="flex gap-2">
                    {["Home", "Hostel", "Office", "Other"].map((l) => (
                      <button
                        key={l}
                        onClick={() => setNewLabel(l)}
                        className={`px-3 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider transition-all ${
                          newLabel === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter full address..."
                    className="text-sm min-h-[60px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleFetchLocation}
                      disabled={fetchingLocation}
                      className="flex-1 rounded-xl text-xs uppercase tracking-wider font-heading font-bold"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      {fetchingLocation ? "FETCHING..." : "USE CURRENT LOCATION"}
                    </Button>
                    <Button onClick={handleSaveAddress} className="rounded-xl text-xs uppercase tracking-wider font-heading font-bold">
                      SAVE
                    </Button>
                  </div>
                  <button onClick={() => setShowAddressForm(false)} className="text-xs text-muted-foreground uppercase tracking-wider">Cancel</button>
                </div>
              )}

              {/* Delivery instructions */}
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1"><FileText className="w-3 h-3" /> Delivery Instructions (optional)</Label>
                <Input
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Ring the bell twice, leave at door..."
                  className="h-9 text-sm"
                />
              </div>
            </div>
          )}
          {expandedSection !== "address" && selectedAddress && (
            <div className="px-4 pb-3">
              <p className="text-xs text-muted-foreground truncate">{selectedAddress.label}: {selectedAddress.address}</p>
            </div>
          )}
        </div>

        {/* SECTION 3 — Delivery Time */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <button onClick={() => toggleSection("time")} className="w-full flex items-center justify-between p-4">
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> DELIVERY TIME
            </h2>
            {expandedSection === "time" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {expandedSection === "time" && (
            <div className="px-4 pb-4 space-y-3">
              <RadioGroup value={deliveryOption} onValueChange={(v) => setDeliveryOption(v as "asap" | "scheduled")}>
                <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="asap" id="asap" />
                  <Label htmlFor="asap" className="flex-1 cursor-pointer">
                    <p className="font-heading font-bold text-xs uppercase tracking-wider">DELIVER ASAP</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Estimated: {prepTime}–{prepTime + 10} mins</p>
                  </Label>
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="scheduled" id="scheduled" />
                  <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
                    <p className="font-heading font-bold text-xs uppercase tracking-wider">SCHEDULE DELIVERY</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Choose your preferred time</p>
                  </Label>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
              </RadioGroup>
              {deliveryOption === "scheduled" && (
                <Input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="h-9 text-sm"
                />
              )}
              <div className="flex items-center gap-2 bg-primary/5 rounded-xl p-3">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">Prep time: ~{prepTime} mins</span> · Arrives in {prepTime}–{prepTime + 10} minutes
                </p>
              </div>
            </div>
          )}
          {expandedSection !== "time" && (
            <div className="px-4 pb-3">
              <p className="text-xs text-muted-foreground">
                {deliveryOption === "asap" ? `ASAP · ~${prepTime}–${prepTime + 10} mins` : `Scheduled: ${scheduledTime || "Not set"}`}
              </p>
            </div>
          )}
        </div>

        {/* SECTION 4 — Coupons */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <button onClick={() => toggleSection("coupon")} className="w-full flex items-center justify-between p-4">
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" /> COUPONS & OFFERS
            </h2>
            {expandedSection === "coupon" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {expandedSection === "coupon" && (
            <div className="px-4 pb-4 space-y-3">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-primary/10 rounded-xl p-3 border border-dashed border-primary/30">
                  <div>
                    <p className="font-heading font-bold text-sm text-primary uppercase tracking-wider">{appliedCoupon.code}</p>
                    <p className="text-xs text-muted-foreground">You save ₹{discount.toFixed(0)}</p>
                  </div>
                  <button onClick={removeCoupon} className="p-1.5 rounded-full hover:bg-destructive/10">
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="h-9 text-sm font-heading uppercase tracking-wider"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <Button onClick={handleApplyCoupon} disabled={applying} className="rounded-xl text-xs uppercase tracking-wider font-heading font-bold shrink-0 h-9">
                      {applying ? "..." : "APPLY"}
                    </Button>
                  </div>
                  {availableCoupons.length > 0 && (
                    <>
                      <button onClick={() => setShowCoupons(!showCoupons)} className="text-xs text-primary font-heading font-bold uppercase tracking-wider">
                        {showCoupons ? "HIDE" : "VIEW"} AVAILABLE OFFERS ({availableCoupons.length})
                      </button>
                      {showCoupons && (
                        <div className="space-y-2">
                          {availableCoupons.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                applyCoupon({
                                  id: c.id, code: c.code, discount_type: c.discount_type,
                                  discount_value: c.discount_value, max_discount: c.max_discount,
                                  min_order_amount: c.min_order_amount,
                                });
                                setShowCoupons(false);
                              }}
                              className="w-full text-left p-3 rounded-xl border border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-heading font-bold text-xs text-primary uppercase tracking-wider">{c.code}</p>
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                                  {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                                </span>
                              </div>
                              {c.description && <p className="text-[10px] text-muted-foreground mt-1">{c.description}</p>}
                              {c.min_order_amount > 0 && <p className="text-[10px] text-muted-foreground">Min order: ₹{c.min_order_amount}</p>}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
          {expandedSection !== "coupon" && appliedCoupon && (
            <div className="px-4 pb-3">
              <p className="text-xs text-primary font-bold">{appliedCoupon.code} applied · -₹{discount.toFixed(0)}</p>
            </div>
          )}
        </div>

        {/* SECTION 5 — Payment Method */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <button onClick={() => toggleSection("payment")} className="w-full flex items-center justify-between p-4">
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> PAYMENT METHOD
            </h2>
            {expandedSection === "payment" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {expandedSection === "payment" && (
            <div className="px-4 pb-4">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                {[
                  { value: "upi", label: "UPI", desc: "Google Pay, PhonePe, Paytm", icon: <Wallet className="w-4 h-4" /> },
                  { value: "card", label: "CARD", desc: "Credit / Debit Card", icon: <CreditCard className="w-4 h-4" /> },
                  { value: "wallet", label: "WALLET", desc: "Paytm, Mobikwik, etc.", icon: <Wallet className="w-4 h-4" /> },
                  { value: "cod", label: "CASH ON DELIVERY", desc: "Pay when delivered", icon: <Banknote className="w-4 h-4" /> },
                ].map((opt) => (
                  <div key={opt.value} className="flex items-center gap-3 p-3 rounded-xl border-2 border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <Label htmlFor={opt.value} className="flex-1 cursor-pointer">
                      <p className="font-heading font-bold text-xs uppercase tracking-wider">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                    </Label>
                    <span className="text-muted-foreground">{opt.icon}</span>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex items-center gap-2 mt-3 bg-primary/5 rounded-xl p-2">
                <Shield className="w-3 h-3 text-primary" />
                <p className="text-[10px] text-muted-foreground">100% Secure Payments</p>
              </div>
            </div>
          )}
          {expandedSection !== "payment" && (
            <div className="px-4 pb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "upi" ? "UPI" : paymentMethod === "card" ? "Card" : "Wallet"}
              </p>
            </div>
          )}
        </div>

        {/* Order Notes */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2"><Edit3 className="w-3 h-3" /> Order Notes (optional)</Label>
          <Input
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Any special requests for your order..."
            className="h-9 text-sm"
          />
        </div>

        {/* Bill Summary */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-3">BILL DETAILS</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">Subtotal</span>
              <span className="font-heading font-bold">₹{subtotal.toFixed(0)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary">
                <span className="text-xs uppercase tracking-wide">Discount</span>
                <span className="font-heading font-bold">-₹{discount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">Delivery Fee</span>
              <span className="font-heading font-bold">₹{deliveryFee}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-heading font-bold uppercase tracking-wider">TOTAL</span>
              <span className="font-heading font-bold text-lg text-primary">₹{finalTotal.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-wider font-heading font-bold">Fast Delivery</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-wider font-heading font-bold">Secure Pay</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Headphones className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-wider font-heading font-bold">24/7 Support</span>
          </div>
        </div>

        {/* ETA badge */}
        <div className="text-center bg-primary/5 rounded-xl p-3">
          <p className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
            🕐 ARRIVES IN {prepTime}–{prepTime + 10} MINUTES
          </p>
        </div>
      </div>

      {/* Sticky Place Order button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={handlePlaceOrder}
          disabled={placing || !selectedAddress}
          className="max-w-lg mx-auto flex items-center justify-between bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all w-full disabled:opacity-60"
        >
          <div className="text-left">
            <p className="font-heading font-bold text-sm uppercase tracking-wider">₹{finalTotal.toFixed(0)}</p>
            <p className="text-[10px] opacity-80 uppercase tracking-wider">TOTAL</p>
          </div>
          <span className="font-heading font-bold uppercase tracking-wider text-sm">
            {placing ? "PLACING..." : "PLACE ORDER →"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
