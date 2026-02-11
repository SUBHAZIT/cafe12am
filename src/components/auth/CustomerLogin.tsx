import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, ArrowRight, Sparkles, User, Phone, MapPin, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const CustomerLogin = () => {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const validatePhone = (p: string) => /^[6-9]\d{9}$/.test(p);

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      toast({ title: "Name required", description: "Please enter your full name", variant: "destructive" });
      return;
    }
    if (!email.trim()) {
      toast({ title: "Email required", description: "Please enter your email", variant: "destructive" });
      return;
    }
    if (!validatePhone(phone)) {
      toast({ title: "Invalid phone", description: "Please enter a valid 10-digit Indian phone number", variant: "destructive" });
      return;
    }
    if (!address.trim() || address.trim().length < 10) {
      toast({ title: "Address required", description: "Please enter your full delivery address (min 10 characters)", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/order",
        data: {
          full_name: fullName,
          phone: `+91${phone}`,
          address,
        },
      },
    });
    setLoading(false);

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      setEmailSent(true);
      toast({ title: "Check your email!", description: "We've sent a verification link. Please verify to continue." });
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      toast({ title: "Missing fields", description: "Please enter email and password", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        toast({ title: "Email not verified", description: "Please check your inbox and verify your email first", variant: "destructive" });
      } else {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      }
    } else {
      navigate("/order");
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({ title: "Email required", description: "Please enter your email address", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setResetSent(true);
      toast({ title: "Reset link sent!", description: "Check your email for the password reset link." });
    }
  };

  if (resetSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full border border-primary/10 animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full border border-primary/10 animate-float-delayed" />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <h1 className="font-heading text-5xl font-bold text-primary mb-2 uppercase tracking-tight">CAFÉ12AM</h1>
            <p className="text-muted-foreground uppercase tracking-wider text-sm">MIDNIGHT SNACK DESTINATION</p>
          </div>
          <div className="bg-card rounded-3xl p-8 shadow-card text-center">
            <KeyRound className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-2">CHECK YOUR EMAIL</h2>
            <p className="text-muted-foreground text-sm mb-6">
              We've sent a password reset link to <strong>{email}</strong>. Click the link to reset your password.
            </p>
            <Button variant="outline" onClick={() => { setResetSent(false); setMode("signin"); }} className="rounded-xl uppercase tracking-wide font-heading font-bold">
              BACK TO SIGN IN
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full border border-primary/10 animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full border border-primary/10 animate-float-delayed" />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <h1 className="font-heading text-5xl font-bold text-primary mb-2 uppercase tracking-tight">CAFÉ12AM</h1>
            <p className="text-muted-foreground uppercase tracking-wider text-sm">MIDNIGHT SNACK DESTINATION</p>
          </div>
          <div className="bg-card rounded-3xl p-8 shadow-card text-center">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-2">VERIFY YOUR EMAIL</h2>
            <p className="text-muted-foreground text-sm mb-6">
              We've sent a verification link to <strong>{email}</strong>. Please click the link to activate your account.
            </p>
            <Button variant="outline" onClick={() => { setEmailSent(false); setMode("signin"); }} className="rounded-xl uppercase tracking-wide font-heading font-bold">
              BACK TO SIGN IN
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full border border-primary/10 animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full border border-primary/10 animate-float-delayed" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-primary/20 animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-primary/30 animate-pulse" />
      <div className="absolute top-16 right-16 w-4 h-4 rotate-45 border border-primary/20" />
      <div className="absolute bottom-24 left-20 w-6 h-6 rotate-45 border border-primary/15" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-heading text-5xl font-bold text-primary mb-2 uppercase tracking-tight">CAFÉ12AM</h1>
          <p className="text-muted-foreground uppercase tracking-wider text-sm">MIDNIGHT SNACK DESTINATION</p>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-card relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full border border-primary/5" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full border border-primary/8" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-lg font-bold uppercase tracking-wide">
                {mode === "signin" ? "SIGN IN" : mode === "signup" ? "CREATE ACCOUNT" : "FORGOT PASSWORD"}
              </h2>
            </div>

            <div className="space-y-3">
              {mode === "signup" && (
                <>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-12 h-14 rounded-xl text-base bg-secondary border-0"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="10-digit Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      maxLength={10}
                      className="pl-12 h-14 rounded-xl text-base bg-secondary border-0"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                    <textarea
                      placeholder="Full Delivery Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      className="w-full pl-12 pr-4 py-3 rounded-xl text-base bg-secondary border-0 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 rounded-xl text-base bg-secondary border-0"
                />
              </div>

              {mode !== "forgot" && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 rounded-xl text-base bg-secondary border-0"
                  />
                </div>
              )}

              {mode === "forgot" ? (
                <Button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full h-14 rounded-xl text-lg font-heading font-bold uppercase tracking-wide"
                >
                  {loading ? "SENDING..." : "SEND RESET LINK"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={mode === "signin" ? handleSignIn : handleSignUp}
                  disabled={loading}
                  className="w-full h-14 rounded-xl text-lg font-heading font-bold uppercase tracking-wide"
                >
                  {loading
                    ? (mode === "signin" ? "SIGNING IN..." : "CREATING ACCOUNT...")
                    : (mode === "signin" ? "SIGN IN" : "SIGN UP")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}

              <div className="text-center pt-2 space-y-2">
                {mode === "signin" && (
                  <>
                    <button onClick={() => setMode("forgot")} className="text-sm text-primary font-bold hover:underline uppercase tracking-wide block w-full">
                      FORGOT PASSWORD?
                    </button>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                      DON'T HAVE AN ACCOUNT?{" "}
                      <button onClick={() => setMode("signup")} className="text-primary font-bold hover:underline">
                        SIGN UP
                      </button>
                    </p>
                  </>
                )}
                {mode === "signup" && (
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    ALREADY HAVE AN ACCOUNT?{" "}
                    <button onClick={() => setMode("signin")} className="text-primary font-bold hover:underline">
                      SIGN IN
                    </button>
                  </p>
                )}
                {mode === "forgot" && (
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    REMEMBER YOUR PASSWORD?{" "}
                    <button onClick={() => setMode("signin")} className="text-primary font-bold hover:underline">
                      SIGN IN
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 uppercase tracking-wide">
          BY CONTINUING, YOU AGREE TO OUR TERMS OF SERVICE
        </p>
      </div>
    </div>
  );
};

export default CustomerLogin;
