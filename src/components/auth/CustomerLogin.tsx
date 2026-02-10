import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CustomerLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast({ title: "Invalid phone", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setStep("otp");
      toast({ title: "OTP Sent!", description: "Check your phone for the verification code" });
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit code", variant: "destructive" });
      return;
    }
    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    const { error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp, type: "sms" });
    setLoading(false);
    if (error) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative elements */}
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
                {step === "phone" ? "LOGIN WITH PHONE" : "VERIFY OTP"}
              </h2>
            </div>

            {step === "phone" ? (
              <div className="space-y-4">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-12 h-14 rounded-xl text-lg bg-secondary border-0"
                  />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">WE'LL SEND YOU A VERIFICATION CODE</p>
                <Button onClick={sendOtp} disabled={loading} className="w-full h-14 rounded-xl text-lg font-heading font-bold uppercase tracking-wide">
                  {loading ? "SENDING..." : "GET OTP"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="h-14 rounded-xl text-lg text-center tracking-[0.5em] bg-secondary border-0 font-heading font-bold"
                />
                <Button onClick={verifyOtp} disabled={loading} className="w-full h-14 rounded-xl text-lg font-heading font-bold uppercase tracking-wide">
                  {loading ? "VERIFYING..." : "VERIFY & LOGIN"}
                </Button>
                <button onClick={() => setStep("phone")} className="text-sm text-primary hover:underline uppercase tracking-wide w-full text-center">
                  CHANGE PHONE NUMBER
                </button>
              </div>
            )}
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
