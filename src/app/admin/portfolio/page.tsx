import AdminGuard from "@/components/admin/admin-guard";
import { PortfolioList } from "@/components/admin/portfolio-list";

export default function PortfolioPage() {
  return (
    <AdminGuard>
      <PortfolioList />
    </AdminGuard>
  );
}
