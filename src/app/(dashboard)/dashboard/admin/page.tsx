import { redirect } from "next/navigation";

// Admin page has been consolidated into Executive Dashboard
// Redirect for backwards compatibility
export default function AdminPage() {
  redirect("/dashboard/executive?tab=users");
}
