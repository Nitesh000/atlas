import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Globe, Zap, Shield, ArrowRight, Check } from "lucide-react";
import { useSession } from "../lib/auth";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { data: session } = useSession();

  return (
    <>
      <div className="flex justify-center items-center p-2 bg-primary">
        <p className="font-mono tracking-wider">
          The product currently in development phase.
        </p>
      </div>

      <div className="flex flex-col min-h-screen">
        {/* Navigation */}
        <header className="flex sticky top-0 z-50 justify-between items-center px-6 h-20 border-b lg:px-12 bg-background/80 backdrop-blur-md">
          <div className="flex gap-3 items-center">
            <img
              src="/logo-icon.png"
              alt="Atlas Logo"
              className="w-8 h-8 rounded-lg shadow-sm"
            />
            <span className="text-xl font-bold tracking-tight">Atlas</span>
          </div>
          <nav className="hidden gap-8 text-sm font-medium md:flex text-muted-foreground">
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              className="transition-colors hover:text-foreground"
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
          <section className="flex flex-col items-center py-24 px-6 mx-auto space-y-8 max-w-5xl text-center md:py-32">
            <div className="inline-flex items-center py-0.5 px-2.5 text-xs font-semibold rounded-full border border-transparent transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-ring">
              ✨ Atlas v1.0 is now live
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight md:text-7xl">
              Give your users{" "}
              <span className="text-primary">instant answers</span> from your
              docs.
            </h1>
            <p className="max-w-2xl text-xl text-muted-foreground">
              Atlas automatically crawls your documentation and provides a
              beautiful, AI-powered chat widget you can embed anywhere in
              minutes.
            </p>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <Button size="lg" className="px-8 h-12 text-base" asChild>
                <Link to={session ? "/overview" : "/register"}>
                  Start Building Free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 h-12 text-base"
              >
                View Demo
              </Button>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-24 px-6 bg-muted/30 border-y">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  Everything you need
                </h2>
                <p className="text-lg text-muted-foreground">
                  Stop answering the same questions manually.
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                <FeatureCard
                  icon={<Globe className="w-6 h-6 text-primary" />}
                  title="Automated Crawling"
                  description="Just drop in your documentation URL. We automatically crawl, chunk, and index your content into vector embeddings."
                />
                <FeatureCard
                  icon={<Zap className="w-6 h-6 text-primary" />}
                  title="Universal Widget"
                  description="Embed our beautiful React chat widget on any CDN, WordPress, Vue, Angular, or vanilla JS site instantly."
                />
                <FeatureCard
                  icon={<Shield className="w-6 h-6 text-primary" />}
                  title="API-First Design"
                  description="Generate secure API keys to integrate Atlas directly into your own custom UI or backend systems."
                />
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="py-24 px-6">
            <div className="mx-auto max-w-5xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  How it works
                </h2>
                <p className="text-lg text-muted-foreground">
                  Get your AI assistant running in 3 simple steps.
                </p>
              </div>
              <div className="grid relative gap-12 md:grid-cols-3">
                <div className="hidden absolute top-12 z-0 h-0.5 md:block left-1/6 right-1/6 bg-border"></div>

                <div className="flex relative z-10 flex-col items-center space-y-4 text-center">
                  <div className="flex justify-center items-center w-12 h-12 text-xl font-bold rounded-full ring-8 bg-primary text-primary-foreground ring-background">
                    1
                  </div>
                  <h3 className="text-xl font-bold">Add your website</h3>
                  <p className="text-muted-foreground">
                    Provide the URL to your documentation or knowledge base.
                  </p>
                </div>

                <div className="flex relative z-10 flex-col items-center space-y-4 text-center">
                  <div className="flex justify-center items-center w-12 h-12 text-xl font-bold rounded-full ring-8 bg-primary text-primary-foreground ring-background">
                    2
                  </div>
                  <h3 className="text-xl font-bold">AI indexes content</h3>
                  <p className="text-muted-foreground">
                    Atlas automatically crawls and generates vector embeddings
                    locally.
                  </p>
                </div>

                <div className="flex relative z-10 flex-col items-center space-y-4 text-center">
                  <div className="flex justify-center items-center w-12 h-12 text-xl font-bold rounded-full ring-8 bg-primary text-primary-foreground ring-background">
                    3
                  </div>
                  <h3 className="text-xl font-bold">Embed the widget</h3>
                  <p className="text-muted-foreground">
                    Paste a single script tag into your HTML and you are live!
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="py-24 px-6 bg-muted/30 border-y">
            <div className="mx-auto max-w-5xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  Simple, transparent pricing
                </h2>
                <p className="text-lg text-muted-foreground">
                  Start for free, upgrade when you need more power.
                </p>
              </div>

              <div className="grid gap-8 mx-auto max-w-4xl md:grid-cols-2">
                {/* Free Plan */}
                <div className="p-8 rounded-2xl border shadow-sm bg-card">
                  <h3 className="mb-2 text-2xl font-bold">Hobby</h3>
                  <p className="mb-6 text-muted-foreground">
                    Perfect for side projects and testing.
                  </p>
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold">$0</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <ul className="mb-8 space-y-4">
                    <li className="flex gap-3 items-center">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />{" "}
                      <span>
                        <strong>1,000</strong> API calls/month
                      </span>
                    </li>
                    <li className="flex gap-3 items-center">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />{" "}
                      <span>
                        <strong>100</strong> Indexed Websites
                      </span>
                    </li>
                    <li className="flex gap-3 items-center">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />{" "}
                      <span>
                        <strong>3</strong> API Keys
                      </span>
                    </li>
                    <li className="flex gap-3 items-center">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />{" "}
                      <span>Community Support</span>
                    </li>
                  </ul>
                  <Button className="w-full" asChild variant="outline">
                    <Link to="/register">Get Started Free</Link>
                  </Button>
                </div>

                {/* Pro Plan */}
                <div className="relative p-8 rounded-2xl border-2 shadow-md bg-card border-primary">
                  <div className="absolute top-0 right-6 transform -translate-y-1/2">
                    <span className="py-1 px-3 text-xs font-bold tracking-wider uppercase rounded-full bg-primary text-primary-foreground">
                      Popular
                    </span>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">Pro</h3>
                  <p className="mb-6 text-muted-foreground">
                    For growing businesses scaling AI.
                  </p>
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold">$29</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <ul className="mb-8 space-y-4">
                    <li className="flex gap-3 items-center">
                      <Check className="w-5 h-5 text-primary shrink-0" />{" "}
                      <span>
                        <strong>100,000</strong> API calls/month
                      </span>
                    </li>
                    <li className="flex gap-3 items-center">
                      <Check className="w-5 h-5 text-primary shrink-0" />{" "}
                      <span>
                        <strong>Unlimited</strong> Indexed Websites
                      </span>
                    </li>
                    <li className="flex gap-3 items-center">
                      <Check className="w-5 h-5 text-primary shrink-0" />{" "}
                      <span>
                        <strong>Unlimited</strong> API Keys
                      </span>
                    </li>
                    <li className="flex gap-3 items-center">
                      <Check className="w-5 h-5 text-primary shrink-0" />{" "}
                      <span>Priority Support</span>
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link to="/register">Upgrade to Pro</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-8 text-sm text-center border-t text-muted-foreground">
          <p>© {new Date().getFullYear()} Atlas. All rights reserved.</p>
        </footer>
      </div>
    </>
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
    <div className="p-6 rounded-2xl border shadow-sm transition-shadow hover:shadow-md bg-card">
      <div className="flex justify-center items-center mb-6 w-12 h-12 rounded-lg bg-primary/10">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
