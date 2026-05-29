import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/env";
import { AdminLoginForm } from "@/modules/auth/components/admin-login-form";
import { getCurrentUser } from "@/modules/auth/lib/session";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  if (hasSupabaseConfig()) {
    const user = await getCurrentUser();
    if (user) {
      redirect(next?.startsWith("/admin") ? next : "/admin");
    }
  }

  return (
    <main className="dark flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <AdminLoginForm next={next?.startsWith("/admin") ? next : "/admin"} isSupabaseConfigured={hasSupabaseConfig()} />
    </main>
  );
}
