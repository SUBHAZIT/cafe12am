import CustomerNav from "@/components/customer/CustomerNav";
import { ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CartPage = () => {
  // Cart state would be managed via context/global store in production
  return (
    <div className="min-h-screen bg-background">
      <CustomerNav />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight mb-8">YOUR CART</h1>

        <div className="text-center py-16 bg-card rounded-3xl shadow-card relative overflow-hidden">
          <div className="absolute top-4 right-4 w-3 h-3 rotate-45 border border-primary/20" />
          <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground uppercase tracking-wider font-heading font-bold">YOUR CART IS EMPTY</p>
          <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wide">ADD ITEMS FROM THE MENU TO GET STARTED</p>
          <Link to="/order">
            <Button className="mt-6 rounded-full font-heading font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 mr-2" />
              BROWSE MENU
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
