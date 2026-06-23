"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeRefPanel } from "@/components/shared/code-ref-panel";
import { spectralRadiusConstrained } from "@/lib/lti";
import { RhoGauge } from "./rho-gauge";
import { ParamSliders } from "./param-sliders";
import { TrajectoryChart } from "./trajectory-chart";
import { ComparisonChart } from "./comparison-chart";
import { RhoCurve } from "./rho-curve";
import { VerifyNote } from "./verify-note";
import {
  DEFAULT_A_RAW,
  DEFAULT_LOG_A,
  DEFAULT_LOG_DT,
  GET_A_LINES,
} from "./constants";

/**
 * The /stability page body. A dynamical-systems view of the recurrent update:
 * the hidden state is a discrete LTI system whose stability is governed by the
 * spectral radius ρ(A). Parcae guarantees ρ(A) < 1 by construction — every
 * widget here is computed client-side from the same formula as the real
 * `LTIInjection`.
 */
export function StabilityView() {
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced ?? false;

  const [logA, setLogA] = React.useState(DEFAULT_LOG_A);
  const [logDt, setLogDt] = React.useState(DEFAULT_LOG_DT);
  const [aRaw, setARaw] = React.useState(DEFAULT_A_RAW);

  // Highlight get_A() in the source panel while the params are being edited.
  const [getAActive, setGetAActive] = React.useState(false);
  const activityTimer = React.useRef<number | undefined>(undefined);

  const onActivity = React.useCallback(() => {
    setGetAActive(true);
    if (activityTimer.current) window.clearTimeout(activityTimer.current);
    activityTimer.current = window.setTimeout(
      () => setGetAActive(false),
      1600,
    );
  }, []);

  React.useEffect(
    () => () => {
      if (activityTimer.current) window.clearTimeout(activityTimer.current);
    },
    [],
  );

  const rho = spectralRadiusConstrained(logA, logDt);

  return (
    <div className="space-y-6">
      {/* Gauge + parameter controls */}
      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Spectral radius ρ(A)</CardTitle>
            <CardDescription>
              The single number that decides stability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RhoGauge rho={rho} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Injection parameters
              <Badge
                variant="secondary"
                className="font-mono text-[10px]"
              >
                computed, not measured
              </Badge>
            </CardTitle>
            <CardDescription>
              Drag the learned parameters — A_disc never leaves (0, 1), so ρ(A)
              never reaches 1.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ParamSliders
              logA={logA}
              logDt={logDt}
              onLogA={setLogA}
              onLogDt={setLogDt}
              onActivity={onActivity}
            />
          </CardContent>
        </Card>
      </div>

      {/* Trajectory + constrained vs unconstrained */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hidden-state trajectory</CardTitle>
            <CardDescription>
              h_t over loops for the current constrained A — a decaying curve onto
              its fixed point.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrajectoryChart a={rho} reduced={reduced} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Constrained vs unconstrained</CardTitle>
            <CardDescription>
              Push the unconstrained a past 1 and watch the state explode — the
              failure Parcae prevents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonChart
              constrainedA={rho}
              aRaw={aRaw}
              onARaw={setARaw}
              reduced={reduced}
            />
          </CardContent>
        </Card>
      </div>

      {/* ρ across log_A + verify note */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ρ(A) across all log_A</CardTitle>
            <CardDescription>
              The constraint holds everywhere — the curve never touches ρ = 1.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RhoCurve logA={logA} logDt={logDt} reduced={reduced} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verify it locally</CardTitle>
            <CardDescription>
              Cross-check the gauge against a real model init.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VerifyNote />
          </CardContent>
        </Card>
      </div>

      {/* Real implementation, synced to get_A() while editing */}
      <CodeRefPanel
        refKey="ltiInjection"
        activeLines={getAActive ? GET_A_LINES : undefined}
      />
    </div>
  );
}
