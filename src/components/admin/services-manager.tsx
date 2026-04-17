"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Gem, Ruler, Home, Truck, Palette, ShieldCheck, Wrench, Hammer, Paintbrush, Droplets, Layers, Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = { Gem, Ruler, Home, Truck, Palette, ShieldCheck, Wrench, Hammer, Paintbrush, Droplets, Layers, Eye };
const ICON_OPTIONS = Object.keys(ICON_MAP);

type Service = {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [icon, setIcon] = useState("Gem");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (!cancelled && Array.isArray(data)) {
        setServices(data);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const fetchServices = useCallback(async () => {
    const res = await fetch("/api/services");
    const data = await res.json();
    if (Array.isArray(data)) setServices(data);
  }, []);

  const openNew = () => {
    setEditing(null);
    setIcon("Gem");
    setTitle("");
    setDescription("");
    setSortOrder(services.length + 1);
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setIcon(s.icon);
    setTitle(s.title);
    setDescription(s.description);
    setSortOrder(s.sort_order);
    setIsActive(s.is_active);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const body = { icon, title, description, sort_order: sortOrder, is_active: isActive };
    if (editing) {
      const res = await fetch(`/api/services/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { toast.error("Failed to update"); setSaving(false); return; }
      toast.success("Service updated");
    } else {
      const res = await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { toast.error("Failed to create"); setSaving(false); return; }
      toast.success("Service created");
    }
    setSaving(false);
    setDialogOpen(false);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Service deleted"); fetchServices(); }
    else toast.error("Failed to delete");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Services</h1>
          <p className="text-stone-500 text-sm mt-1">{services.length} services</p>
        </div>
        <Button onClick={openNew} className="bg-stone-900 hover:bg-stone-800 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />Add Service
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{editing ? "Edit Service" : "New Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Marble Supply" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Icon</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((ic) => {
                      const Ic = ICON_MAP[ic];
                      return (
                        <SelectItem key={ic} value={ic}>
                          <div className="flex items-center gap-2">
                            <Ic className="h-4 w-4" />
                            <span>{ic}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Carefully selected premium marble..." rows={3} />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch checked={isActive} onCheckedChange={setIsActive} id="svc-active" />
                <Label htmlFor="svc-active" className="text-sm">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-stone-500">Order</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="h-9 w-20" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving || !title || !description} className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-white shadow-sm animate-pulse" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-500 font-medium">No services yet</p>
          <Button variant="outline" className="mt-4" onClick={openNew}>Create first service</Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => {
            const Ic = ICON_MAP[svc.icon] || Gem;
            return (
              <div key={svc.id} className="group p-6 rounded-2xl bg-white shadow-sm border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bronze-50">
                    <Ic className="h-5 w-5 text-bronze-600" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(svc)} className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(svc.id)} className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <h3 className="font-semibold text-stone-900 mb-2" style={{ fontFamily: "var(--font-playfair)" }}>{svc.title}</h3>
                <p className="text-sm text-stone-500 line-clamp-2">{svc.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  {!svc.is_active && <span className="text-[11px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded">Inactive</span>}
                  <span className="text-[11px] text-stone-400">#{svc.sort_order}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
