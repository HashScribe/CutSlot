import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "muted" | "danger";

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary/15 text-primary",
  success: "bg-emerald-500/15 text-emerald-400",
  muted: "bg-muted text-muted-foreground",
  danger: "bg-destructive/15 text-destructive"
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium", variants[variant], className)}
      {...props}
    />
  );
}
