import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User, Store, Clock, Building2, Lock, LogOut, ChevronRight, ChevronLeft,
  Edit, Save, X, Shield, Phone, Mail, FileText, Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Section = "business" | "operations" | "financial" | "security";

const MerchantProfile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("business");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", address: "" });
  const [storeForm, setStoreForm] = useState({ store_name: "", store_description: "", opening_time: "21:00", closing_time: "02:00" });
  const [settings, setSettings] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({ account_holder_name: "", bank_name: "", account_number: "", ifsc_code: "", upi_id: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [editingStore, setEditingStore] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name || "", phone: profile.phone || "", email: profile.email || "", address: profile.address || "" });
      fetchSettings();
      fetchBankDetails();
    }
  }, [profile]);

  const fetchSettings = async () => {
    if (!profile) return;
    const { data } = await supabase.from("merchant_settings").select("*").eq("merchant_id", profile.id).maybeSingle();
    if (data) {
      setSettings(data);
      setStoreForm({ store_name: data.store_name || "", store_description: data.store_description || "", opening_time: data.opening_time || "21:00", closing_time: data.closing_time || "02:00" });
    }
  };

  const fetchBankDetails = async () => {
    if (!profile) return;
    const { data } = await supabase.from("bank_details").select("*").eq("user_id", profile.id).maybeSingle();
    if (data) {
      setBankDetails(data);
      setBankForm({ account_holder_name: data.account_holder_name, bank_name: data.bank_name, account_number: data.account_number, ifsc_code: data.ifsc_code, upi_id: data.upi_id || "" });
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from("profiles").update(form).eq("id", profile.id);
    setSaving(false);
    toast({ title: "Profile updated!" });
    setEditing(false);
  };

  const saveStoreSettings = async () => {
    if (!profile) return;
    setSaving(true);
    if (settings) {
      await supabase.from("merchant_settings").update(storeForm).eq("merchant_id", profile.id);
    } else {
      await supabase.from("merchant_settings").insert([{ ...storeForm, merchant_id: profile.id }]);
    }
    setSaving(false);
    toast({ title: "Store settings updated!" });
    setEditingStore(false);
    fetchSettings();
  };

  const saveBankDetails = async () => {
    if (!profile || !bankForm.account_holder_name || !bankForm.account_number || !bankForm.ifsc_code) {
      toast({ title: "Missing required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (bankDetails) {
      await supabase.from("bank_details").update(bankForm).eq("id", bankDetails.id);
    } else {
      await supabase.from("bank_details").insert([{ ...bankForm, user_id: profile.id }]);
    }
    setSaving(false);
    toast({ title: "Bank details saved! Admin will review changes." });
    setShowBankForm(false);
    fetchBankDetails();
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
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Password changed!" });
      setChangingPassword(false);
      setPasswordForm({ password: "", confirmPassword: "" });
    }
  };

  const sections = [
    { id: "business" as Section, label: "BUSINESS", icon: Store },
    { id: "operations" as Section, label: "OPERATIONS", icon: Clock },
    { id: "financial" as Section, label: "FINANCIAL", icon: Building2 },
    { id: "security" as Section, label: "SECURITY", icon: Shield },
  ];

  const initials = (profile?.full_name || "M").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/merchant")} className="p-2 rounded-full hover:bg-secondary"><ChevronLeft className="w-5 h-5" /></button>
            <h1 className="font-heading text-xl font-bold text-primary uppercase tracking-tight">PROFILE</h1>
            <span className="text-xs font-heading font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">MERCHANT</span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="section-pink py-8 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Avatar className="w-20 h-20 border-4 border-primary/20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-heading font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">{settings?.store_name || profile?.full_name || "MERCHANT"}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email || profile?.phone}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
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
        {/* Business Info */}
        {section === "business" && (
          <div className="space-y-4">
            {/* Personal Info */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-heading text-lg font-bold uppercase tracking-tight">CONTACT INFO</h2>
                {!editing ? (
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider"><Edit className="w-3 h-3 mr-1" /> EDIT</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
                    <Button size="sm" onClick={saveProfile} disabled={saving} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider"><Save className="w-3 h-3 mr-1" /> SAVE</Button>
                  </div>
                )}
              </div>
              {editing ? (
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Full Name</label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" /></div>
                  <div><label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Phone</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" /></div>
                  <div><label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Email</label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" /></div>
                  <div><label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Store Address</label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" /></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {[{ label: "NAME", value: profile?.full_name }, { label: "PHONE", value: profile?.phone }, { label: "EMAIL", value: profile?.email }, { label: "ADDRESS", value: profile?.address }].map((item) => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</span>
                      <span className="font-heading font-semibold text-sm text-right max-w-[60%]">{item.value || "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Store Info */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-heading text-lg font-bold uppercase tracking-tight">STORE INFO</h2>
                {!editingStore ? (
                  <Button size="sm" variant="outline" onClick={() => setEditingStore(true)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider"><Edit className="w-3 h-3 mr-1" /> EDIT</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingStore(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
                    <Button size="sm" onClick={saveStoreSettings} disabled={saving} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider"><Save className="w-3 h-3 mr-1" /> SAVE</Button>
                  </div>
                )}
              </div>
              {editingStore ? (
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Store Name</label><Input value={storeForm.store_name} onChange={(e) => setStoreForm({ ...storeForm, store_name: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" /></div>
                  <div><label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Description</label><Input value={storeForm.store_description} onChange={(e) => setStoreForm({ ...storeForm, store_description: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" /></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {[{ label: "STORE NAME", value: settings?.store_name }, { label: "DESCRIPTION", value: settings?.store_description }].map((item) => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</span>
                      <span className="font-heading font-semibold text-sm text-right max-w-[60%]">{item.value || "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Operations */}
        {section === "operations" && (
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-lg font-bold uppercase tracking-tight">OPERATING HOURS</h2>
              {!editingStore ? (
                <Button size="sm" variant="outline" onClick={() => setEditingStore(true)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider"><Edit className="w-3 h-3 mr-1" /> EDIT</Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditingStore(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
                  <Button size="sm" onClick={saveStoreSettings} disabled={saving} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider"><Save className="w-3 h-3 mr-1" /> SAVE</Button>
                </div>
              )}
            </div>
            {editingStore ? (
              <div className="space-y-3">
                <div><label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Opening Time</label><Input type="time" value={storeForm.opening_time} onChange={(e) => setStoreForm({ ...storeForm, opening_time: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" /></div>
                <div><label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Closing Time</label><Input type="time" value={storeForm.closing_time} onChange={(e) => setStoreForm({ ...storeForm, closing_time: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" /></div>
              </div>
            ) : (
              <div className="space-y-3">
                {[{ label: "OPENING TIME", value: settings?.opening_time || "21:00" }, { label: "CLOSING TIME", value: settings?.closing_time || "02:00" }, { label: "STATUS", value: settings?.is_open ? "OPEN" : "CLOSED" }].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</span>
                    <span className="font-heading font-semibold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Financial */}
        {section === "financial" && (
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-lg font-bold uppercase tracking-tight">BANK DETAILS</h2>
              <Button size="sm" variant="outline" onClick={() => setShowBankForm(!showBankForm)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
                {bankDetails ? "EDIT" : "ADD"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-4 bg-secondary/50 p-3 rounded-xl">⚠️ Bank detail changes require admin approval.</p>
            {showBankForm || !bankDetails ? (
              <div className="space-y-3">
                <Input placeholder="Account Holder Name" value={bankForm.account_holder_name} onChange={(e) => setBankForm({ ...bankForm, account_holder_name: e.target.value })} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Bank Name" value={bankForm.bank_name} onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="Account Number" value={bankForm.account_number} onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="IFSC Code" value={bankForm.ifsc_code} onChange={(e) => setBankForm({ ...bankForm, ifsc_code: e.target.value })} className="rounded-xl bg-secondary border-0" />
                <Input placeholder="UPI ID (Optional)" value={bankForm.upi_id} onChange={(e) => setBankForm({ ...bankForm, upi_id: e.target.value })} className="rounded-xl bg-secondary border-0" />
                <Button onClick={saveBankDetails} disabled={saving} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">SAVE DETAILS</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {[{ label: "NAME", value: bankDetails.account_holder_name }, { label: "BANK", value: bankDetails.bank_name }, { label: "ACCOUNT", value: `****${bankDetails.account_number.slice(-4)}` }, { label: "IFSC", value: bankDetails.ifsc_code }, ...(bankDetails.upi_id ? [{ label: "UPI", value: bankDetails.upi_id }] : [])].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</span>
                    <span className="font-heading font-bold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Security */}
        {section === "security" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <h2 className="font-heading text-lg font-bold uppercase tracking-tight p-5 pb-3">SECURITY</h2>
              {!changingPassword ? (
                <button onClick={() => setChangingPassword(true)} className="w-full flex items-center justify-between p-4 border-t border-border hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3"><Lock className="w-5 h-5 text-primary" /><span className="font-heading font-bold text-sm uppercase tracking-wider">CHANGE PASSWORD</span></div>
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
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <button onClick={signOut} className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors">
                <LogOut className="w-5 h-5 text-destructive" />
                <span className="font-heading font-bold text-sm uppercase tracking-wider text-destructive">LOGOUT</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantProfile;
