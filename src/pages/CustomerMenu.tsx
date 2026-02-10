import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CustomerNav from "@/components/customer/CustomerNav";
import CategoryBar from "@/components/customer/CategoryBar";
import FoodCard from "@/components/customer/FoodCard";
import ClosedPopup from "@/components/customer/ClosedPopup";
import { useOperatingHours } from "@/hooks/useOperatingHours";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import foodBurger from "@/assets/food-burger.png";
import foodMaggi from "@/assets/food-maggi.png";
import foodFries from "@/assets/food-fries.png";
import foodCoffee from "@/assets/food-coffee.png";
import foodSandwich from "@/assets/food-sandwich.png";

const dummyItems = [
  { id: "d1", name: "Classic Burger", description: "Juicy patty with cheese, lettuce & special sauce", price: 149, image_url: foodBurger, is_veg: false, preparation_time_mins: 15, is_available: true, category: "Burgers" },
  { id: "d2", name: "Maggi Masala", description: "Hot steamy maggi with extra masala & veggies", price: 69, image_url: foodMaggi, is_veg: true, preparation_time_mins: 10, is_available: true, category: "Maggi" },
  { id: "d3", name: "Loaded Fries", description: "Crispy fries with cheese sauce & jalapeños", price: 129, image_url: foodFries, is_veg: true, preparation_time_mins: 12, is_available: true, category: "Fries" },
  { id: "d4", name: "Cold Coffee", description: "Creamy cold coffee with ice cream topping", price: 99, image_url: foodCoffee, is_veg: true, preparation_time_mins: 5, is_available: true, category: "Beverages" },
  { id: "d5", name: "Grilled Sandwich", description: "Multi-layer grilled sandwich with cheese & veggies", price: 119, image_url: foodSandwich, is_veg: true, preparation_time_mins: 10, is_available: true, category: "Sandwiches" },
  { id: "d6", name: "Chicken Burger", description: "Crispy chicken patty with mayo & pickles", price: 179, image_url: foodBurger, is_veg: false, preparation_time_mins: 18, is_available: true, category: "Burgers" },
  { id: "d7", name: "Cheese Maggi", description: "Extra cheesy maggi with butter & corn", price: 89, image_url: foodMaggi, is_veg: true, preparation_time_mins: 12, is_available: true, category: "Maggi" },
  { id: "d8", name: "Peri Peri Fries", description: "Spicy peri peri seasoned crispy fries", price: 109, image_url: foodFries, is_veg: true, preparation_time_mins: 10, is_available: true, category: "Fries" },
  { id: "d9", name: "Hot Chocolate", description: "Rich dark hot chocolate with whipped cream", price: 129, image_url: foodCoffee, is_veg: true, preparation_time_mins: 8, is_available: true, category: "Beverages" },
  { id: "d10", name: "Paneer Sandwich", description: "Grilled paneer with mint chutney & veggies", price: 139, image_url: foodSandwich, is_veg: true, preparation_time_mins: 12, is_available: true, category: "Sandwiches" },
  { id: "d11", name: "Veg Burger", description: "Crispy veggie patty with fresh lettuce", price: 129, image_url: foodBurger, is_veg: true, preparation_time_mins: 12, is_available: true, category: "Burgers" },
  { id: "d12", name: "Masala Fries", description: "Indian spiced fries with tangy dip", price: 99, image_url: foodFries, is_veg: true, preparation_time_mins: 10, is_available: true, category: "Snacks" },
];

const CustomerMenu = () => {
  const { isOpen } = useOperatingHours();
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showClosedBanner, setShowClosedBanner] = useState(!isOpen);
  const [showCheckoutBlock, setShowCheckoutBlock] = useState(false);
  const [dbItems, setDbItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data } = await supabase.from("menu_items").select("*, categories(name)").eq("is_available", true);
      if (data && data.length > 0) setDbItems(data);
    };
    fetchMenu();
  }, []);

  const items = dbItems.length > 0
    ? dbItems.map((i) => ({ ...i, category: i.categories?.name || "Other" }))
    : dummyItems;

  const filtered = items.filter((item) => {
    const matchCategory = !selectedCategory || item.category === selectedCategory;
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    toast({ title: "Added to cart!", description: "Item added successfully" });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id]--;
      else delete newCart[id];
      return newCart;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {showClosedBanner && !isOpen && (
        <ClosedPopup onDismiss={() => setShowClosedBanner(false)} />
      )}
      {showCheckoutBlock && !isOpen && (
        <ClosedPopup blockCheckout />
      )}
      <CustomerNav cartCount={cartCount} />

      {/* Hero banner */}
      <div className="section-pink py-8 px-4 relative overflow-hidden">
        <div className="absolute top-4 right-8 w-3 h-3 rotate-45 border border-primary/20" />
        <div className="absolute bottom-4 left-8 w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-heading text-xs font-bold tracking-[0.3em] text-primary uppercase">LATE NIGHT MENU</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground uppercase tracking-tight mb-4">
            MIDNIGHT CRAVINGS? WE GOT YOU
          </h1>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-card border-0 shadow-soft text-lg"
            />
          </div>
        </div>
      </div>

      <CategoryBar selectedCategory={selectedCategory} onSelect={setSelectedCategory} />

      {/* Food grid */}
      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-foreground">
              {selectedCategory || "ALL ITEMS"} ({filtered.length})
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground uppercase tracking-wider">NO ITEMS FOUND</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((item) => (
                <FoodCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image_url={item.image_url}
                  is_veg={item.is_veg}
                  preparation_time_mins={item.preparation_time_mins}
                  is_available={item.is_available}
                  quantity={cart[item.id] || 0}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
          {!isOpen ? (
            <button
              onClick={() => setShowCheckoutBlock(true)}
              className="max-w-lg mx-auto flex items-center justify-between bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow w-full"
            >
              <p className="font-heading font-bold text-sm uppercase tracking-wider">{cartCount} ITEMS IN CART</p>
              <span className="font-heading font-bold uppercase tracking-wider text-sm">VIEW CART →</span>
            </button>
          ) : (
            <a
              href="/order/cart"
              className="max-w-lg mx-auto flex items-center justify-between bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
            >
              <p className="font-heading font-bold text-sm uppercase tracking-wider">{cartCount} ITEMS IN CART</p>
              <span className="font-heading font-bold uppercase tracking-wider text-sm">VIEW CART →</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;
