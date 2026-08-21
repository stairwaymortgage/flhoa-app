"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";
import {
  FLOWS,
  type Flow,
  type FlowStep,
  type Option,
  type SingleStep,
  type MultiStep,
  type SliderStep,
  type CountryStep,
  type ContactStep,
} from "@/lib/inquiryFlows";

// ─────────────────────────────────────────────────────────────────────────────
// TCPA consent disclosure
// ─────────────────────────────────────────────────────────────────────────────

export const CONSENT_TEXT =
  "By checking this box and providing my phone number, I consent to receive calls, text messages, and/or pre-recorded voicemails from Olgas Friends LLC via automated technology at the number provided regarding my inquiries and mortgage updates, even if I'm on a Do Not Call list. Consent is not a condition of purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. SMS consent is not shared with third parties.";

// ─────────────────────────────────────────────────────────────────────────────
// Context / Provider
// ─────────────────────────────────────────────────────────────────────────────

export type InquiryIntent =
  | "finance"
  | "foreign-national"
  | "sell"
  | "check-building"
  | "board"
  | "preconstruction";

/** Backward-compat alias for callers that still import LeadIntent */
export type LeadIntent = "buying" | "owning" | "board" | "inquiry" | InquiryIntent;

export type LeadSponsor = "lender" | "realtor" | "general";

export interface InquiryOptions {
  intent: string;
  sponsor?: LeadSponsor;
  entityType?: string;
  entityName?: string;
  entitySlug?: string;
}

interface InquiryContextValue {
  openInquiry: (intent: string, opts?: Omit<InquiryOptions, "intent">) => void;
  /** Backward-compat: maps old LeadOptions shape to openInquiry */
  openLead: (opts: { intent: LeadIntent; sponsor?: LeadSponsor; entityType?: string; entityName?: string; entitySlug?: string }) => void;
}

const InquiryContext = createContext<InquiryContextValue | null>(null);

/** Map legacy buying/owning/inquiry intents to new flow IDs */
function mapLegacyIntent(intent: string): string {
  switch (intent) {
    case "buying":
      return "finance";
    case "owning":
      return "sell";
    case "inquiry":
      return "check-building";
    default:
      return intent; // "board", or any new intent, passes through unchanged
  }
}

export function useInquiry(): InquiryContextValue {
  const ctx = useContext(InquiryContext);
  return ctx ?? { openInquiry: () => {}, openLead: () => {} };
}

/** @deprecated Use useInquiry() instead */
export function useLeadModal() {
  return useInquiry();
}

export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const [activeOpts, setActiveOpts] = useState<InquiryOptions | null>(null);

  const openInquiry = useCallback((intent: string, opts?: Omit<InquiryOptions, "intent">) => {
    const resolvedIntent = mapLegacyIntent(intent);
    track("lead_open", { intent: resolvedIntent, sponsor: opts?.sponsor, entityType: opts?.entityType });
    setActiveOpts({ intent: resolvedIntent, sponsor: opts?.sponsor ?? "general", ...opts });
  }, []);

  const openLead = useCallback(
    (opts: { intent: LeadIntent; sponsor?: LeadSponsor; entityType?: string; entityName?: string; entitySlug?: string }) => {
      openInquiry(opts.intent, {
        sponsor: opts.sponsor,
        entityType: opts.entityType,
        entityName: opts.entityName,
        entitySlug: opts.entitySlug,
      });
    },
    [openInquiry]
  );

  const value = useMemo(() => ({ openInquiry, openLead }), [openInquiry, openLead]);

  return (
    <InquiryContext.Provider value={value}>
      {children}
      {activeOpts && (
        <InquiryModal opts={activeOpts} onClose={() => setActiveOpts(null)} />
      )}
    </InquiryContext.Provider>
  );
}

/** @deprecated Use InquiryProvider instead */
export { InquiryProvider as LeadModalProvider };

// ─────────────────────────────────────────────────────────────────────────────
// Answer state types
// ─────────────────────────────────────────────────────────────────────────────

type AnswerValue = string | string[] | number | boolean;
type Answers = Record<string, AnswerValue>;

interface ContactData {
  name: string;
  email: string;
  phone: string;
  whatsapp: boolean;
  company: string;
  note: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main modal component
// ─────────────────────────────────────────────────────────────────────────────

function InquiryModal({ opts, onClose }: { opts: InquiryOptions; onClose: () => void }) {
  const pathname = usePathname();
  const flow: Flow | undefined = FLOWS[opts.intent];

  // Fallback if the intent isn't a known flow — open a basic check-building
  const steps: FlowStep[] = flow?.steps ?? FLOWS["check-building"].steps;
  const totalSteps = steps.length;

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [contact, setContact] = useState<ContactData>({
    name: "",
    email: "",
    phone: "",
    whatsapp: false,
    company: "",
    note: "",
  });
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const currentStep = steps[stepIndex];

  // ── Body scroll lock + focus trap + Escape ──────────────────────────────────
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        const hasAnswers = Object.keys(answers).length > 0 || contact.name;
        if (hasAnswers) {
          if (window.confirm("You have answers in progress. Close anyway?")) onClose();
        } else {
          onClose();
        }
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, answers, contact.name]);

  // ── Navigation helpers ──────────────────────────────────────────────────────

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  }, [totalSteps]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Auto-advance after single-select choice
  const handleSingleSelect = useCallback(
    (key: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
      setTimeout(goNext, 170);
    },
    [goNext]
  );

  const handleMultiToggle = useCallback((key: string, value: string) => {
    setAnswers((prev) => {
      const current = (prev[key] as string[] | undefined) ?? [];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  }, []);

  const handleSlider = useCallback((key: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleBuilding = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, building: value }));
  }, []);

  const handleCountry = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, country: value }));
    setTimeout(goNext, 170);
  }, [goNext]);

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!consentChecked) return;
    if (!contact.name.trim()) return;
    if (!contact.email.trim() && !contact.phone.trim()) return;

    setSubmitState("sending");
    setSubmitError("");

    // Collect qualifier answers (exclude contact/consent steps)
    const qualifierAnswers: Record<string, AnswerValue> = {};
    for (const [k, v] of Object.entries(answers)) {
      qualifierAnswers[k] = v;
    }
    // Board flow: company/association name lives in contact state, not answers
    if (contact.company.trim()) {
      qualifierAnswers.company = contact.company.trim();
    }

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contact.name.trim(),
          email: contact.email.trim() || undefined,
          phone: contact.phone.trim() || undefined,
          intent: opts.intent,
          sponsor: opts.sponsor ?? "general",
          entityType: opts.entityType,
          entityName: opts.entityName,
          entitySlug: opts.entitySlug,
          pageUrl: pathname,
          message: contact.note.trim() || undefined,
          consent: true,
          answers: qualifierAnswers,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Submission failed.");
      track("lead_submit", {
        intent: opts.intent,
        sponsor: opts.sponsor,
        entityType: opts.entityType,
        entityName: opts.entityName,
      });
      setSubmitState("sent");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed.");
      setSubmitState("error");
    }
  }

  // ── Progress ────────────────────────────────────────────────────────────────

  const progressPct = Math.round(((stepIndex + 1) / totalSteps) * 100);

  // ── Confirm screen ──────────────────────────────────────────────────────────

  if (submitState === "sent") {
    const firstName = contact.name.trim().split(/\s+/)[0] ?? "there";
    return (
      <ModalShell onClose={onClose} opts={opts}>
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-gold flex items-center justify-center">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-serif font-bold text-[22px] text-navy mb-2">
            Request sent, {firstName}.
          </h2>
          <p className="text-sm text-mut mb-6">
            We&apos;ve received your inquiry and will follow up shortly.
          </p>
          <div className="text-left bg-[#F7F9FC] border border-line rounded-lg p-4 mb-6">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-mut mb-3">
              What happens next
            </p>
            <ol className="space-y-2 text-sm text-ink">
              <li className="flex gap-2.5">
                <span className="shrink-0 h-5 w-5 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center mt-0.5">1</span>
                <span>A licensed specialist reviews your answers — usually within a few hours on business days.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="shrink-0 h-5 w-5 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center mt-0.5">2</span>
                <span>They reach out via your preferred contact — email or phone — with an initial assessment.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="shrink-0 h-5 w-5 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center mt-0.5">3</span>
                <span>If it&apos;s a good fit, they&apos;ll schedule a deeper conversation or send a formal quote.</span>
              </li>
            </ol>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-gold text-navy-dark font-bold text-[14px] px-8 py-3 rounded-[5px] hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </ModalShell>
    );
  }

  // ── Render current step ─────────────────────────────────────────────────────

  return (
    <ModalShell onClose={onClose} opts={opts}>
      {/* Header bar */}
      <div className="bg-navy text-white px-5 pt-4 pb-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            {flow && (
              <span className="inline-block bg-[rgba(255,255,255,0.12)] text-[#C8D4E0] text-[10px] font-semibold tracking-[0.12em] uppercase rounded px-2 py-0.5 mb-1.5">
                {flow.tag}
              </span>
            )}
            {opts.entityName && (
              <p className="text-[12px] text-[#C8D4E0]">{opts.entityName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-[#C8D4E0] hover:text-white text-2xl leading-none -mt-0.5"
          >
            ×
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-[#1a2733] overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Step counter */}
        <p className="text-[11px] text-[#C8D4E0] mt-1.5 pb-3">
          Step {stepIndex + 1} of {totalSteps}
        </p>
      </div>

      {/* Step body */}
      <div className="px-5 py-5">
        <StepRenderer
          step={currentStep}
          answers={answers}
          contact={contact}
          consentChecked={consentChecked}
          onSingleSelect={handleSingleSelect}
          onMultiToggle={handleMultiToggle}
          onSlider={handleSlider}
          onBuilding={handleBuilding}
          onCountry={handleCountry}
          onContactChange={setContact}
          onConsentChange={setConsentChecked}
        />

        {submitState === "error" && (
          <p role="alert" className="text-[13px] text-warn mt-3">
            {submitError}
          </p>
        )}

        {/* Footer nav */}
        <StepFooter
          step={currentStep}
          stepIndex={stepIndex}
          answers={answers}
          contact={contact}
          consentChecked={consentChecked}
          submitState={submitState}
          onBack={goBack}
          onNext={goNext}
          onSubmit={handleSubmit}
        />
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal shell (overlay + dialog wrapper)
// ─────────────────────────────────────────────────────────────────────────────

function ModalShell({
  onClose,
  opts,
  children,
}: {
  onClose: () => void;
  opts: InquiryOptions;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(0,20,40,0.55)] flex items-start justify-center overflow-y-auto p-3 sm:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={opts.intent}
        className="bg-white border border-line rounded-lg w-full max-w-[540px] my-auto overflow-hidden shadow-xl"
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step dispatcher
// ─────────────────────────────────────────────────────────────────────────────

interface StepRendererProps {
  step: FlowStep;
  answers: Answers;
  contact: ContactData;
  consentChecked: boolean;
  onSingleSelect: (key: string, value: string) => void;
  onMultiToggle: (key: string, value: string) => void;
  onSlider: (key: string, value: number) => void;
  onBuilding: (value: string) => void;
  onCountry: (value: string) => void;
  onContactChange: React.Dispatch<React.SetStateAction<ContactData>>;
  onConsentChange: (v: boolean) => void;
}

function StepRenderer(props: StepRendererProps) {
  const { step } = props;
  switch (step.type) {
    case "building":
      return <BuildingStepView step={step} answers={props.answers} onChange={props.onBuilding} />;
    case "single":
      return <SingleStepView step={step as SingleStep} answers={props.answers} onSelect={props.onSingleSelect} />;
    case "multi":
      return <MultiStepView step={step as MultiStep} answers={props.answers} onToggle={props.onMultiToggle} />;
    case "slider":
      return <SliderStepView step={step as SliderStep} answers={props.answers} onChange={props.onSlider} />;
    case "country":
      return <CountryStepView step={step as CountryStep} answers={props.answers} onSelect={props.onCountry} />;
    case "contact":
      return <ContactStepView step={step as ContactStep} contact={props.contact} onChange={props.onContactChange} />;
    case "consent":
      return <ConsentStepView checked={props.consentChecked} onChange={props.onConsentChange} />;
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step header (eye + q + sub)
// ─────────────────────────────────────────────────────────────────────────────

function StepHeader({ step }: { step: FlowStep }) {
  return (
    <div className="mb-4">
      <p className="text-gold uppercase tracking-[0.14em] text-[11px] font-semibold mb-1">
        {step.eye}
      </p>
      <h2 className="font-serif font-bold text-[22px] text-navy leading-snug">{step.q}</h2>
      {step.sub && (
        <p className="text-[13px] text-mut mt-1 leading-snug">{step.sub}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Option button
// ─────────────────────────────────────────────────────────────────────────────

function OptionBtn({
  option,
  selected,
  multi,
  onClick,
}: {
  option: Option;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
}) {
  const [label, desc] = option;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left flex items-start gap-3 px-3.5 py-3 rounded-lg border transition-all",
        selected
          ? "border-gold bg-gold/5 shadow-[inset_0_0_0_1px_#C9A227]"
          : "border-line bg-white hover:border-navy hover:bg-[#F7F9FC]",
      ].join(" ")}
    >
      {/* Tick / radio indicator */}
      <span
        className={[
          "shrink-0 mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors",
          multi ? "rounded" : "rounded-full",
          selected ? "bg-gold border-gold" : "border-line bg-white",
        ].join(" ")}
      >
        {selected && (
          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={3}>
            {multi ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
            ) : (
              <circle cx="6" cy="6" r="3" fill="white" stroke="none" />
            )}
          </svg>
        )}
      </span>
      <span>
        <span className="block text-[13px] font-semibold text-ink leading-snug">{label}</span>
        {desc && <span className="block text-[12px] text-mut mt-0.5 leading-snug">{desc}</span>}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Building step
// ─────────────────────────────────────────────────────────────────────────────

function BuildingStepView({
  step,
  answers,
  onChange,
}: {
  step: FlowStep;
  answers: Answers;
  onChange: (v: string) => void;
}) {
  const value = (answers["building"] as string) ?? "";
  return (
    <div>
      <StepHeader step={step} />
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Icon Brickell, 465 Brickell Ave, 33131…"
        className="w-full border border-line rounded-[5px] px-3 py-2.5 text-sm focus:outline-none focus:border-navy"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single-select step
// ─────────────────────────────────────────────────────────────────────────────

function SingleStepView({
  step,
  answers,
  onSelect,
}: {
  step: SingleStep;
  answers: Answers;
  onSelect: (key: string, value: string) => void;
}) {
  const selected = (answers[step.key] as string) ?? "";
  return (
    <div>
      <StepHeader step={step} />
      <div className="space-y-2">
        {step.options.map((opt) => (
          <OptionBtn
            key={opt[0]}
            option={opt}
            selected={selected === opt[0]}
            onClick={() => onSelect(step.key, opt[0])}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Multi-select step
// ─────────────────────────────────────────────────────────────────────────────

function MultiStepView({
  step,
  answers,
  onToggle,
}: {
  step: MultiStep;
  answers: Answers;
  onToggle: (key: string, value: string) => void;
}) {
  const selected = (answers[step.key] as string[]) ?? [];
  return (
    <div>
      <StepHeader step={step} />
      <div className="grid sm:grid-cols-2 gap-2">
        {step.options.map((opt) => (
          <OptionBtn
            key={opt[0]}
            option={opt}
            selected={selected.includes(opt[0])}
            multi
            onClick={() => onToggle(step.key, opt[0])}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Slider step
// ─────────────────────────────────────────────────────────────────────────────

function SliderStepView({
  step,
  answers,
  onChange,
}: {
  step: SliderStep;
  answers: Answers;
  onChange: (key: string, value: number) => void;
}) {
  const value = (answers[step.key] as number) ?? step.start;
  const pct = ((value - step.min) / (step.max - step.min)) * 100;

  return (
    <div>
      <StepHeader step={step} />
      <div className="mb-6 text-center">
        <span className="font-serif font-bold text-[32px] text-navy">
          {formatCurrency(value)}
        </span>
      </div>

      <div className="relative px-1 mb-2">
        {/* Track background */}
        <div className="h-2 bg-[#E5EBF0] rounded-full relative">
          {/* Filled track */}
          <div
            className="absolute left-0 top-0 h-2 bg-gold rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={step.min}
          max={step.max}
          step={step.step}
          value={value}
          onChange={(e) => onChange(step.key, Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
          style={{ zIndex: 1 }}
        />
        {/* Visible thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white border-2 border-gold shadow pointer-events-none"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-mut mt-3">
        <span>{formatCurrency(step.min)}</span>
        <span>{formatCurrency(step.max)}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Country dropdown step
// ─────────────────────────────────────────────────────────────────────────────

function CountryStepView({
  step,
  answers,
  onSelect,
}: {
  step: CountryStep;
  answers: Answers;
  onSelect: (v: string) => void;
}) {
  const value = (answers[step.key] as string) ?? "";
  return (
    <div>
      <StepHeader step={step} />
      <select
        value={value}
        onChange={(e) => onSelect(e.target.value)}
        autoFocus
        className="w-full border border-line rounded-[5px] px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-navy"
      >
        <option value="" disabled>Select a country…</option>
        {step.countries.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact step
// ─────────────────────────────────────────────────────────────────────────────

function ContactStepView({
  step,
  contact,
  onChange,
}: {
  step: ContactStep;
  contact: ContactData;
  onChange: React.Dispatch<React.SetStateAction<ContactData>>;
}) {
  const field = (k: keyof ContactData, value: string | boolean) =>
    onChange((prev) => ({ ...prev, [k]: value }));

  return (
    <div>
      <StepHeader step={step} />

      {/* Name */}
      <div className="mb-3">
        <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
          Your name <span className="text-warn">*</span>
        </label>
        <input
          type="text"
          autoFocus
          value={contact.name}
          onChange={(e) => field("name", e.target.value)}
          placeholder="First and last name"
          className="w-full border border-line rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-navy"
        />
      </div>

      {/* Email + Phone */}
      <div className="grid sm:grid-cols-2 gap-3 mb-1">
        <div>
          <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={contact.email}
            onChange={(e) => field("email", e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-line rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-navy"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            value={contact.phone}
            onChange={(e) => field("phone", e.target.value)}
            placeholder="+1 (305) 555-0100"
            className="w-full border border-line rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-navy"
          />
        </div>
      </div>
      <p className="text-[11px] text-mut mb-3">Provide an email, a phone number, or both.</p>

      {/* Company (board flow) */}
      {step.company && (
        <div className="mb-3">
          <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
            Association / company name
          </label>
          <input
            type="text"
            value={contact.company}
            onChange={(e) => field("company", e.target.value)}
            placeholder="e.g. Icon Brickell Condo Association"
            className="w-full border border-line rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-navy"
          />
        </div>
      )}

      {/* WhatsApp opt-in */}
      {step.whatsapp && contact.phone && (
        <label className="flex items-center gap-2.5 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={contact.whatsapp}
            onChange={(e) => field("whatsapp", e.target.checked)}
            className="shrink-0"
          />
          <span className="text-[12px] text-mut leading-snug">
            I&apos;m okay being contacted via WhatsApp on this number
          </span>
        </label>
      )}

      {/* Optional note */}
      <div>
        <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
          Anything else you&apos;d like us to know? <span className="normal-case font-normal">(optional)</span>
        </label>
        <textarea
          rows={2}
          value={contact.note}
          onChange={(e) => field("note", e.target.value)}
          placeholder="Optional message…"
          className="w-full border border-line rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:border-navy"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Consent step
// ─────────────────────────────────────────────────────────────────────────────

function ConsentStepView({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <div className="mb-4">
        <p className="text-gold uppercase tracking-[0.14em] text-[11px] font-semibold mb-1">
          Before you send
        </p>
        <h2 className="font-serif font-bold text-[22px] text-navy leading-snug">
          One quick disclosure
        </h2>
      </div>

      <div className="bg-[#F7F9FC] border border-line rounded-lg p-4 mb-4">
        <label className="flex gap-3 items-start cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="shrink-0 mt-0.5"
            aria-describedby="consent-text"
          />
          <span id="consent-text" className="text-[11.5px] text-mut leading-relaxed">
            {CONSENT_TEXT}
          </span>
        </label>
      </div>

      <p className="text-[10.5px] text-mut leading-snug">
        flhoaregistry.com is an independent public-records directory and is not affiliated with
        the State of Florida. Sponsored partners are independent licensed professionals.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step footer (Back + Next/Submit)
// ─────────────────────────────────────────────────────────────────────────────

interface StepFooterProps {
  step: FlowStep;
  stepIndex: number;
  answers: Answers;
  contact: ContactData;
  consentChecked: boolean;
  submitState: "idle" | "sending" | "sent" | "error";
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

function StepFooter({
  step,
  stepIndex,
  answers,
  contact,
  consentChecked,
  submitState,
  onBack,
  onNext,
  onSubmit,
}: StepFooterProps) {
  const isFirst = stepIndex === 0;
  const isConsent = step.type === "consent";
  const isContact = step.type === "contact";

  // Compute whether the current step is "filled" enough to advance
  function canAdvance(): boolean {
    switch (step.type) {
      case "building":
        return ((answers["building"] as string) ?? "").trim().length > 0;
      case "single":
        return Boolean(answers[step.key]);
      case "multi": {
        const sel = (answers[step.key] as string[]) ?? [];
        return sel.length >= ((step as MultiStep).min ?? 1);
      }
      case "slider":
        return true; // slider always has a value
      case "country":
        return Boolean(answers["country"]);
      case "contact":
        return (
          contact.name.trim().length > 0 &&
          (contact.email.trim().length > 0 || contact.phone.trim().length > 0)
        );
      case "consent":
        return consentChecked;
      default:
        return true;
    }
  }

  const enabled = canAdvance();

  return (
    <div className="flex items-center justify-between mt-5 pt-4 border-t border-line">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        disabled={isFirst}
        className="text-[13px] text-mut hover:text-ink transition-colors disabled:opacity-0 disabled:pointer-events-none"
      >
        ← Back
      </button>

      {/* Next / Submit */}
      {isConsent ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!enabled || submitState === "sending"}
          className="bg-gold text-navy-dark font-bold text-[13px] px-6 py-2.5 rounded-[5px] disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {submitState === "sending" ? "Sending…" : "Send my request →"}
        </button>
      ) : step.type === "single" ? (
        // Single steps auto-advance; show a ghost Next for accessibility only when something is selected
        enabled ? null : (
          <button
            type="button"
            disabled
            className="bg-gold/40 text-navy-dark font-bold text-[13px] px-6 py-2.5 rounded-[5px] opacity-50 cursor-not-allowed"
          >
            Next →
          </button>
        )
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!enabled}
          className="bg-gold text-navy-dark font-bold text-[13px] px-6 py-2.5 rounded-[5px] disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {isContact ? "Review & submit →" : "Next →"}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Backward-compat openLead helper (named export for existing callers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convenience wrapper for legacy callers that use openLead({intent, sponsor}).
 * Call useInquiry() and destructure openLead from the result.
 */
export function useOpenLead() {
  const { openLead } = useInquiry();
  return openLead;
}
