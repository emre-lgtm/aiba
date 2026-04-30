"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Star, Search, LayoutGrid, List } from "lucide-react";

type Category = { id: string; name: string; slug: string };
type PortfolioItem = {
  id: string;
  title: string;
  stone_type: string;
  image_url: string;
  description: string | null;
  featured: boolean;
  sort_order: number;
  category: Category | null;
};

export function PortfolioList() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      if (!cancelled && Array.isArray(data)) {
        setItems(data);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/portfolio");
    const data = await res.json();
    if (Array.isArray(data)) setItems(data);
    setLoading(false);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Material deleted");
      fetchItems();
    } else {
      toast.error("Failed to delete");
    }
  };

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.stone_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Materials</h1>
          <p className="text-stone-500 text-sm mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} total
          </p>
        </div>
        <Link href="/admin/portfolio/new">
          <Button className="bg-stone-900 hover:bg-stone-800 text-white shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by title or stone type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-bronze-500/20 focus:border-bronze-400 transition-all"
          />
        </div>
        <div className="flex rounded-lg border border-stone-200 bg-white overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`p-2 transition-colors ${view === "grid" ? "bg-stone-900 text-white" : "text-stone-400 hover:bg-stone-50"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 transition-colors ${view === "list" ? "bg-stone-900 text-white" : "text-stone-400 hover:bg-stone-50"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="aspect-[4/3] bg-stone-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-stone-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-stone-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-stone-100 mb-4">
            <Plus className="h-7 w-7 text-stone-400" />
          </div>
          <p className="text-stone-500 font-medium">
            {search ? "No items match your search" : "No materials yet"}
          </p>
          {!search && (
            <Link href="/admin/portfolio/new">
              <Button variant="outline" className="mt-4">
                Create your first item
              </Button>
            </Link>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-stone-200">
                {item.image_url && (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {item.featured && (
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm">
                      <Star className="h-3 w-3 text-white fill-white" />
                      <span className="text-[11px] text-white font-medium">Featured</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link href={`/admin/portfolio/${item.id}/edit`}>
                    <button className="p-2 rounded-lg bg-white/90 hover:bg-white shadow-sm transition-colors">
                      <Pencil className="h-3.5 w-3.5 text-stone-700" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-white/90 hover:bg-red-50 shadow-sm transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  {item.category && (
                    <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
                      {item.category.name}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-stone-900 text-sm truncate">{item.title}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{item.stone_type}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-white shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
            >
              <div className="h-14 w-14 rounded-lg bg-stone-200 overflow-hidden relative flex-shrink-0">
                {item.image_url && (
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-stone-900 truncate">{item.title}</p>
                <p className="text-xs text-stone-500">{item.stone_type}</p>
              </div>
              <div className="flex items-center gap-3">
                {item.category && (
                  <Badge variant="secondary" className="text-[10px]">{item.category.name}</Badge>
                )}
                {item.featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                <Link href={`/admin/portfolio/${item.id}/edit`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
