import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useOperatingHours = () => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const checkHours = async () => {
      // Check if ALL merchants are offline
      const { data: merchants } = await supabase
        .from("merchant_settings")
        .select("is_open");

      if (merchants && merchants.length > 0) {
        const anyOpen = merchants.some((m) => m.is_open);
        setIsOpen(anyOpen);
      } else {
        // Fallback: time-based (7PM to 2AM)
        const now = new Date();
        const hour = now.getHours();
        const open = hour >= 19 || hour < 2;
        setIsOpen(open);
      }
    };

    checkHours();
    const interval = setInterval(checkHours, 60000);
    return () => clearInterval(interval);
  }, []);

  return { isOpen };
};
