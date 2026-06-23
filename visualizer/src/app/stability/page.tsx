import { PageHeader } from "@/components/layout/page-header";
import { StabilityView } from "@/components/stability/stability-view";

export default function StabilityPage() {
  return (
    <div>
      <PageHeader
        title="Stability"
        subtitle="LTI injection and the spectral radius ρ(A) < 1."
      />
      <p className="mb-8 max-w-3xl text-muted-foreground">
        Ignoring the nonlinear transformer term, the recurrent hidden state is a
        discrete linear time-invariant system{" "}
        <span className="font-mono">h_{"{t+1}"} = A·h_t + B·e</span>. Its
        stability is governed entirely by the{" "}
        <span className="text-recurrent">spectral radius ρ(A)</span>: when ρ &lt;
        1 the state contracts onto a fixed point, when ρ ≥ 1 it diverges and
        training explodes. OpenMythos sidesteps the failure mode entirely —
        Parcae parameterizes A so that{" "}
        <span className="text-recurrent">ρ(A) &lt; 1 by construction</span>.
      </p>

      <StabilityView />
    </div>
  );
}
