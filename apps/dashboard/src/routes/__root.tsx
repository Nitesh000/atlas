import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "../components/theme-provider";
import { ModeToggle } from "../components/mode-toggle";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="atlas-ui-theme" attribute="class">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="bg-card border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Atlas</h1>
          <ModeToggle />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  ),
});
