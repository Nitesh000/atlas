import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useCurrentOrg } from "../hooks/use-current-org";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Activity, AlertCircle, Zap } from "lucide-react";

export const Route = createFileRoute("/usage")({
  component: UsagePage,
});

function UsagePage() {
  const { data: org, isLoading: orgLoading } = useCurrentOrg();

  const { data: usage, isLoading: usageLoading } = useQuery({
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

  if (orgLoading || usageLoading)
    return (
      <div className="p-8 text-muted-foreground animate-pulse">
        Loading usage...
      </div>
    );

  if (!org || !usage) {
    return (
      <div className="p-8">
        <Card className="max-w-md bg-destructive/5 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Workspace Required
            </CardTitle>
            <CardDescription>Create a workspace to view usage.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const percentage = Math.min(
    100,
    Math.max(0, (usage.apiCallCount / usage.limit) * 100),
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Usage</h2>
        <p className="text-muted-foreground mt-2">
          Monitor your API consumption for {org.name}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> API Calls
            </CardTitle>
            <CardDescription>
              Current billing cycle: {usage.monthYear}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-4xl font-extrabold">
                  {usage.apiCallCount.toLocaleString()}
                </span>
                <span className="text-muted-foreground ml-2">
                  / {usage.limit.toLocaleString()}
                </span>
              </div>
              <div className="text-sm font-medium text-primary">
                {percentage.toFixed(1)}% Used
              </div>
            </div>

            <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${percentage > 90 ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {percentage >= 100 && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> You have reached your
                monthly API limit. Requests are halted.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Plan Limits
            </CardTitle>
            <CardDescription>
              Upgrade to unlock higher capacity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Monthly API Calls</span>
              <span className="font-medium">
                {usage.limit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Websites limit</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Keys limit</span>
              <span className="font-medium">3</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
