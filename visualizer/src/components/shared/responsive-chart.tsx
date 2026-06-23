"use client";

import * as React from "react";
import { ResponsiveContainer, type ResponsiveContainerProps } from "recharts";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR / hydration and true once mounted on the client.
 * Uses useSyncExternalStore so the server and initial client render agree,
 * avoiding hydration mismatches without setState-in-effect.
 */
function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Drop-in replacement for Recharts' ResponsiveContainer that renders only after
 * mount. Avoids the SSR "width(-1)/height(-1)" warning during static prerender
 * while keeping full responsiveness on the client. Parent must have a fixed
 * height (as our chart containers already do).
 */
export function ResponsiveChart(props: ResponsiveContainerProps) {
  const mounted = useMounted();
  if (!mounted) return null;
  return <ResponsiveContainer {...props} />;
}
