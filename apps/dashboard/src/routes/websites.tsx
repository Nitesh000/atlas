import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { useCurrentOrg } from "../hooks/use-current-org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Globe, Plus, AlertCircle, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/websites")({
  component: WebsitesPage,
});

function WebsitesPage() {
  const { data: org, isLoading: orgLoading } = useCurrentOrg();
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const { data: websites, isLoading: sitesLoading } = useQuery({
    queryKey: ["websites", org?.id],
    queryFn: async () => {
      const res = await api.get(`/orgs/${org?.id}/websites`);
      return res.data as { id: string; url: string; title: string | null; status: string; createdAt: string }[];
    },
    enabled: !!org?.id,
    refetchInterval: 5000, // Refresh status periodically while crawling
  });

  const addWebsite = useMutation({
    mutationFn: async (data: { url: string; title?: string }) => {
      const res = await api.post(`/orgs/${org?.id}/websites`, data);
      return res.data;
    },
    onSuccess: () => {
      setNewUrl("");
      setNewTitle("");
      queryClient.invalidateQueries({ queryKey: ["websites", org?.id] });
    },
  });

  if (orgLoading) return <div className="p-8 text-muted-foreground animate-pulse">Loading workspace...</div>;
  
  if (!org) {
    return (
      <div className="p-8">
        <Card className="max-w-md bg-destructive/5 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Workspace Required
            </CardTitle>
            <CardDescription>You need to create an organization in the Overview tab first.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isLoading = sitesLoading || addWebsite.isPending;

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Websites</h2>
          <p className="text-muted-foreground mt-2">
            Manage and track documentation websites for RAG context.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Indexed Sources</CardTitle>
              <CardDescription>Websites continuously crawled and vectorized for your AI agents.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {websites?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        <Globe className="h-8 w-8 mx-auto mb-3 opacity-20" />
                        No websites added yet. Add your first data source.
                      </TableCell>
                    </TableRow>
                  ) : (
                    websites?.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell className="font-medium text-primary hover:underline">
                          <a href={site.url} target="_blank" rel="noreferrer">{site.url}</a>
                        </TableCell>
                        <TableCell className="text-sm">{site.title || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {site.status === "crawling" && <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />}
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              site.status === "crawling" ? "bg-blue-500/10 text-blue-500" :
                              site.status === "completed" ? "bg-green-500/10 text-green-500" :
                              site.status === "failed" ? "bg-destructive/10 text-destructive" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(site.createdAt).toLocaleDateString()}
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
          <Card>
            <CardHeader>
              <CardTitle>Add Source</CardTitle>
              <CardDescription>Queue a new website for crawling.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newUrl.trim()) addWebsite.mutate({ url: newUrl, title: newTitle || undefined });
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    placeholder="https://docs.example.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    disabled={isLoading}
                    required
                    type="url"
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Alias (Optional)</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Core API Docs"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    disabled={isLoading}
                    className="bg-muted/50"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Plus className="mr-2 h-4 w-4" /> Start Crawl
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
