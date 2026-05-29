import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/modules/auth/lib/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button size="sm" variant="outline" type="submit">
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </Button>
    </form>
  );
}
