// Builds the entity-scoped form links carried by every record page — /corrections
// and /claim — prefilling each form with the record the visitor was looking at.

export interface CorrectionTarget {
  // `url` is only used by the corrections form, which records the page reported.
  type: string;
  entity: string;
  url: string;
  slug?: string;
}

export function correctionHref({ type, entity, url, slug }: CorrectionTarget): string {
  const params = new URLSearchParams({ type, entity, url });
  if (slug) params.set("slug", slug);
  return `/corrections?${params.toString()}`;
}

export function claimHref({ type, entity, slug }: Omit<CorrectionTarget, "url">): string {
  const params = new URLSearchParams({ type, entity });
  if (slug) params.set("slug", slug);
  return `/claim?${params.toString()}`;
}
