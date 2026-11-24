import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycle = () => {
    const order = ["light", "dark", "system"];
    const idx = order.indexOf(theme || "system");
    setTheme(order[(idx + 1) % order.length]);
  };

  const Icon = !mounted ? Monitor : theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label = !mounted ? "Toggle theme" : `Theme: ${theme || "system"}`;

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={cycle}
        aria-label={label}
        title={label}
        className="rounded-full"
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={cycle} className="rounded-full">
      <Icon className="mr-2 h-4 w-4" />
      {!mounted ? "Theme" : theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System"}
    </Button>
  );
}

export default ThemeToggle;