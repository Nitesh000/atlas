import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { ThemeProvider } from "../components/theme-provider";
import { ModeToggle } from "../components/mode-toggle";
import {
  Building2,
  BarChart,
  CreditCard,
  Settings,
  Book,
  LifeBuoy,
  Search,
  Bell,
} from "lucide-react";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider
      defaultTheme="dark"
      storageKey="atlas-ui-theme"
      attribute="class"
    >
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
        {/* Sidebar */}
        <aside className="hidden fixed top-0 left-0 z-50 flex-col w-64 h-full border-r bg-card border-border lg:flex">
          <div className="flex items-center px-6 h-16 border-b border-border/50">
            <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
              <img src="/logo.png" alt="Atlas Logo" className="h-8 w-8 object-cover rounded-lg shadow-sm" />
              <span className="font-bold text-xl tracking-tight text-foreground">Atlas</span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            <Link
              to="/"
              className="flex items-center py-2 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent [&.active]:bg-accent [&.active]:text-foreground"
            >
              <Building2 className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100" />
              Organizations
            </Link>
            <a
              href="#"
              className="flex items-center py-2 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent"
            >
              <BarChart className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100" />
              Usage
            </a>
            <a
              href="#"
              className="flex items-center py-2 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent"
            >
              <CreditCard className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100" />
              Billing
            </a>
            <a
              href="#"
              className="flex items-center py-2 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent"
            >
              <Settings className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100" />
              Settings
            </a>
          </nav>

          <div className="px-3 pt-4 pb-6 space-y-1 border-t border-border/50">
            <a
              href="#"
              className="flex items-center py-2 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent"
            >
              <Book className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100" />
              Docs
            </a>
            <a
              href="#"
              className="flex items-center py-2 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent"
            >
              <LifeBuoy className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100" />
              Support
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* Top Header */}
          <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 border-b bg-background/60 backdrop-blur-xl border-border/50">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors">
                Atlas
              </span>
              <span className="text-border">/</span>
              <span className="text-foreground">Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 py-1.5 px-3 rounded-md border bg-muted/50 border-border/50 min-w-[240px] text-muted-foreground group hover:border-primary/50 transition-colors cursor-pointer">
                <Search className="h-4 w-4" />
                <span className="flex-1 text-sm">Search...</span>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Bell className="h-4 w-4" />
                </button>
                <ModeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  ),
});
