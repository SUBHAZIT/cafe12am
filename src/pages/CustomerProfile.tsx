import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CustomerNav from "@/components/customer/CustomerNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User, MapPin, Bell, Shield, HelpCircle, LogOut, ChevronRight,
  Plus, Edit, Trash2, Star, Lock, FileText, Package, Camera, Save, X, Check
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type Section = "profile" | "addresses" | "preferences" | "account";

const CustomerProfile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("profile");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", address: "" });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: "Home", address: "", is_default: false });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        email: profile.email || "",
        address: profile.address || "",
      });
      fetchAddresses();
    }
  }, [profile]);

  const fetchAddresses = async () => {
    if (!profile) return;
    const { data } = await supabase.from("saved_addresses").select("*").eq("user_id", profile.id).order("created_at");
    if (data) setAddresses(data);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      address: form.address,
    }).eq("id", profile.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      setEditing(false);
    }
  };

  const saveAddress = async () => {
    if (!profile || !addressForm.address) return;
    setSaving(true);
    if (addressForm.is_default) {
      await supabase.from("saved_addresses").update({ is_default: false }).eq("user_id", profile.id);
    }
    if (editingAddressId) {
      await supabase.from("saved_addresses").update(addressForm).eq("id", editingAddressId);
    } else {
      await supabase.from("saved_addresses").insert([{ ...addressForm, user_id: profile.id }]);
    }
    setSaving(false);
    toast({ title: editingAddressId ? "Address updated!" : "Address added!" });
    setShowAddAddress(false);
    setEditingAddressId(null);
    setAddressForm({ label: "Home", address: "", is_default: false });
    fetchAddresses();
  };

  const deleteAddress = async (id: string) => {
    await supabase.from("saved_addresses").delete().eq("id", id);
    toast({ title: "Address deleted" });
    fetchAddresses();
  };

  const changePassword = async () => {
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (passwordForm.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.password });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password changed!" });
      setChangingPassword(false);
      setPasswordForm({ password: "", confirmPassword: "" });
    }
  };

  const handleDeleteAccount = async () => {
    toast({ title: "Account deletion requested", description: "Please contact support to complete this process." });
  };

  const sections = [
    { id: "profile" as Section, label: "BASIC INFO", icon: User },
    { id: "addresses" as Section, label: "ADDRESSES", icon: MapPin },
    { id: "preferences" as Section, label: "PREFERENCES", icon: Bell },
    { id: "account" as Section, label: "ACCOUNT", icon: Shield },
  ];

  const initials = (profile?.full_name || "U").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <CustomerNav />

      {/* Profile header */}
      <div className="section-pink py-8 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Avatar className="w-20 h-20 border-4 border-primary/20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-heading font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">{profile?.full_name || "USER"}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email || profile?.phone}</p>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sections.map((s) => (
            <button key={s.id} onClick={() => setSection(s.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${section === s.id ? "bg-primary text-primary-foreground shadow-soft" : "bg-card text-muted-foreground hover:bg-secondary"}`}>
              <s.icon className="w-4 h-4" />{s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-24">
        {/* Basic Info */}
        {section === "profile" && (
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-heading text-lg font-bold uppercase tracking-tight">PERSONAL DETAILS</h2>
              {!editing ? (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                  <Edit className="w-3 h-3 mr-1" /> EDIT
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
                  <Button size="sm" onClick={saveProfile} disabled={saving} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                    <Save className="w-3 h-3 mr-1" /> {saving ? "SAVING..." : "SAVE"}
                  </Button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Full Name</label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Phone</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Email</label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Default Address</label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "NAME", value: profile?.full_name || "—" },
                  { label: "PHONE", value: profile?.phone || "—" },
                  { label: "EMAIL", value: profile?.email || "—" },
                  { label: "ADDRESS", value: profile?.address || "—" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</span>
                    <span className="font-heading font-semibold text-sm text-right max-w-[60%]">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addresses */}
        {section === "addresses" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-lg font-bold uppercase tracking-tight">SAVED ADDRESSES</h2>
              <Button size="sm" onClick={() => { setShowAddAddress(true); setEditingAddressId(null); setAddressForm({ label: "Home", address: "", is_default: false }); }} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                <Plus className="w-3 h-3 mr-1" /> ADD
              </Button>
            </div>

            {showAddAddress && (
              <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Label</label>
                  <div className="flex gap-2 mt-1">
                    {["Home", "Hostel", "Office", "Other"].map((l) => (
                      <button key={l} onClick={() => setAddressForm({ ...addressForm, label: l })} className={`px-3 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${addressForm.label === l ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Address</label>
                  <Input value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} placeholder="Full delivery address" className="rounded-xl bg-secondary border-0 mt-1" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={addressForm.is_default} onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })} className="rounded" />
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">SET AS DEFAULT</span>
                </label>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setShowAddAddress(false); setEditingAddressId(null); }} className="rounded-full"><X className="w-4 h-4" /></Button>
                  <Button size="sm" onClick={saveAddress} disabled={saving} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                    {saving ? "SAVING..." : editingAddressId ? "UPDATE" : "ADD ADDRESS"}
                  </Button>
                </div>
              </div>
            )}

            {addresses.length === 0 && !showAddAddress ? (
              <div className="text-center py-12 bg-card rounded-2xl shadow-card">
                <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground uppercase tracking-wider text-sm">NO SAVED ADDRESSES</p>
              </div>
            ) : addresses.map((a) => (
              <div key={a.id} className="bg-card rounded-2xl p-4 shadow-card flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mt-0.5">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-bold text-sm uppercase tracking-wide">{a.label}</p>
                      {a.is_default && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-heading font-bold uppercase">DEFAULT</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{a.address}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingAddressId(a.id); setAddressForm({ label: a.label, address: a.address, is_default: a.is_default }); setShowAddAddress(true); }} className="p-2 rounded-full hover:bg-secondary">
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteAddress(a.id)} className="p-2 rounded-full hover:bg-secondary">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preferences */}
        {section === "preferences" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <h2 className="font-heading text-lg font-bold uppercase tracking-tight p-5 pb-0">NOTIFICATIONS</h2>
              {[
                { label: "ORDER UPDATES", desc: "Get notified about order status changes" },
                { label: "PROMOTIONS", desc: "Receive special offers and deals" },
                { label: "EMAIL NOTIFICATIONS", desc: "Get updates via email" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 border-b border-border last:border-0">
                  <div>
                    <p className="font-heading font-bold text-sm uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account */}
        {section === "account" && (
          <div className="space-y-4">
            {/* Quick links */}
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <Link to="/order/orders" className="flex items-center justify-between p-4 border-b border-border hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="font-heading font-bold text-sm uppercase tracking-wider">ORDER HISTORY</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <button onClick={() => toast({ title: "Help & support", description: "Contact us at support@cafe12am.com" })} className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span className="font-heading font-bold text-sm uppercase tracking-wider">HELP & SUPPORT</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => toast({ title: "Privacy Policy", description: "Visit our website for full privacy policy." })} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-heading font-bold text-sm uppercase tracking-wider">PRIVACY & TERMS</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Security */}
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <h2 className="font-heading text-lg font-bold uppercase tracking-tight p-5 pb-3">SECURITY</h2>
              {!changingPassword ? (
                <button onClick={() => setChangingPassword(true)} className="w-full flex items-center justify-between p-4 border-t border-border hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <span className="font-heading font-bold text-sm uppercase tracking-wider">CHANGE PASSWORD</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ) : (
                <div className="p-5 space-y-3 border-t border-border">
                  <Input type="password" placeholder="New Password" value={passwordForm.password} onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })} className="rounded-xl bg-secondary border-0" />
                  <Input type="password" placeholder="Confirm Password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="rounded-xl bg-secondary border-0" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setChangingPassword(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
                    <Button size="sm" onClick={changePassword} disabled={saving} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">UPDATE PASSWORD</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Danger zone */}
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <button onClick={signOut} className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-destructive" />
                  <span className="font-heading font-bold text-sm uppercase tracking-wider text-destructive">LOGOUT</span>
                </div>
              </button>
              <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-4 hover:bg-destructive/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <span className="font-heading font-bold text-sm uppercase tracking-wider text-destructive">DELETE ACCOUNT</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
