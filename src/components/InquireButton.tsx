"use client";

import { useLeadModal, type LeadIntent, type LeadSponsor } from "./LeadModal";
import { track } from "@/lib/analytics";

// The "Inquire Now" control shared by every sponsor unit. Split out of
// Sponsors.tsx so the sponsor components themselves stay server-rendered.
export function InquireButton({
  intent = "inquiry",
  sponsor = "general",
  entityType,
  entityName,
  entitySlug,
  className,
  label = "Inquire Now",
}: {
  intent?: LeadIntent;
  sponsor?: LeadSponsor;
  entityType?: string;
  entityName?: string;
  entitySlug?: string;
  className?: string;
  label?: string;
}) {
  const { openLead } = useLeadModal();
  return (
    <button
      type="button"
      onClick={() => {
        track("sponsor_click", { sponsor, intent, entityType, entityName });
        openLead({ intent, sponsor, entityType, entityName, entitySlug });
      }}
      className={className}
    >
      {label}
    </button>
  );
}
