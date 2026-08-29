import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "../lib/auth";
import { api } from "../lib/api";
import { useCurrentOrg } from "../hooks/use-current-org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Activity, Globe, Key, Building2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/overview")({
  component: Index,
});

function Index() {
  const { data: session, isPending } = useSession();

  if (isPending)
    return (
      <div className="p-8 animate-pulse text-muted-foreground">
        Loading session...
      </div>
    );

  if (!session) {
    return (
      <div className="flex fixed inset-0 justify-center items-center z-[100] bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-md shadow-2xl border-primary/10">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center items-center mx-auto mb-2 w-12 h-12 rounded-xl border bg-primary/10 border-primary/20">
              <img
                src="/logo-icon.png"
                alt="Atlas"
                className="w-6 h-6 opacity-90"
              />
            </div>
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <p className="text-sm text-muted-foreground">
              Please log in to access your dashboard.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-4">
            <Button asChild variant="default" className="w-full h-11">
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-11">
              <Link to="/register">Create an Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <DashboardHome userName={session.user.name} />;
}

function DashboardHome({ userName }: { userName: string }) {
  const { data: org, isLoading: orgLoading } = useCurrentOrg();
  const queryClient = useQueryClient();
  const [newOrgName, setNewOrgName] = useState("");

  const { data: usage } = useQuery({
    queryKey: ["usage", org?.id],
    queryFn: async () => {
      const res = await api.get(`/orgs/${org?.id}/usage`);
      return res.data as {
        apiCallCount: number;
        limit: number;
        monthYear: string;
      };
    },
    enabled: !!org?.id,
  });

  const { data: websites } = useQuery({
    queryKey: ["websites", org?.id],
    queryFn: async () => {
      const res = await api.get(`/orgs/${org?.id}/websites`);
      return res.data as { status: string }[];
    },
    enabled: !!org?.id,
  });

  const { data: apiKeys } = useQuery({
    queryKey: ["apiKeys", org?.id],
    queryFn: async () => {
      const res = await api.get(`/orgs/${org?.id}/api-keys`);
      return res.data as { id: string }[];
    },
    enabled: !!org?.id,
  });

  const createOrg = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post("/orgs", { name });
      return res.data;
    },
    onSuccess: () => {
      setNewOrgName("");
      queryClient.invalidateQueries({ queryKey: ["currentOrg"] });
    },
  });

  if (orgLoading)
    return (
      <div className="p-8 animate-pulse text-muted-foreground">
        Loading dashboard...
      </div>
    );

  if (!org) {
    return (
      <div className="mx-auto mt-12 space-y-6 max-w-md">
        <div className="space-y-2 text-center">
          <div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 rounded-xl border bg-primary/10 border-primary/20">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome, {userName}
          </h2>
          <p className="text-muted-foreground">
            Create your primary workspace to start indexing websites and
            generating API keys.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Workspace</CardTitle>
            <CardDescription>
              You can only have one workspace per account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (newOrgName.trim()) createOrg.mutate(newOrgName);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="e.g. Acme Corp"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  disabled={createOrg.isPending}
                  required
                  className="bg-muted/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createOrg.isPending}
              >
                Create Workspace
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeWebsites =
    websites?.filter((w) => w.status === "completed").length || 0;
  const crawlingWebsites =
    websites?.filter((w) => w.status === "crawling").length || 0;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="mt-2 text-muted-foreground">
          Welcome back to {org.name}. Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total API Calls
            </CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage?.apiCallCount.toLocaleString() ?? "-"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Limit: {usage?.limit.toLocaleString() ?? "-"} / month
            </p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Indexed Websites
            </CardTitle>
            <Globe className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{websites?.length ?? "-"}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeWebsites} active, {crawlingWebsites} crawling
            </p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Active API Keys
            </CardTitle>
            <Key className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys?.length ?? "-"}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / 3
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Limit 3 keys per account
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              to="/websites"
              className="flex justify-between items-center p-4 rounded-lg border transition-colors group hover:bg-muted/50"
            >
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">Index New Website</div>
                  <div className="text-sm text-muted-foreground">
                    Crawl a documentation site for RAG.
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 transition-colors text-muted-foreground group-hover:text-foreground" />
            </Link>

            <Link
              to="/api-keys"
              className="flex justify-between items-center p-4 rounded-lg border transition-colors group hover:bg-muted/50"
            >
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">Generate API Key</div>
                  <div className="text-sm text-muted-foreground">
                    Create a secure token for requests.
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 transition-colors text-muted-foreground group-hover:text-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
