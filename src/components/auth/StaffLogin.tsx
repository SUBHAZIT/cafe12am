import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface StaffLoginProps {
  type: "merchant" | "delivery" | "admin";
}

const titles = {
  merchant: "MERCHANT LOGIN",
  delivery: "DELIVERY PARTNER LOGIN",
  admin: "ADMIN LOGIN",
};

const StaffLogin = ({ type }: StaffLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: "Missing fields", description: "Please enter email and password", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full border border-primary/10 animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full border border-primary/10 animate-float-delayed" />
      <div className="absolute top-16 right-16 w-4 h-4 rotate-45 border border-primary/20" />

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-heading text-sm font-bold uppercase tracking-wider">BACK TO HOME</span>
        </Link>
        <div className="text-center mb-8">
          <h1 className="font-heading text-5xl font-bold text-primary mb-2 uppercase tracking-tight">CAFÉ12AM</h1>
          <p className="text-muted-foreground uppercase tracking-wider text-sm">{titles[type]}</p>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-card relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full border border-primary/5" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-lg font-bold uppercase tracking-wide">SIGN IN</h2>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 rounded-xl text-lg bg-secondary border-0"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-14 rounded-xl text-lg bg-secondary border-0"
              />
            </div>

            <Button onClick={handleLogin} disabled={loading} className="w-full h-14 rounded-xl text-lg font-heading font-bold uppercase tracking-wide">
              {loading ? "SIGNING IN..." : "LOGIN"}
            </Button>

            <p className="text-xs text-center text-muted-foreground uppercase tracking-wide">
              CREDENTIALS PROVIDED BY ADMIN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
