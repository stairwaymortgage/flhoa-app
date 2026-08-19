// Core entity types for flhoaregistry.com
// These mirror the normalized schema loaded from FL_Community_Associations_Master_Directory.xlsx

export type AssociationStatus = "Approved" | "Acknowledged";
export type SecondaryStatus = "Delinquent" | "Current" | null;

export interface Association {
  slug: string;
  projectNumber: string;
  fileNumber: string;
  name: string;
  county: string;
  city: string;
  citySlug: string;
  street: string;
  state: string;
  zip: string;
  units: number | null;
  recordedDate: string;
  primaryStatus: AssociationStatus;
  secondaryStatus: SecondaryStatus;
  sourceType: string; // Condominium, Cooperative, Mobile Home, Timeshare, etc.
  managingEntity: {
    number: string | null;
    name: string | null;
    city: string | null;
    state: string | null;
    firmSlug: string | null; // set when confidently matched to a licensed firm
  } | null;
  developerSlug: string | null;
}

export type FirmStatusCode = "C A" | "C " | "C I" | "P A" | "S A" | "S " | "S I";

export interface Firm {
  slug: string;
  licenseNumber: string;
  name: string;
  street: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  licenseType: string; // CAB — Community Association Business
  statusCode: FirmStatusCode;
  statusPlain: string; // decoded human-readable status
  originalDate: string;
  expirationDate: string;
  managedAssociations: { slug: string; name: string; county: string; units: number | null; status: AssociationStatus }[];
}

export interface CamLicensee {
  slug: string;
  licenseNumber: string;
  name: string;
  city: string;
  county: string;
  expirationDate: string;
  ceCredits: number | null;
  ceCourses: number | null;
  firmSlug: string | null;
}

export interface DevProject {
  name: string;
  slug: string | null;
  county: string;
  projectNumber: string;
}

export interface Developer {
  slug: string;
  name: string;
  city: string | null;
  county: string | null;
  projectsFiled: number;
  countiesCount: number;
  primaryType: string;
  filingRange: string;
  projects: DevProject[];
}

export interface County {
  slug: string;
  name: string;
  associationCount: number;
  firmCount: number;
  developerCount: number;
  cities: { name: string; slug: string; associationCount: number }[];
}

export type EntityKind = "association" | "firm" | "cam" | "developer";

export interface SearchResult {
  kind: EntityKind;
  slug: string;
  name: string;
  county: string;
  detail: string;
  href: string;
}
