import foodBurger from "@/assets/food-burger.png";
import foodMaggi from "@/assets/food-maggi.png";
import foodFries from "@/assets/food-fries.png";
import foodCoffee from "@/assets/food-coffee.png";
import foodSandwich from "@/assets/food-sandwich.png";

const defaultCategories = [
  { name: "Burgers", image: foodBurger },
  { name: "Maggi", image: foodMaggi },
  { name: "Fries", image: foodFries },
  { name: "Beverages", image: foodCoffee },
  { name: "Sandwiches", image: foodSandwich },
  { name: "Snacks", image: foodFries },
  { name: "Combos", image: foodBurger },
  { name: "Desserts", image: foodCoffee },
];

interface CategoryBarProps {
  selectedCategory: string | null;
  onSelect: (cat: string | null) => void;
  categories?: { name: string; image_url?: string | null }[];
}

const CategoryBar = ({ selectedCategory, onSelect, categories }: CategoryBarProps) => {
  const items = categories && categories.length > 0
    ? categories.map((c) => ({ name: c.name, image: c.image_url || foodBurger }))
    : defaultCategories;

  return (
    <section className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-4 text-foreground">
          WHAT'S ON YOUR MIND?
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => onSelect(null)}
            className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all ${
              !selectedCategory ? "scale-110" : "opacity-70 hover:opacity-100"
            }`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl ${
              !selectedCategory ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary"
            }`}>
              🍽️
            </div>
            <span className="text-xs font-heading font-semibold uppercase tracking-wider">ALL</span>
          </button>
          {items.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onSelect(cat.name === selectedCategory ? null : cat.name)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all ${
                selectedCategory === cat.name ? "scale-110" : "opacity-70 hover:opacity-100"
              }`}
            >
              <div className={`w-20 h-20 rounded-full overflow-hidden border-2 ${
                selectedCategory === cat.name ? "border-primary shadow-soft" : "border-transparent"
              }`}>
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-heading font-semibold uppercase tracking-wider">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBar;
