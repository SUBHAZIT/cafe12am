import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, User, Search, Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface CustomerNavProps {
  cartCount?: number;
}

const CustomerNav = ({ cartCount = 0 }: CustomerNavProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/order" className="font-heading text-2xl font-bold text-primary uppercase tracking-tight">
          CAFÉ12AM
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/order" className="text-sm font-heading font-semibold uppercase tracking-wider text-foreground hover:text-primary transition-colors">
            MENU
          </Link>
          <Link to="/order/orders" className="text-sm font-heading font-semibold uppercase tracking-wider text-foreground hover:text-primary transition-colors">
            MY ORDERS
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/order/cart" className="relative p-2 rounded-full hover:bg-secondary transition-colors">
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/order/profile" className="p-2 rounded-full hover:bg-secondary transition-colors">
                <User className="w-5 h-5 text-foreground" />
              </Link>
              <button onClick={signOut} className="p-2 rounded-full hover:bg-secondary transition-colors">
                <LogOut className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase tracking-wide">
              LOGIN
            </Link>
          )}

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border p-4 space-y-3">
          <Link to="/order" className="block text-sm font-heading font-semibold uppercase tracking-wider py-2" onClick={() => setMobileOpen(false)}>MENU</Link>
          <Link to="/order/orders" className="block text-sm font-heading font-semibold uppercase tracking-wider py-2" onClick={() => setMobileOpen(false)}>MY ORDERS</Link>
        </div>
      )}
    </nav>
  );
};

export default CustomerNav;
