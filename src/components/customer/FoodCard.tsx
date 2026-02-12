import { Plus, Minus, Clock, Leaf, Star } from "lucide-react";
import foodBurger from "@/assets/food-burger.png";

interface FoodCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string | null;
  is_veg?: boolean;
  preparation_time_mins?: number;
  is_available?: boolean;
  quantity?: number;
  avgRating?: number | null;
  ratingCount?: number;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

const FoodCard = ({
  id, name, description, price, image_url, is_veg, preparation_time_mins, is_available = true,
  quantity = 0, avgRating, ratingCount = 0, onAdd, onRemove,
}: FoodCardProps) => {
  return (
    <div className={`bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group relative ${!is_available ? "opacity-50" : ""}`}>
      <div className="absolute top-2 right-2 w-2 h-2 rotate-45 border border-primary/20 z-10" />

      <div className="relative h-48 overflow-hidden">
        <img
          src={image_url || foodBurger}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {!is_available && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="font-heading text-primary-foreground font-bold uppercase tracking-wider text-sm bg-destructive px-3 py-1 rounded-full">
              SOLD OUT
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          {is_veg && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 uppercase">
              <Leaf className="w-3 h-3" /> VEG
            </span>
          )}
        </div>

        {/* Rating badge */}
        {avgRating != null && avgRating > 0 && (
          <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-[11px] font-heading font-bold">{avgRating.toFixed(1)}</span>
            {ratingCount > 0 && (
              <span className="text-[9px] text-muted-foreground">({ratingCount})</span>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading font-bold text-foreground uppercase tracking-wide text-sm leading-tight">{name}</h3>
          {preparation_time_mins && (
            <span className="flex items-center gap-1 text-muted-foreground text-[10px] shrink-0">
              <Clock className="w-3 h-3" /> {preparation_time_mins} MIN
            </span>
          )}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 uppercase tracking-wide">{description}</p>
        )}

        <div className="flex items-center justify-between">
          <p className="font-heading text-lg font-bold text-primary">₹{price}</p>

          {is_available && (
            quantity > 0 ? (
              <div className="flex items-center gap-2 bg-primary rounded-full">
                <button onClick={() => onRemove(id)} className="p-2 text-primary-foreground hover:opacity-80">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-primary-foreground font-heading font-bold text-sm min-w-[20px] text-center">{quantity}</span>
                <button onClick={() => onAdd(id)} className="p-2 text-primary-foreground hover:opacity-80">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAdd(id)}
                className="px-4 py-2 rounded-full border-2 border-primary text-primary font-heading font-bold text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all"
              >
                ADD
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
