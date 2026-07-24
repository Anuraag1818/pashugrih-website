import { redirect } from "next/navigation";
import { getSignedInUser, isAdmin } from "../../../lib/auth";
import { AdminLoginForm } from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const user = await getSignedInUser();
  if (isAdmin(user)) redirect("/admin");
  return <AdminLoginForm signedInEmail={user?.email} />;
}
