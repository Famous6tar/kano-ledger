import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { fetchProfile } from "@/lib/shop";

export const DEFAULT_BRAND = {
  business_name: "Your business",
  tagline: "Shop finance",
  logo_url: "",
  brand_color: "#0E7C66",
  accent_color: "#D97706",
  currency: "NGN",
  receipt_note: "",
};

export function hexToHsl(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const light = (max + min) / 2;
  const d = max - min;
  let hue = 0;
  let sat = 0;
  if (d) {
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) hue = ((b - r) / d + 2) * 60;
    else hue = ((r - g) / d + 4) * 60;
  }
  return { h: hue, s: sat * 100, l: light * 100 };
}

export function brandChannels(hex, isDark = false) {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  const lightness = isDark
    ? Math.min(Math.max(hsl.l, 44), 68)
    : Math.min(Math.max(hsl.l, 24), 44);
  return {
    h: Math.round(hsl.h),
    s: Math.round(hsl.s),
    l: Math.round(lightness),
    css: `${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(lightness)}%`,
  };
}

export function applyBrandTheme(brand, isDark) {
  if (typeof document === "undefined") return;
  const channels = brandChannels(brand?.brand_color || DEFAULT_BRAND.brand_color, isDark);
  if (!channels) return;
  const root = document.documentElement;
  root.style.setProperty("--brand", channels.css);
  root.style.setProperty("--brand-foreground", channels.l > 62 ? "200 18% 12%" : "0 0% 100%");
}

const BrandContext = createContext(null);

export function BrandProvider({ children }) {
  const [brand, setBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    const profile = await fetchProfile();
    setBrand(profile);
    setIsLoading(false);
    return profile;
  }, []);

  useEffect(() => {
    refresh().catch(() => setIsLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (brand) applyBrandTheme(brand, isDark);
  }, [brand, isDark]);

  useEffect(() => {
    if (!isLoading && !brand) navigate({ to: "/setup" });
  }, [isLoading, brand, navigate]);

  const value = useMemo(
    () => ({ brand: brand || DEFAULT_BRAND, setBrand, isDark, isLoading, refresh }),
    [brand, isDark, isLoading, refresh]
  );

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-brand" />
          Opening your ledger…
        </div>
      </div>
    );
  }

  if (!brand) return null;

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  return ctx || { brand: DEFAULT_BRAND, setBrand: () => {}, isDark: false, isLoading: false };
}