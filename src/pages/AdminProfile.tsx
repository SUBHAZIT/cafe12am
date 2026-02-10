import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Shield, Lock, LogOut, ChevronRight, ChevronLeft, Edit, Save, X, Bell, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Section = "identity" | "security" | "preferences";

const AdminProfile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("identity");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name || "", phone: profile.phone || "", email: profile.email || "" });
  }, [profile]);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from("profiles").update(form).eq("id", profile.id);
    setSaving(false);
    toast({ title: "Profile updated!" });
    setEditing(false);
  };

  const changePassword = async () => {
    if (passwordForm.password !== passwordForm.confirmPassword) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (passwordForm.password.length < 6) { toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.password });
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Password changed!" }); setChangingPassword(false); setPasswordForm({ password: "", confirmPassword: "" }); }
  };

  const sections = [
    { id: "identity" as Section, label: "IDENTITY", icon: User },
    { id: "security" as Section, label: "SECURITY", icon: Shield },
    { id: "preferences" as Section, label: "PREFERENCES", icon: Bell },
  ];

  const initials = (profile?.full_name || "A").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="p-2 rounded-full hover:bg-secondary"><ChevronLeft className="w-5 h-5" /></button>
            <h1 className="font-heading text-xl font-bold text-primary uppercase tracking-tight">PROFILE</h1>
            <span className="text-xs font-heading font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">ADMIN</span>
          </div>
        </div>
      </nav>

      <div className="section-pink py-8 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Avatar className="w-20 h-20 border-4 border-primary/20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-heading font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">{profile?.full_name || "ADMIN"}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email || profile?.phone}</p>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-heading font-bold uppercase mt-1 inline-block">SUPER ADMIN</span>
          </div>
        </div>
      </div>

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
        {section === "identity" && (
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-lg font-bold uppercase tracking-tight">ADMIN INFO</h2>
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
                <div><label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Admin Name</label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" /></div>
                <div><label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Email</label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" /></div>
                <div><label className="text-xs text-muted-foreground uppercase tracking-wider font-heading font-bold">Contact Number</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl bg-secondary border-0 mt-1" /></div>
              </div>
            ) : (
              <div className="space-y-3">
                {[{ label: "NAME", value: profile?.full_name }, { label: "EMAIL", value: profile?.email }, { label: "PHONE", value: profile?.phone }].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</span>
                    <span className="font-heading font-semibold text-sm text-right max-w-[60%]">{item.value || "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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

        {section === "preferences" && (
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <h2 className="font-heading text-lg font-bold uppercase tracking-tight p-5 pb-0">NOTIFICATIONS</h2>
            {[
              { label: "NEW ORDERS", desc: "Get notified when new orders arrive" },
              { label: "STAFF CHANGES", desc: "Alerts for merchant/rider account changes" },
              { label: "SYSTEM ALERTS", desc: "Critical system notifications" },
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
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
