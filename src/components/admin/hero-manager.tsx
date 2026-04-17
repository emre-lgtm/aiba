"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
import { Plus, Pencil, Trash2, Loader2, Upload, X, Sparkles, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Slide = {
  id: string;
  title: string;
  accent: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

export function HeroManager() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [accent, setAccent] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await fetch("/api/hero");
      const data = await res.json();
      if (!cancelled && Array.isArray(data)) {
        setSlides(data);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const fetchSlides = useCallback(async () => {
    const res = await fetch("/api/hero");
    const data = await res.json();
    if (Array.isArray(data)) setSlides(data);
  }, []);

  const openNew = () => {
    setEditing(null);
    setTitle("");
    setAccent("");
    setDescription("");
    setImageUrl("");
    setSortOrder(slides.length + 1);
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (s: Slide) => {
    setEditing(s);
    setTitle(s.title);
    setAccent(s.accent);
    setDescription(s.description);
    setImageUrl(s.image_url);
    setSortOrder(s.sort_order);
    setIsActive(s.is_active);
    setDialogOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("hero-images").upload(path, file, { contentType: file.type });
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("hero-images").getPublicUrl(path);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const prompt = customPrompt || `Professional architectural photography of a luxury natural stone and marble showroom, elegant interior design with premium stone slabs on display, warm lighting, high-end atmosphere, photorealistic, 8k quality`;
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size: "1728x960" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Generation failed"); setGenerating(false); return; }
      const downloadRes = await fetch(data.url);
      const blob = await downloadRes.blob();
      const path = `${crypto.randomUUID()}.png`;
      const { error } = await supabase.storage.from("hero-images").upload(path, blob, { contentType: "image/png" });
      if (error) { toast.error("Save failed"); setGenerating(false); return; }
      const { data: urlData } = supabase.storage.from("hero-images").getPublicUrl(path);
      setImageUrl(urlData.publicUrl);
      toast.success("AI image generated");
    } catch { toast.error("Generation failed"); }
    setGenerating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const body = { title, accent, description, image_url: imageUrl, sort_order: sortOrder, is_active: isActive };
    if (editing) {
      const res = await fetch(`/api/hero/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { toast.error("Failed to update"); setSaving(false); return; }
      toast.success("Slide updated");
    } else {
      const res = await fetch("/api/hero", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { toast.error("Failed to create"); setSaving(false); return; }
      toast.success("Slide created");
    }
    setSaving(false);
    setDialogOpen(false);
    fetchSlides();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    const res = await fetch(`/api/hero/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Slide deleted"); fetchSlides(); }
    else toast.error("Failed to delete");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Hero Slides</h1>
          <p className="text-stone-500 text-sm mt-1">{slides.length} slides</p>
        </div>
        <Button onClick={openNew} className="bg-stone-900 hover:bg-stone-800 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{editing ? "Edit Slide" : "New Slide"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Elegance" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Accent Text</Label>
                <Input value={accent} onChange={(e) => setAccent(e.target.value)} placeholder="of Natural Stone" className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="We bring elegance to your spaces..." rows={3} />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch checked={isActive} onCheckedChange={setIsActive} id="active" />
                <Label htmlFor="active" className="text-sm">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-stone-500">Order</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="h-9 w-20" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Image</Label>
                <button type="button" onClick={() => setShowAi(!showAi)} className="flex items-center gap-1.5 text-xs font-medium text-bronze-600 hover:text-bronze-700">
                  <Sparkles className="h-3.5 w-3.5" /> AI Generate
                </button>
              </div>
              {showAi && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                  <Textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Luxury marble showroom, warm lighting..." rows={2} className="text-xs" />
                  <Button type="button" onClick={handleGenerate} disabled={generating} className="w-full h-9 bg-gradient-to-r from-bronze-600 to-bronze-500 text-white text-xs">
                    {generating ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Generating...</> : <><Wand2 className="mr-1.5 h-3.5 w-3.5" />Generate with AI</>}
                  </Button>
                </div>
              )}
              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-video group">
                  <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                  <button type="button" onClick={() => setImageUrl("")} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-bronze-400 transition-all">
                  <Upload className="h-7 w-7 text-stone-400 mb-2" />
                  <span className="text-sm text-stone-500">{uploading ? "Uploading..." : "Upload image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              )}
            </div>

            <Button onClick={handleSave} disabled={saving || !title || !accent || !imageUrl} className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Update Slide" : "Create Slide"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm"><div className="aspect-video bg-stone-200 animate-pulse" /><div className="p-4 space-y-2"><div className="h-4 bg-stone-200 rounded animate-pulse w-3/4" /><div className="h-3 bg-stone-100 rounded animate-pulse w-1/2" /></div></div>)}
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-500 font-medium">No hero slides yet</p>
          <Button variant="outline" className="mt-4" onClick={openNew}>Create first slide</Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <div key={slide.id} className="group rounded-2xl overflow-hidden bg-white shadow-sm border border-stone-100 hover:shadow-lg transition-all">
              <div className="aspect-video relative overflow-hidden bg-stone-200">
                <Image src={slide.image_url} alt={slide.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-playfair)" }}>{slide.title} <span className="text-bronze-300">{slide.accent}</span></p>
                </div>
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(slide)} className="p-2 rounded-lg bg-white/90 hover:bg-white shadow-sm"><Pencil className="h-3.5 w-3.5 text-stone-700" /></button>
                  <button onClick={() => handleDelete(slide.id)} className="p-2 rounded-lg bg-white/90 hover:bg-red-50 shadow-sm"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                </div>
                {!slide.is_active && (
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-stone-800/80 text-stone-300 text-[10px] font-medium">Inactive</div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-stone-500 line-clamp-2">{slide.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-stone-400">#{slide.sort_order}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
