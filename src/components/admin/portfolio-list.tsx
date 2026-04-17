"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Star } from "lucide-react";

type Category = { id: string; name: string; slug: string };
type PortfolioItem = {
  id: string;
  title: string;
  stone_type: string;
  image_url: string;
  featured: boolean;
  sort_order: number;
  category: Category | null;
};

export function PortfolioList() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (!confirm("Delete this portfolio item?")) return;
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Portfolio item deleted");
      fetchItems();
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-stone-500 text-sm mt-1">
            Manage portfolio items
          </p>
        </div>
        <Link href="/admin/portfolio/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Stone Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-12">Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-stone-400">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-stone-400">
                    No portfolio items yet
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md bg-stone-200 overflow-hidden relative">
                        {item.image_url && (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="text-stone-500">
                      {item.stone_type}
                    </TableCell>
                    <TableCell>
                      {item.category ? (
                        <Badge variant="secondary">{item.category.name}</Badge>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.featured && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/portfolio/${item.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
