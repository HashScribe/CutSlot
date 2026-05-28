"use client";

import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        </div>
        <CardTitle>Admin login</CardTitle>
        <CardDescription>Sign in to manage bookings, services, staff, and salon settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" placeholder="owner@salon.com" autoComplete="email" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" />
          </div>
          <Button className="w-full" type="button">
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
