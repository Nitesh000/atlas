import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Globe, Zap, Shield, ArrowRight } from "lucide-react";
import { useSession } from "../lib/auth";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Atlas Logo"
            className="h-8 w-8 rounded-lg shadow-sm"
          />
          <span className="font-bold text-xl tracking-tight">Atlas</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <a
            href="#features"
            className="hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-foreground transition-colors"
          >
            How it Works
          </a>
          <a
            href="#pricing"
            className="hover:text-foreground transition-colors"
          >
            Pricing
          </a>
        </nav>
        <div className="flex gap-4">
          {session ? (
            <Button asChild>
              <Link to="/overview">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-24 md:py-32 flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            ✨ Atlas v1.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Give your users{" "}
            <span className="text-primary">instant answers</span> from your
            docs.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Atlas automatically crawls your documentation and provides a
            beautiful, AI-powered chat widget you can embed anywhere in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to={session ? "/overview" : "/register"}>
                Start Building Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              View Demo
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-24 bg-muted/30 border-y">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything you need
              </h2>
              <p className="text-muted-foreground text-lg">
                Stop answering the same questions manually.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Globe className="h-6 w-6 text-primary" />}
                title="Automated Crawling"
                description="Just drop in your documentation URL. We automatically crawl, chunk, and index your content into vector embeddings."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6 text-primary" />}
                title="Universal Widget"
                description="Embed our beautiful React chat widget on any CDN, WordPress, Vue, Angular, or vanilla JS site instantly."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6 text-primary" />}
                title="API-First Design"
                description="Generate secure API keys to integrate Atlas directly into your own custom UI or backend systems."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Atlas. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
