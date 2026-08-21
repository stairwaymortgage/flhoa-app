// ─────────────────────────────────────────────────────────────────────────────
// Inquiry flows — one object drives every multi-step modal.
// ─────────────────────────────────────────────────────────────────────────────

export type StepType =
  | "single"
  | "multi"
  | "slider"
  | "building"
  | "country"
  | "contact"
  | "consent";

/** [label, description] — description is empty string when there is no sub-text */
export type Option = [string, string];

// ── Shared step shapes ────────────────────────────────────────────────────────

interface BaseStep {
  key: string;
  /** Short "eyebrow" label rendered above the question in gold */
  eye: string;
  /** Question heading text */
  q: string;
  /** Optional sub-text below the question */
  sub?: string;
  type: StepType;
}

export interface SingleStep extends BaseStep {
  type: "single";
  options: Option[];
}

export interface MultiStep extends BaseStep {
  type: "multi";
  options: Option[];
  /** Minimum selections required before Next is enabled (default 1) */
  min?: number;
}

export interface SliderStep extends BaseStep {
  type: "slider";
  min: number;
  max: number;
  start: number;
  step: number;
  format: "currency";
}

export interface BuildingStep extends BaseStep {
  type: "building";
}

export interface CountryStep extends BaseStep {
  type: "country";
  countries: string[];
}

export interface ContactStep extends BaseStep {
  type: "contact";
  /** Show WhatsApp opt-in checkbox */
  whatsapp?: boolean;
  /** Show company/association name field */
  company?: boolean;
}

export interface ConsentStep extends BaseStep {
  type: "consent";
}

export type FlowStep =
  | SingleStep
  | MultiStep
  | SliderStep
  | BuildingStep
  | CountryStep
  | ContactStep
  | ConsentStep;

export interface Flow {
  id: string;
  /** Button / pill tag label */
  tag: string;
  /** Short intent key sent to the API */
  intent: string;
  steps: FlowStep[];
}

// ── Reusable shared steps ─────────────────────────────────────────────────────

const BUILDING_STEP: BuildingStep = {
  key: "building",
  eye: "Let's start",
  q: "Which building are you asking about?",
  sub: "Type an address, building name, or ZIP code.",
  type: "building",
};

const CONTACT_STEP: ContactStep = {
  key: "contact",
  eye: "Last step",
  q: "Where should we send this?",
  sub: "An email or a phone number — whichever you'd rather be reached on. One is enough.",
  type: "contact",
};

const CONTACT_WHATSAPP_STEP: ContactStep = {
  ...CONTACT_STEP,
  whatsapp: true,
};

const CONTACT_COMPANY_STEP: ContactStep = {
  ...CONTACT_STEP,
  company: true,
};

const CONSENT_STEP: ConsentStep = {
  key: "consent",
  eye: "Before you send",
  q: "Before you send this",
  type: "consent",
};

// ── Individual flows ──────────────────────────────────────────────────────────

const FINANCE_FLOW: Flow = {
  id: "finance",
  tag: "Finance a purchase",
  intent: "finance",
  steps: [
    BUILDING_STEP,
    {
      key: "stage",
      eye: "Your search",
      q: "Where are you in the process?",
      type: "single",
      options: [
        ["Just starting", "Browsing and comparing options"],
        ["Found a unit", "I have a specific condo in mind"],
        ["Making an offer", "Negotiating or about to submit"],
        ["Under contract", "Already have an accepted offer"],
      ],
    },
    {
      key: "purpose",
      eye: "Intended use",
      q: "How will you use this property?",
      type: "single",
      options: [
        ["Primary home", "I'll live here full-time"],
        ["Second home", "Vacation or part-time use"],
        ["Investment or rental", "I plan to rent it out"],
      ],
    },
    {
      key: "price",
      eye: "Purchase price",
      q: "Roughly what's the purchase price?",
      sub: "Drag to set your target range.",
      type: "slider",
      min: 200_000,
      max: 8_000_000,
      start: 900_000,
      step: 50_000,
      format: "currency",
    },
    {
      key: "down",
      eye: "Down payment",
      q: "How much are you putting down?",
      type: "single",
      options: [
        ["Under 10%", ""],
        ["10–20%", ""],
        ["20–25%", ""],
        ["25%+", ""],
        ["Not sure", ""],
      ],
    },
    {
      key: "preapp",
      eye: "Pre-approval",
      q: "Have you been pre-approved for a mortgage?",
      type: "single",
      options: [
        ["Yes", "I have a current pre-approval letter"],
        ["Started, not finished", "Application is in progress"],
        ["Not yet", "Haven't started the process"],
      ],
    },
    {
      key: "timeline",
      eye: "Timeline",
      q: "When do you need to close?",
      type: "single",
      options: [
        ["0–30 days", "Very soon — urgency is high"],
        ["1–3 months", ""],
        ["3–6 months", ""],
        ["Just exploring", "No hard deadline yet"],
      ],
    },
    {
      key: "worry",
      eye: "Concerns",
      q: "What concerns you most about this building?",
      sub: "Select all that apply.",
      type: "multi",
      options: [
        ["Special assessment", "Outstanding or upcoming fees"],
        ["Reserves budget", "Is the association funded?"],
        ["Insurance", "Coverage gaps or high premiums"],
        ["Litigation", "Active lawsuits involving the HOA"],
        ["Nothing specific", "Just want the full picture"],
      ],
    },
    CONTACT_STEP,
    CONSENT_STEP,
  ],
};

const FOREIGN_NATIONAL_FLOW: Flow = {
  id: "foreign-national",
  tag: "Foreign-national loan",
  intent: "foreign-national",
  steps: [
    BUILDING_STEP,
    {
      key: "country",
      eye: "Country of residence",
      q: "Which country do you primarily reside in?",
      type: "country",
      countries: [
        "Canada",
        "UK",
        "Brazil",
        "Argentina",
        "Colombia",
        "Mexico",
        "Venezuela",
        "Peru",
        "Chile",
        "Spain",
        "Portugal",
        "Germany",
        "France",
        "Italy",
        "Russia",
        "China",
        "India",
        "UAE",
        "Other",
      ],
    },
    {
      key: "ushistory",
      eye: "US credit history",
      q: "Do you have any US credit history?",
      type: "single",
      options: [
        ["Yes, some", "I have accounts or a credit file in the US"],
        ["No, none", "All my credit is outside the US"],
        ["Not sure", "I'm not certain what shows up"],
      ],
    },
    {
      key: "usbank",
      eye: "US bank account",
      q: "Do you have a US bank account?",
      type: "single",
      options: [
        ["Yes", "I already have one"],
        ["Opening soon", "In the process of opening one"],
        ["Not yet", "I don't have one yet"],
      ],
    },
    {
      key: "purpose",
      eye: "Intended use",
      q: "How will you use this property?",
      type: "single",
      options: [
        ["Second home", "Vacation or part-time personal use"],
        ["Investment / rental", "I plan to rent it out"],
        ["Future primary", "I may relocate here eventually"],
      ],
    },
    {
      key: "price",
      eye: "Purchase price",
      q: "Roughly what's the purchase price?",
      sub: "Drag to set your target range.",
      type: "slider",
      min: 300_000,
      max: 10_000_000,
      start: 1_200_000,
      step: 50_000,
      format: "currency",
    },
    {
      key: "down",
      eye: "Down payment",
      q: "How much are you planning to put down?",
      sub: "Foreign-national programs typically require 25–40%.",
      type: "single",
      options: [
        ["Around 25%", ""],
        ["Around 35%", ""],
        ["40%+", ""],
        ["Not sure", ""],
      ],
    },
    {
      key: "timeline",
      eye: "Timeline",
      q: "What's your purchase timeline?",
      type: "single",
      options: [
        ["0–3 months", ""],
        ["3–6 months", ""],
        ["6–12 months", ""],
        ["Just exploring", "No firm date yet"],
      ],
    },
    {
      key: "language",
      eye: "Preferred language",
      q: "What language do you prefer for communication?",
      type: "single",
      options: [
        ["English", ""],
        ["Spanish", ""],
        ["Portuguese", ""],
        ["Other", ""],
      ],
    },
    CONTACT_WHATSAPP_STEP,
    CONSENT_STEP,
  ],
};

const SELL_FLOW: Flow = {
  id: "sell",
  tag: "Sell my unit",
  intent: "sell",
  steps: [
    BUILDING_STEP,
    {
      key: "ownership",
      eye: "Ownership",
      q: "How do you hold this property?",
      type: "single",
      options: [
        ["Own outright", "No mortgage — free and clear"],
        ["Still paying mortgage", "I have an outstanding loan"],
        ["Trust or LLC", "Held in an entity"],
        ["Inherited", "Came to me through an estate"],
      ],
    },
    {
      key: "stage",
      eye: "Readiness",
      q: "Where are you in the selling process?",
      type: "single",
      options: [
        ["Just curious", "Exploring what my unit is worth"],
        ["Getting ready", "Preparing to list in the near future"],
        ["Interviewing agents", "Actively looking for representation"],
      ],
    },
    {
      key: "flags",
      eye: "Building flags",
      q: "Are there any known issues with the building?",
      sub: "Select all that apply — buyers' lenders will ask.",
      type: "multi",
      options: [
        ["Special assessment", "Upcoming or outstanding fees"],
        ["Pending / failed inspection", "Milestone or Fannie/Freddie flag"],
        ["Insurance trouble", "Coverage lapse or high premiums"],
        ["Litigation", "Active HOA lawsuit"],
        ["None", "No known issues"],
      ],
    },
    {
      key: "unit",
      eye: "Unit type",
      q: "What type of unit are you selling?",
      type: "single",
      options: [
        ["Studio / 1-bed", ""],
        ["2-bed", ""],
        ["3-bed", ""],
        ["4+ bed", ""],
      ],
    },
    {
      key: "timeline",
      eye: "Timeline",
      q: "When are you hoping to sell?",
      type: "single",
      options: [
        ["ASAP", "As soon as possible"],
        ["1–3 months", ""],
        ["3–6 months", ""],
        ["Just testing the market", "No firm timeline"],
      ],
    },
    CONTACT_STEP,
    CONSENT_STEP,
  ],
};

const CHECK_BUILDING_FLOW: Flow = {
  id: "check-building",
  tag: "Check a building",
  intent: "check-building",
  steps: [
    BUILDING_STEP,
    {
      key: "relationship",
      eye: "Your relationship",
      q: "What's your connection to this building?",
      type: "single",
      options: [
        ["Buying", "I'm in the process of purchasing a unit"],
        ["Considering an offer", "I haven't made an offer yet"],
        ["I own here", "Current owner seeking information"],
        ["Renting, thinking of buying", "Tenant considering a purchase"],
        ["Just researching", "No direct stake right now"],
      ],
    },
    {
      key: "concerns",
      eye: "Concerns",
      q: "What would you like us to check?",
      sub: "Select all that apply.",
      type: "multi",
      options: [
        ["Lender finance-ability", "Can buyers get a conventional / FHA / VA loan here?"],
        ["Reserves health", "Is the association adequately funded?"],
        ["Special assessments", "Outstanding or upcoming fees"],
        ["Insurance", "Coverage status and premiums"],
        ["Litigation", "Active or pending HOA lawsuits"],
        ["Inspection milestone", "SB-4D / structural inspection status"],
        ["Rental rules", "Short-term or long-term rental restrictions"],
      ],
    },
    {
      key: "unit",
      eye: "Scope",
      q: "Which unit(s) are you asking about?",
      type: "single",
      options: [
        ["Under contract", "I have a specific unit under contract"],
        ["Considering a unit", "I'm evaluating a specific listing"],
        ["Whole-building overview", "General building health check"],
      ],
    },
    {
      key: "timeline",
      eye: "Timeline",
      q: "How quickly do you need this?",
      type: "single",
      options: [
        ["This week", "Urgent — decision approaching"],
        ["This month", "Soon but not immediately"],
        ["No rush", "Gathering info at my own pace"],
      ],
    },
    CONTACT_STEP,
    CONSENT_STEP,
  ],
};

const BOARD_FLOW: Flow = {
  id: "board",
  tag: "I'm on a condo board",
  intent: "board",
  steps: [
    BUILDING_STEP,
    {
      key: "role",
      eye: "Your role",
      q: "What's your role in the association?",
      type: "single",
      options: [
        ["Board president", ""],
        ["Treasurer", ""],
        ["Board member", ""],
        ["Property manager / CAM", ""],
        ["Association attorney", ""],
      ],
    },
    {
      key: "needs",
      eye: "Goals",
      q: "What does the association need help with?",
      sub: "Select all that apply.",
      type: "multi",
      options: [
        ["FHA approval / renewal", "Get or maintain FHA certification"],
        ["VA approval", "Enable veteran buyers to purchase here"],
        ["Conventional standing", "Fannie Mae / Freddie Mac eligibility"],
        ["Reserve study", "Professional reserve fund analysis"],
        ["Off the ineligible list", "Removed from a lender blacklist"],
        ["Not sure", "We know there's an issue — need guidance"],
      ],
    },
    {
      key: "trigger",
      eye: "What triggered this",
      q: "What prompted this inquiry?",
      type: "single",
      options: [
        ["Buyers can't finance", "Deals falling through at the loan stage"],
        ["Approval expiring", "Certification coming up for renewal"],
        ["Lender flagged the building", "We received a notice or rejection"],
        ["Proactive planning", "Getting ahead of potential issues"],
      ],
    },
    {
      key: "size",
      eye: "Building size",
      q: "How many units are in the building?",
      type: "single",
      options: [
        ["Under 25", ""],
        ["25–100", ""],
        ["100–300", ""],
        ["300+", ""],
      ],
    },
    {
      key: "urgency",
      eye: "Urgency",
      q: "How urgent is this?",
      type: "single",
      options: [
        ["Deals are stalling now", "We need help immediately"],
        ["Planning ahead", "No crisis yet, but want to be prepared"],
        ["Just gathering info", "Early-stage research"],
      ],
    },
    CONTACT_COMPANY_STEP,
    CONSENT_STEP,
  ],
};

const PRECONSTRUCTION_FLOW: Flow = {
  id: "preconstruction",
  tag: "Preconstruction · top 10",
  intent: "preconstruction",
  steps: [
    {
      key: "area",
      eye: "Location",
      q: "Which areas interest you?",
      sub: "Select all that apply — we'll match you with projects in those markets.",
      type: "multi",
      options: [
        ["Brickell", "Miami's financial district"],
        ["Edgewater / Midtown", "Bayfront and arts district"],
        ["Miami Beach / South Beach", "Barrier island lifestyle"],
        ["Sunny Isles / Bal Harbour", "Ultra-luxury oceanfront"],
        ["Coral Gables / Coconut Grove", "Tree-lined neighborhoods"],
        ["Fort Lauderdale", "Boating capital of the world"],
        ["Pompano / Hollywood", "Value and growth corridor"],
        ["Open to suggestions", "Show me the best opportunities"],
      ],
    },
    {
      key: "purpose",
      eye: "Intended use",
      q: "How will you use the unit?",
      type: "single",
      options: [
        ["Primary residence", "I'll live here full-time"],
        ["Second home", "Vacation or part-time personal use"],
        ["Investment / rental", "I plan to rent it out"],
      ],
    },
    {
      key: "str",
      eye: "Short-term rentals",
      q: "How important is short-term rental flexibility (Airbnb / VRBO)?",
      type: "single",
      options: [
        ["Yes — important", "I need STR-friendly buildings only"],
        ["Nice to have", "Preferred but not a dealbreaker"],
        ["Not needed", "I'm not planning to short-term rent"],
      ],
    },
    {
      key: "price",
      eye: "Budget",
      q: "What's your target price range?",
      sub: "Drag to set your target range.",
      type: "slider",
      min: 300_000,
      max: 10_000_000,
      start: 1_200_000,
      step: 50_000,
      format: "currency",
    },
    {
      key: "delivery",
      eye: "Delivery timeline",
      q: "When do you want the building delivered?",
      type: "single",
      options: [
        ["Already delivered", "Ready to occupy now"],
        ["Within ~1 year", "Near-term completion"],
        ["1–3 years out", "Mid-range pipeline"],
        ["No preference", "Show me all options"],
      ],
    },
    {
      key: "finance",
      eye: "Financing",
      q: "How do you plan to pay?",
      type: "single",
      options: [
        ["Financing", "I'll need a mortgage"],
        ["Cash", "All cash purchase"],
        ["Not sure", "Haven't decided yet"],
      ],
    },
    {
      key: "visit",
      eye: "Site visit",
      q: "Are you planning to visit in person?",
      type: "single",
      options: [
        ["Planning a visit", "I'll come to Miami to tour"],
        ["Remote / video first", "I prefer a virtual walkthrough"],
        ["Both", "Happy to do either"],
      ],
    },
    {
      key: "language",
      eye: "Preferred language",
      q: "What language do you prefer for communication?",
      type: "single",
      options: [
        ["English", ""],
        ["Spanish", ""],
        ["Portuguese", ""],
        ["Other", ""],
      ],
    },
    CONTACT_WHATSAPP_STEP,
    CONSENT_STEP,
  ],
};

// ── Exported FLOWS registry ───────────────────────────────────────────────────

export const FLOWS: Record<string, Flow> = {
  finance: FINANCE_FLOW,
  "foreign-national": FOREIGN_NATIONAL_FLOW,
  sell: SELL_FLOW,
  "check-building": CHECK_BUILDING_FLOW,
  board: BOARD_FLOW,
  preconstruction: PRECONSTRUCTION_FLOW,
};

/** All registered intent IDs */
export const FLOW_IDS = Object.keys(FLOWS) as Array<keyof typeof FLOWS>;
