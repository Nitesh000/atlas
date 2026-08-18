import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSession, signOut } from "../lib/auth";
import { api } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div className="p-8">Loading...</div>;

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Please log in</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button asChild variant="default">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">Register</Link>
            </Button>
          </CardContent>
        </Card>
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
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {session.user.name}</h2>
        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Organizations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading organizations...</p>
          ) : orgs?.length === 0 ? (
            <p className="text-sm text-muted-foreground">You don't have any organizations yet.</p>
          ) : (
            <ul className="space-y-3">
              {orgs?.map((org) => (
                <li key={org.id} className="border rounded-md p-4 flex justify-between items-center bg-card">
                  <span className="font-medium text-lg">{org.name}</span>
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/orgs/$orgId" params={{ orgId: org.id }}>
                      Manage API Keys
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t pt-6">
            <form 
              className="flex items-end gap-4 max-w-md"
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                if (newOrgName.trim()) createOrg.mutate(newOrgName);
              }}
            >
              <div className="flex-1 space-y-2">
                <Label htmlFor="orgName">Create New Organization</Label>
                <Input
                  id="orgName"
                  placeholder="e.g. Acme Corp"
                  value={newOrgName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOrgName(e.target.value)}
                  disabled={createOrg.isPending}
                  required
                />
              </div>
              <Button type="submit" disabled={createOrg.isPending}>
                Create
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
