import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/routes";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="space-y-4 py-8">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            OpenMythos
          </h1>
          <Badge variant="secondary" className="font-mono">
            Visualizer
          </Badge>
        </div>
        <p className="max-w-2xl text-lg text-muted-foreground">
          An interactive guide to the Recurrent-Depth Transformer.{" "}
          <span className="font-mono text-foreground">
            Same weights, more loops &rarr; deeper reasoning.
          </span>
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Link key={route.href} href={route.href} className="group">
            <Card className="h-full transition-colors hover:ring-foreground/25">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  {route.label}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardTitle>
                <CardDescription>{route.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
