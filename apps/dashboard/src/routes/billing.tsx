import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useCurrentOrg } from "../hooks/use-current-org";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { PLANS } from "@atlas/types";

export const Route = createFileRoute("/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { data: org, isLoading } = useCurrentOrg();

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/billing/checkout", {
        organizationId: org?.id,
        successUrl: `${window.location.origin}/billing`,
        cancelUrl: `${window.location.origin}/billing`,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/billing/portal", {
        organizationId: org?.id,
        returnUrl: `${window.location.origin}/billing`,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  if (isLoading || !org) return <div className="p-8">Loading...</div>;

  const isPro = org.plan === PLANS.PRO;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing details.
        </p>
      </div>

      {isPro && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Active Subscription</CardTitle>
            <CardDescription>You are currently on the Atlas Pro plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => portalMutation.mutate()} 
              disabled={portalMutation.isPending}
            >
              {portalMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Manage Billing in Stripe
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <Card className={`border-2 relative overflow-hidden shadow-sm ${!isPro ? "border-primary/20" : "border-muted"}`}>
          {!isPro && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-lg">
              Current Plan
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">Hobby</CardTitle>
            <CardDescription>
              Perfect for testing and small personal projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-4xl font-extrabold">
              $0
              <span className="text-lg text-muted-foreground font-normal">
                /mo
              </span>
            </div>
            <ul className="space-y-3">
              {[
                "1,000 API calls/month",
                "Up to 100 Indexed Websites",
                "3 API Keys",
                "Standard community support",
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-500 shrink-0" /> {feat}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled={!isPro} variant={!isPro ? "outline" : "default"}>
              {!isPro ? "Current Plan" : "Downgrade"}
            </Button>
          </CardFooter>
        </Card>

        <Card className={`border-2 relative overflow-hidden shadow-sm ${isPro ? "border-primary/20" : "border-muted"}`}>
          {isPro && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-lg">
              Current Plan
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">Pro</CardTitle>
            <CardDescription>
              For growing businesses that need more power.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-4xl font-extrabold">
              $29
              <span className="text-lg text-muted-foreground font-normal">
                /mo
              </span>
            </div>
            <ul className="space-y-3">
              {[
                "100,000 API calls/month",
                "Unlimited Indexed Websites",
                "Unlimited API Keys",
                "Priority email support",
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" /> {feat}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              disabled={isPro || checkoutMutation.isPending}
              onClick={() => checkoutMutation.mutate()}
            >
              {checkoutMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPro ? "Current Plan" : "Upgrade to Pro"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
