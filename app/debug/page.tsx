import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Debug() {
  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">UI Debug</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            shadcn/ui Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </CardContent>
      </Card>
    </main>
  );
}
