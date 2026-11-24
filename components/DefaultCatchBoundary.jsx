import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function DefaultCatchBoundary({ error, reset }) {
  const router = useRouter();

  if (typeof window !== "undefined" && error) {
    // eslint-disable-next-line no-console
    console.error("[route error]", error);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          {error?.message || "An unexpected error occurred while loading this page."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => (typeof reset === "function" ? reset() : router.invalidate())}
        >
          Try again
        </Button>
        <Button
          className="rounded-full"
          onClick={() => { if (typeof window !== "undefined") window.location.href = "/"; }}
        >
          Go home
        </Button>
      </div>
    </div>
  );
}