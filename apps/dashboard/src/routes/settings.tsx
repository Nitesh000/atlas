import { createFileRoute } from "@tanstack/react-router";
import { useCurrentOrg } from "../hooks/use-current-org";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check, Users, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: org } = useCurrentOrg();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: invites = [] } = useQuery({
    queryKey: ["invites", org?.id],
    queryFn: async () => {
      const res = await api.get(`/orgs/${org?.id}/invites`);
      return res.data;
    },
    enabled: !!org?.id,
  });

  const createInviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await api.post(`/orgs/${org?.id}/invites`, {
        email,
        role: "member",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", org?.id] });
      setInviteEmail("");
    },
  });

  const copyId = () => {
    if (org?.id) {
      navigator.clipboard.writeText(org.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyInvite = (token: string) => {
    const url = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard.writeText(url);
    // Ideally use toast here
    alert("Invite link copied!");
  };

  if (!org)
    return (
      <div className="p-8 text-muted-foreground animate-pulse">
        Loading settings...
      </div>
    );

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Manage your workspace preferences and team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Name</CardTitle>
          <CardDescription>
            This is your organization's visible name within Atlas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              defaultValue={org.name}
              readOnly
              className="bg-muted/50"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 bg-muted/20">
          <Button disabled>Save Changes</Button>
        </CardFooter>
      </Card>

      {/* Team & Invites Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Members & Invites
          </CardTitle>
          <CardDescription>
            Invite team members to collaborate in your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form 
            className="flex items-end gap-4 max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              if (inviteEmail) createInviteMutation.mutate(inviteEmail);
            }}
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="colleague@company.com"
                  className="pl-9"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={createInviteMutation.isPending}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={createInviteMutation.isPending || !inviteEmail}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </form>

          {invites.length > 0 && (
            <div className="border rounded-xl overflow-hidden mt-6">
              <div className="bg-muted/50 px-4 py-2 border-b text-sm font-medium text-muted-foreground">
                Pending Invites
              </div>
              <ul className="divide-y">
                {invites.map((invite: any) => (
                  <li key={invite.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{invite.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Role: {invite.role} • Expires {new Date(invite.expiresAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyInvite(invite.token)}>
                        Copy Link
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace ID</CardTitle>
          <CardDescription>
            Used when interacting directly with the Atlas REST API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 max-w-md">
            <code className="flex-1 bg-muted px-4 py-2 rounded-md text-sm font-mono border text-muted-foreground select-all">
              {org.id}
            </code>
            <Button variant="outline" size="icon" onClick={copyId}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your workspace, there is no going back. All indexed
            websites, vector chunks, and API keys will be permanently destroyed.
          </p>
          <Button variant="destructive" disabled>
            Delete Workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
