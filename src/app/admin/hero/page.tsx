import AdminGuard from "@/components/admin/admin-guard";
import { HeroManager } from "@/components/admin/hero-manager";

export default function HeroPage() {
  return (
    <AdminGuard>
      <HeroManager />
    </AdminGuard>
  );
}
