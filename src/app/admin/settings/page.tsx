import AdminGuard from "@/components/admin/admin-guard";
import { SettingsForm } from "@/components/admin/settings-form";

export default function SettingsPage() {
  return (
    <AdminGuard>
      <SettingsForm />
    </AdminGuard>
  );
}
