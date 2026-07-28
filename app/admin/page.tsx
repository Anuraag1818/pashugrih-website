import { getFreshSiteContent } from "../../lib/content";
import { getSignedInUser, isAdmin } from "../../lib/auth";
import { redirect } from "next/navigation";
import { AdminEditor } from "./AdminEditor";
import { AccessDenied } from "./AccessDenied";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSignedInUser();
  if (!user) redirect("/admin/login");
  if (!isAdmin(user)) return <AccessDenied email={user.email ?? "Signed-in account"} />;
  const content = await getFreshSiteContent();
  return <AdminEditor initialContent={content} userName={user.name ?? user.email ?? "Admin"} />;
}
