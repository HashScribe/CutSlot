import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NoSalonState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No salon found</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This tenant does not have a salon profile yet. Run the local seed or create a salon row before configuring services and staff.
        </p>
      </CardContent>
    </Card>
  );
}
