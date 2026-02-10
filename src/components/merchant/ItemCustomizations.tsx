import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  menuItemId: string;
}

const ItemCustomizations = ({ menuItemId }: Props) => {
  const [optionGroups, setOptionGroups] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [newGroup, setNewGroup] = useState({ name: "", is_required: false });
  const [newOption, setNewOption] = useState<Record<string, { name: string; additional_price: number }>>({});
  const [newVariant, setNewVariant] = useState({ name: "", price: 0 });
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddVariant, setShowAddVariant] = useState(false);

  const fetchData = async () => {
    const [groupsRes, variantsRes] = await Promise.all([
      supabase.from("option_groups").select("*, option_items(*)").eq("menu_item_id", menuItemId).order("sort_order"),
      supabase.from("item_variants").select("*").eq("menu_item_id", menuItemId).order("sort_order"),
    ]);
    if (groupsRes.data) setOptionGroups(groupsRes.data);
    if (variantsRes.data) setVariants(variantsRes.data);
  };

  useEffect(() => { fetchData(); }, [menuItemId]);

  // Option Groups
  const addGroup = async () => {
    if (!newGroup.name.trim()) return;
    const { error } = await supabase.from("option_groups").insert([{ menu_item_id: menuItemId, name: newGroup.name, is_required: newGroup.is_required }]);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setNewGroup({ name: "", is_required: false });
    setShowAddGroup(false);
    fetchData();
  };

  const deleteGroup = async (id: string) => {
    await supabase.from("option_groups").delete().eq("id", id);
    fetchData();
  };

  const toggleGroupRequired = async (id: string, current: boolean) => {
    await supabase.from("option_groups").update({ is_required: !current }).eq("id", id);
    fetchData();
  };

  // Option Items
  const addOptionItem = async (groupId: string) => {
    const opt = newOption[groupId];
    if (!opt?.name.trim()) return;
    const { error } = await supabase.from("option_items").insert([{ option_group_id: groupId, name: opt.name, additional_price: opt.additional_price }]);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setNewOption(prev => ({ ...prev, [groupId]: { name: "", additional_price: 0 } }));
    fetchData();
  };

  const deleteOptionItem = async (id: string) => {
    await supabase.from("option_items").delete().eq("id", id);
    fetchData();
  };

  const toggleOptionAvailability = async (id: string, current: boolean) => {
    await supabase.from("option_items").update({ is_available: !current }).eq("id", id);
    fetchData();
  };

  // Variants
  const addVariant = async () => {
    if (!newVariant.name.trim()) return;
    const { error } = await supabase.from("item_variants").insert([{ menu_item_id: menuItemId, name: newVariant.name, price: newVariant.price }]);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setNewVariant({ name: "", price: 0 });
    setShowAddVariant(false);
    fetchData();
  };

  const deleteVariant = async (id: string) => {
    await supabase.from("item_variants").delete().eq("id", id);
    fetchData();
  };

  const toggleVariantAvailability = async (id: string, current: boolean) => {
    await supabase.from("item_variants").update({ is_available: !current }).eq("id", id);
    fetchData();
  };

  return (
    <div className="space-y-4">
      {/* VARIANTS */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">SIZE / VARIANTS</h4>
          <button onClick={() => setShowAddVariant(!showAddVariant)} className="text-xs text-primary font-heading font-bold uppercase tracking-wider flex items-center gap-1">
            <Plus className="w-3 h-3" /> ADD
          </button>
        </div>
        {showAddVariant && (
          <div className="flex gap-2 mb-2">
            <Input placeholder="e.g. Large" value={newVariant.name} onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })} className="rounded-lg bg-secondary border-0 text-sm h-8" />
            <Input type="number" placeholder="₹ Price" value={newVariant.price || ""} onChange={(e) => setNewVariant({ ...newVariant, price: Number(e.target.value) })} className="rounded-lg bg-secondary border-0 text-sm h-8 w-24" />
            <Button size="sm" onClick={addVariant} className="rounded-lg h-8 text-xs">SAVE</Button>
          </div>
        )}
        {variants.map(v => (
          <div key={v.id} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-secondary/50">
            <span className="text-sm">{v.name} — ₹{v.price}</span>
            <div className="flex gap-1">
              <button onClick={() => toggleVariantAvailability(v.id, v.is_available)} className={v.is_available ? "text-green-500" : "text-muted-foreground"}>
                {v.is_available ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              </button>
              <button onClick={() => deleteVariant(v.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
        {variants.length === 0 && !showAddVariant && <p className="text-xs text-muted-foreground">No variants</p>}
      </div>

      {/* OPTION GROUPS */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">CUSTOMIZATION OPTIONS</h4>
          <button onClick={() => setShowAddGroup(!showAddGroup)} className="text-xs text-primary font-heading font-bold uppercase tracking-wider flex items-center gap-1">
            <Plus className="w-3 h-3" /> ADD GROUP
          </button>
        </div>

        {showAddGroup && (
          <div className="flex gap-2 mb-2 items-center">
            <Input placeholder='e.g. "Add Extras"' value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} className="rounded-lg bg-secondary border-0 text-sm h-8" />
            <label className="flex items-center gap-1 text-xs whitespace-nowrap">
              <input type="checkbox" checked={newGroup.is_required} onChange={(e) => setNewGroup({ ...newGroup, is_required: e.target.checked })} />
              Required
            </label>
            <Button size="sm" onClick={addGroup} className="rounded-lg h-8 text-xs">SAVE</Button>
          </div>
        )}

        {optionGroups.map(group => (
          <div key={group.id} className="mb-3 bg-secondary/30 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xs uppercase tracking-wide">{group.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${group.is_required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {group.is_required ? "REQUIRED" : "OPTIONAL"}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleGroupRequired(group.id, group.is_required)} className="text-xs text-primary"><ToggleRight className="w-4 h-4" /></button>
                <button onClick={() => deleteGroup(group.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>

            {group.option_items?.map((opt: any) => (
              <div key={opt.id} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-secondary/50">
                <span className="text-sm">{opt.name} {opt.additional_price > 0 ? `+₹${opt.additional_price}` : ""}</span>
                <div className="flex gap-1">
                  <button onClick={() => toggleOptionAvailability(opt.id, opt.is_available)} className={opt.is_available ? "text-green-500" : "text-muted-foreground"}>
                    {opt.is_available ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteOptionItem(opt.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))}

            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Option name"
                value={newOption[group.id]?.name || ""}
                onChange={(e) => setNewOption(prev => ({ ...prev, [group.id]: { ...prev[group.id], name: e.target.value, additional_price: prev[group.id]?.additional_price || 0 } }))}
                className="rounded-lg bg-background border-0 text-sm h-7"
              />
              <Input
                type="number" placeholder="+₹"
                value={newOption[group.id]?.additional_price || ""}
                onChange={(e) => setNewOption(prev => ({ ...prev, [group.id]: { ...prev[group.id], name: prev[group.id]?.name || "", additional_price: Number(e.target.value) } }))}
                className="rounded-lg bg-background border-0 text-sm h-7 w-20"
              />
              <Button size="sm" onClick={() => addOptionItem(group.id)} className="rounded-lg h-7 text-[10px] px-2">ADD</Button>
            </div>
          </div>
        ))}
        {optionGroups.length === 0 && !showAddGroup && <p className="text-xs text-muted-foreground">No customization options</p>}
      </div>
    </div>
  );
};

export default ItemCustomizations;
