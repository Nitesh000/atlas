import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Code, Terminal, Layers } from "lucide-react";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Documentation</h2>
        <p className="text-muted-foreground mt-2">
          Learn how to integrate Atlas into your applications.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Embed the Chat Widget
            </CardTitle>
            <CardDescription>
              The fastest way to add RAG chat to your frontend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground/80">
              Add the following snippet right before your closing{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                &lt;/body&gt;
              </code>{" "}
              tag. The widget is fully styled and responsive out of the box.
            </p>
            <div className="bg-muted p-4 rounded-xl border font-mono text-sm">
              <pre className="text-muted-foreground whitespace-pre-wrap break-words">
                <span className="text-blue-400">&lt;script</span>{" "}
                <span className="text-green-300">src</span>=
                <span className="text-yellow-300">
                  "https://atlas.com/embed.js"
                </span>
                <span className="text-green-300">data-layout</span>=
                <span className="text-yellow-300">"floating"</span>
                <span className="text-green-300">data-primary</span>=
                <span className="text-yellow-300">"#3b82f6"</span>
                <span className="text-blue-400">&gt;&lt;/script&gt;</span>
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" /> REST API Integration
            </CardTitle>
            <CardDescription>
              Directly query the chat pipeline from your backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground/80">
              Generate an API key in the API Keys tab, then send a POST request
              with the{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                x-atlas-api-key
              </code>{" "}
              header.
            </p>
            <div className="bg-muted p-4 rounded-xl border font-mono text-sm">
              <pre className="text-muted-foreground whitespace-pre-wrap break-words">
                curl -X POST https://api.atlas.com/v1/chat \ -H{" "}
                <span className="text-yellow-300">
                  "Content-Type: application/json"
                </span>{" "}
                \ -H{" "}
                <span className="text-yellow-300">
                  "x-atlas-api-key: atl_your_secret_key"
                </span>{" "}
                \ -d{" "}
                <span className="text-yellow-300">
                  {"'"}&#123; "message": "How do I authenticate?" &#125;{"'"}
                </span>
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" /> Response Format
            </CardTitle>
            <CardDescription>
              What you receive from the chat API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-xl border font-mono text-sm">
              <pre className="text-muted-foreground whitespace-pre-wrap break-words">
                {`{
  "reply": "To authenticate, you must include a bearer token in your header...",
  "sources": [
    "https://docs.yoursite.com/auth/introduction",
    "https://docs.yoursite.com/auth/tokens"
  ]
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
