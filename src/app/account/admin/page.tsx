import { redirect } from "next/navigation";

/** Eski URL; yönetim artık `/admin` altında. */
export default function AccountAdminLegacyPage() {
  redirect("/admin");
}
