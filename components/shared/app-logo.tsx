import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Scissors className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold">CutSlot</p>
        <p className="text-xs text-muted-foreground">Salon booking SaaS</p>
      </div>
    </div>
  );
}
