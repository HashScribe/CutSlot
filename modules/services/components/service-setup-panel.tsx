import { Clock, Scissors } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ServiceSetupPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-primary" aria-hidden="true" />
          Services foundation
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {[
          ["Haircut", "45 min", "10 min buffer"],
          ["Color touch-up", "90 min", "15 min buffer"],
          ["Blow dry", "30 min", "5 min buffer"]
        ].map(([name, duration, buffer]) => (
          <div key={name} className="rounded-lg border border-border bg-secondary/30 p-4">
            <p className="font-medium">{name}</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {duration} · {buffer}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
