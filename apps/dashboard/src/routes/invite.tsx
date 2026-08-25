import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useSession } from "../lib/auth";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/invite")({
  component: InvitePage,
});

function InvitePage() {
  const search = useSearch({ from: "/invite" }) as { token?: string };
  const { data: session, isPending: sessionLoading } = useSession();
  const navigate = useNavigate();

  const acceptMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await api.post("/orgs/invites/accept", { token });
      return res.data;
    },
    onSuccess: () => {
      navigate({ to: "/overview" });
    },
  });

  useEffect(() => {
    if (!sessionLoading && !session) {
      // Must be logged in to accept an invite
      navigate({ to: "/login", search: { redirect: `/invite?token=${search.token}` } });
    }
  }, [session, sessionLoading, navigate, search.token]);

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Organization Invite</CardTitle>
          <CardDescription>You have been invited to join a workspace.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-6 space-y-4">
          {!search.token ? (
            <div className="text-destructive font-medium">Invalid invite link. Missing token.</div>
          ) : acceptMutation.isSuccess ? (
            <div className="text-green-600 font-medium">Invite accepted! Redirecting...</div>
          ) : (
            <>
              {acceptMutation.isError && (
                <div className="text-destructive text-sm text-center mb-2 bg-destructive/10 p-3 rounded-md w-full">
                  {(acceptMutation.error as any)?.response?.data?.message || "Failed to accept invite."}
                </div>
              )}
              <Button 
                size="lg" 
                className="w-full" 
                onClick={() => acceptMutation.mutate(search.token!)}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Accept Invitation
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}