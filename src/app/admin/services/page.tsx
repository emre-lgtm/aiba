import AdminGuard from "@/components/admin/admin-guard";
import { ServicesManager } from "@/components/admin/services-manager";

export default function ServicesPage() {
  return (
    <AdminGuard>
      <ServicesManager />
    </AdminGuard>
  );
}
