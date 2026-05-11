"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Loader2, Upload, X,
  Crosshair, Star, ChevronLeft, ChevronRight, ZoomIn,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ImageEntry = { url: string; focal_x: number; focal_y: number };

// ── Focal Point Picker ─────────────────────────────────────────────────────────
function FocalPicker({
  src, focal_x, focal_y, onChange,
}: {
  src: string; focal_x: number; focal_y: number;
  onChange: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const calc = useCallback((e: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const x = Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)));
    onChange(x, y);
  }, [onChange]);

  useEffect(() => {
    const onMove  = (e: MouseEvent)  => { if (dragging.current) calc(e); };
    const onUp    = ()               => { dragging.current = false; };
    const onTouch = (e: TouchEvent)  => { if (dragging.current) { e.preventDefault(); calc(e); } };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("touchmove", onTouch, { passive: false });
    window.addEventListener("touchend",  onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend",  onUp);
    };
  }, [calc]);

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[4/3] cursor-crosshair rounded-xl overflow-hidden select-none touch-none"
      onMouseDown={(e) => { dragging.current = true; calc(e); }}
      onTouchStart={(e) => { dragging.current = true; calc(e); }}
    >
      <img src={src} alt="focal" className="w-full h-full object-cover pointer-events-none" draggable={false} />
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      {/* crosshair dot */}
      <div
        className="absolute pointer-events-none"
        style={{ left: `${focal_x}%`, top: `${focal_y}%`, transform: "translate(-50%, -50%)" }}
      >
        <div className="w-7 h-7 rounded-full border-2 border-white shadow-lg relative">
          <div className="absolute inset-0 rounded-full bg-white/20" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white -translate-x-1/2" />
        </div>
      </div>
      <p className="absolute bottom-2 left-0 right-0 text-center text-[11px] text-white/80 font-medium pointer-events-none">
        Tıkla/sürükle → odak ({focal_x}%, {focal_y}%)
      </p>
    </div>
  );
}

// ── Sortable image list with mouse-based drag ──────────────────────────────────
function SortableImageList({
  images, onReorder, onRemove, onMakeCover, onFocalChange,
}: {
  images: ImageEntry[];
  onReorder: (next: ImageEntry[]) => void;
  onRemove: (i: number) => void;
  onMakeCover: (i: number) => void;
  onFocalChange: (i: number, x: number, y: number) => void;
}) {
  const [focalIdx, setFocalIdx] = useState<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  // Mouse-based drag (not HTML5 drag API)
  const dragStart = (i: number) => {
    setDraggingIdx(i);
    setOverIdx(i);
  };

  const dragEnter = (i: number) => {
    if (draggingIdx === null) return;
    setOverIdx(i);
  };

  const dragEnd = () => {
    if (draggingIdx !== null && overIdx !== null && draggingIdx !== overIdx) {
      const next = [...images];
      const [moved] = next.splice(draggingIdx, 1);
      next.splice(overIdx, 0, moved);
      onReorder(next);
      // adjust focalIdx
      if (focalIdx === draggingIdx) setFocalIdx(overIdx);
      else if (focalIdx !== null) {
        // shift focal index if needed
        const lo = Math.min(draggingIdx, overIdx);
        const hi = Math.max(draggingIdx, overIdx);
        if (focalIdx >= lo && focalIdx <= hi) {
          setFocalIdx(draggingIdx < overIdx ? focalIdx - 1 : focalIdx + 1);
        }
      }
    }
    setDraggingIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="space-y-2">
      {images.map((img, i) => (
        <div key={img.url + i}>
          <div
            draggable
            onDragStart={() => dragStart(i)}
            onDragEnter={() => dragEnter(i)}
            onDragEnd={dragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all bg-white cursor-grab active:cursor-grabbing",
              i === 0 ? "border-amber-300 ring-1 ring-amber-200" : "border-stone-200 hover:border-stone-300",
              draggingIdx === i && "opacity-40 scale-95",
              overIdx === i && draggingIdx !== i && "border-bronze-400 bg-bronze-50/30"
            )}
          >
            {/* Drag handle visual */}
            <div className="text-stone-300 shrink-0 flex flex-col gap-0.5 px-0.5">
              {[0,1,2].map(r => (
                <div key={r} className="flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-current" />
                  <div className="w-1 h-1 rounded-full bg-current" />
                </div>
              ))}
            </div>

            {/* Thumbnail */}
            <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-stone-100">
              <img
                src={img.url} alt={`photo ${i + 1}`}
                className="w-full h-full object-cover pointer-events-none"
                style={{ objectPosition: `${img.focal_x}% ${img.focal_y}%` }}
                draggable={false}
              />
              {i === 0 && (
                <div className="absolute top-0.5 left-0.5 px-1 rounded text-[9px] font-bold bg-amber-400 text-white">KAPAK</div>
              )}
            </div>

            {/* Info + focal toggle */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-600">Fotoğraf {i + 1}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Odak: {img.focal_x}% × {img.focal_y}%</p>
              <button
                type="button"
                onClick={() => setFocalIdx(focalIdx === i ? null : i)}
                className={cn(
                  "mt-1.5 flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md transition-all",
                  focalIdx === i ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                )}
              >
                <Crosshair className="h-3 w-3" />
                {focalIdx === i ? "Kapat" : "Odak noktası"}
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-1 shrink-0">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => { onMakeCover(i); setFocalIdx(null); }}
                  title="Kapak yap"
                  className="p-1.5 rounded-lg hover:bg-amber-50 text-stone-300 hover:text-amber-500 transition-colors"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => { onRemove(i); if (focalIdx === i) setFocalIdx(null); }}
                title="Sil"
                className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Focal editor panel */}
          {focalIdx === i && (
            <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
              <p className="text-[11px] text-stone-500">
                Fotoğrafın her zaman görünür kalmasını istediğin kısmı işaretle. Farklı ekran boyutlarında kırpma bu noktaya göre yapılır.
              </p>
              <FocalPicker
                src={img.url}
                focal_x={img.focal_x}
                focal_y={img.focal_y}
                onChange={(x, y) => onFocalChange(i, x, y)}
              />
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Merkez", x: 50, y: 50 }, { label: "Üst", x: 50, y: 15 },
                  { label: "Alt",   x: 50, y: 85  }, { label: "Sol", x: 15, y: 50 },
                  { label: "Sağ",   x: 85, y: 50  },
                ].map((p) => (
                  <button
                    key={p.label} type="button"
                    onClick={() => onFocalChange(i, p.x, p.y)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-300 transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      <p className="text-[11px] text-stone-400 text-center pt-1">
        Sıraya göre taşımak için satırı sürükleyin · ★ ile kapak fotoğrafını değiştirin
      </p>
    </div>
  );
}

// ── Main Form ──────────────────────────────────────────────────────────────────
export function PortfolioForm({ itemId }: { itemId?: string }) {
  const router  = useRouter();
  const supabase = createClient();
  const isEditing = !!itemId;

  const [saving,      setSaving]      = useState(false);
  const [loadingItem, setLoadingItem] = useState(isEditing);
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [featured,    setFeatured]    = useState(false);
  const [sortOrder,   setSortOrder]   = useState(0);
  const [images,      setImages]      = useState<ImageEntry[]>([]);
  const [uploading,   setUploading]   = useState(false);
  const [previewIdx,  setPreviewIdx]  = useState(0);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEditing || !itemId) return;
    let cancelled = false;
    fetch(`/api/portfolio/${itemId}`).then(r => r.json()).then(d => {
      if (cancelled || !d.id) return;
      setTitle(d.title);
      setDescription(d.description || "");
      setFeatured(d.featured || false);
      setSortOrder(d.sort_order || 0);
      if (Array.isArray(d.images) && d.images.length > 0) setImages(d.images);
      else if (d.image_url) setImages([{ url: d.image_url, focal_x: 50, focal_y: 50 }]);
      setLoadingItem(false);
    });
    return () => { cancelled = true; };
  }, [isEditing, itemId]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const added: ImageEntry[] = [];
    for (const file of files) {
      const ext  = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("portfolio-images").upload(path, file, { contentType: file.type });
      if (error) { toast.error(`Yüklenemedi: ${file.name}`); continue; }
      const { data: u } = supabase.storage.from("portfolio-images").getPublicUrl(path);
      added.push({ url: u.publicUrl, focal_x: 50, focal_y: 50 });
    }
    setImages(prev => [...prev, ...added]);
    setUploading(false);
    if (added.length) toast.success(`${added.length} fotoğraf eklendi`);
    e.target.value = "";
  };

  const updateFocal = (i: number, x: number, y: number) =>
    setImages(prev => prev.map((img, idx) => idx === i ? { ...img, focal_x: x, focal_y: y } : img));

  const makeCover = (i: number) => {
    const next = [...images];
    const [item] = next.splice(i, 1);
    next.unshift(item);
    setImages(next);
    setPreviewIdx(0);
    toast.success("Kapak güncellendi");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) { toast.error("En az bir fotoğraf ekleyin"); return; }
    setSaving(true);
    const body = {
      title,
      stone_type: title,           // keep column happy, same as title
      category_id: null,
      description: description || null,
      featured,
      sort_order: sortOrder,
      image_url: images[0]?.url || "",
      images,
    };
    const url    = isEditing ? `/api/portfolio/${itemId}` : "/api/portfolio";
    const method = isEditing ? "PUT" : "POST";
    const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { toast.error("Kaydedilemedi"); setSaving(false); return; }
    toast.success(isEditing ? "Güncellendi" : "Oluşturuldu");
    router.push("/admin/portfolio");
  };

  if (loadingItem) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/portfolio">
          <Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{isEditing ? "Materyal Düzenle" : "Yeni Materyal"}</h1>
          <p className="text-stone-500 text-sm mt-0.5">{images.length} fotoğraf · İlk fotoğraf kapak olarak kullanılır</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-5">

          {/* ── Sol: alanlar ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Başlık *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Diana Beige Banyo" required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Açıklama</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Materyal hakkında kısa açıklama..." rows={4} />
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

            {/* Önizleme */}
            {images.length > 0 && (
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Ön İzleme</Label>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-200">
                    <img
                      src={images[previewIdx]?.url}
                      alt="preview"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: `${images[previewIdx]?.focal_x ?? 50}% ${images[previewIdx]?.focal_y ?? 50}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-sm truncate">{title || "Materyal Adı"}</p>
                    </div>
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ZoomIn className="h-4 w-4 text-white" />
                    </div>
                    {images.length > 1 && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/50 text-white text-[11px]">
                        {previewIdx + 1} / {images.length}
                      </div>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button type="button" onClick={() => setPreviewIdx(p => (p - 1 + images.length) % images.length)} className="p-1.5 rounded-lg hover:bg-stone-100">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <div className="flex gap-1.5">
                        {images.map((_, i) => (
                          <button key={i} type="button" onClick={() => setPreviewIdx(i)}
                            className={cn("h-1.5 rounded-full transition-all", i === previewIdx ? "w-4 bg-stone-800" : "w-1.5 bg-stone-300")}
                          />
                        ))}
                      </div>
                      <button type="button" onClick={() => setPreviewIdx(p => (p + 1) % images.length)} className="p-1.5 rounded-lg hover:bg-stone-100">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button type="submit" disabled={saving || !title || images.length === 0} className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Güncelle" : "Oluştur"}
            </Button>
          </div>

          {/* ── Sağ: fotoğraf yöneticisi ──────────────────────────────── */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    Fotoğraflar ({images.length})
                  </Label>
                  {images.length > 1 && (
                    <span className="text-[11px] text-stone-400">
                      ★ kapak · odak noktası · sürükle sırala
                    </span>
                  )}
                </div>

                {/* Upload zone */}
                <label className={cn(
                  "flex flex-col items-center justify-center w-full py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                  uploading ? "border-amber-400 bg-amber-50/30" : "border-stone-200 hover:border-amber-400 hover:bg-amber-50/20"
                )}>
                  <Upload className="h-7 w-7 text-stone-400 mb-2" />
                  <span className="text-sm font-medium text-stone-600">
                    {uploading ? "Yükleniyor..." : "Fotoğraf ekle (çoklu seçim yapılabilir)"}
                  </span>
                  <span className="text-xs text-stone-400 mt-1">PNG, JPG, WEBP</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>

                {images.length === 0 ? (
                  <p className="text-center text-stone-400 text-sm py-4">
                    Henüz fotoğraf yok — yukarıdan yükleyin
                  </p>
                ) : (
                  <SortableImageList
                    images={images}
                    onReorder={setImages}
                    onRemove={(i) => { setImages(prev => prev.filter((_, idx) => idx !== i)); setPreviewIdx(0); }}
                    onMakeCover={makeCover}
                    onFocalChange={updateFocal}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
