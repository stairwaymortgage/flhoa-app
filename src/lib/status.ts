import type { FirmStatusCode } from "./types";

// Decode raw DBPR firm license status codes into plain English.
// The raw code is always shown alongside for verifiability.
const FIRM_STATUS: Record<string, string> = {
  "C A": "Current / Active",
  "C ": "Current",
  "C I": "Current / Inactive",
  "P A": "Pending / Active",
  "S A": "Suspended / Active filing",
  "S ": "Suspended",
  "S I": "Suspended / Inactive",
};

export function decodeFirmStatus(code: string): string {
  return FIRM_STATUS[code] ?? "On file";
}

export function isFirmActive(code: string): boolean {
  return code.trim().startsWith("C");
}

// Neutral, registry-fact explainer for a delinquent secondary status.
// Never a financial-health characterization — this is a filing fact only.
export const DELINQUENT_EXPLAINER =
  "A delinquent secondary status in the state registry indicates a lapse in required annual filings or fees with the Division of Florida Condominiums. It is a registration fact, not a statement about the community's finances or condition.";

export const CAM_EXPLAINER =
  "A Community Association Manager (CAM) is licensed by the State of Florida to manage the operations of condominium, cooperative, and homeowners' associations — budgets, meetings, maintenance, and compliance. Florida requires a CAM license to manage most communities of more than 10 units or with budgets over $100,000.";

export const AS_OF_DATE = "August 2026";
export const DATA_SOURCE = "Florida DBPR public records";
