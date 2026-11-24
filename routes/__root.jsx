import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";
import appCss from "@/index.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kanti — Shop finance & debt ledger" },
      {
        name: "description",
        content:
          "Track every credit sale and repayment, watch each retailer's outstanding balance, and share branded receipts in seconds.",
      },
      { name: "theme-color", content: "#0b1412" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap",
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

// The document. There is no index.html: the server renders <html> from here.
function RootDocument({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      {/* data-react-root: the builder's preview bridge looks for #root and falls back to this. */}
      <body data-react-root="true">
        {children}
        <Scripts />
      </body>
    </html>
  );
}