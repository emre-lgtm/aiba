"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type Stat = { icon: string; value: string; label: string };

const ICON_OPTIONS = [
  { value: "Award", label: "Award" },
  { value: "Users", label: "Users" },
  { value: "Globe", label: "Globe" },
  { value: "TrendingUp", label: "Trending Up" },
  { value: "Gem", label: "Gem" },
  { value: "Home", label: "Home" },
  { value: "Truck", label: "Truck" },
  { value: "ShieldCheck", label: "Shield Check" },
  { value: "Ruler", label: "Ruler" },
  { value: "Palette", label: "Palette" },
];

const DEFAULT_ABOUT = {
  subtitle: "About Us",
  title: "Crafting Timeless Beauty",
  title_accent: "Timeless",
  description: "For over 15 years, AIBA STONE has been the premier destination for luxury natural stone. We source the world's finest marble, travertine, and limestone to transform your vision into reality.",
  image_url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  badge_value: "15+",
  badge_label: "Years of Excellence",
  section_title: "From Quarry to Your Space",
  section_p1: "We partner directly with quarries in Italy, Turkey, India, and Brazil to bring you the rarest and most exquisite natural stones. Every slab is hand-selected by our expert team to ensure uncompromising quality.",
  section_p2: "Our master craftsmen combine traditional techniques with cutting-edge CNC technology to deliver precision results that exceed expectations. From concept to installation, we handle every detail.",
  features: ["Premium Quality Materials", "Expert Craftsmanship", "Global Sourcing", "Turnkey Solutions"],
  stats: [
    { icon: "Award", value: "15+", label: "Years Experience" },
    { icon: "Users", value: "500+", label: "Happy Clients" },
    { icon: "Globe", value: "30+", label: "Countries Served" },
    { icon: "TrendingUp", value: "2000+", label: "Projects Completed" },
  ],
};

export function AboutManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [subtitle, setSubtitle] = useState(DEFAULT_ABOUT.subtitle);
  const [title, setTitle] = useState(DEFAULT_ABOUT.title);
  const [titleAccent, setTitleAccent] = useState(DEFAULT_ABOUT.title_accent);
  const [description, setDescription] = useState(DEFAULT_ABOUT.description);
  const [imageUrl, setImageUrl] = useState(DEFAULT_ABOUT.image_url);
  const [badgeValue, setBadgeValue] = useState(DEFAULT_ABOUT.badge_value);
  const [badgeLabel, setBadgeLabel] = useState(DEFAULT_ABOUT.badge_label);
  const [sectionTitle, setSectionTitle] = useState(DEFAULT_ABOUT.section_title);
  const [sectionP1, setSectionP1] = useState(DEFAULT_ABOUT.section_p1);
  const [sectionP2, setSectionP2] = useState(DEFAULT_ABOUT.section_p2);
  const [features, setFeatures] = useState<string[]>(DEFAULT_ABOUT.features);
  const [stats, setStats] = useState<Stat[]>(DEFAULT_ABOUT.stats);
  const [newFeature, setNewFeature] = useState("");
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          const a = data.about;
          if (a) {
            if (a.subtitle) setSubtitle(a.subtitle);
            if (a.title) setTitle(a.title);
            if (a.title_accent) setTitleAccent(a.title_accent);
            if (a.description) setDescription(a.description);
            if (a.image_url) setImageUrl(a.image_url);
            if (a.badge_value) setBadgeValue(a.badge_value);
            if (a.badge_label) setBadgeLabel(a.badge_label);
            if (a.section_title) setSectionTitle(a.section_title);
            if (a.section_p1) setSectionP1(a.section_p1);
            if (a.section_p2) setSectionP2(a.section_p2);
            if (a.features?.length) setFeatures(a.features);
            if (a.stats?.length) setStats(a.stats);
          }
        }
      } catch {}
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

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

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFeatures([...features, newFeature.trim()]);
    setNewFeature("");
  };

  const removeFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));

  const updateStat = (i: number, field: keyof Stat, value: string) => {
    const updated = [...stats];
    updated[i] = { ...updated[i], [field]: value };
    setStats(updated);
  };

  const addStat = () => setStats([...stats, { icon: "Award", value: "", label: "" }]);
  const removeStat = (i: number) => setStats(stats.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsRes = await fetch("/api/settings");
      const currentData = settingsRes.ok ? await settingsRes.json() : {};

      const aboutData = {
        subtitle,
        title,
        title_accent: titleAccent,
        description,
        image_url: imageUrl,
        badge_value: badgeValue,
        badge_label: badgeLabel,
        section_title: sectionTitle,
        section_p1: sectionP1,
        section_p2: sectionP2,
        features,
        stats,
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentData, about: aboutData }),
      });

      if (!res.ok) { toast.error("Failed to save"); setSaving(false); return; }
      toast.success("About section saved");
    } catch { toast.error("Failed to save"); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">About Us</h1>
          <p className="text-stone-500 text-sm mt-1">Edit your About section content</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-stone-900 hover:bg-stone-800 text-white shadow-sm">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4">Header</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Subtitle</Label>
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Accent Word</Label>
                <Input value={titleAccent} onChange={(e) => setTitleAccent(e.target.value)} className="h-11" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4">Image & Badge</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                {imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] group">
                    <Image src={imageUrl} alt="About" fill className="object-cover" />
                    <button type="button" onClick={() => setImageUrl("")} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-bronze-400 transition-all">
                    <Upload className="h-7 w-7 text-stone-400 mb-2" />
                    <span className="text-sm text-stone-500">{uploading ? "Uploading..." : "Upload image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Badge Value</Label>
                  <Input value={badgeValue} onChange={(e) => setBadgeValue(e.target.value)} placeholder="15+" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Badge Label</Label>
                  <Input value={badgeLabel} onChange={(e) => setBadgeLabel(e.target.value)} placeholder="Years of Excellence" className="h-11" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4">Content Section</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Section Title</Label>
                <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Paragraph 1</Label>
                <Textarea value={sectionP1} onChange={(e) => setSectionP1(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Paragraph 2</Label>
                <Textarea value={sectionP2} onChange={(e) => setSectionP2(e.target.value)} rows={3} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4">Features</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {features.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-sm">
                  {f}
                  <button onClick={() => removeFeature(i)} className="text-stone-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add feature..." className="h-10" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} />
              <Button type="button" variant="outline" onClick={addFeature} className="shrink-0"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">Stats</h3>
              <Button type="button" variant="outline" size="sm" onClick={addStat}><Plus className="h-3 w-3 mr-1" /> Add Stat</Button>
            </div>
            <div className="space-y-3">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <select value={stat.icon} onChange={(e) => updateStat(i, "icon", e.target.value)} className="h-10 rounded-lg border border-stone-200 px-3 text-sm bg-white">
                    {ICON_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <Input value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="15+" className="h-10 w-24" />
                  <Input value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="Years Experience" className="h-10 flex-1" />
                  <button onClick={() => removeStat(i)} className="p-2 text-stone-400 hover:text-red-500 shrink-0"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-stone-900 hover:bg-stone-800 text-white shadow-sm min-w-[200px]">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
