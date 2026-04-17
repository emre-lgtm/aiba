"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, GripVertical, FolderOpen } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
};

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (!cancelled && Array.isArray(data)) {
        setCategories(data);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (Array.isArray(data)) setCategories(data);
    setLoading(false);
  }, []);

  const generateSlug = (val: string) => {
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  };

  const openNew = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setSortOrder(categories.length + 1);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSortOrder(cat.sort_order);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const body = { name, slug, sort_order: sortOrder };

    if (editing) {
      const res = await fetch(`/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, id: editing.id }),
      });
      if (!res.ok) {
        toast.error("Failed to update category");
        setSaving(false);
        return;
      }
      toast.success("Category updated");
    } else {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        toast.error("Failed to create category");
        setSaving(false);
        return;
      }
      toast.success("Category created");
    }

    setSaving(false);
    setDialogOpen(false);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Portfolio items will lose their category reference.")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Category deleted");
      fetchCategories();
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Categories</h1>
          <p className="text-stone-500 text-sm mt-1">
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-stone-900 hover:bg-stone-800 text-white shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {editing ? "Edit Category" : "New Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editing) generateSlug(e.target.value);
                  }}
                  placeholder="Kitchen"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="kitchen"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Sort Order</Label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="h-11"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving || !name || !slug}
                className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white shadow-sm animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-stone-100 mb-4">
            <FolderOpen className="h-7 w-7 text-stone-400" />
          </div>
          <p className="text-stone-500 font-medium">No categories yet</p>
          <Button variant="outline" className="mt-4" onClick={openNew}>
            Create your first category
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-400">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 text-sm">{cat.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px] font-mono">{cat.slug}</Badge>
                  <span className="text-[11px] text-stone-400">#{cat.sort_order}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
