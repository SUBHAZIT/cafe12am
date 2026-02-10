import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ToggleLeft, ToggleRight, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ComboManager = () => {
  const { profile } = useAuth();
  const [combos, setCombos] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCombo, setNewCombo] = useState({ name: "", description: "", combo_price: 0 });
  const [expandedCombo, setExpandedCombo] = useState<string | null>(null);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<string>("");

  const fetchCombos = async () => {
    if (!profile) return;
    const { data } = await supabase.from("combos").select("*, combo_items(*, menu_items(name, price))").eq("merchant_id", profile.id);
    if (data) setCombos(data);
  };

  const fetchMenuItems = async () => {
    if (!profile) return;
    const { data } = await supabase.from("menu_items").select("id, name, price").eq("merchant_id", profile.id);
    if (data) setMenuItems(data);
  };

  useEffect(() => { fetchCombos(); fetchMenuItems(); }, [profile]);

  const addCombo = async () => {
    if (!profile || !newCombo.name.trim()) return;
    const { error } = await supabase.from("combos").insert([{ ...newCombo, merchant_id: profile.id }]);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Combo created!" });
    setNewCombo({ name: "", description: "", combo_price: 0 });
    setShowAdd(false);
    fetchCombos();
  };

  const deleteCombo = async (id: string) => {
    await supabase.from("combos").delete().eq("id", id);
    fetchCombos();
    toast({ title: "Combo deleted" });
  };

  const toggleCombo = async (id: string, current: boolean) => {
    await supabase.from("combos").update({ is_available: !current }).eq("id", id);
    fetchCombos();
  };

  const addItemToCombo = async (comboId: string) => {
    if (!selectedItemToAdd) return;
    const { error } = await supabase.from("combo_items").insert([{ combo_id: comboId, menu_item_id: selectedItemToAdd }]);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setSelectedItemToAdd("");
    fetchCombos();
  };

  const removeComboItem = async (id: string) => {
    await supabase.from("combo_items").delete().eq("id", id);
    fetchCombos();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-heading text-lg font-bold uppercase tracking-tight">COMBOS</h3>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-1" /> CREATE COMBO
        </Button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
          <Input placeholder="Combo Name" value={newCombo.name} onChange={(e) => setNewCombo({ ...newCombo, name: e.target.value })} className="rounded-xl bg-secondary border-0" />
          <Input placeholder="Description" value={newCombo.description} onChange={(e) => setNewCombo({ ...newCombo, description: e.target.value })} className="rounded-xl bg-secondary border-0" />
          <Input type="number" placeholder="Combo Price (₹)" value={newCombo.combo_price || ""} onChange={(e) => setNewCombo({ ...newCombo, combo_price: Number(e.target.value) })} className="rounded-xl bg-secondary border-0" />
          <Button onClick={addCombo} className="rounded-full font-heading font-bold text-xs uppercase tracking-wider">CREATE</Button>
        </div>
      )}

      <div className="space-y-3">
        {combos.map((combo) => {
          const individualTotal = combo.combo_items?.reduce((sum: number, ci: any) => sum + Number(ci.menu_items?.price || 0) * ci.quantity, 0) || 0;
          return (
            <div key={combo.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedCombo(expandedCombo === combo.id ? null : combo.id)}>
                <div>
                  <p className="font-heading font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" /> {combo.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Combo ₹{combo.combo_price} {individualTotal > 0 && <span className="line-through ml-1">₹{individualTotal}</span>}
                    {combo.description && ` • ${combo.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toggleCombo(combo.id, combo.is_available)} className={combo.is_available ? "text-green-500" : "text-muted-foreground"}>
                    {combo.is_available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => deleteCombo(combo.id)} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {expandedCombo === combo.id && (
                <div className="border-t border-border p-4 space-y-2">
                  {combo.combo_items?.map((ci: any) => (
                    <div key={ci.id} className="flex items-center justify-between py-1">
                      <span className="text-sm">{ci.quantity}x {ci.menu_items?.name} (₹{ci.menu_items?.price})</span>
                      <button onClick={() => removeComboItem(ci.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <select
                      value={selectedItemToAdd}
                      onChange={(e) => setSelectedItemToAdd(e.target.value)}
                      className="flex-1 rounded-lg bg-secondary border-0 text-sm h-8 px-2"
                    >
                      <option value="">Select item to add...</option>
                      {menuItems.map(mi => <option key={mi.id} value={mi.id}>{mi.name} (₹{mi.price})</option>)}
                    </select>
                    <Button size="sm" onClick={() => addItemToCombo(combo.id)} className="rounded-lg h-8 text-xs">ADD</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {combos.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm uppercase tracking-wider">NO COMBOS YET</p>}
      </div>
    </div>
  );
};

export default ComboManager;
