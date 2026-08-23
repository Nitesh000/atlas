import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, Copy, Check, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/api-keys")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const { data: org, isLoading: orgLoading } = useCurrentOrg();
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const { data: apiKeys, isLoading: keysLoading } = useQuery({
    queryKey: ["apiKeys", org?.id],
    queryFn: async () => {
      const res = await api.get(`/orgs/${org?.id}/api-keys`);
      return res.data as {
        id: string;
        name: string;
        key: string;
        createdAt: string;
        lastUsedAt: string | null;
      }[];
    },
    enabled: !!org?.id,
  });

  const createApiKey = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post(`/orgs/${org?.id}/api-keys`, { name });
      return res.data;
    },
    onSuccess: () => {
      setNewKeyName("");
      queryClient.invalidateQueries({ queryKey: ["apiKeys", org?.id] });
    },
  });

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  if (orgLoading)
    return (
      <div className="p-8 text-muted-foreground animate-pulse">
        Loading workspace...
      </div>
    );

  if (!org) {
    return (
      <div className="p-8">
        <Card className="max-w-md bg-destructive/5 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Workspace Required
            </CardTitle>
            <CardDescription>
              You need to create an organization in the Overview tab first.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isLoading = keysLoading || createApiKey.isPending;
  const isLimitReached = (apiKeys?.length ?? 0) >= 3;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
        <p className="text-muted-foreground mt-2">
          Manage your API keys for programmatic access to Atlas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Keys</CardTitle>
              <CardDescription>
                Keys associated with {org.name}. Limit 3 per account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Secret Key</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No API keys generated yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    apiKeys?.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">
                          {key.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono text-muted-foreground select-all">
                              {key.key.slice(0, 12)}...{key.key.slice(-4)}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(key.id, key.key)}
                            >
                              {copiedKeyId === key.id ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {key.lastUsedAt
                            ? new Date(key.lastUsedAt).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          {!isLimitReached ? (
            <Card>
              <CardHeader>
                <CardTitle>Create New Key</CardTitle>
                <CardDescription>
                  Generate a new secret API key.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newKeyName.trim()) createApiKey.mutate(newKeyName);
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g. Production Web"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      disabled={isLoading}
                      required
                      className="bg-muted/50"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Key className="mr-2 h-4 w-4" /> Generate Key
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/30 border-dashed">
              <CardHeader>
                <CardTitle className="text-muted-foreground flex items-center gap-2">
                  Limit Reached
                </CardTitle>
                <CardDescription>
                  You have reached the maximum limit of 3 API keys for your
                  account. Delete an existing key to generate a new one.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
