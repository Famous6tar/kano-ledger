import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeftRight, LayoutDashboard, Settings2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/customers", label: "Retailers", icon: Users },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/settings", label: "Business profile", icon: Settings2 },
];

export function SidebarNav({ onNavigate }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
      <p className="px-3 pb-2 pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
        Workspace
      </p>
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-brand/10 font-semibold text-foreground"
                : "font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand transition-opacity",
                active ? "opacity-100" : "opacity-0"
              )}
            />
            <Icon className={cn("h-[1.05rem] w-[1.05rem]", active ? "text-brand" : "text-muted-foreground")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}