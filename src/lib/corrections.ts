// Builds the /corrections link carried by every record page, prefilling the form
// with the record the visitor was looking at.

export interface CorrectionTarget {
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
