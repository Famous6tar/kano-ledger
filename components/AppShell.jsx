import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { SidebarNav } from "@/components/SidebarNav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * The chrome around every signed-in page:
 *  - a fixed 64px sidebar on desktop (renders SidebarNav)
 *  - a slide-over drawer on mobile (same SidebarNav, closed on navigation)
 *  - a sticky mobile header with menu button + theme toggle
 *  - the main content column (children = <Outlet /> from _authed/_app.jsx)
 * BrandProvider sits ABOVE this component, so SidebarNav can use useBrand().
 */
export function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Auto-close the mobile drawer whenever the route changes.
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/70 bg-card lg:flex">
        <SidebarNav />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarNav />
        </SheetContent>
      </Sheet>

      {/* Main content column, offset by sidebar width on desktop */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/70 bg-background/80 px-4 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <ThemeToggle compact />
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}