import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical, ToggleLeft, ToggleRight, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  onSelectCategory: (id: string) => void;
  selectedCategoryId: string | null;
}

const CategoryManager = ({ onSelectCategory, selectedCategoryId }: Props) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
    if (data) setCategories(data);
  };

  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async () => {
    if (!newName.trim()) return;
    const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order)) + 1 : 0;
    const { error } = await supabase.from("categories").insert([{ name: newName.trim(), sort_order: maxOrder }]);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Category added!" });
    setNewName("");
    setShowAdd(false);
    fetchCategories();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("categories").update({ is_active: !current }).eq("id", id);
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    fetchCategories();
    toast({ title: "Category deleted" });
  };

  const reorder = async (id: string, direction: "up" | "down") => {
    const idx = categories.findIndex(c => c.id === id);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === categories.length - 1)) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const a = categories[idx];
    const b = categories[swapIdx];
    await Promise.all([
      supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    fetchCategories();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-heading text-lg font-bold uppercase tracking-tight">CATEGORIES</h3>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-1" /> ADD
        </Button>
      </div>

      {showAdd && (
        <div className="flex gap-2">
          <Input placeholder="Category name" value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded-xl bg-secondary border-0" />
          <Button onClick={addCategory} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">SAVE</Button>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedCategoryId === cat.id ? "bg-primary/10 border border-primary/30" : "bg-card shadow-card hover:bg-secondary"}`}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <span className={`font-heading font-bold text-sm uppercase tracking-wide ${!cat.is_active ? "text-muted-foreground line-through" : ""}`}>{cat.name}</span>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => reorder(cat.id, "up")} className="p-1 rounded hover:bg-secondary"><ChevronUp className="w-4 h-4" /></button>
              <button onClick={() => reorder(cat.id, "down")} className="p-1 rounded hover:bg-secondary"><ChevronDown className="w-4 h-4" /></button>
              <button onClick={() => toggleActive(cat.id, cat.is_active)} className={`p-1 rounded ${cat.is_active ? "text-green-500" : "text-muted-foreground"}`}>
                {cat.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button onClick={() => deleteCategory(cat.id)} className="p-1 rounded text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-center text-muted-foreground py-4 text-sm uppercase tracking-wider">NO CATEGORIES YET</p>}
      </div>
    </div>
  );
};

export default CategoryManager;
