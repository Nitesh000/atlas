import { createFileRoute } from "@tanstack/react-router";
import { useCurrentOrg } from "../hooks/use-current-org";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: org } = useCurrentOrg();
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    if (org?.id) {
      navigator.clipboard.writeText(org.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!org) return <div className="p-8 text-muted-foreground animate-pulse">Loading settings...</div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Manage your workspace preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Name</CardTitle>
          <CardDescription>This is your organization's visible name within Atlas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input id="orgName" defaultValue={org.name} readOnly className="bg-muted/50" />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 bg-muted/20">
          <Button disabled>Save Changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace ID</CardTitle>
          <CardDescription>Used when interacting directly with the Atlas REST API.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 max-w-md">
            <code className="flex-1 bg-muted px-4 py-2 rounded-md text-sm font-mono border text-muted-foreground select-all">
              {org.id}
            </code>
            <Button variant="outline" size="icon" onClick={copyId}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your workspace, there is no going back. All indexed websites, vector chunks, and API keys will be permanently destroyed.
          </p>
          <Button variant="destructive" disabled>Delete Workspace</Button>
        </CardContent>
      </Card>
    </div>
  );
}
