import AdminGuard from "@/components/admin/admin-guard";
import { PortfolioForm } from "@/components/admin/portfolio-form";

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminGuard>
      <PortfolioForm itemId={id} />
    </AdminGuard>
  );
}
