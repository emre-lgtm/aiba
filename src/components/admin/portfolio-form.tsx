"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, X, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name: string; slug: string };

const PROMPT_TEMPLATES: Record<string, string> = {
  Kitchen: "Professional architectural photography of a luxury kitchen with {stone} marble countertop, warm natural lighting, high-end interior design, photorealistic, 8k quality",
  Bathroom: "Professional architectural photography of a luxury bathroom with {stone} marble cladding and surfaces, spa-like atmosphere, soft lighting, photorealistic, 8k quality",
  Flooring: "Professional architectural photography of {stone} marble flooring in a grand entrance hall, polished surface reflecting light, elegant interior, photorealistic, 8k quality",
  Exterior: "Professional architectural photography of a luxury villa exterior with {stone} natural stone facade cladding, golden hour lighting, photorealistic, 8k quality",
};

function buildPrompt(stoneType: string, categoryName: string) {
  const template = PROMPT_TEMPLATES[categoryName] || PROMPT_TEMPLATES["Kitchen"];
  return template.replace("{stone}", stoneType);
}

export function PortfolioForm({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!itemId;

  const [saving, setSaving] = useState(false);
  const [loadingItem, setLoadingItem] = useState(isEditing);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [stoneType, setStoneType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);

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
        const itemData = await itemRes.json();
        if (!cancelled && itemData.id) {
          setTitle(itemData.title);
          setStoneType(itemData.stone_type);
          setCategoryId(itemData.category_id || "");
          setDescription(itemData.description || "");
          setFeatured(itemData.featured || false);
          setSortOrder(itemData.sort_order || 0);
          setImageUrl(itemData.image_url || "");
        }
        if (!cancelled) setLoadingItem(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isEditing, itemId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;

    const { error } = await supabase.storage
      .from("portfolio-images")
      .upload(path, file, { contentType: file.type });

    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("portfolio-images")
      .getPublicUrl(path);

    setImageUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleGenerateImage = async () => {
    if (!stoneType) {
      toast.error("Enter stone type first");
      return;
    }

    setGenerating(true);
    const categoryName = selectedCategory?.name || "Kitchen";
    const prompt = customPrompt || buildPrompt(stoneType, categoryName);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size: "1280x1280" }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Image generation failed");
        setGenerating(false);
        return;
      }

      const aiImageUrl = data.url;

      const downloadRes = await fetch(aiImageUrl);
      const blob = await downloadRes.blob();
      const ext = aiImageUrl.split(".").pop()?.split("?")[0] || "png";
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-images")
        .upload(path, blob, { contentType: blob.type || "image/png" });

      if (uploadError) {
        toast.error("Failed to save generated image");
        setGenerating(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(path);

      setImageUrl(urlData.publicUrl);
      toast.success("AI image generated and saved");
    } catch {
      toast.error("Image generation failed");
    }

    setGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body = {
      title,
      stone_type: stoneType,
      category_id: categoryId || null,
      description: description || null,
      featured,
      sort_order: sortOrder,
      image_url: imageUrl,
    };

    if (isEditing) {
      const res = await fetch(`/api/portfolio/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        toast.error("Failed to update");
        setSaving(false);
        return;
      }
      toast.success("Portfolio item updated");
    } else {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        toast.error("Failed to create");
        setSaving(false);
        return;
      }
      toast.success("Portfolio item created");
    }

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

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/portfolio">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {isEditing ? "Edit Item" : "New Item"}
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {isEditing ? "Update portfolio entry" : "Add to your portfolio"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-medium uppercase tracking-wider text-stone-500">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Calacatta Oro Kitchen"
                    required
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stone_type" className="text-xs font-medium uppercase tracking-wider text-stone-500">Stone Type *</Label>
                    <Input
                      id="stone_type"
                      value={stoneType}
                      onChange={(e) => setStoneType(e.target.value)}
                      placeholder="Calacatta Oro"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-stone-500">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Luxury kitchen countertop crafted with Calacatta Oro marble"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Switch checked={featured} onCheckedChange={setFeatured} id="featured" />
                    <Label htmlFor="featured" className="text-sm font-medium">Featured</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sort_order" className="text-xs font-medium text-stone-500">Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      className="h-9 w-20"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white"
                  disabled={saving || !title || !stoneType || !imageUrl}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update Item" : "Create Item"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Image *</Label>
                <button
                  type="button"
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  className="flex items-center gap-1.5 text-xs font-medium text-bronze-600 hover:text-bronze-700 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Generate
                </button>
              </div>

              {showAiPanel && (
                <div className="mb-4 p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={
                      stoneType
                        ? buildPrompt(stoneType, selectedCategory?.name || "Kitchen")
                        : "Enter stone type first..."
                    }
                    rows={3}
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={generating || !stoneType}
                    className="w-full h-9 bg-gradient-to-r from-bronze-600 to-bronze-500 hover:from-bronze-500 hover:to-bronze-400 text-white text-xs"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              )}

              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] group">
                  <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white shadow-sm"
                    >
                      <X className="h-3.5 w-3.5 text-stone-700" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-bronze-400 hover:bg-bronze-50/30 transition-all">
                  <Upload className="h-7 w-7 text-stone-400 mb-2" />
                  <span className="text-sm font-medium text-stone-500">
                    {uploading ? "Uploading..." : "Upload image"}
                  </span>
                  <span className="text-[11px] text-stone-400 mt-1">or use AI Generate above</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
