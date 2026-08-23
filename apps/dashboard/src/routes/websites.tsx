import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
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
import {
  Globe,
  Plus,
  AlertCircle,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const Route = createFileRoute("/websites")({
  component: WebsitesPage,
});

function WebsitesPage() {
  const { data: org, isLoading: orgLoading } = useCurrentOrg();
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: websites, isLoading: sitesLoading } = useQuery({
    queryKey: ["websites", org?.id],
    queryFn: async () => {
      const res = await api.get(`/orgs/${org?.id}/websites`);
      return res.data as {
        id: string;
        url: string;
        title: string | null;
        status: string;
        createdAt: string;
      }[];
    },
    enabled: !!org?.id,
  });

  useEffect(() => {
    if (!org?.id) return;

    // Ensure we hit the absolute base URL
    const baseUrl =
      import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";
    const evtSource = new EventSource(
      `${baseUrl}/orgs/${org.id}/websites/events`,
      {
        withCredentials: true,
      },
    );

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Invalidate the query to fetch the freshest data (e.g. updated timestamps)
        queryClient.invalidateQueries({ queryKey: ["websites", org.id] });

        // Optimistic update for immediate visual feedback
        queryClient.setQueryData(["websites", org.id], (old: any[]) => {
          if (!old) return old;
          return old.map((w) =>
            w.id === data.websiteId ? { ...w, status: data.status } : w,
          );
        });
      } catch (err) {
        // ignore JSON parse errors from pings
      }
    };

    return () => evtSource.close();
  }, [org?.id, queryClient]);

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

  const rescrape = useMutation({
    mutationFn: async (websiteId: string) => {
      await api.post(`/orgs/${org?.id}/websites/${websiteId}/scrape`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites", org?.id] });
    },
  });

  const deleteWebsite = useMutation({
    mutationFn: async (websiteId: string) => {
      await api.delete(`/orgs/${org?.id}/websites/${websiteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites", org?.id] });
    },
  });

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

  const isLoading =
    sitesLoading || addWebsite.isPending || deleteWebsite.isPending;
  const isLimitReached = (websites?.length ?? 0) >= 3;

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
              <CardDescription>
                Websites continuously crawled and vectorized for your AI agents.
              </CardDescription>
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
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <Globe className="h-8 w-8 mx-auto mb-3 opacity-20" />
                        No websites added yet. Add your first data source.
                      </TableCell>
                    </TableRow>
                  ) : (
                    websites?.map((site) => (
                      <React.Fragment key={site.id}>
                        <TableRow>
                          <TableCell className="font-medium text-primary hover:underline">
                            <a href={site.url} target="_blank" rel="noreferrer">
                              {site.url}
                            </a>
                          </TableCell>
                          <TableCell className="text-sm">
                            {site.title || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  site.status === "crawling"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : site.status === "completed"
                                      ? "bg-green-500/10 text-green-500"
                                      : site.status === "failed"
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {site.status.charAt(0).toUpperCase() +
                                  site.status.slice(1)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => rescrape.mutate(site.id)}
                                disabled={
                                  site.status === "crawling" ||
                                  rescrape.isPending
                                }
                                title="Re-scrape website"
                              >
                                <RefreshCw
                                  className={`h-3 w-3 ${site.status === "crawling" ? "animate-spin opacity-50 text-blue-500" : "text-muted-foreground hover:text-foreground"}`}
                                />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setExpandedId(
                                    expandedId === site.id ? null : site.id,
                                  )
                                }
                                className="text-xs h-8 text-muted-foreground hover:text-foreground"
                              >
                                {expandedId === site.id ? (
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                )}
                                Pages
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteWebsite.mutate(site.id)}
                                disabled={deleteWebsite.isPending}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete website"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedId === site.id && (
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={4} className="p-0">
                              <WebsitePagesList
                                orgId={org.id}
                                websiteId={site.id}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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
                <CardTitle>Add Source</CardTitle>
                <CardDescription>
                  Queue a new website for crawling.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newUrl.trim())
                      addWebsite.mutate({
                        url: newUrl,
                        title: newTitle || undefined,
                      });
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
          ) : (
            <Card className="bg-muted/30 border-dashed">
              <CardHeader>
                <CardTitle className="text-muted-foreground flex items-center gap-2">
                  Limit Reached
                </CardTitle>
                <CardDescription>
                  You have reached the maximum limit of 100 websites for your
                  account. Delete an existing source to add a new one.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function WebsitePagesList({
  orgId,
  websiteId,
}: {
  orgId: string;
  websiteId: string;
}) {
  const { data: pages, isLoading } = useQuery({
    queryKey: ["website-pages", orgId, websiteId],
    queryFn: async () => {
      const res = await api.get(`/orgs/${orgId}/websites/${websiteId}/pages`);
      return res.data as { url: string }[];
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground text-center animate-pulse">
        Loading pages...
      </div>
    );
  }

  if (!pages || pages.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground text-center">
        No sub-routes found. This source might still be crawling or failed.
      </div>
    );
  }

  return (
    <div className="p-4 max-h-[300px] overflow-y-auto">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
        Indexed Pages ({pages.length})
      </div>
      <ul className="space-y-1">
        {pages.map((page, i) => (
          <li
            key={i}
            className="text-sm px-2 py-1.5 hover:bg-muted rounded text-foreground/80 break-all"
          >
            <a
              href={page.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              {page.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
