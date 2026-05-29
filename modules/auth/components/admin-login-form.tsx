"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signInWithPasswordAction } from "@/modules/auth/lib/actions";

export function AdminLoginForm({
  next,
  isSupabaseConfigured,
}: {
  next: string;
  isSupabaseConfigured: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    signInWithPasswordAction,
    {}
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        </div>
        <CardTitle>Admin login</CardTitle>
        <CardDescription>
          Sign in to manage bookings, services, staff, and salon settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSupabaseConfigured ? (
          <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-muted-foreground">
            Add Supabase values to{" "}
            <span className="font-medium text-foreground">.env.local</span>{" "}
            before signing in.
          </div>
        ) : null}
        <form action={formAction} className="mt-4 space-y-4">
          <input name="next" type="hidden" value={next} />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="owner@salon.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <Button
            className="w-full"
            disabled={!isSupabaseConfigured || isPending}
            type="submit"
          >
            {isPending ? "Signing in..." : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
