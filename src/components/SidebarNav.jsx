import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Users, ShoppingCart, Package, ReceiptText, TrendingDown, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useBrand } from "@/components/brand/BrandProvider";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/pos", label: "POS Terminal", icon: ShoppingCart },
  { to: "/products", label: "Inventory", icon: Package },
  { to: "/sales", label: "Sales & Invoices", icon: ReceiptText },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/expenses", label: "Expenses", icon: TrendingDown },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const { user, logout } = useAuth();
  const { brand } = useBrand();
  const location = useLocation();

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="mb-8 flex items-center gap-3 px-2">
          {brand?.logo_url ? (
            <img src={brand.logo_url} alt="Logo" className="h-10 w-10 rounded-xl object-cover ring-1 ring-black/10" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-brand-foreground font-heading font-bold">
              {initials(brand?.business_name || "Kanti")}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-bold text-foreground">{brand?.business_name || "Kanti"}</p>
            <p className="truncate text-[0.65rem] text-muted-foreground">{brand?.tagline || "Shop Ledger"}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-border/60 pt-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
            {initials(user?.email || "U")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{user?.full_name || user?.email || "Signed in"}</p>
          </div>
        </div>
        <button onClick={() => logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </div>
  );
}