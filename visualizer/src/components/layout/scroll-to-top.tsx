"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Resets scroll to the top of the page on every route change.
 *
 * Next.js App Router can leave the scroll position unchanged when navigating
 * between tall pages that use Suspense boundaries — so clicking a nav link from
 * a scrolled position lands you mid-page on the new route. Forcing scroll to
 * the top on pathname change keeps navigation predictable.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
