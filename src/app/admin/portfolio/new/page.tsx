import AdminGuard from "@/components/admin/admin-guard";
import { PortfolioForm } from "@/components/admin/portfolio-form";

export default function NewPortfolioPage() {
  return (
    <AdminGuard>
      <PortfolioForm />
    </AdminGuard>
  );
}
