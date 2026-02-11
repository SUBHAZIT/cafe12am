import { useState, useEffect } from "react";

export const useOperatingHours = () => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const checkHours = () => {
      const now = new Date();
      const hour = now.getHours();
      // Open: 7PM (19) to 2AM (2)
      // Closed: 2AM to 7PM
      const open = hour >= 19 || hour < 2;
      setIsOpen(open);
    };

    checkHours();
    const interval = setInterval(checkHours, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return { isOpen };
};
