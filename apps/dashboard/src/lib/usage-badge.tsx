import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { useCurrentOrg } from "../hooks/use-current-org";
import { Zap } from "lucide-react";

export function UsageHeaderBadge() {
  const { data: org } = useCurrentOrg();

  const { data: usage, isLoading } = useQuery({
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

  if (isLoading || !usage) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground animate-pulse">
        <Zap className="w-3.5 h-3.5" />
        <span>Loading...</span>
      </div>
    );
  }

  const isNearingLimit = usage.apiCallCount >= usage.limit * 0.9;
  const isOverLimit = usage.apiCallCount >= usage.limit;

  const bgClass = isOverLimit
    ? "bg-destructive/10 border-destructive/20 text-destructive"
    : isNearingLimit
      ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
      : "bg-primary/10 border-primary/20 text-primary";

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${bgClass}`}
    >
      <Zap className="w-3.5 h-3.5" />
      <span>
        {usage.apiCallCount.toLocaleString()} / {usage.limit.toLocaleString()}
      </span>
      <span className="opacity-70 font-normal hidden sm:inline">
        calls this month
      </span>
    </div>
  );
}
