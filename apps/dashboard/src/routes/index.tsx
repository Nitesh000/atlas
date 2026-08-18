import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "../lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;

  if (!session) {
    return <div>Please log in to manage your organizations.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome, {session.user.name}</h2>
      <p>Select an organization to manage API keys.</p>
    </div>
  );
}
