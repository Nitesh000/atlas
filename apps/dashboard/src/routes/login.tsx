import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { signIn } from "../lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { error: authError } = await signIn.email({
        email,
        password,
      });
      if (authError) {
        setError(authError.message || "Failed to login");
        return;
      }
      navigate({ to: "/overview" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex fixed inset-0 z-50 w-full h-screen bg-background text-foreground">
      {/* Left Panel: Brand & Value Prop */}
      <div className="hidden overflow-hidden relative flex-col justify-between p-12 w-1/2 bg-black border-r lg:flex border-border/50">
        {/* Deep Pitch Black Background with Technical Abstract Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[150px] rounded-full"></div>
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div
          className="flex relative z-10 gap-3 items-center text-2xl font-bold tracking-tight text-white"
          onClick={() => {
            navigate({ to: "/" });
          }}
        >
          <img
            src="/logo-icon.png"
            alt="Atlas Logo"
            className="object-cover w-10 h-10 rounded-xl border shadow-lg border-white/10"
          />
          Atlas
        </div>

        <div className="flex relative z-10 flex-col gap-8 mt-auto mb-auto max-w-lg">
          <div className="flex flex-col gap-4">
            <span className="py-1.5 px-3 font-mono text-xs tracking-widest uppercase rounded-md border text-primary bg-primary/10 w-fit border-primary/20">
              Welcome Back
            </span>
            <h1 className="text-5xl font-bold tracking-tight text-white lg:text-6xl leading-[1.1]">
              Access your workspace.
            </h1>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-zinc-400">
            Manage your API keys, monitor crawls, and test your intelligent
            workflows in one place.
          </p>
        </div>

        <div className="relative z-10 text-sm text-zinc-500">
          © {new Date().getFullYear()} Atlas Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="flex relative flex-col justify-center items-center p-8 w-full lg:w-1/2">
        <div className="space-y-8 w-full max-w-md">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 text-sm font-medium rounded-md border text-destructive bg-destructive/10 border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  required
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="text-sm font-medium transition-colors text-primary hover:text-primary/80"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  required
                  className="bg-muted/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base transition-shadow shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)]"
            >
              Sign In
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold transition-colors text-primary hover:text-primary/80"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
