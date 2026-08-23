import { createRootRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { ThemeProvider } from "../components/theme-provider";
import { ModeToggle } from "../components/mode-toggle";
import {
  BarChart,
  CreditCard,
  Settings,
  Book,
  LifeBuoy,
  Search,
  Key,
  Globe,
  LogOut,
  User,
  Activity,
  Zap
} from "lucide-react";
import { signOut } from "../lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function RootComponent() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <ThemeProvider
      defaultTheme="dark"
      storageKey="atlas-ui-theme"
      attribute="class"
    >
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
        {/* Sidebar */}
        <aside className="hidden fixed top-0 left-0 z-50 flex-col w-64 h-full border-r bg-card border-border lg:flex">
          <div className="flex items-center px-6 h-16 border-b border-border/50 shrink-0">
            <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
              <img src="/logo.png" alt="Atlas Logo" className="h-8 w-8 object-cover rounded-lg shadow-sm" />
              <span className="font-bold text-xl tracking-tight text-foreground">Atlas</span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            <Link
              to="/"
              className="flex items-center py-2.5 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent [&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-medium"
            >
              <Activity className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100 [&.active]:opacity-100" />
              Overview
            </Link>
            <Link
              to="/websites"
              className="flex items-center py-2.5 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent [&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-medium"
            >
              <Globe className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100 [&.active]:opacity-100" />
              Websites
            </Link>
            <Link
              to="/api-keys"
              className="flex items-center py-2.5 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent [&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-medium"
            >
              <Key className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100 [&.active]:opacity-100" />
              API Keys
            </Link>
            <Link
              to="/usage"
              className="flex items-center py-2.5 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent [&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-medium"
            >
              <BarChart className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100 [&.active]:opacity-100" />
              Usage
            </Link>
            <Link
              to="/billing"
              className="flex items-center py-2.5 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent [&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-medium"
            >
              <CreditCard className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100 [&.active]:opacity-100" />
              Billing
            </Link>
            <Link
              to="/settings"
              className="flex items-center py-2.5 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent [&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-medium"
            >
              <Settings className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100 [&.active]:opacity-100" />
              Settings
            </Link>
          </nav>

          <div className="px-3 pt-4 pb-6 space-y-1 border-t border-border/50 shrink-0">
            <a
              href="#"
              className="flex items-center py-2.5 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent"
            >
              <Book className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100" />
              Documentation
            </a>
            <a
              href="#"
              className="flex items-center py-2.5 px-3 rounded-md transition-all text-muted-foreground group hover:text-foreground hover:bg-accent"
            >
              <LifeBuoy className="mr-3 h-4 w-4 opacity-70 group-hover:opacity-100" />
              Support
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* Top Header */}
          <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 border-b bg-background/80 backdrop-blur-xl border-border/50">
            {/* Left: Usage Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                <Zap className="w-3.5 h-3.5" />
                <span>1,245 / 50,000</span>
                <span className="text-primary/70 font-normal hidden sm:inline">calls this month</span>
              </div>
            </div>

            {/* Right: Search & Profile */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 py-1.5 px-3 rounded-md border bg-muted/50 border-border/50 min-w-[240px] text-muted-foreground group hover:border-primary/50 transition-colors cursor-pointer">
                <Search className="h-4 w-4" />
                <span className="flex-1 text-sm">Search...</span>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>

              <div className="flex items-center gap-4 pl-4 border-l border-border/50">
                <ModeToggle />
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate({ to: "/settings" })}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate({ to: "/billing" })}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
