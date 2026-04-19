import { AboutManager } from "@/components/admin/about-manager";
import AdminGuard from "@/components/admin/admin-guard";

export default function AboutPage() {
  return (
    <AdminGuard>
      <AboutManager />
    </AdminGuard>
  );
}
