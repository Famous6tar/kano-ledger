import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BrandProvider } from "@/components/brand/BrandProvider";

export const Route = createFileRoute("/_authed/_app")({ component: AppLayout });

function AppLayout() {
  const { user } = Route.useRouteContext();
  return (
    <BrandProvider>
      <AppShell user={user}>
        <Outlet />
      </AppShell>
    </BrandProvider>
  );
}