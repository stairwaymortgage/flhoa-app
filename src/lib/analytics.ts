// GA4 event helper. Safe to call from anywhere: it no-ops when gtag is absent
// (no measurement ID configured, blocked by a content blocker, or server-side).

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type TrackParams = Record<string, string | number | boolean | undefined>;

export function track(event: string, params: TrackParams = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  // Drop undefined values so GA does not record empty parameters.
  const clean: TrackParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") clean[k] = v;
  }
  try {
    window.gtag("event", event, clean);
  } catch {
    // Analytics must never break a user flow.
  }
}
