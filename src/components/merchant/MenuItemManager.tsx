import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ToggleLeft, ToggleRight, Settings2, Clock, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ItemCustomizations from "./ItemCustomizations";

interface Props {
  categoryId: string | null;
}

const MenuItemManager = ({ categoryId }: Props) => {
  const { profile } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: "", description: "", price: 0, is_veg: false,
    preparation_time_mins: 15, image_url: "", available_from: "", available_until: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    if (!profile) return;
    let query = supabase.from("menu_items").select("*, categories(name)").eq("merchant_id", profile.id);
    if (categoryId) query = query.eq("category_id", categoryId);
    const { data } = await query.order("name");
    if (data) setItems(data);
  };

  useEffect(() => { fetchItems(); }, [profile, categoryId]);

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return newItem.image_url || null;
    setUploading(true);
    const ext = imageFile.name.split(".").pop();
    const path = `menu/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("food-images").upload(path, imageFile);
    setUploading(false);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return null; }
    const { data: urlData } = supabase.storage.from("food-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const addItem = async () => {
    if (!profile || !newItem.name) return;
    const imageUrl = await uploadImage();
    const { error } = await supabase.from("menu_items").insert([{
      name: newItem.name, description: newItem.description, price: newItem.price,
      is_veg: newItem.is_veg, preparation_time_mins: newItem.preparation_time_mins,
      image_url: imageUrl, merchant_id: profile.id, category_id: categoryId,
      available_from: newItem.available_from || null, available_until: newItem.available_until || null,
    }]);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Item added!" });
    setShowAdd(false);
    setNewItem({ name: "", description: "", price: 0, is_veg: false, preparation_time_mins: 15, image_url: "", available_from: "", available_until: "" });
    setImageFile(null);
    fetchItems();
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from("menu_items").update({ is_available: !current }).eq("id", id);
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("menu_items").delete().eq("id", id);
    fetchItems();
    toast({ title: "Item deleted" });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-heading text-lg font-bold uppercase tracking-tight">
          {categoryId ? "ITEMS IN CATEGORY" : "ALL ITEMS"}
        </h3>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-1" /> ADD ITEM
        </Button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
          <Input placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="rounded-xl bg-secondary border-0" />
          <Input placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="rounded-xl bg-secondary border-0" />
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Price (₹)" value={newItem.price || ""} onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })} className="rounded-xl bg-secondary border-0" />
            <Input type="number" placeholder="Prep Time (mins)" value={newItem.preparation_time_mins || ""} onChange={(e) => setNewItem({ ...newItem, preparation_time_mins: Number(e.target.value) })} className="rounded-xl bg-secondary border-0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Available From</label>
              <Input type="time" value={newItem.available_from} onChange={(e) => setNewItem({ ...newItem, available_from: e.target.value })} className="rounded-xl bg-secondary border-0" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Available Until</label>
              <Input type="time" value={newItem.available_until} onChange={(e) => setNewItem({ ...newItem, available_until: e.target.value })} className="rounded-xl bg-secondary border-0" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={newItem.is_veg} onChange={(e) => setNewItem({ ...newItem, is_veg: e.target.checked })} />
              Vegetarian
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Image className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              {imageFile ? imageFile.name : "Upload Image"}
            </label>
          </div>
          <Button onClick={addItem} disabled={uploading} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
            {uploading ? "UPLOADING..." : "ADD ITEM"}
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {item.image_url && <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.is_veg ? "bg-green-500" : "bg-red-500"}`} />
                    <p className="font-heading font-bold text-sm uppercase tracking-wide">{item.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">₹{item.price} • {item.preparation_time_mins} min</p>
                  {(item.available_from || item.available_until) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{item.available_from || "—"} – {item.available_until || "—"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditingItemId(editingItemId === item.id ? null : item.id)} className="p-2 rounded-full hover:bg-secondary">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => toggleAvailability(item.id, item.is_available)} className={`p-2 rounded-full ${item.is_available ? "text-green-500" : "text-muted-foreground"}`}>
                  {item.is_available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-2 rounded-full text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {editingItemId === item.id && (
              <div className="border-t border-border p-4">
                <ItemCustomizations menuItemId={item.id} />
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm uppercase tracking-wider">NO ITEMS — SELECT A CATEGORY AND ADD ITEMS</p>}
      </div>
    </div>
  );
};

export default MenuItemManager;
