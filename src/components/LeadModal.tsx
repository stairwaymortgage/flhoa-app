"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

export type LeadIntent = "buying" | "owning" | "board" | "inquiry";
export type LeadSponsor = "lender" | "realtor" | "general";

export interface LeadOptions {
  intent: LeadIntent;
  sponsor: LeadSponsor;
  entityType?: string;
  entityName?: string;
  entitySlug?: string;
}

// The exact disclosure shown with every lead submission.
export const CONSENT_TEXT =
  "By submitting, I agree to be contacted about my inquiry and understand my information may be shared with one or more of the registry's licensed real estate or lending partners.";

const INTENT_HEADINGS: Record<LeadIntent, string> = {
  buying: "Buying in this community",
  owning: "You own in this community",
  board: "You serve on the board",
  inquiry: "Request information",
};

function defaultMessage(intent: LeadIntent, entityName?: string): string {
  const where = entityName ? ` for ${entityName}` : "";
  switch (intent) {
    case "buying":
      return `I'm interested in financing options${where}.`;
    case "owning":
      return `I own${entityName ? ` in ${entityName}` : " here"} and would like a home value report and my options.`;
    case "board":
      return `I serve on the board${where} and would like to discuss association funding options.`;
    default:
      return `I would like more information${where}.`;
  }
}

interface LeadModalContextValue {
  openLead: (opts: LeadOptions) => void;
}

const LeadModalContext = createContext<LeadModalContextValue | null>(null);

export function useLeadModal(): LeadModalContextValue {
  const ctx = useContext(LeadModalContext);
  // Buttons render inside the provider in the root layout; the no-op keeps a
  // stray usage from crashing a page.
  return ctx ?? { openLead: () => {} };
}

export function LeadModalProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<LeadOptions | null>(null);
  const openLead = useCallback((o: LeadOptions) => {
    track("lead_open", {
      intent: o.intent,
      sponsor: o.sponsor,
      entityType: o.entityType,
    });
    setOpts(o);
  }, []);
  const value = useMemo(() => ({ openLead }), [openLead]);

  return (
    <LeadModalContext.Provider value={value}>
      {children}
      {opts && <LeadModal opts={opts} onClose={() => setOpts(null)} />}
    </LeadModalContext.Provider>
  );
}

function LeadModal({ opts, onClose }: { opts: LeadOptions; onClose: () => void }) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(() => defaultMessage(opts.intent, opts.entityName));
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  // Esc to close, and a focus trap that keeps Tab inside the dialog.
  useEffect(() => {
    firstFieldRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const canSubmit =
    name.trim().length > 0 && (email.trim().length > 0 || phone.trim().length > 0) && consent;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          intent: opts.intent,
          sponsor: opts.sponsor,
          entityType: opts.entityType,
          entityName: opts.entityName,
          entitySlug: opts.entitySlug,
          pageUrl: pathname,
          message: message.trim(),
          consent,
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
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
      setState("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(0,20,40,0.55)] flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="bg-white border border-line rounded-lg w-full max-w-[520px] my-auto overflow-hidden"
      >
        <div className="bg-navy text-white px-[22px] py-3 flex items-start justify-between gap-4">
          <div>
            <h2 id="lead-modal-title" className="font-serif text-[17px] font-bold leading-tight">
              {INTENT_HEADINGS[opts.intent]}
            </h2>
            {opts.entityName && (
              <p className="text-[12px] text-[#C8D4E0] mt-0.5">{opts.entityName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#C8D4E0] text-xl leading-none hover:text-white"
          >
            ×
          </button>
        </div>

        {state === "sent" ? (
          <div className="p-[22px]">
            <h3 className="font-serif text-[18px] font-bold text-navy mb-2">Thank you — received</h3>
            <p className="text-sm text-mut">
              Your request has been sent to one of the registry&apos;s licensed partners. Someone will
              follow up using the contact details you provided.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 bg-navy text-white font-bold text-[13px] px-6 py-2.5 rounded-[5px]"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-[22px]">
            <label className="block mb-3">
              <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
                Your name <span className="text-warn">*</span>
              </span>
              <input
                ref={firstFieldRef}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-line rounded-[5px] px-3 py-2 text-sm"
              />
            </label>

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <label className="block">
                <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-line rounded-[5px] px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
                  Phone
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-line rounded-[5px] px-3 py-2 text-sm"
                />
              </label>
            </div>
            <p className="text-[11px] text-mut -mt-1 mb-3">Provide an email or a phone number.</p>

            <label className="block mb-3">
              <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
                Message
              </span>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-line rounded-[5px] px-3 py-2 text-sm"
              />
            </label>

            <label className="flex gap-2.5 items-start mb-4">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                aria-describedby="lead-consent-text"
                className="mt-[3px] shrink-0"
              />
              <span id="lead-consent-text" className="text-[11.5px] text-mut leading-snug">
                {CONSENT_TEXT}
              </span>
            </label>

            {state === "error" && (
              <p role="alert" className="text-[13px] text-warn mb-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || state === "sending"}
              className="w-full bg-gold text-navy-dark font-bold text-[14px] py-3 rounded-[5px] disabled:opacity-50"
            >
              {state === "sending" ? "Sending…" : "Send my request"}
            </button>

            <p className="text-[10.5px] text-mut mt-3 leading-snug">
              flhoaregistry.com is an independent public-records directory and is not affiliated with
              the State of Florida. Sponsored partners are independent licensed professionals.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
