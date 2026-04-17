import AdminGuard from "@/components/admin/admin-guard";
import { CategoriesManager } from "@/components/admin/categories-manager";

export default function CategoriesPage() {
  return (
    <AdminGuard>
      <CategoriesManager />
    </AdminGuard>
  );
}
