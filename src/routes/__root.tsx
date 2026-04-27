import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { PlanProvider } from "@/hooks/usePlan";
import { UpgradeModalProvider } from "@/hooks/useUpgradeModal";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

// build: force rebuild 2026-04-23

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            search={{ list: undefined }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" },
      { title: "To Go" },
      { name: "description", content: "Sua lista pessoal de restaurantes para visitar." },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "To Go" },
      { name: "theme-color", content: "#86d9b0" },
      { property: "og:title", content: "To Go" },
      { property: "og:description", content: "Sua lista pessoal de restaurantes para visitar." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/icon-512.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://rfsvfqynjoiglvornrvp.supabase.co", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://rfsvfqynjoiglvornrvp.supabase.co" },
      { rel: "dns-prefetch", href: "https://a.tile.openstreetmap.org" },
      { rel: "dns-prefetch", href: "https://b.tile.openstreetmap.org" },
      { rel: "dns-prefetch", href: "https://c.tile.openstreetmap.org" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ backgroundColor: "#f5f0e8" }}>
      <head>
        <HeadContent />
        <style>{`html,body{background-color:#f5f0e8;margin:0;}`}</style>
      </head>
      <body style={{ backgroundColor: "#f5f0e8" }}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Fresh QueryClient per browser session (and per SSR request)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlanProvider>
          <UpgradeModalProvider>
            <PaymentTestModeBanner />
            <Outlet />
            <GlobalLegalFooter />
            <Toaster />
          </UpgradeModalProvider>
        </PlanProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function GlobalLegalFooter() {
  return (
    <footer className="border-t border-border bg-background px-5 py-6 text-center text-xs text-muted-foreground">
      <p>© {new Date().getFullYear()} John Charles Long · To Go</p>
      <nav className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link to="/terms" className="hover:text-foreground hover:underline">
          Termos de Uso
        </Link>
        <span aria-hidden>·</span>
        <Link to="/privacy" className="hover:text-foreground hover:underline">
          Privacidade
        </Link>
        <span aria-hidden>·</span>
        <Link to="/refund" className="hover:text-foreground hover:underline">
          Reembolso
        </Link>
        <span aria-hidden>·</span>
        <Link to="/pricing" className="hover:text-foreground hover:underline">
          Planos
        </Link>
      </nav>
    </footer>
  );
}
