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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, X, Sparkles } from "lucide-react";
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
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;

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
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/portfolio">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Portfolio Item" : "New Portfolio Item"}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Calacatta Oro Kitchen"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stone_type">Stone Type *</Label>
              <Input
                id="stone_type"
                value={stoneType}
                onChange={(e) => setStoneType(e.target.value)}
                placeholder="Calacatta Oro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Luxury kitchen countertop crafted with Calacatta Oro marble"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={featured}
                  onCheckedChange={setFeatured}
                  id="featured"
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Image *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAiPanel(!showAiPanel)}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI Generate
                </Button>
              </div>

              {showAiPanel && (
                <Card className="p-4 space-y-3 bg-stone-50">
                  <div className="space-y-2">
                    <Label className="text-xs">Custom prompt (optional)</Label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder={
                        stoneType
                          ? buildPrompt(stoneType, selectedCategory?.name || "Kitchen")
                          : "Enter stone type above first..."
                      }
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={generating || !stoneType}
                    className="w-full"
                    variant="secondary"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating (~15s)...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate with GLM-Image
                      </>
                    )}
                  </Button>
                </Card>
              )}

              {imageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-stone-200 aspect-[4/3]">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-stone-400 transition-colors">
                  <Upload className="h-8 w-8 text-stone-400 mb-2" />
                  <span className="text-sm text-stone-500">
                    {uploading ? "Uploading..." : "Click to upload image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={saving || !title || !stoneType || !imageUrl}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Item" : "Create Item"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
