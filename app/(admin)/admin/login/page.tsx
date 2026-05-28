import { AdminLoginForm } from "@/modules/auth/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="dark flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <AdminLoginForm />
    </main>
  );
}
