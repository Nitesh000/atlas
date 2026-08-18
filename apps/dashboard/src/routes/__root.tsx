import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-bold">Atlas Dashboard</h1>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  ),
});
