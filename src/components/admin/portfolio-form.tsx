"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Loader2, Upload, X, GripVertical,
  Crosshair, Star, ChevronLeft, ChevronRight, Info,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────
type ImageEntry = { url: string; focal_x: number; focal_y: number };
type Category   = { id: string; name: string; slug: string };

// ── Focal Point Picker ────────────────────────────────────────────────────────
function FocalPicker({
  src, focal_x, focal_y, onChange,
}: {
  src: string; focal_x: number; focal_y: number;
  onChange: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.round(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)));
    onChange(x, y);
  }, [onChange]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) update(e); };
    const onUp   = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [update]);

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[4/3] cursor-crosshair rounded-xl overflow-hidden select-none"
      onMouseDown={(e) => { dragging.current = true; update(e); }}
      onClick={(e) => update(e)}
    >
      <img
        src={src} alt="focal"
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/20" />
      {/* crosshair */}
      <div
        className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${focal_x}%`, top: `${focal_y}%` }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-white shadow-lg" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white -translate-x-1/2" />
      </div>
      <p className="absolute bottom-2 left-0 right-0 text-center text-[11px] text-white/80 font-medium">
        Tıkla veya sürükle → odak noktası ({focal_x}%, {focal_y}%)
      </p>
    </div>
  );
}

// ── Main Form ──────────────────────────────────────────────────────────────────
export function PortfolioForm({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!itemId;

  const [saving, setSaving]           = useState(false);
  const [loadingItem, setLoadingItem] = useState(isEditing);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [title, setTitle]             = useState("");
  const [stoneType, setStoneType]     = useState("");
  const [categoryId, setCategoryId]   = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured]       = useState(false);
  const [sortOrder, setSortOrder]     = useState(0);
  const [images, setImages]           = useState<ImageEntry[]>([]);
  const [uploading, setUploading]     = useState(false);
  const [focalIdx, setFocalIdx]       = useState<number | null>(null); // which image is in focal editor
  const [previewIdx, setPreviewIdx]   = useState(0);
  const dragItem   = useRef<number | null>(null);
  const dragOver   = useRef<number | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [catRes, itemRes] = await Promise.all([
        fetch("/api/categories"),
        isEditing && itemId ? fetch(`/api/portfolio/${itemId}`) : Promise.resolve(null),
      ]);
      const catData = await catRes.json();
      if (!cancelled && Array.isArray(catData)) setCategories(catData);

      if (itemRes) {
        const d = await itemRes.json();
        if (!cancelled && d.id) {
          setTitle(d.title);
          setStoneType(d.stone_type);
          setCategoryId(d.category_id || "");
          setDescription(d.description || "");
          setFeatured(d.featured || false);
          setSortOrder(d.sort_order || 0);
          // Support both old single image_url and new images array
          if (Array.isArray(d.images) && d.images.length > 0) {
            setImages(d.images);
          } else if (d.image_url) {
            setImages([{ url: d.image_url, focal_x: 50, focal_y: 50 }]);
          }
        }
        if (!cancelled) setLoadingItem(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isEditing, itemId]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const newEntries: ImageEntry[] = [];
    for (const file of files) {
      const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage
        .from("portfolio-images")
        .upload(path, file, { contentType: file.type });
      if (error) { toast.error(`Upload failed: ${file.name}`); continue; }
      const { data: urlData } = supabase.storage.from("portfolio-images").getPublicUrl(path);
      newEntries.push({ url: urlData.publicUrl, focal_x: 50, focal_y: 50 });
    }
    setImages((prev) => [...prev, ...newEntries]);
    setUploading(false);
    if (newEntries.length) toast.success(`${newEntries.length} fotoğraf yüklendi`);
    e.target.value = "";
  };

  // ── Reorder drag ─────────────────────────────────────────────────────────
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const updated = [...images];
    const [moved] = updated.splice(dragItem.current, 1);
    updated.splice(dragOver.current, 0, moved);
    setImages(updated);
    dragItem.current = null;
    dragOver.current = null;
  };

  // ── Focal update ──────────────────────────────────────────────────────────
  const updateFocal = (idx: number, x: number, y: number) => {
    setImages((prev) => prev.map((img, i) => i === idx ? { ...img, focal_x: x, focal_y: y } : img));
  };

  // ── Remove ────────────────────────────────────────────────────────────────
  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (focalIdx === idx) setFocalIdx(null);
    setPreviewIdx(0);
  };

  // ── Make cover (move to first) ────────────────────────────────────────────
  const makeCover = (idx: number) => {
    if (idx === 0) return;
    const updated = [...images];
    const [item] = updated.splice(idx, 1);
    updated.unshift(item);
    setImages(updated);
    setFocalIdx(null);
    setPreviewIdx(0);
    toast.success("Kapak fotoğrafı güncellendi");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) { toast.error("En az bir fotoğraf ekleyin"); return; }
    setSaving(true);

    const body = {
      title,
      stone_type: stoneType,
      category_id: categoryId || null,
      description: description || null,
      featured,
      sort_order: sortOrder,
      image_url: images[0]?.url || "",   // backward compat
      images,
    };

    const url    = isEditing ? `/api/portfolio/${itemId}` : "/api/portfolio";
    const method = isEditing ? "PUT" : "POST";
    const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (!res.ok) { toast.error("Kaydedilemedi"); setSaving(false); return; }
    toast.success(isEditing ? "Güncellendi" : "Oluşturuldu");
    setSaving(false);
    router.push("/admin/portfolio");
  };

  if (loadingItem) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  const coverImage = images[0];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/portfolio">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {isEditing ? "Materyal Düzenle" : "Yeni Materyal"}
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {images.length} fotoğraf · İlk fotoğraf kapak olarak kullanılır
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-5">

          {/* ── Left: fields ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Başlık *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Calacatta Oro Mutfak" required className="h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Taş Türü *</Label>
                    <Input value={stoneType} onChange={(e) => setStoneType(e.target.value)} placeholder="Calacatta Oro" required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Kategori</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Seç..." /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Açıklama</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Materyal hakkında kısa açıklama..." rows={3} />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Switch checked={featured} onCheckedChange={setFeatured} id="featured" />
                    <Label htmlFor="featured" className="text-sm font-medium">Öne çıkar</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-stone-500">Sıra</Label>
                    <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="h-9 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview card */}
            {images.length > 0 && (
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Ön İzleme (frontend görünümü)</Label>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden group bg-stone-200">
                    <img
                      src={images[previewIdx]?.url}
                      alt="preview"
                      className="w-full h-full object-cover transition-all duration-500"
                      style={{
                        objectPosition: `${images[previewIdx]?.focal_x ?? 50}% ${images[previewIdx]?.focal_y ?? 50}%`,
                      }}
                    />
                    {/* name overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-sm truncate">{title || "Materyal Adı"}</p>
                      <p className="text-white/70 text-xs">{stoneType || "Taş türü"}</p>
                    </div>
                    {/* zoom icon */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Crosshair className="h-4 w-4 text-white" />
                    </div>
                    {/* photo counter */}
                    {images.length > 1 && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/50 text-white text-[11px]">
                        {previewIdx + 1} / {images.length}
                      </div>
                    )}
                  </div>
                  {/* nav */}
                  {images.length > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button type="button" onClick={() => setPreviewIdx((p) => (p - 1 + images.length) % images.length)} className="p-1.5 rounded-lg hover:bg-stone-100">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <div className="flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i} type="button"
                            onClick={() => setPreviewIdx(i)}
                            className={`h-1.5 rounded-full transition-all ${i === previewIdx ? "w-4 bg-stone-800" : "w-1.5 bg-stone-300"}`}
                          />
                        ))}
                      </div>
                      <button type="button" onClick={() => setPreviewIdx((p) => (p + 1) % images.length)} className="p-1.5 rounded-lg hover:bg-stone-100">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white" disabled={saving || !title || !stoneType || images.length === 0}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Güncelle" : "Oluştur"}
            </Button>
          </div>

          {/* ── Right: image manager ────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    Fotoğraflar ({images.length})
                  </Label>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                    <Info className="h-3 w-3" />
                    Sürükle → sırala · ★ → kapak · ✚ → odak noktası
                  </div>
                </div>

                {/* Upload zone */}
                <label className={`flex flex-col items-center justify-center w-full py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? "border-bronze-400 bg-bronze-50/30" : "border-stone-300 hover:border-bronze-400 hover:bg-bronze-50/20"}`}>
                  <Upload className="h-6 w-6 text-stone-400 mb-2" />
                  <span className="text-sm font-medium text-stone-500">
                    {uploading ? "Yükleniyor..." : "Fotoğraf ekle (çoklu seçim yapılabilir)"}
                  </span>
                  <span className="text-xs text-stone-400 mt-1">PNG, JPG, WEBP · Birden fazla seçebilirsiniz</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>

                {/* Image grid */}
                {images.length === 0 ? (
                  <div className="text-center py-8 text-stone-400 text-sm">
                    Henüz fotoğraf yok — yukarıdan yükleyin
                  </div>
                ) : (
                  <div className="space-y-3">
                    {images.map((img, i) => (
                      <div
                        key={img.url + i}
                        draggable
                        onDragStart={() => { dragItem.current = i; }}
                        onDragEnter={() => { dragOver.current = i; }}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all bg-white ${i === 0 ? "border-amber-300 ring-1 ring-amber-200" : "border-stone-200"}`}
                      >
                        {/* Drag handle */}
                        <div className="pt-1 cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500">
                          <GripVertical className="h-5 w-5" />
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-100">
                          <img
                            src={img.url} alt={`photo ${i + 1}`}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: `${img.focal_x}% ${img.focal_y}%` }}
                          />
                          {i === 0 && (
                            <div className="absolute top-0.5 left-0.5 px-1 rounded text-[9px] font-bold bg-amber-400 text-white">KAPAK</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-stone-600 truncate">Fotoğraf {i + 1}</p>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            Odak: {img.focal_x}% × {img.focal_y}%
                          </p>

                          {/* Focal editor toggle */}
                          <button
                            type="button"
                            onClick={() => setFocalIdx(focalIdx === i ? null : i)}
                            className={`mt-2 flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all ${focalIdx === i ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}
                          >
                            <Crosshair className="h-3 w-3" />
                            {focalIdx === i ? "Kapat" : "Odak noktası düzenle"}
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1.5">
                          {i !== 0 && (
                            <button
                              type="button"
                              onClick={() => makeCover(i)}
                              title="Kapak yap"
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-stone-400 hover:text-amber-600"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            title="Sil"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Focal point editor panel */}
                    {focalIdx !== null && images[focalIdx] && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                            Fotoğraf {focalIdx + 1} — Odak Noktası
                          </p>
                          <button type="button" onClick={() => setFocalIdx(null)} className="text-stone-400 hover:text-stone-600">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          Fotoğrafın hangi kısmının her zaman görünür kalmasını istediğini tıklayarak işaretle. Farklı ekran boyutlarında kırpma bu noktaya göre yapılır.
                        </p>
                        <FocalPicker
                          src={images[focalIdx].url}
                          focal_x={images[focalIdx].focal_x}
                          focal_y={images[focalIdx].focal_y}
                          onChange={(x, y) => updateFocal(focalIdx, x, y)}
                        />
                        {/* Quick presets */}
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: "Merkez", x: 50, y: 50 },
                            { label: "Üst", x: 50, y: 20 },
                            { label: "Alt", x: 50, y: 80 },
                            { label: "Sol", x: 20, y: 50 },
                            { label: "Sağ", x: 80, y: 50 },
                          ].map((p) => (
                            <button
                              key={p.label} type="button"
                              onClick={() => updateFocal(focalIdx, p.x, p.y)}
                              className="text-[11px] px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-300 transition-all"
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-stone-400 text-center pt-1">
                      Sıralamayı değiştirmek için satırı sürükleyin · İlk fotoğraf kapak görseli olarak kullanılır
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
