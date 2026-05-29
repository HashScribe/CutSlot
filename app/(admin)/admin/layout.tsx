import Link from "next/link";
import { CalendarDays, LayoutDashboard, Scissors, Settings, Sparkles, Users } from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { hasSupabaseConfig } from "@/lib/env";
import { SignOutButton } from "@/modules/auth/components/sign-out-button";
import { requireCurrentUser } from "@/modules/auth/lib/session";
import { NoTenantState } from "@/modules/tenants/components/no-tenant-state";
import { requireActiveTenant } from "@/modules/tenants/lib/queries";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/bookings", label: "Bookings", icon: Sparkles },
  { href: "/admin/services", label: "Services", icon: Scissors },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings }
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let tenantName = "CutSlot";
  let tenantRole = "setup";
  let hasTenant = false;

  if (hasSupabaseConfig()) {
    const user = await requireCurrentUser();
    const tenant = await requireActiveTenant(user.id);
    hasTenant = Boolean(tenant);
    tenantName = tenant?.name ?? "No tenant";
    tenantRole = tenant?.role ?? "missing";
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card/80 p-5 lg:block">
        <AppLogo />
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur md:px-8">
          <div className="lg:hidden">
            <AppLogo />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium">{tenantName}</p>
            <p className="text-xs text-muted-foreground">Role: {tenantRole}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm">New booking</Button>
            {hasSupabaseConfig() ? <SignOutButton /> : null}
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
          {hasSupabaseConfig() && !hasTenant ? <NoTenantState /> : children}
        </main>
      </div>
    </div>
  );
}
