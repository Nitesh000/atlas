import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/orgs/$orgId")({
  component: OrgDetails,
});

function OrgDetails() {
  const { orgId } = Route.useParams();
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState("");

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["orgs", orgId, "api-keys"],
    queryFn: async () => {
      const res = await api.get(`/orgs/${orgId}/api-keys`);
      return res.data as {
        id: string;
        key: string;
        name: string;
        createdAt: string;
      }[];
    },
  });

  const createApiKey = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post(`/orgs/${orgId}/api-keys`, {
        name,
        allowedDomains: null, // MVP: No domain restrictions yet
      });
      return res.data;
    },
    onSuccess: (data) => {
      setNewKeyName("");
      setNewKey(data.key); // Show the key once
      queryClient.invalidateQueries({ queryKey: ["orgs", orgId, "api-keys"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyName.trim()) {
      createApiKey.mutate(newKeyName.trim());
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold flex-1">Manage Organization</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {newKey && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 p-4 rounded-md border border-green-200 dark:border-green-800">
              <p className="font-semibold mb-2">New API Key Created!</p>
              <code className="block bg-black/10 dark:bg-black/40 p-2 rounded break-all select-all">
                {newKey}
              </code>
              <p className="text-sm mt-2 font-medium">
                Copy this key now. You will not be able to see it again.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setNewKey("")}
              >
                I have copied it
              </Button>
            </div>
          )}

          {isLoading ? (
            <p>Loading keys...</p>
          ) : apiKeys?.length === 0 ? (
            <p className="text-muted-foreground">No API keys generated yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys?.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
                        {key.key.substring(0, 8)}...
                      </code>
                    </TableCell>
                    <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Create New Key</h3>
            <form onSubmit={handleCreate} className="flex items-end gap-4 max-w-md">
              <div className="flex-1 space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g. Production Widget"
                  value={newKeyName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKeyName(e.target.value)}
                  disabled={createApiKey.isPending}
                  required
                />
              </div>
              <Button type="submit" disabled={createApiKey.isPending}>
                Generate Key
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
