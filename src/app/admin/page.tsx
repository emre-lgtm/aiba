import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminGuard from "@/components/admin/admin-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Images, Tags } from "lucide-react";

async function getStats() {
  const supabase = await createClient();

  const [portfolioRes, categoriesRes] = await Promise.all([
    supabase.from("portfolio_items").select("id", { count: "exact", head: true }),
    supabase.from("portfolio_categories").select("id", { count: "exact", head: true }),
  ]);

  return {
    portfolioCount: portfolioRes.count ?? 0,
    categoryCount: categoriesRes.count ?? 0,
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
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">
            Welcome back, {user.email}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">
                Portfolio Items
              </CardTitle>
              <Images className="h-4 w-4 text-stone-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.portfolioCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">
                Categories
              </CardTitle>
              <Tags className="h-4 w-4 text-stone-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.categoryCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
