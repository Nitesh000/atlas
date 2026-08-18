import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSession, signOut } from "../lib/auth";
import { api } from "../lib/api";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div className="p-4">Loading...</div>;

  if (!session) {
    return (
      <div className="p-4 bg-white rounded shadow text-center max-w-md mx-auto mt-12">
        <h2 className="text-xl font-bold mb-4">Please log in to manage your account.</h2>
        <div className="flex justify-center gap-4">
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </div>
      </div>
    );
  }

  return <DashboardHome session={session} />;
}

function DashboardHome({ session }: { session: any }) {
  const [newOrgName, setNewOrgName] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["orgs"],
    queryFn: async () => {
      const res = await api.get("/orgs");
      return res.data as { id: string; name: string }[];
    },
  });

  const createOrg = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post("/orgs", { name });
      return res.data;
    },
    onSuccess: () => {
      setNewOrgName("");
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
    },
  });

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Welcome, {session.user.name}</h2>
        <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-black">
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-md shadow space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Your Organizations</h3>
        
        {isLoading ? (
          <p>Loading organizations...</p>
        ) : orgs?.length === 0 ? (
          <p className="text-gray-500">You don't have any organizations yet.</p>
        ) : (
          <ul className="space-y-2">
            {orgs?.map((org) => (
              <li key={org.id} className="border p-3 rounded flex justify-between items-center">
                <span className="font-medium">{org.name}</span>
                <Link to="/" className="text-blue-600 text-sm hover:underline">
                  Manage API Keys &rarr;
                </Link>
              </li>
            ))}
          </ul>
        )}

        <form 
          className="mt-6 pt-4 border-t flex items-end gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (newOrgName.trim()) createOrg.mutate(newOrgName);
          }}
        >
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Create New Organization</label>
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Organization Name"
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={createOrg.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
