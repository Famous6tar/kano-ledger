import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <p className="font-display text-7xl leading-none tracking-tight text-foreground">404</p>
      <p className="text-sm text-muted-foreground">This page doesn't exist.</p>
      <Button asChild className="rounded-full">
        <Link to="/">Back to the dashboard</Link>
      </Button>
    </div>
  );
}