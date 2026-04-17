import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminGuard from "@/components/admin/admin-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Images, Tags, TrendingUp, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type RecentItem = {
  id: string;
  title: string;
  stone_type: string;
  image_url: string;
  created_at: string;
  category: { name: string } | null;
};

async function getStats() {
  const supabase = await createClient();

  const [portfolioRes, categoriesRes, recentRes] = await Promise.all([
    supabase.from("portfolio_items").select("id", { count: "exact", head: true }),
    supabase.from("portfolio_categories").select("id", { count: "exact", head: true }),
    supabase.from("portfolio_items").select("id, title, stone_type, image_url, created_at, category:portfolio_categories(name)").order("created_at", { ascending: false }).limit(5),
  ]);

  return {
    portfolioCount: portfolioRes.count ?? 0,
    categoryCount: categoriesRes.count ?? 0,
    recentItems: (recentRes.data || []) as unknown as RecentItem[],
  };
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const stats = await getStats();

  return (
    <AdminGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">
            Welcome back, <span className="text-stone-700 font-medium">{user.email}</span>
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bronze-50">
                  <Images className="h-5 w-5 text-bronze-600" />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-stone-900">{stats.portfolioCount}</p>
              <p className="text-sm text-stone-500 mt-1">Portfolio Items</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100">
                  <Tags className="h-5 w-5 text-stone-600" />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-stone-900">{stats.categoryCount}</p>
              <p className="text-sm text-stone-500 mt-1">Categories</p>
            </CardContent>
          </Card>

          <Link href="/admin/portfolio/new" className="sm:col-span-2 lg:col-span-1">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-stone-900 to-stone-800 text-white h-full cursor-pointer group">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 group-hover:bg-bronze-500/20 transition-colors">
                  <ArrowUpRight className="h-5 w-5 text-bronze-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Add New Item</p>
                  <p className="text-sm text-stone-400 mt-1">Create a portfolio entry</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {stats.recentItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-900">Recent Items</h2>
              <Link href="/admin/portfolio" className="text-sm text-bronze-600 hover:text-bronze-700 font-medium">
                View all
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {stats.recentItems.map((item) => (
                <Link key={item.id} href={`/admin/portfolio/${item.id}/edit`}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden group cursor-pointer">
                    <div className="aspect-[4/3] bg-stone-200 relative overflow-hidden">
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium text-stone-900 truncate">{item.title}</p>
                      <p className="text-xs text-stone-500">{item.category?.name || "Uncategorized"}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
