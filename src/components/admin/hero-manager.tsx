"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus, Pencil, Trash2, Loader2, Upload, X,
  MousePointerClick, GripVertical, Video, CheckCircle2, Film,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type HeroButton = {
  label: string;
  href: string;
  style: "primary" | "outline";
};

type Slide = {
  id: string;
  title: string;
  accent: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  buttons?: HeroButton[];
};

const DEFAULT_BUTTONS: HeroButton[] = [
  { label: "View Our Projects", href: "#portfolio", style: "primary" },
  { label: "Get a Quote", href: "#contact", style: "outline" },
];

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
  const [buttons, setButtons] = useState<HeroButton[]>(DEFAULT_BUTTONS);

  // ── Video state ──────────────────────────────────────────────────────────
  const [currentVideoUrl, setCurrentVideoUrl] = useState("/video.mp4");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const supabase = createClient();

  // Load current video URL from settings
  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.hero_video_url) setCurrentVideoUrl(d.hero_video_url);
    }).catch(() => {});
  }, []);

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

  // ── Video upload ─────────────────────────────────────────────────────────
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { toast.error("Sadece video dosyası yüklenebilir (MP4, WebM)"); return; }
    if (file.size > 200 * 1024 * 1024) { toast.error("Video 200 MB'dan küçük olmalı"); return; }

    setUploadingVideo(true);
    setVideoProgress(0);

    const path = `hero-video-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage
      .from("hero-images")
      .upload(path, file, { contentType: file.type, upsert: true });

    if (error) {
      toast.error("Video yüklenemedi: " + error.message);
      setUploadingVideo(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("hero-images").getPublicUrl(path);
    const videoUrl = urlData.publicUrl;

    // Save to settings
    const settingsRes = await fetch("/api/settings");
    const settings = settingsRes.ok ? await settingsRes.json() : {};
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, hero_video_url: videoUrl }),
    });

    setCurrentVideoUrl(videoUrl);
    setUploadingVideo(false);
    setVideoProgress(100);
    toast.success("Video güncellendi! Sayfa yenilenmeli.");
    e.target.value = "";
  };

  const openNew = () => {
    setEditing(null);
    setTitle("");
    setAccent("");
    setDescription("");
    setImageUrl("");
    setSortOrder(slides.length + 1);
    setIsActive(true);
    setButtons(DEFAULT_BUTTONS);
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
    setButtons(
      Array.isArray(s.buttons) && s.buttons.length > 0
        ? s.buttons
        : DEFAULT_BUTTONS
    );
    setDialogOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage
      .from("hero-images")
      .upload(path, file, { contentType: file.type });
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("hero-images").getPublicUrl(path);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Image uploaded");
  };

  // ── Button helpers ──────────────────────────────────────────────────────────
  const addButton = () =>
    setButtons([...buttons, { label: "New Button", href: "#", style: "outline" }]);

  const removeButton = (i: number) =>
    setButtons(buttons.filter((_, idx) => idx !== i));

  const updateButton = (i: number, field: keyof HeroButton, value: string) => {
    const updated = [...buttons];
    updated[i] = { ...updated[i], [field]: value } as HeroButton;
    setButtons(updated);
  };

  const moveButton = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= buttons.length) return;
    const updated = [...buttons];
    [updated[i], updated[j]] = [updated[j], updated[i]];
    setButtons(updated);
  };
  // ───────────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    const body = {
      title,
      accent,
      description,
      image_url: imageUrl,
      sort_order: sortOrder,
      is_active: isActive,
      buttons,
    };
    const url = editing ? `/api/hero/${editing.id}` : "/api/hero";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) { toast.error("Failed to save"); setSaving(false); return; }
    toast.success(editing ? "Slide updated" : "Slide created");
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
          <Plus className="h-4 w-4 mr-2" />Slide Ekle
        </Button>
      </div>

      {/* ── Arka Plan Videosu ───────────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Film className="h-4 w-4 text-bronze-600" />
            Arka Plan Videosu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Preview */}
            <div className="relative rounded-xl overflow-hidden bg-stone-900 aspect-video">
              <video
                key={currentVideoUrl}
                src={currentVideoUrl}
                className="w-full h-full object-cover opacity-80"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 flex items-end p-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white text-xs font-medium">Mevcut video</span>
                </div>
              </div>
            </div>

            {/* Upload */}
            <div className="space-y-3">
              <p className="text-sm text-stone-600">
                Hero bölümünde slaytların arkasında döngü olarak oynatılan video. MP4 formatı önerilir.
              </p>
              <div className="space-y-2 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span>MP4 veya WebM formatı</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span>Maks 200 MB</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span>1920×1080 veya üstü önerilir</span>
                </div>
              </div>

              <label className={`flex flex-col items-center justify-center w-full py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                uploadingVideo ? "border-bronze-400 bg-bronze-50/30" : "border-stone-200 hover:border-bronze-400 hover:bg-bronze-50/20"
              }`}>
                {uploadingVideo ? (
                  <>
                    <Loader2 className="h-6 w-6 text-bronze-500 animate-spin mb-2" />
                    <span className="text-sm font-medium text-stone-600">Yükleniyor...</span>
                    <span className="text-xs text-stone-400 mt-1">Büyük dosyalar için bekleyin</span>
                  </>
                ) : (
                  <>
                    <Video className="h-6 w-6 text-stone-400 mb-2" />
                    <span className="text-sm font-medium text-stone-600">Yeni video yükle</span>
                    <span className="text-xs text-stone-400 mt-1">MP4, WebM · Maks 200 MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                  disabled={uploadingVideo}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Dialog ─────────────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editing ? "Edit Slide" : "New Slide"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Title + Accent */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Title
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Elegance"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Accent (gradient text)
                </Label>
                <Input
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  placeholder="of Natural Stone"
                  className="h-11"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="We bring elegance to your spaces..."
                rows={3}
              />
            </div>

            {/* Active + Order */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch checked={isActive} onCheckedChange={setIsActive} id="active" />
                <Label htmlFor="active" className="text-sm">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-stone-500">Order</Label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="h-9 w-20"
                />
              </div>
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Background Image
              </Label>
              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-video group">
                  <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-bronze-400 transition-all">
                  <Upload className="h-7 w-7 text-stone-400 mb-2" />
                  <span className="text-sm text-stone-500">
                    {uploading ? "Uploading..." : "Upload image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {/* ── Buttons Editor ─────────────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <MousePointerClick className="h-3.5 w-3.5" />
                  Buttons ({buttons.length})
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addButton}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Button
                </Button>
              </div>

              {buttons.length === 0 && (
                <p className="text-sm text-stone-400 text-center py-4 border-2 border-dashed border-stone-200 rounded-xl">
                  No buttons — click &quot;Add Button&quot; to add one
                </p>
              )}

              <div className="space-y-2">
                {buttons.map((btn, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 bg-stone-50"
                  >
                    {/* Up/Down */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveButton(i, -1)}
                        disabled={i === 0}
                        className="p-0.5 rounded text-stone-400 hover:text-stone-600 disabled:opacity-30"
                        title="Move up"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Label */}
                    <Input
                      value={btn.label}
                      onChange={(e) => updateButton(i, "label", e.target.value)}
                      placeholder="Button Text"
                      className="h-9 flex-1 text-sm"
                    />

                    {/* Href */}
                    <Input
                      value={btn.href}
                      onChange={(e) => updateButton(i, "href", e.target.value)}
                      placeholder="#section or /page"
                      className="h-9 flex-1 text-sm"
                    />

                    {/* Style toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        updateButton(
                          i,
                          "style",
                          btn.style === "primary" ? "outline" : "primary"
                        )
                      }
                      className={`shrink-0 px-3 h-9 rounded-lg text-xs font-medium border transition-all ${
                        btn.style === "primary"
                          ? "bg-amber-700 border-amber-700 text-white"
                          : "bg-white border-stone-300 text-stone-600"
                      }`}
                      title="Toggle style"
                    >
                      {btn.style === "primary" ? "Primary" : "Outline"}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeButton(i)}
                      className="shrink-0 p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {buttons.length > 0 && (
                <p className="text-[11px] text-stone-400">
                  Tip: Click &quot;Primary / Outline&quot; to toggle button style. First button is usually the main CTA.
                </p>
              )}
            </div>
            {/* ─────────────────────────────────────────────────────────── */}

            <Button
              onClick={handleSave}
              disabled={saving || !title || !accent || !imageUrl}
              className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Update Slide" : "Create Slide"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Slide Grid ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="aspect-video bg-stone-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-stone-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-stone-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-500 font-medium">No hero slides yet</p>
          <Button variant="outline" className="mt-4" onClick={openNew}>
            Create first slide
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="group rounded-2xl overflow-hidden bg-white shadow-sm border border-stone-100 hover:shadow-lg transition-all"
            >
              <div className="aspect-video relative overflow-hidden bg-stone-200">
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p
                    className="text-white font-bold text-sm"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {slide.title}{" "}
                    <span className="text-amber-300">{slide.accent}</span>
                  </p>
                </div>
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(slide)}
                    className="p-2 rounded-lg bg-white/90 hover:bg-white shadow-sm"
                  >
                    <Pencil className="h-3.5 w-3.5 text-stone-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-2 rounded-lg bg-white/90 hover:bg-red-50 shadow-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
                {!slide.is_active && (
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-stone-800/80 text-stone-300 text-[10px] font-medium">
                    Inactive
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-stone-500 line-clamp-2">
                  {slide.description}
                </p>
                {/* Button preview */}
                {Array.isArray(slide.buttons) && slide.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {slide.buttons.map((btn, i) => (
                      <span
                        key={i}
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                          btn.style === "primary"
                            ? "bg-amber-100 text-amber-800"
                            : "border border-stone-300 text-stone-500"
                        }`}
                      >
                        {btn.label}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-stone-400">
                    #{slide.sort_order}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
